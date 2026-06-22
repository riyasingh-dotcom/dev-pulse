type StatCardProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
};

export function StatCard({ label, value, icon, colorClass, bgClass }: StatCardProps) {
  const clamp = Math.min(100, Math.max(0, value));

  return (
    <div className="rounded-xl border border-border bg-card p-4 card-hover flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bgClass}`}>
        <span className={colorClass}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xl font-bold tabular-nums leading-none">{value}%</div>
        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
        <div className="mt-2 h-1 bg-muted/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${clamp}%`,
              background: "linear-gradient(90deg, oklch(0.588 0.248 264), oklch(0.65 0.2 220))",
            }}
          />
        </div>
      </div>
    </div>
  );
}
