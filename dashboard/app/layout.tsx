import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReplayX Dashboard",
  description: "Replay-first incident response dashboard for the ReplayX hackathon demo."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
