import type { ProductivityScores } from "@/lib/types";

type ProductivityScoreProps = {
  scores: ProductivityScores;
};

const R = 52;
const C = 2 * Math.PI * R;

export function ProductivityScore({ scores }: ProductivityScoreProps) {
  const { overall, consistency, impact, velocity } = scores;
  const offset = C - (overall / 100) * C;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Circle */}
      <div className="relative" style={{ width: 148, height: 148 }}>
        <svg className="-rotate-90" width={148} height={148} viewBox="0 0 132 132">
          <defs>
            <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <filter id="sg-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle cx="66" cy="66" r={R} fill="none" stroke="currentColor"
            strokeWidth="9" className="text-muted/30" />
          <circle cx="66" cy="66" r={R} fill="none" stroke="url(#sg)"
            strokeWidth="9" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={offset}
            filter="url(#sg-glow)"
            style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.34,1.56,.64,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-foreground tabular-nums leading-none">
            {overall}
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground tracking-widest mt-0.5">
            OUT OF 100
          </span>
        </div>
      </div>

      <p className="text-sm font-semibold text-foreground">Productivity Score</p>

      {/* Stats row */}
      <div className="flex gap-6 text-center pt-1 border-t border-border w-full justify-center">
        {(
          [
            ["Consistency", consistency],
            ["Impact", impact],
            ["Velocity", velocity],
          ] as const
        ).map(([label, val]) => (
          <div key={label}>
            <p className="text-base font-bold text-foreground tabular-nums">{val}%</p>
            <p className="text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
