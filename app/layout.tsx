import type { Metadata } from "next";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AI Product Sense Dashboard",
  description: "AI-powered competitive analysis and PRD generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark font-sans", geistSans.variable, geistMono.variable)} suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
