import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({
  size = "md",
  onDark = false,
  compact = false,
}: {
  size?: "sm" | "md" | "lg";
  onDark?: boolean;
  compact?: boolean;
}) {
  const sizes = {
    sm: "h-6 w-auto",
    md: "h-8 w-auto",
    lg: "h-10 w-auto",
  };

  if (compact) {
    return (
      <Link
        href="/"
        className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        title="Grounded"
      >
        {onDark ? (
          <Image
            src="/Grounded_dark-removebg-preview.png"
            alt="Grounded"
            width={28}
            height={28}
            className="h-7 w-7 object-contain object-left"
            priority
          />
        ) : (
          <>
            <Image
              src="/Grounded_lightt-removebg-preview.png"
              alt="Grounded"
              width={28}
              height={28}
              className="h-7 w-7 object-contain object-left dark:hidden"
              priority
            />
            <Image
              src="/Grounded_dark-removebg-preview.png"
              alt="Grounded"
              width={28}
              height={28}
              className="hidden h-7 w-7 object-contain object-left dark:block"
              priority
            />
          </>
        )}
      </Link>
    );
  }

  return (
    <Link href="/" className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-sm">
      {onDark ? (
        <Image
          src="/Grounded_dark-removebg-preview.png"
          alt="Grounded"
          width={300}
          height={80}
          className={cn("object-contain", sizes[size])}
          priority
        />
      ) : (
        <>
          <Image
            src="/Grounded_lightt-removebg-preview.png"
            alt="Grounded"
            width={300}
            height={80}
            className={cn("dark:hidden object-contain", sizes[size])}
            priority
          />
          <Image
            src="/Grounded_dark-removebg-preview.png"
            alt="Grounded"
            width={300}
            height={80}
            className={cn("hidden dark:block object-contain", sizes[size])}
            priority
          />
        </>
      )}
    </Link>
  );
}
