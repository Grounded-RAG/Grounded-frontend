import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function BrandMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-6 w-auto",
    md: "h-8 w-auto",
    lg: "h-10 w-auto",
  };

  return (
    <Link href="/" className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 rounded-sm">
      {/* Light Mode Logo */}
      <Image 
        src="/Grounded_lightt-removebg-preview.png" 
        alt="Grounded" 
        width={300}
        height={80}
        className={cn("dark:hidden object-contain", sizes[size])}
        priority
      />
      {/* Dark Mode Logo */}
      <Image 
        src="/Grounded_dark-removebg-preview.png" 
        alt="Grounded" 
        width={300}
        height={80}
        className={cn("hidden dark:block object-contain", sizes[size])}
        priority
      />
    </Link>
  );
}
