"use client";

import { GitCommitHorizontal, ExternalLink } from "lucide-react";
import type { GitHubSummary } from "@/lib/types";

type Props = { summary: GitHubSummary };

const REPO_COLORS = [
  "text-blue-500",
  "text-orange-500",
  "text-purple-500",
  "text-green-500",
  "text-rose-500",
  "text-yellow-500",
  "text-cyan-500",
  "text-pink-500",
];

function timeAgo(isoString: string): string {
  const ms = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function RecentActivity({ summary }: Props) {
  const items = summary.recentRepoActivity ?? [];

  return (
    <div className="bg-card rounded-xl border border-border p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-foreground">Recent Activity</h3>
        <a
          href={`https://github.com/${summary.username}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
        >
          Profile <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="grid grid-cols-[1fr_56px_72px] text-[12px] font-semibold uppercase tracking-widest text-muted-foreground px-1 pb-2 border-b border-border">
        <span>Repository</span>
        <span className="text-right">Pushes</span>
        <span className="text-right">Last Push</span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 px-1">No recent activity found.</p>
      ) : (
        items.map((item, idx) => {
          const repoName = item.repo.includes("/") ? item.repo.split("/")[1] : item.repo;
          const repoOwner = item.repo.includes("/") ? item.repo.split("/")[0] : summary.username;
          return (
            <div
              key={item.repo}
              className="grid grid-cols-[1fr_56px_72px] items-center text-[13px] py-2.5 px-1 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors rounded"
            >
              <a
                href={`https://github.com/${repoOwner}/${repoName}`}
                target="_blank"
                rel="noreferrer"
                className={`font-semibold hover:underline flex items-center gap-2 truncate text-sm ${REPO_COLORS[idx % REPO_COLORS.length]}`}
              >
                <GitCommitHorizontal className="w-3.5 h-3.5 shrink-0 opacity-80" />
                <span className="truncate">{repoName}</span>
              </a>
              <span className="text-right text-foreground font-medium tabular-nums">
                {item.commits}
              </span>
              <span
                className="text-right text-muted-foreground text-[12px] tabular-nums"
                title={item.lastActive ? formatDate(item.lastActive) : ""}
              >
                {item.lastActive ? timeAgo(item.lastActive) : "—"}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}
