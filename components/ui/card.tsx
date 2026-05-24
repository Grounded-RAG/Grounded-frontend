import { cn } from "@/lib/utils";
import { flatCardSurfaceClass, flatDetailCardClass } from "@/components/ui/card-surface";
import type { HTMLAttributes } from "react";

type Variant = "default" | "flat" | "detail" | "subtle" | "glass" | "elevated";

const variantStyles: Record<Variant, string> = {
  default: flatCardSurfaceClass,
  flat: flatCardSurfaceClass,
  glass: flatCardSurfaceClass,
  elevated: flatDetailCardClass,
  detail: flatDetailCardClass,
  subtle: "rounded-2xl border-0 bg-muted/30 shadow-none",
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
        "p-5 md:p-6",
        variantStyles[variant],
        interactive && "cursor-pointer transition-all duration-200 hover:bg-muted/20",
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
