import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { poppins } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grounded | Document-backed intelligence",
  description: "Upload your knowledge, create grounded agents, ask questions with citations and confidence scoring. Enterprise document intelligence for teams.",
  icons: {
    icon: "/Grounded_light_logo.jpg",
    shortcut: "/Grounded_light_logo.jpg",
    apple: "/Grounded_light_logo.jpg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={poppins.variable}>
      <body className={`${poppins.className} min-h-screen bg-background text-foreground antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
