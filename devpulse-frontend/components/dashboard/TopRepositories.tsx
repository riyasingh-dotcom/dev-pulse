import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { GitHubSummary } from "@/lib/types";

type Props = { summary: GitHubSummary };

const REPO_COLORS = [
  "text-blue-500",
  "text-orange-500",
  "text-purple-500",
  "text-green-500",
  "text-rose-500",
];

function impactStyle(pct: number): string {
  if (pct >= 75) return "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/25";
  if (pct >= 40) return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/25";
  return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/25";
}

export function TopRepositories({ summary }: Props) {
  const maxCommits = summary.topRepos[0]?.commits ?? 1;

  return (
    <div className="bg-card rounded-xl border border-border p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-foreground">Top Repositories</h3>
        <a
          href={`https://github.com/${summary.username}?tab=repositories`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
        >
          View All <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[1fr_72px] sm:grid-cols-[1fr_80px_64px] text-[12px] font-semibold uppercase tracking-widest text-muted-foreground px-1 pb-2 border-b border-border">
        <span>Repository</span>
        <span className="text-right">Commits</span>
        <span className="text-right hidden sm:block">Impact</span>
      </div>

      {summary.topRepos.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 px-1">No repositories found.</p>
      ) : (
        summary.topRepos.map((repo, idx) => {
          const pct = Math.round((repo.commits / maxCommits) * 100);
          return (
            <div
              key={repo.name}
              className="grid grid-cols-[1fr_72px] sm:grid-cols-[1fr_80px_64px] items-center text-[13px] py-2.5 px-1 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors rounded"
            >
              <a
                href={`https://github.com/${summary.username}/${repo.name}`}
                target="_blank"
                rel="noreferrer"
                className={`font-semibold hover:underline flex items-center text-sm gap-2 truncate ${REPO_COLORS[idx % REPO_COLORS.length]}`}
              >
                <span className="w-2 h-2 rounded-sm bg-current opacity-80 shrink-0" />
                {repo.name}
              </a>
              <span className="text-right text-foreground font-medium tabular-nums">
                {repo.commits.toLocaleString()}
              </span>
              <div className="hidden sm:flex justify-end">
                <Badge variant="outline" className={`text-[11px] font-bold h-5 px-1.5 ${impactStyle(pct)}`}>
                  {pct}%
                </Badge>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
