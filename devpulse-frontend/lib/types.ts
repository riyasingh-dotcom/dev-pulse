export type GitHubProfile = {
  username: string;
  followers: number;
  publicRepos: number;
};

export type GitHubSummary = {
  username: string;
  period: string;
  totalCommits: number;
  totalPRs: number;
  totalIssuesClosed: number;
  mostActiveRepo: string;
  activeDays: number;
  longestStreak: number;
  languageBreakdown: Record<string, number>;
  commitsByDayOfWeek: Record<string, number>;
  last7Days?: Array<{ date: string; day: string; commits: number }>;
  topRepos: Array<{ name: string; commits: number }>;
  recentRepoActivity?: Array<{ repo: string; commits: number; lastActive: string }>;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ProductivityScores = {
  overall: number;
  consistency: number;
  impact: number;
  velocity: number;
};
