import { cn } from "@/lib/utils";

const tones = {
  neutral: "border-border/50 bg-muted/40 text-muted-foreground",
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warn: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
  accent: "border-foreground/15 bg-foreground/5 text-foreground",
};

const sizes = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
};

export function Badge({
  children,
  tone = "neutral",
  size = "md",
  dot,
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  size?: keyof typeof sizes;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        tones[tone],
        sizes[size],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            tone === "success" && "bg-emerald-500 dark:bg-emerald-400",
            tone === "warn" && "bg-amber-500 dark:bg-amber-400",
            tone === "danger" && "bg-red-500 dark:bg-red-400",
            tone === "accent" && "bg-foreground",
            tone === "neutral" && "bg-muted-foreground",
          )}
        />
      )}
      {children}
    </span>
  );
}
