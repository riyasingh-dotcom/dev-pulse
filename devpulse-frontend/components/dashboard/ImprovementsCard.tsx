import { AlertTriangle, Target } from "lucide-react";
import { parseReport } from "@/lib/parseReport";

const MIN_ITEMS = 3;

const PLACEHOLDERS = [
  "Analyzing your contribution patterns…",
  "Reviewing commit frequency and depth…",
  "Evaluating collaboration signals…",
];

type Props = { report: string };

export function ImprovementsCard({ report }: Props) {
  const { improvements } = parseReport(report);
  const hasReport = report.trim().length > 0;

  if (!hasReport) {
    return (
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center">
            <Target className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Focus Areas</h3>
        </div>
        <div className="space-y-2">
          {Array.from({ length: MIN_ITEMS }).map((_, i) => (
            <div key={i} className="h-11 rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Pad with placeholder items if LLM returned fewer than MIN_ITEMS
  const padded = improvements.slice(0, MIN_ITEMS);
  while (padded.length < MIN_ITEMS) {
    padded.push(PLACEHOLDERS[padded.length] ?? "Further analysis in progress…");
  }
  const isPlaceholder = (i: number) => i >= improvements.length;

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center">
          <Target className="w-3.5 h-3.5 text-amber-500" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Focus Areas</h3>
        <span className="ml-auto text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
          {improvements.length}
        </span>
      </div>

      <div className="space-y-2">
        {padded.map((item, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 p-2.5 rounded-lg border ${
              isPlaceholder(i)
                ? "bg-muted/20 border-border/50 opacity-50"
                : "bg-amber-500/5 border-amber-500/15"
            }`}
          >
            <AlertTriangle
              className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                isPlaceholder(i) ? "text-muted-foreground" : "text-amber-500"
              }`}
            />
            <span
              className={`text-[14px] leading-snug ${
                isPlaceholder(i) ? "text-muted-foreground italic" : "text-foreground/80"
              }`}
            >
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
