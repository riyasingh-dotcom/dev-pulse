import type { GitHubSummary } from '../github/github.service';

export const buildChatSystemPrompt = (
  summary: GitHubSummary,
  report: string,
): string => {
  const topRepos =
    summary.topRepos.length > 0
      ? summary.topRepos.map((r) => `${r.name} (${r.commits} pushes)`).join(', ')
      : 'none';

  const languages =
    Object.keys(summary.languageBreakdown).length > 0
      ? Object.entries(summary.languageBreakdown)
          .sort(([, a], [, b]) => b - a)
          .map(([l, c]) => `${l}: ${c}`)
          .join(', ')
      : 'none';

  return `You are an expert engineering coach having a conversation with ${summary.username}.

You have already analysed their GitHub activity and generated the coaching report below.
Use both the activity data and the report as your source of truth when answering questions.

=== GitHub Activity (${summary.period}) ===
Commits: ${summary.totalCommits} | PRs: ${summary.totalPRs} | Issues closed: ${summary.totalIssuesClosed}
Active days: ${summary.activeDays} | Longest streak: ${summary.longestStreak} day(s)
Most active repo: ${summary.mostActiveRepo || 'N/A'}
Top repos: ${topRepos}
Languages: ${languages}

=== Coaching Report ===
${report}

Guidelines:
- Be concise, direct, and specific — reference actual numbers from the data when relevant.
- Encourage and challenge the developer constructively.
- If asked for tasks or goals, make them concrete and time-boxed.
- If a question is unrelated to engineering or their GitHub activity, politely redirect.`;
};
