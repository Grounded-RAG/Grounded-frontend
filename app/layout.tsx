import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grounded — Document-backed intelligence",
  description: "Upload your knowledge, create grounded agents, ask questions with citations and confidence scoring. Enterprise document intelligence for teams.",
  icons: {
    icon: "/Grounded_light_logo.jpg",
    shortcut: "/Grounded_light_logo.jpg",
    apple: "/Grounded_light_logo.jpg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
