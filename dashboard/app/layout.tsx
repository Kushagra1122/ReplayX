import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const displayFont = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display"
});

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body"
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "ReplayX | Codex-first Incident Response",
  description: "Professional replay-first incident response dashboard for the ReplayX hackathon demo."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}>
      <body style={{ backgroundColor: "var(--bg)" }}>{children}</body>
    </html>
  );
}
