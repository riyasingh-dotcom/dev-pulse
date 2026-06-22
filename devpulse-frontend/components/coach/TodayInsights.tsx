import { TrendingUp, AlertTriangle, Flame, Star } from "lucide-react";
import type { GitHubSummary } from "@/lib/types";

type Insight = {
  type: "positive" | "warning";
  title: string;
  desc: string;
};

function buildInsights(summary: GitHubSummary): Insight[] {
  const insights: Insight[] = [];

  if (summary.longestStreak >= 3) {
    insights.push({
      type: "positive",
      title: "Velocity Peak",
      desc: `${summary.longestStreak}-day streak. You're ${summary.longestStreak > 7 ? "20%" : "10%"} above average.`,
    });
  }

  const topDay = Object.entries(summary.commitsByDayOfWeek).sort(
    ([, a], [, b]) => b - a,
  )[0];
  if (topDay && topDay[1] > 0) {
    insights.push({
      type: "positive",
      title: "Best Day",
      desc: `${topDay[0]} is your peak with ${topDay[1]} commits.`,
    });
  }

  if (summary.totalPRs < 3) {
    insights.push({
      type: "warning",
      title: "Stale PR Alert",
      desc: `Only ${summary.totalPRs} PR${summary.totalPRs !== 1 ? "s" : ""} detected. Open more pull requests.`,
    });
  }

  if (summary.mostActiveRepo) {
    insights.push({
      type: "positive",
      title: "Hot Repo",
      desc: `${summary.mostActiveRepo} is your most active repository.`,
    });
  }

  if (summary.activeDays < 7) {
    insights.push({
      type: "warning",
      title: "Low Activity",
      desc: `Only ${summary.activeDays} active days. Try to commit more consistently.`,
    });
  }

  return insights.slice(0, 3);
}

const ICONS = {
  positive: { streak: Flame, day: Star, repo: TrendingUp },
  warning: AlertTriangle,
};

export function TodayInsights({ summary }: { summary: GitHubSummary }) {
  const insights = buildInsights(summary);

  return (
    <div className="w-44 shrink-0 p-3 border-r border-border overflow-y-auto">
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Today's Insights
      </h4>
      <div className="space-y-2">
        {insights.map((insight, i) => {
          const isPositive = insight.type === "positive";
          const Icon = isPositive ? TrendingUp : ICONS.warning;
          return (
            <div
              key={i}
              className={`p-2 rounded-md text-xs border ${
                isPositive
                  ? "bg-green-500/8 border-green-500/20"
                  : "bg-orange-500/8 border-orange-500/20"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon
                  className={`w-3 h-3 shrink-0 ${
                    isPositive ? "text-green-400" : "text-orange-400"
                  }`}
                />
                <span
                  className={`font-semibold leading-tight ${
                    isPositive ? "text-green-400" : "text-orange-400"
                  }`}
                >
                  {insight.title}
                </span>
              </div>
              <p className="text-muted-foreground leading-snug">{insight.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
