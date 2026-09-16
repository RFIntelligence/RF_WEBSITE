"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

export default function LoginPage() {
  const router = useRouter();

  function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    // No auth logic — clicking Sign in navigates straight to dashboard
    router.push("/dashboard");
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-[var(--background)] px-4">
      {/* Subtle radial glow behind the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div
          style={{
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(242,78,75,0.07) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[400px]">
        {/* Logo + wordmark */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image
            src="/logo.png"
            alt="RF Intelligence"
            width={48}
            height={32}
            className="object-contain"
            priority
          />
          <span
            className="text-base font-semibold tracking-tight text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-geist-sans, system-ui)" }}
          >
            RF Intelligence
          </span>
        </div>

        {/* Card surface */}
        <div
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8"
          style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.4)" }}
        >
          {/* Heading */}
          <h1 className="mb-1 text-xl font-semibold text-[var(--text-primary)]">
            Sign in
          </h1>
          <p className="mb-6 text-sm text-[var(--text-muted)]">
            Enter your credentials to access your workspace.
          </p>

          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-xs font-mono tracking-widest uppercase text-[var(--text-muted)]"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                defaultValue="jordan.ellis@acmecorp.com"
                autoComplete="email"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-xs font-mono tracking-widest uppercase text-[var(--text-muted)]"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                defaultValue="password"
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="mt-2 w-full h-10 text-sm font-semibold">
              Sign in
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[var(--surface)] px-3 text-xs text-[var(--text-muted)]">
                or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-10 text-sm"
            onClick={() => router.push("/dashboard")}
          >
            <svg
              aria-hidden="true"
              className="mr-2 h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            className="text-[var(--accent)] hover:underline"
            onClick={() => router.push("/dashboard")}
          >
            Request access
          </button>
        </p>
      </div>
    </div>
  );
}
