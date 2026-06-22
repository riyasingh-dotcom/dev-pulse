import {
  GitCommit,
  GitPullRequest,
  CheckCircle2,
  Calendar,
  Flame,
} from "lucide-react";
import type { GitHubSummary } from "@/lib/types";

type Props = { summary: GitHubSummary };

export function MetricsGrid({ summary }: Props) {
  const metrics = [
    {
      label: "Total Commits",
      value: summary.totalCommits,
      icon: GitCommit,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
      note: "push events",
    },
    {
      label: "Pull Requests",
      value: summary.totalPRs,
      icon: GitPullRequest,
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-500",
      note: "all-time",
    },
    {
      label: "Issues Closed",
      value: summary.totalIssuesClosed,
      icon: CheckCircle2,
      iconBg: "bg-green-500/10",
      iconColor: "text-green-500",
      note: "resolved",
    },
    {
      label: "Active Days",
      value: summary.activeDays,
      icon: Calendar,
      iconBg: "bg-cyan-500/10",
      iconColor: "text-cyan-500",
      note: "in period",
    },
    {
      label: "Longest Streak",
      value: `${summary.longestStreak}d`,
      icon: Flame,
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-500",
      note: "consecutive",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {metrics.map((m) => (
        <div key={m.label} className="bg-card rounded-xl border border-border p-4 flex flex-col gap-3">
          <div className={`w-8 h-8 rounded-lg ${m.iconBg} flex items-center justify-center`}>
            <m.icon className={`w-4 h-4 ${m.iconColor}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{m.value}</p>
            <p className="text-[12px] font-medium text-foreground/70 mt-0.5">{m.label}</p>
            <p className="text-[10px] text-muted-foreground">{m.note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
