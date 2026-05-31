import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Variant = "default" | "glass" | "elevated" | "subtle";

const variantStyles: Record<Variant, string> = {
  default: "glass-card",
  glass: "glass-card",
  elevated: "elevated-panel",
  subtle: "border-transparent bg-secondary/30",
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
