import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function DetailPageHeader({
  href,
  backLabel,
  actions,
  className,
}: {
  href: string;
  backLabel: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <Link
        href={href}
        className="flex w-fit shrink-0 items-center text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-5 w-5" />
        {backLabel}
      </Link>
      {actions ? (
        <div className="flex items-center gap-2 self-stretch sm:shrink-0 sm:self-auto [&_button]:flex-1 sm:[&_button]:flex-none">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
