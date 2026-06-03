import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <p className="mt-3 text-muted-foreground">Page not found.</p>
        <Link href="/" className="mt-6 inline-block text-sm font-semibold text-foreground underline-offset-4 hover:underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
