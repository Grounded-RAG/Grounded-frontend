import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  max = 100,
  tone = "accent",
  className,
}: {
  value: number;
  max?: number;
  tone?: "accent" | "success" | "warn" | "danger";
  className?: string;
}) {
  const percent = Math.min(100, Math.round((value / max) * 100));
  const toneColor = {
    accent: "bg-foreground",
    success: "bg-emerald-500",
    warn: "bg-amber-500",
    danger: "bg-red-500",
  }[tone];

  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted/50", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500 ease-smooth", toneColor)}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export function ConfidenceMeter({
  score,
  size = 56,
  className,
}: {
  score: number;
  size?: number;
  className?: string;
}) {
  const percent = Math.round(score * 100);
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const color =
    percent >= 75
      ? "stroke-emerald-500 dark:stroke-emerald-400"
      : percent >= 50
        ? "stroke-amber-500 dark:stroke-amber-400"
        : "stroke-red-500 dark:stroke-red-400";

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-muted/50"
          strokeWidth={4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={cn(color, "transition-all duration-700 ease-smooth")}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-xs font-bold text-foreground">{percent}%</span>
    </div>
  );
}

export function StepIndicator({
  steps,
  current,
  className,
}: {
  steps: string[];
  current: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {steps.map((step, index) => {
        const isActive = index === current;
        const isComplete = index < current;
        return (
          <div key={step} className="flex items-center gap-3">
            <span
              className={cn(
                "grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : isComplete
                    ? "bg-foreground/15 text-foreground"
                    : "bg-muted/50 text-muted-foreground",
              )}
            >
              {isComplete ? "✓" : index + 1}
            </span>
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}
