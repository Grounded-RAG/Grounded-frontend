import Link from "next/link";
import { BrandMark } from "@/components/brand";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="text-center">
        <BrandMark size="lg" />
        <h1 className="mt-8 text-4xl font-bold text-foreground">Page not found</h1>
        <p className="mt-3 text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <Link href="/" className="mt-6 inline-block">
          <Button>Back to home</Button>
        </Link>
      </div>
    </main>
  );
}
