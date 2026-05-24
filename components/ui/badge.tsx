import { cn } from "@/lib/utils";

const tones = {
  neutral: "border-border/50 bg-muted/40 text-muted-foreground",
  success: "border-foreground/15 bg-foreground/5 text-foreground",
  warn: "border-border bg-muted text-muted-foreground",
  danger: "border-foreground/20 bg-foreground/10 text-foreground",
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
            tone === "success" && "bg-foreground",
            tone === "warn" && "bg-muted-foreground",
            tone === "danger" && "bg-foreground/70",
            tone === "accent" && "bg-foreground",
            tone === "neutral" && "bg-muted-foreground",
          )}
        />
      )}
      {children}
    </span>
  );
}
