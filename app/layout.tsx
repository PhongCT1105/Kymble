import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/shell/app-header";

const display = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Kymble — the AI GTM organization",
  description:
    "Kymble finds who needs you next — and shows the receipts. An AI GTM organization for Nimble + Kylon.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full`}
    >
      <body className="min-h-full bg-canvas text-ink">
        <AppHeader />
        <main className="mx-auto w-full max-w-[1240px] px-5 pb-24 pt-6 sm:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
