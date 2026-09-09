import nodemailer from "nodemailer";

/**
 * POST /api/contact
 *
 * Receives the contact form submission, then:
 *  1. Notifies the team inbox (Intelligencerf@gmail.com) with the lead details.
 *  2. Sends a personalized, link-free thank-you email to the client.
 *
 * Requires env vars (see .env.example):
 *   GMAIL_USER           — Intelligencerf@gmail.com
 *   GMAIL_APP_PASSWORD   — Google App Password (not the account password)
 */

const TEAM_EMAIL = "Intelligencerf@gmail.com";

type ContactPayload = {
  firstName?: string;
  lastName?: string;
  contactNumber?: string;
  email?: string;
  requirement?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function validate(payload: ContactPayload): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!payload.firstName?.trim()) errors.firstName = "First name is required.";
  if (!payload.lastName?.trim()) errors.lastName = "Last name is required.";

  const digits = payload.contactNumber?.replace(/\D/g, "") ?? "";
  if (!payload.contactNumber?.trim()) {
    errors.contactNumber = "Contact number is required.";
  } else if (digits.length < 7 || digits.length > 15) {
    errors.contactNumber = "Enter a valid contact number.";
  }

  const email = payload.email?.trim() ?? "";
  if (!email) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  return errors;
}

export async function POST(request: Request) {
  let payload: ContactPayload;
  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { ok: false, message: "Invalid request." },
      { status: 400 },
    );
  }

  const errors = validate(payload);
  if (Object.keys(errors).length > 0) {
    return Response.json({ ok: false, errors }, { status: 400 });
  }

  const firstName = payload.firstName!.trim();
  const lastName = payload.lastName!.trim();
  const fullName = `${firstName} ${lastName}`;
  const contactNumber = payload.contactNumber!.trim();
  const email = payload.email!.trim();
  const requirement =
    payload.requirement && payload.requirement.trim().length > 0
      ? payload.requirement.trim()
      : "—";

  const gmailUser = process.env.GMAIL_USER ?? TEAM_EMAIL;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailAppPassword) {
    console.error(
      "[contact] GMAIL_APP_PASSWORD is not set — cannot send emails.",
    );
    return Response.json(
      { ok: false, message: "Email service is not configured yet. Please reach out to us directly at Intelligencerf@gmail.com." },
      { status: 500 },
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    // ── 1. Internal notification to the team inbox ──
    await transporter.sendMail({
      from: `RF Intelligence Website <${gmailUser}>`,
      to: TEAM_EMAIL,
      replyTo: email,
      subject: `New Enquiry — ${fullName}`,
      text: [
        `New enquiry from the website contact form.`,
        ``,
        `Name: ${fullName}`,
        `Contact Number: ${contactNumber}`,
        `Email: ${email}`,
        `Requirement:`,
        requirement,
      ].join("\n"),
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; color:#1a1a1a; max-width:560px;">
          <h2 style="margin:0 0 16px;">New enquiry — RF Intelligence</h2>
          <table cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
            <tr><td style="color:#555;"><strong>Name</strong></td><td>${escapeHtml(fullName)}</td></tr>
            <tr><td style="color:#555;"><strong>Contact Number</strong></td><td>${escapeHtml(contactNumber)}</td></tr>
            <tr><td style="color:#555;"><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
            <tr valign="top"><td style="color:#555;"><strong>Requirement</strong></td><td>${escapeHtml(requirement).replace(/\n/g, "<br />")}</td></tr>
          </table>
        </div>
      `,
    });

    // ── 2. Personalized thank-you to the client.
    // Deliberately plain and link-free so Gmail does not flag it as spam:
    // no anchors, no images, no tracking pixels, minimal HTML.
    const summaryRows: Array<[string, string]> = [
      ["Name", fullName],
      ["Contact Number", contactNumber],
      ["Email", email],
      ["Requirement", requirement],
    ];

    const summaryHtml = summaryRows
      .map(
        ([label, value]) => `
            <tr>
              <td style="padding:10px 14px;background:#f6f7f9;border:1px solid #e3e5e8;font-weight:bold;color:#333;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
              <td style="padding:10px 14px;border:1px solid #e3e5e8;color:#1a1a1a;">${escapeHtml(value).replace(/\n/g, "<br />")}</td>
            </tr>`,
      )
      .join("");

    await transporter.sendMail({
      from: `RF Intelligence <${gmailUser}>`,
      to: email,
      subject: `Thank you for reaching out, ${firstName}!`,
      text: [
        `Hi ${firstName},`,
        ``,
        `Thank you for getting in touch with RF Intelligence.`,
        ``,
        `We have received your enquiry and one of our team members will review it and get back to you shortly.`,
        ``,
        `----------------------------------------`,
        `HERE IS WHAT YOU SHARED WITH US`,
        `----------------------------------------`,
        ...summaryRows.map(([label, value]) => `${label}: ${value}`),
        `----------------------------------------`,
        ``,
        `If you would like to add anything in the meantime, simply reply to this email — it reaches our team directly.`,
        ``,
        `Warm regards,`,
        `Team RF Intelligence`,
      ].join("\n"),
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;font-size:15px;line-height:1.65;max-width:600px;margin:0 auto;">
          <div style="background:#0D0E12;padding:22px 28px;border-radius:8px 8px 0 0;">
            <p style="margin:0;color:#F24E4B;font-size:12px;letter-spacing:3px;text-transform:uppercase;">RF Intelligence</p>
          </div>
          <div style="border:1px solid #e3e5e8;border-top:none;padding:28px;border-radius:0 0 8px 8px;">
            <h2 style="margin:0 0 18px;font-size:20px;color:#1a1a1a;">Hi ${escapeHtml(firstName)},</h2>
            <p style="margin:0 0 14px;">Thank you for getting in touch with <strong>RF Intelligence</strong>.</p>
            <p style="margin:0 0 20px;">We have received your enquiry and one of our team members will review it and get back to you shortly.</p>
            <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:14px;margin:0 0 22px;">
              ${summaryHtml}
            </table>
            <p style="margin:0 0 24px;color:#444;">If you would like to add anything in the meantime, simply reply to this email — it reaches our team directly.</p>
            <div style="border-top:1px solid #e3e5e8;padding-top:18px;">
              <p style="margin:0;"><strong>Team RF Intelligence</strong></p>
              <p style="margin:4px 0 0;color:#888;font-size:13px;">Intelligencerf@gmail.com</p>
            </div>
          </div>
        </div>
      `,
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("[contact] Failed to send emails:", error);
    return Response.json(
      { ok: false, message: "Something went wrong while sending your message. Please try again or email us at Intelligencerf@gmail.com." },
      { status: 500 },
    );
  }
}
