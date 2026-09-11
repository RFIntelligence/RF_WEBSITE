import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Playfair_Display,
  Stack_Sans_Text,
} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const stackSansText = Stack_Sans_Text({
  variable: "--font-stack-sans-text",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.rfintelligenceco.com";

export const metadata: Metadata = {
  title: {
    default: "RF Intelligence — AI-Powered Business Automation",
    template: "%s | RF Intelligence",
  },
  description:
    "RF Intelligence is an AI automation company that helps businesses transform repetitive operational workflows into intelligent, automated systems.",
  // Icons are declared via file conventions only:
  //   app/favicon.ico      → <link rel="icon" href="/favicon.ico" sizes="any" />
  //   app/icon.png         → <link rel="icon" href="/icon.png" type="image/png" sizes="…" />
  //   app/apple-icon.png   → <link rel="apple-touch-icon" … />
  // Declaring them here again via metadata.icons would create duplicate <link>
  // tags and the two declarations can disagree, causing browsers to pick the
  // wrong one. Let the file-convention layer be the single source of truth.
  openGraph: {
    siteName: "RF Intelligence",
    type: "website",
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/logo.png`,
        width: 1536,
        height: 1024,
        alt: "RF Intelligence logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RF Intelligence — AI-Powered Business Automation",
    description:
      "RF Intelligence is an AI automation company that helps businesses transform repetitive operational workflows into intelligent, automated systems.",
    images: [`${siteUrl}/logo.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        {/*
          Explicit fallback <link> tags.
          Next.js file-convention icons (app/favicon.ico, app/icon.png,
          app/apple-icon.png) already emit the correct <link> tags
          automatically. These are belt-and-suspenders for Vercel's CDN
          edge cache, which occasionally serves a stale <head> on first
          deploy until the cache purges.
        */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${stackSansText.variable} antialiased`}
      >
        {/* Warm up the Spline CDNs early so the footer robot is already
            loading while the user scrolls, instead of starting cold. */}
        <link rel="preconnect" href="https://unpkg.com" crossOrigin="anonymous" />
        <link
          rel="preconnect"
          href="https://prod.spline.design"
          crossOrigin="anonymous"
        />
        <link
          rel="modulepreload"
          href="https://unpkg.com/@splinetool/viewer/build/spline-viewer.js"
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
