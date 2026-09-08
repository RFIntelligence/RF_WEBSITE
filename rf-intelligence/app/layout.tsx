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
  icons: {
<<<<<<< HEAD
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
=======
    icon: [{ url: "/logo.png", type: "image/png" }],
    shortcut: "/logo.png",
    apple: [{ url: "/logo.png", type: "image/png" }],
>>>>>>> 83b1610319ea6d891d531c3137067e2f970de23a
  },
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
