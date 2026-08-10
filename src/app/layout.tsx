import { Fraunces, Fredoka, Outfit } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-island",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Circle",
  description: "Your closed friend circle — party rooms, tabs, and chaos.",
  applicationName: "Circle",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Circle",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0b1410" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1410" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${fraunces.variable} ${fredoka.variable} h-full`}
    >
      <body className="min-h-dvh flex flex-col overscroll-none font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
