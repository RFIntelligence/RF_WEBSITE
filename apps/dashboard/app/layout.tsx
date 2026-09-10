import type { Metadata } from "next";
import { Logo } from "@rf-intelligence/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "RF Intelligence Dashboard",
  description: "Client dashboard for RF Intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <header style={{ padding: "1rem", borderBottom: "1px solid var(--color-border)" }}>
          <Logo href="/" size="md" />
        </header>
        <main style={{ padding: "2rem" }}>{children}</main>
      </body>
    </html>
  );
}