import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Providers } from "@/app/providers";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

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
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <body className={`${poppins.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
