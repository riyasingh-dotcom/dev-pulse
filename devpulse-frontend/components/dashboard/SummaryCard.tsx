import { GitCommit, Calendar, Flame, FolderGit2 } from "lucide-react";
import type { GitHubSummary, ProductivityScores } from "@/lib/types";

type Props = { summary: GitHubSummary; scores: ProductivityScores };

export function SummaryCard({ summary, scores }: Props) {
  const initial = summary.username[0]?.toUpperCase() ?? "?";

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        {/* Identity */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 border-2 border-primary/25 flex items-center justify-center text-xl font-bold text-primary shrink-0">
            {initial}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-foreground">@{summary.username}</h2>
              <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {scores.overall} score
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground mt-0.5">{summary.period}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[11px] text-muted-foreground">Active developer</span>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-5 sm:gap-10 flex-wrap">
          <QuickStat icon={GitCommit} label="Commits" value={summary.totalCommits} accent="text-blue-500" />
          <QuickStat icon={Calendar} label="Active Days" value={summary.activeDays} accent="text-violet-500" />
          <QuickStat icon={Flame} label="Streak" value={`${summary.longestStreak}d`} accent="text-orange-500" />
          <div className="text-right">
            <p className="text-[11px] text-muted-foreground mb-1 flex items-center justify-end gap-1">
              <FolderGit2 className="w-3 h-3" /> Top Repo
            </p>
            <p className="text-sm font-semibold text-foreground max-w-36 truncate">
              {summary.mostActiveRepo
                ? summary.mostActiveRepo.split("/").pop()
                : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="text-center">
      <Icon className={`w-4 h-4 ${accent} mx-auto mb-1.5`} />
      <p className="text-xl font-bold text-foreground tabular-nums">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
