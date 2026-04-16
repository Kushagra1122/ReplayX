import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const displayFont = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display"
});

const bodyFont = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "ReplayX | Codex-first Incident Response",
  description: "Professional replay-first incident response dashboard for the ReplayX hackathon demo."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body style={{ backgroundColor: "var(--bg)" }}>{children}</body>
    </html>
  );
}
