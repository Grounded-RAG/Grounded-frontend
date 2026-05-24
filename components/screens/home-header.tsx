"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HomeHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300",
        scrolled
          ? "border-b border-border/40 bg-background/75 shadow-sm shadow-black/[0.03] backdrop-blur-lg backdrop-saturate-150 supports-[backdrop-filter]:bg-background/60 dark:shadow-black/20"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-6xl items-center justify-between px-6 transition-[padding] duration-300",
          scrolled ? "py-4" : "pt-8",
        )}
      >
        <BrandMark />
        <nav className="hidden items-center gap-8 text-[14px] text-muted-foreground md:flex">
          <Link href="#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </Link>
          <Link href="#features" className="transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="#modes" className="transition-colors hover:text-foreground">
            Execution modes
          </Link>
        </nav>
        <div className="flex items-center gap-5">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Sign in
          </Link>
          <Link href="/sign-up">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
