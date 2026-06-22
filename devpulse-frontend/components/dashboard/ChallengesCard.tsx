import { Zap } from "lucide-react";
import { parseReport } from "@/lib/parseReport";

const MIN_ITEMS = 2;

const PLACEHOLDERS = [
  "Building your weekly challenge…",
  "Reviewing your activity for growth opportunities…",
  "Preparing a targeted coding goal…",
];

type Props = { report: string };

export function ChallengesCard({ report }: Props) {
  const { weeklyChallenge } = parseReport(report);
  const hasReport = report.trim().length > 0;

  if (!hasReport) {
    return (
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-violet-500/10 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-violet-500" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Weekly Challenges</h3>
        </div>
        <div className="space-y-2">
          {Array.from({ length: MIN_ITEMS }).map((_, i) => (
            <div key={i} className="h-11 rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const padded = weeklyChallenge.slice(0, MIN_ITEMS);
  while (padded.length < MIN_ITEMS) {
    padded.push(PLACEHOLDERS[padded.length] ?? "More challenges coming…");
  }
  const isPlaceholder = (i: number) => i >= weeklyChallenge.length;

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-md bg-violet-500/10 flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-violet-500" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Weekly Challenges</h3>
        {weeklyChallenge.length > 0 && (
          <span className="ml-auto text-[10px] font-semibold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
            {weeklyChallenge.length}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {padded.map((item, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 p-2.5 rounded-lg border ${
              isPlaceholder(i)
                ? "bg-muted/20 border-border/50 opacity-50"
                : "bg-violet-500/5 border-violet-500/15"
            }`}
          >
            <Zap
              className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                isPlaceholder(i) ? "text-muted-foreground" : "text-violet-500"
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
