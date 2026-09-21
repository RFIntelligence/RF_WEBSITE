"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

type PageState =
  | { status: "loading" }          // reading the token from the URL
  | { status: "missing_token" }    // no token in the URL at all
  | { status: "form"; token: string }
  | { status: "submitting"; token: string }
  | { status: "success"; name: string }
  | { status: "api_error"; token: string; message: string }  // recoverable inline error
  | { status: "fatal_error"; message: string };              // non-recoverable (expired, accepted, etc.)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-400"
    >
      <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
      {message}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AcceptInvitationPage({ searchParams }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(searchParams);
  const token = resolvedParams.token ?? "";

  const [state, setState] = useState<PageState>({ status: "loading" });

  // On mount: validate the token is present in the URL (we can't verify the
  // HMAC client-side — that happens server-side on submit).
  useEffect(() => {
    if (!token.trim()) {
      setState({ status: "missing_token" });
    } else {
      setState({ status: "form", token });
    }
  }, [token]);

  // Form field errors (inline, field-level)
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    password?: string;
    confirm?: string;
  }>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = (form.get("name") as string).trim();
    const password = form.get("password") as string;
    const confirm = form.get("confirm") as string;

    // Client-side validation
    const errors: typeof fieldErrors = {};
    if (!name) errors.name = "Name is required";
    if (password.length < 8) errors.password = "Password must be at least 8 characters";
    if (password !== confirm) errors.confirm = "Passwords do not match";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    const currentToken =
      state.status === "form" || state.status === "api_error"
        ? state.token
        : token;
    setState({ status: "submitting", token: currentToken });

    try {
      const res = await fetch("/api/auth/accept-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: currentToken, name, password }),
      });

      const data = (await res.json().catch(() => null)) as {
        error?: string;
        user?: { name: string };
      } | null;

      if (!res.ok) {
        const message = data?.error ?? `Something went wrong (${res.status})`;

        // 409 "Already authenticated" and 410 gone are fatal (can't retry).
        // 400 bad request might be a recoverable field error shown inline.
        const isFatal = res.status === 410 || res.status === 404;
        if (isFatal) {
          setState({ status: "fatal_error", message });
        } else {
          setState({ status: "api_error", token: currentToken, message });
        }
        return;
      }

      setState({ status: "success", name: data?.user?.name ?? name });

      // Redirect to the dashboard after a short success pause.
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);
    } catch {
      setState({
        status: "api_error",
        token: currentToken,
        message: "Could not reach the server. Please check your connection and try again.",
      });
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-[var(--background)] px-4">
      {/* Radial glow — matches login page */}
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
          <span className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
            RF Intelligence
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8"
          style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.4)" }}
        >
          {/* ── Loading ── */}
          {state.status === "loading" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="size-6 animate-spin text-[var(--text-muted)]" />
              <p className="text-sm text-[var(--text-muted)]">Verifying invitation…</p>
            </div>
          )}

          {/* ── Missing token ── */}
          {state.status === "missing_token" && (
            <>
              <h1 className="mb-1 text-xl font-semibold text-[var(--text-primary)]">
                Invalid link
              </h1>
              <p className="mb-4 text-sm text-[var(--text-muted)]">
                This invitation link is missing its token. Please use the link sent to your
                email, or ask your Admin to resend the invitation.
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 text-sm"
                onClick={() => router.push("/login")}
              >
                Back to sign in
              </Button>
            </>
          )}

          {/* ── Non-recoverable error (expired, already accepted, etc.) ── */}
          {state.status === "fatal_error" && (
            <>
              <h1 className="mb-1 text-xl font-semibold text-[var(--text-primary)]">
                Invitation unavailable
              </h1>
              <p className="mb-4 text-sm text-[var(--text-muted)]">
                {state.message}
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 text-sm"
                onClick={() => router.push("/login")}
              >
                Back to sign in
              </Button>
            </>
          )}

          {/* ── Success ── */}
          {state.status === "success" && (
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <CheckCircle className="size-10 text-emerald-400" />
              <div>
                <h1 className="text-xl font-semibold text-[var(--text-primary)]">
                  Welcome, {state.name}!
                </h1>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Your account is set up. Taking you to the dashboard…
                </p>
              </div>
              <Loader2 className="size-4 animate-spin text-[var(--text-muted)]" />
            </div>
          )}

          {/* ── Form ── */}
          {(state.status === "form" ||
            state.status === "submitting" ||
            state.status === "api_error") && (
            <>
              <h1 className="mb-1 text-xl font-semibold text-[var(--text-primary)]">
                Accept invitation
              </h1>
              <p className="mb-6 text-sm text-[var(--text-muted)]">
                Set your name and a password to activate your account.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Full name */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="name"
                    className="text-xs font-mono tracking-widest uppercase text-[var(--text-muted)]"
                  >
                    Full name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Jane Smith"
                    autoComplete="name"
                    autoFocus
                    required
                    aria-describedby={fieldErrors.name ? "name-error" : undefined}
                  />
                  {fieldErrors.name && (
                    <p id="name-error" className="text-xs text-rose-400">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="password"
                    className="text-xs font-mono tracking-widest uppercase text-[var(--text-muted)]"
                  >
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    required
                    aria-describedby={fieldErrors.password ? "password-error" : undefined}
                  />
                  {fieldErrors.password && (
                    <p id="password-error" className="text-xs text-rose-400">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                {/* Confirm password */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="confirm"
                    className="text-xs font-mono tracking-widest uppercase text-[var(--text-muted)]"
                  >
                    Confirm password
                  </label>
                  <Input
                    id="confirm"
                    name="confirm"
                    type="password"
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    required
                    aria-describedby={fieldErrors.confirm ? "confirm-error" : undefined}
                  />
                  {fieldErrors.confirm && (
                    <p id="confirm-error" className="text-xs text-rose-400">
                      {fieldErrors.confirm}
                    </p>
                  )}
                </div>

                {/* Server-side errors shown above the submit button */}
                {state.status === "api_error" && (
                  <ErrorBanner message={state.message} />
                )}

                <Button
                  type="submit"
                  disabled={state.status === "submitting"}                  className="mt-2 w-full h-10 text-sm font-semibold"
                >
                  {state.status === "submitting" ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Creating account…
                    </span>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        {(state.status === "form" ||
          state.status === "submitting" ||
          state.status === "api_error") && (
          <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
            Already have an account?{" "}
            <button
              type="button"
              className="text-[var(--accent)] hover:underline"
              onClick={() => router.push("/login")}
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
