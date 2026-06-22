import { CheckCircle2, TrendingUp } from "lucide-react";
import { parseReport } from "@/lib/parseReport";

type Props = { report: string };

export function StrengthsCard({ report }: Props) {
  const { strengths } = parseReport(report);

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-md bg-green-500/10 flex items-center justify-center">
          <TrendingUp className="w-3.5 h-3.5 text-green-500" />
        </div>
        <h3 className="text-base font-semibold text-foreground">Strengths</h3>
        {strengths.length > 0 && (
          <span className="ml-auto text-[10px] font-semibold text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
            {strengths.length}
          </span>
        )}
      </div>

      {strengths.length > 0 ? (
        <div className="space-y-2">
          {strengths.map((s, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-2.5 rounded-lg bg-green-500/5 border border-green-500/15"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
              <span className="text-[14px] text-foreground/80 leading-snug">{s}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-11 rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      )}
    </div>
  );
}
