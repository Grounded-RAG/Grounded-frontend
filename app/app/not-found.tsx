import Link from "next/link";
import { BrandMark } from "@/components/brand";
import { Button } from "@/components/ui/button";

export default function AppNotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="text-center">
        <BrandMark size="lg" />
        <h1 className="mt-8 text-4xl font-bold text-foreground">Page not found</h1>
        <p className="mt-3 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/app" className="mt-6 inline-block">
          <Button>Back to workspace</Button>
        </Link>
      </div>
    </main>
  );
}
