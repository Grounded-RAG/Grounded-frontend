import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Variant = "default" | "glass" | "elevated" | "subtle";

const variantStyles: Record<Variant, string> = {
  default: "border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900",
  glass:   "border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900",
  elevated:"border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900",
  subtle:  "border border-transparent bg-zinc-50 dark:bg-zinc-900/50",
};

export function Card({
  children,
  className,
  variant = "default",
  interactive,
  ...props
}: HTMLAttributes<HTMLElement> & {
  variant?: Variant;
  interactive?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl p-5",
        variantStyles[variant],
        interactive &&
          "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  eyebrow,
  action,
}: {
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        {eyebrow ? <p className="section-title mb-1.5">{eyebrow}</p> : null}
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>
      {action}
    </div>
  );
}
