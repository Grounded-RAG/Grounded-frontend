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
      <div className={cn("grid w-full gap-1.5", className)}>
        {label && (
          <label className="pl-0.5 text-[13px] font-medium text-foreground/80">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-full border border-border/80 bg-input px-4 py-1.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
            error && "ring-2 ring-destructive/30",
          )}
          ref={ref}
          {...props}
        />
        {helperText && !error && (
          <p className="mt-0.5 pl-0.5 text-xs text-muted-foreground">{helperText}</p>
        )}
        {error && (
          <p className="mt-0.5 pl-0.5 text-xs text-destructive">{error}</p>
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
      <div className={cn("grid w-full gap-1.5", className)}>
        {label && (
          <label className="pl-0.5 text-[13px] font-medium text-foreground/80">
            {label}
          </label>
        )}
        <textarea
          rows={rows}
          className="flex w-full resize-none rounded-2xl border border-border/80 bg-input px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
