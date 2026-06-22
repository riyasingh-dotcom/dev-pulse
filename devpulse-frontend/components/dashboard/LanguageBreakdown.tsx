import type { GitHubSummary } from "@/lib/types";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#eab308",
  Python: "#3572a5",
  Rust: "#ce422b",
  Go: "#00add8",
  Java: "#b07219",
  "C++": "#f34b7d",
  "C#": "#178600",
  Ruby: "#701516",
  Swift: "#fa7343",
  Kotlin: "#a97bff",
  PHP: "#4f5d95",
  Shell: "#89e051",
  Dart: "#00b4ab",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Vue: "#41b883",
  Svelte: "#ff3e00",
};
const DEFAULT_COLOR = "#6366f1";

type Props = { summary: GitHubSummary };

export function LanguageBreakdown({ summary }: Props) {
  const total = Object.values(summary.languageBreakdown).reduce((a, b) => a + b, 0);
  const allSorted = Object.entries(summary.languageBreakdown).sort(([, a], [, b]) => b - a);
  const top = allSorted.slice(0, 6);
  const othersCount = allSorted.slice(6).reduce((s, [, v]) => s + v, 0);
  const othersLangs = allSorted.length - 6;

  const rows = othersCount > 0
    ? [...top, ["Others", othersCount] as [string, number]]
    : top;

  return (
    <div className="bg-card rounded-xl border border-border p-5 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Language Breakdown</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {allSorted.length} language{allSorted.length !== 1 ? "s" : ""} detected
          </p>
        </div>
        <span className="text-[11px] font-semibold text-muted-foreground bg-muted/50 px-2 py-1 rounded-md border border-border">
          {total.toLocaleString()} repos
        </span>
      </div>

      {/* Stacked proportion bar */}
      {top.length > 0 && (
        <div className="flex h-2.5 rounded-full overflow-hidden gap-px mb-5">
          {top.map(([lang, count]) => {
            const pct = total > 0 ? (count / total) * 100 : 0;
            const color = LANG_COLORS[lang] ?? DEFAULT_COLOR;
            return (
              <div
                key={lang}
                className="h-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            );
          })}
          {othersCount > 0 && (
            <div
              className="h-full flex-1 bg-muted/60"
            />
          )}
        </div>
      )}

      {total === 0 ? (
        <p className="text-sm text-muted-foreground flex-1 flex items-center justify-center">
          No language data available.
        </p>
      ) : (
        <div className="flex flex-col flex-1 justify-between gap-2.5">
          {rows.map(([lang, count]) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const color = lang === "Others" ? "#94a3b8" : (LANG_COLORS[lang] ?? DEFAULT_COLOR);
            return (
              <div key={lang}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[15px] font-medium text-foreground">
                      {lang === "Others" ? `Others (${othersLangs})` : lang}
                    </span>
                  </div>
                  <span className="text-[15px] font-semibold text-muted-foreground tabular-nums">
                    {pct}%
                  </span>
                </div>
                <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
