import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Playfair_Display,
  Stack_Sans_Text,
} from "next/font/google";
import { Logo } from "@rf-intelligence/ui";
import "./globals.css";

/*
 * Fonts — identical set to apps/website/app/layout.tsx.
 * Loaded once here; CSS variables are available to all child components via
 * the body className and the @theme inline font-* tokens in globals.css.
 */
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

export const metadata: Metadata = {
  title: {
    default: "RF Intelligence Dashboard",
    template: "%s | RF Intelligence",
  },
  description: "Operations dashboard — RF Intelligence",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /*
     * data-theme="dark" — dashboard is dark-only (matches marketing site default).
     * The brand.css :root / [data-theme="dark"] block supplies all tokens.
     * suppressHydrationWarning prevents React hydration mismatches if a future
     * theme toggle changes this attribute client-side.
     */
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${stackSansText.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
