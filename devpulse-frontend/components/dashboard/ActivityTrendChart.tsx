"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import type { GitHubSummary } from "@/lib/types";

type Props = { summary: GitHubSummary };

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function CustomTick(props: { x?: number; y?: number; payload?: { value: string } }) {
  const { x = 0, y = 0, payload } = props;
  const [dayPart = "", datePart = ""] = (payload?.value ?? "").split("|");
  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.55} dy={14}>
        {dayPart}
      </text>
      <text textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.38} dy={27}>
        {datePart}
      </text>
    </g>
  );
}

export function ActivityTrendChart({ summary }: Props) {
  const raw = summary.last7Days;

  const data = raw
    ? raw.map(({ date, day, commits }) => {
        const d = new Date(date + "T00:00:00Z");
        const mon = MONTH_SHORT[d.getUTCMonth()];
        const num = d.getUTCDate();
        return {
          label: `${day.slice(0, 3)}|${mon} ${num}`,
          fullDate: `${day}, ${mon} ${num}`,
          commits,
        };
      })
    : // fallback: old cached data without last7Days
      (["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] as const).map((abbr, i) => {
        const FULL = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"] as const;
        return {
          label: `${abbr}|`,
          fullDate: FULL[i],
          commits: summary.commitsByDayOfWeek[FULL[i]] ?? 0,
        };
      });

  const max = Math.max(...data.map((d) => d.commits), 1);
  const total = data.reduce((sum, d) => sum + d.commits, 0);
  const avg = total / data.length;
  const peakEntry = data.reduce((best, d) => (d.commits > best.commits ? d : best), data[0]);
  const activeDays = data.filter((d) => d.commits > 0).length;

  return (
    <div className="bg-card rounded-xl border border-border p-5 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Last 7 Days</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Push activity by date</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-foreground">{total}</p>
          <p className="text-[11px] text-muted-foreground">total pushes</p>
        </div>
      </div>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            barSize={32}
            barCategoryGap="22%"
            margin={{ top: 8, right: 4, left: 4, bottom: 12 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="currentColor"
              strokeOpacity={0.07}
            />
            <XAxis
              dataKey="label"
              tick={<CustomTick />}
              axisLine={false}
              tickLine={false}
              height={40}
            />
            <YAxis hide />
            {avg > 0 && (
              <ReferenceLine
                y={avg}
                stroke="oklch(0.605 0.215 255 / 0.45)"
                strokeDasharray="4 3"
                strokeWidth={1.5}
              />
            )}
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontSize: 13,
                padding: "8px 12px",
              }}
              cursor={{ fill: "oklch(0.605 0.215 255 / 0.06)" }}
              formatter={(value) => [`${value} pushes`, "Activity"]}
              labelFormatter={(label: unknown) => {
                if (typeof label !== "string") return String(label ?? "");
                const [, datePart] = label.split("|");
                return datePart ?? label;
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 2 }}
            />
            <Bar dataKey="commits" radius={[6, 6, 2, 2]}>
              {data.map((entry, i) => {
                const isMax = entry.commits === max && max > 0;
                const opacity = entry.commits === 0 ? 0.12 : 0.22 + (entry.commits / max) * 0.78;
                return (
                  <Cell
                    key={i}
                    fill={
                      isMax
                        ? "oklch(0.605 0.215 255)"
                        : `oklch(0.605 0.215 255 / ${opacity.toFixed(2)})`
                    }
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-border">
        {[
          { label: "Peak Day", value: peakEntry.fullDate.split(",")[0] ?? "—" },
          { label: "Peak Pushes", value: String(max) },
          { label: "Daily Avg", value: avg.toFixed(1) },
          { label: "Active Days", value: `${activeDays}/7` },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <p className="text-[11px] text-muted-foreground">{label}</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
