import {
  Injectable,
  NotFoundException,
  BadGatewayException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

// ─── GitHub API raw types (only fields we consume) ──────────────────────────

type GithubApiUser = {
  login: string;
  followers: number;
  public_repos: number;
};

type PushPayload = {
  // `size` is the authoritative commit count for a push.
  // `commits` array is capped at 20 by GitHub and can be [] on force-pushes
  // even when size > 0 — always prefer size over commits.length.
  size: number;
  distinct_size: number;
  commits: Array<{ sha: string }>;
};

type ActionPayload = {
  action: string;
};

// payload shape varies per event type; we only read the fields we use
type GitHubRawEvent = {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
  payload: Partial<PushPayload & ActionPayload>;
};

type GitHubRawRepo = {
  name: string;
  language: string | null;
};

// Search API response — only total_count matters for our counts
type GitHubSearchCount = {
  total_count: number;
  incomplete_results: boolean;
};

// ─── Public types ────────────────────────────────────────────────────────────

export type GithubProfile = {
  username: string;
  followers: number;
  publicRepos: number;
};

export type GitHubSummary = {
  username: string;

  // ── Accurate (from dedicated API sources) ──────────────────────────────────
  //
  // totalPRs         → GitHub Search API: all-time count across public repos
  //                    (private repos included when GITHUB_TOKEN is set)
  // totalIssuesClosed→ GitHub Search API: same scope as above
  // languageBreakdown→ /users/{u}/repos primary language per repo; counts repos
  //                    not lines of code — accurate for repo distribution
  //
  // ── Estimates (Events API window only) ────────────────────────────────────
  //
  // GitHub's Events API returns at most 300 events (10 pages × 30).
  // `per_page` is silently ignored — the page size is always 30.
  // Very active users may only see the last few days; inactive users may see
  // events 90+ days old. None of the event-derived fields below cover all-time.
  //
  // totalCommits     → PushEvent.size summed across the events window
  // activeDays       → unique UTC dates in the events window
  // longestStreak    → consecutive active days within the events window
  // mostActiveRepo   → repo with most events in the window
  // commitsByDayOfWeek → PushEvent commits grouped by UTC day in the window
  // topRepos         → repos with most commits in the window
  // period           → date range of the fetched events

  period: string;
  totalCommits: number;
  totalPRs: number;
  totalIssuesClosed: number;
  mostActiveRepo: string;
  activeDays: number;
  longestStreak: number;
  languageBreakdown: Record<string, number>;
  commitsByDayOfWeek: Record<string, number>;
  topRepos: Array<{ name: string; commits: number }>;
};

// ─── Pure helper functions ───────────────────────────────────────────────────

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

// GitHub Events API fixed page size — per_page param is silently ignored
const EVENTS_PAGE_SIZE = 30;

function toUtcDateStr(isoTimestamp: string): string {
  return isoTimestamp.slice(0, 10); // 'YYYY-MM-DD' (UTC portion)
}

// Expects a sorted, deduplicated array of 'YYYY-MM-DD' strings.
function longestConsecutiveStreak(sortedDates: string[]): number {
  if (sortedDates.length === 0) return 0;
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]).getTime();
    const curr = new Date(sortedDates[i]).getTime();
    if (Math.round((curr - prev) / 86_400_000) === 1) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }
  return longest;
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class GithubService {
  private readonly baseUrl: string;
  private readonly token: string | undefined;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>(
      'GITHUB_API_BASE',
      'https://api.github.com',
    );
    this.token = this.config.get<string>('GITHUB_TOKEN');
  }

  private get authHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  private handleAxiosError(err: unknown, username: string): never {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 404) {
        throw new NotFoundException(`GitHub user "${username}" not found`);
      }
      // 403 = rate-limited without token  |  429 = explicit rate-limit header
      if (err.response?.status === 403 || err.response?.status === 429) {
        throw new HttpException(
          'GitHub API rate limit exceeded. Try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }
    throw new BadGatewayException('GitHub API is unavailable');
  }

  async getProfile(username: string): Promise<GithubProfile> {
    try {
      const { data } = await axios.get<GithubApiUser>(
        `${this.baseUrl}/users/${username}`,
        { headers: this.authHeaders },
      );
      return {
        username: data.login,
        followers: data.followers,
        publicRepos: data.public_repos,
      };
    } catch (err) {
      return this.handleAxiosError(err, username);
    }
  }

  // Fetches all available events across up to 10 pages (max 300 events).
  //
  // BUG RISK: GitHub Events API silently ignores `per_page` — the page size
  // is always 30. Breaking on `data.length < per_page` (e.g. < 100) would
  // stop after the first page and return only 30 events. We break only on
  // an empty page or a partial page relative to the known 30-item size.
  async fetchUserEvents(username: string): Promise<GitHubRawEvent[]> {
    const all: GitHubRawEvent[] = [];
    for (let page = 1; page <= 10; page++) {
      try {
        const { data } = await axios.get<GitHubRawEvent[]>(
          `${this.baseUrl}/users/${username}/events`,
          { headers: this.authHeaders, params: { page } },
        );
        if (data.length === 0) break;
        all.push(...data);
        if (data.length < EVENTS_PAGE_SIZE) break; // partial page = last page
      } catch (err) {
        // If we already have some events, return what we have rather than
        // throwing and losing all data on a mid-pagination rate limit hit.
        if (all.length > 0) return all;
        return this.handleAxiosError(err, username);
      }
    }
    return all;
  }

  async fetchUserRepos(username: string): Promise<GitHubRawRepo[]> {
    try {
      const { data } = await axios.get<GitHubRawRepo[]>(
        `${this.baseUrl}/users/${username}/repos`,
        { headers: this.authHeaders, params: { per_page: 100 } },
      );
      return data;
    } catch (err) {
      return this.handleAxiosError(err, username);
    }
  }

  // All-time PR count via Search API. Falls back to 0 on error because the
  // Search API has a separate, tighter rate limit (10 req/hr unauthenticated,
  // 30 req/hr with token) and we don't want a search failure to kill the whole
  // summary response.
  async fetchPRCount(username: string): Promise<number> {
    try {
      const { data } = await axios.get<GitHubSearchCount>(
        `${this.baseUrl}/search/issues`,
        {
          headers: this.authHeaders,
          params: { q: `type:pr author:${username}`, per_page: 1 },
        },
      );
      return data.total_count;
    } catch {
      return 0;
    }
  }

  // All-time closed issue count via Search API. Same fallback rationale as above.
  async fetchClosedIssueCount(username: string): Promise<number> {
    try {
      const { data } = await axios.get<GitHubSearchCount>(
        `${this.baseUrl}/search/issues`,
        {
          headers: this.authHeaders,
          params: { q: `type:issue author:${username} is:closed`, per_page: 1 },
        },
      );
      return data.total_count;
    } catch {
      return 0;
    }
  }

  buildSummary(
    username: string,
    events: GitHubRawEvent[],
    repos: GitHubRawRepo[],
    totalPRs: number,
    totalIssuesClosed: number,
  ): GitHubSummary {
    const activeDateSet = new Set<string>();
    // PushEvent count per repo — used for both topRepos and mostActiveRepo.
    // Each PushEvent counts as 1; GitHub's Events API does not reliably expose
    // exact commit counts (size can be 0 on force-pushes, commits[] capped at 20).
    const pushEventsByRepo: Record<string, number> = {};
    const commitsByDayOfWeek: Record<string, number> = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
    };

    let totalCommits = 0;

    for (const event of events) {
      activeDateSet.add(toUtcDateStr(event.created_at));

      const repo = event.repo.name;

      if (event.type === 'PushEvent') {
        // Each PushEvent counts as 1 commit activity.
        // GitHub's Events API does not reliably expose exact commit counts:
        // payload.size can be 0 on force-pushes and payload.commits[] is
        // capped at 20. PushEvent frequency is a consistent, if coarse, estimate.
        totalCommits += 1;
        pushEventsByRepo[repo] = (pushEventsByRepo[repo] ?? 0) + 1;

        // Use UTC day to stay consistent with toUtcDateStr()
        const day = DAY_NAMES[new Date(event.created_at).getUTCDay()];
        commitsByDayOfWeek[day] = (commitsByDayOfWeek[day] ?? 0) + 1;
      }
    }

    const activeDates = [...activeDateSet].sort();
    const activeDays = activeDates.length;
    const longestStreak = longestConsecutiveStreak(activeDates);

    const mostActiveRepo =
      Object.entries(pushEventsByRepo).sort(([, a], [, b]) => b - a)[0]?.[0] ??
      '';

    const topRepos = Object.entries(pushEventsByRepo)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, pushEvents]) => ({ name, commits: pushEvents }));

    const languageBreakdown: Record<string, number> = {};
    for (const repo of repos) {
      if (repo.language !== null) {
        languageBreakdown[repo.language] =
          (languageBreakdown[repo.language] ?? 0) + 1;
      }
    }

    const period =
      activeDates.length > 0
        ? `${activeDates[0]} to ${activeDates[activeDates.length - 1]}`
        : 'no recent activity';

    return {
      username,
      period,
      totalCommits,
      totalPRs,
      totalIssuesClosed,
      mostActiveRepo,
      activeDays,
      longestStreak,
      languageBreakdown,
      commitsByDayOfWeek,
      topRepos,
    };
  }

  async getSummary(username: string): Promise<GitHubSummary> {
    const [events, repos, totalPRs, totalIssuesClosed] = await Promise.all([
      this.fetchUserEvents(username),
      this.fetchUserRepos(username),
      this.fetchPRCount(username),
      this.fetchClosedIssueCount(username),
    ]);
    console.log('EVENTS COUNT:', events.length);
    console.log('FIRST EVENT:', events[0]);
    return this.buildSummary(
      username,
      events,
      repos,
      totalPRs,
      totalIssuesClosed,
    );
  }
}
