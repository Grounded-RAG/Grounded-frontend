import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PageHeader({
  description,
  action,
  actionHref,
}: {
  description?: string;
  action?: string;
  actionHref?: string;
}) {
  if (!description && !action) return null;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      {description ? (
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground animate-fade-in">{description}</p>
      ) : (
        <div />
      )}
      {action ? (
        <div className="w-full shrink-0 md:w-auto">
          {actionHref ? (
            <Link href={actionHref} className="block w-full md:inline-block md:w-auto">
              <Button size="md" className="w-full md:w-auto">
                {action}
              </Button>
            </Link>
          ) : (
            <Button size="md" className="w-full md:w-auto">
              {action}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
