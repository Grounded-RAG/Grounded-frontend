import { cn } from "@/lib/utils";
import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, helperText, error, ...props }, ref) => {
    return (
      <div className={cn("grid gap-1.5 w-full", className)}>
        {label && (
          <label className="text-[13px] font-medium text-foreground/80 pl-0.5">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-xl border border-border/40 bg-foreground/[0.02] px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/30 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
            error && "border-destructive/60 focus:ring-destructive/20 focus:border-destructive",
          )}
          ref={ref}
          {...props}
        />
        {helperText && !error && (
          <p className="text-xs text-muted-foreground/60 pl-0.5 mt-0.5">{helperText}</p>
        )}
        {error && (
          <p className="text-xs text-destructive pl-0.5 mt-0.5">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, rows = 3, ...props }, ref) => {
    return (
      <div className={cn("grid gap-1.5 w-full", className)}>
        {label && (
          <label className="text-[13px] font-medium text-foreground/80 pl-0.5">
            {label}
          </label>
        )}
        <textarea
          rows={rows}
          className={cn(
            "flex w-full resize-none rounded-xl border border-border/40 bg-foreground/[0.02] px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:border-foreground/30 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
