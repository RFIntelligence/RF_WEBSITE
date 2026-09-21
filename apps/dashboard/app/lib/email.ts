/**
 * Minimal email delivery abstraction.
 *
 * The demo deployment uses the "console" provider (`EMAIL_PROVIDER=console`),
 * which records the outbound message instead of contacting a third party. A
 * real provider can be dropped in behind the same `sendEmail` contract without
 * touching call sites.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
}

export interface EmailResult {
  delivered: boolean;
  provider: string;
}

export function emailProviderName(): string {
  return process.env.EMAIL_PROVIDER?.trim() || "console";
}

export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const provider = emailProviderName();

  if (provider === "console") {
    // Use process.stdout.write so the full multi-line body is never truncated
    // by Next.js dev mode log buffering.
    const divider = "─".repeat(60);
    process.stdout.write(
      [
        "",
        divider,
        `[email:console]`,
        `  To:      ${message.to}`,
        `  Subject: ${message.subject}`,
        `  Body:`,
        ...message.body.split("\n").map((line) => `    ${line}`),
        divider,
        "",
      ].join("\n"),
    );
    return { delivered: true, provider };
  }

  // Unknown/unconfigured providers must never throw into the request path.
  console.warn(
    `[email] provider "${provider}" is not configured; message dropped`,
  );
  return { delivered: false, provider };
}
