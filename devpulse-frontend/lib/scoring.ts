import type { GitHubSummary, ProductivityScores } from "./types";

export function calculateScores(summary: GitHubSummary): ProductivityScores {
  if (summary.activeDays === 0 && summary.totalCommits === 0) {
    return { overall: 0, consistency: 0, impact: 0, velocity: 0 };
  }

  // Velocity: avg commits per active day, normalized; cap at 100
  const commitsPerDay =
    summary.activeDays > 0 ? summary.totalCommits / summary.activeDays : 0;
  const velocity = Math.min(100, Math.round(commitsPerDay * 10));

  // Consistency: streak weight (60%) + active-day ratio (40%)
  const streakScore = Math.min(100, Math.round((summary.longestStreak / 14) * 100));
  const activeDayRatio = Math.min(1, summary.activeDays / 21);
  const consistency = Math.round(streakScore * 0.6 + activeDayRatio * 100 * 0.4);

  // Impact: PRs + weighted closed issues, normalized to ~30 total
  const impactRaw = summary.totalPRs + summary.totalIssuesClosed * 0.7;
  const impact = Math.min(100, Math.round((impactRaw / 30) * 100));

  const overall = Math.round(velocity * 0.35 + consistency * 0.35 + impact * 0.3);

  return { overall, velocity, consistency, impact };
}
