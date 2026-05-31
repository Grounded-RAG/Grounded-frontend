import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  actionHref,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: string;
  actionHref?: string;
}) {
  return (
    <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div className="max-w-3xl animate-fade-in">
        {eyebrow ? <p className="section-title mb-1.5">{eyebrow}</p> : null}
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{title}</h1>
        {description ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      </div>
      {action ? (
        actionHref ? (
          <Link href={actionHref}>
            <Button size="md">{action}</Button>
          </Link>
        ) : (
          <Button size="md">{action}</Button>
        )
      ) : null}
    </div>
  );
}
