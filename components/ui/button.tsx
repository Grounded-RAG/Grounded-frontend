import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "soft";
type Size = "sm" | "md" | "lg" | "icon";

const variantStyles: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-none",
  secondary: "bg-muted text-foreground hover:bg-muted/80 shadow-none",
  soft: "bg-muted/60 text-foreground hover:bg-muted shadow-none",
  ghost: "text-muted-foreground hover:bg-muted/50 hover:text-foreground shadow-none",
  outline: "border border-border/60 bg-card text-foreground hover:bg-muted/40 shadow-none",
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/85 shadow-none",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-4 text-xs gap-1.5 rounded-full",
  md: "h-9 px-5 text-[13px] gap-1.5 rounded-full",
  lg: "h-10 px-6 text-sm gap-2 rounded-full",
  icon: "h-9 w-9 p-0 rounded-full",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all duration-200 ease-smooth",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-40",
        "active:scale-[0.98]",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  );
}
