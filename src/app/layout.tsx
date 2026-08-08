import { Orbitron, Exo_2 } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const display = Orbitron({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Exo_2({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tactix AI — JARVIS Company Brain",
  description:
    "One AI brain for Slack, Google Sheets, Freshdesk, Looker, and WhatsApp — detect requests, correct them, run shipments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
