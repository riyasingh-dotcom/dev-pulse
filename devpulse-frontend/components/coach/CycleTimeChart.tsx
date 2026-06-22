"use client";

import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { GitHubSummary } from "@/lib/types";

type Props = { summary: GitHubSummary };

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DAY_MAP: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
};

export function CycleTimeChart({ summary }: Props) {
  const data = WEEKDAYS.map((d) => ({
    day: d,
    commits: summary.commitsByDayOfWeek[DAY_MAP[d]] ?? 0,
  }));

  const peakDay = data.reduce(
    (best, cur) => (cur.commits > best.commits ? cur : best),
    data[0],
  );

  const peakCommits = peakDay?.commits ?? 0;
  const extraHours = Math.max(1, Math.round(peakCommits * 0.15));

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-muted-foreground font-medium">
          Cycle Time Distribution
        </span>
        {peakDay && peakDay.commits > 0 && (
          <span className="text-[11px] text-red-400 font-medium">
            +{extraHours}h on {peakDay.day}s
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={72}>
        <BarChart data={data} barSize={22} barCategoryGap="15%">
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 6,
              fontSize: 11,
              color: "hsl(var(--foreground))",
            }}
            cursor={false}
          />
          <Bar dataKey="commits" radius={[3, 3, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.day === peakDay?.day ? "#ef4444" : "#4f46e5"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
