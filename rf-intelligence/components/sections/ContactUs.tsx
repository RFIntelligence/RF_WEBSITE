"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { SendButton } from "@/components/ui/SendButton";
import { GeometricOrb } from "@/components/ui/geometric-orb";

/**
 * ContactUs — homepage section between How It Works and Footer.
 * Left: reserved slot for a 3D component (drop it into the placeholder div).
 * Right: contact form. All fields mandatory except the requirement text.
 *
 * Submissions POST to /api/contact which emails Intelligencerf@gmail.com
 * and sends the client a personalized, link-free thank-you message.
 */

type FormState = {
  firstName: string;
  lastName: string;
  contactNumber: string;
  email: string;
  requirement: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const INITIAL_STATE: FormState = {
  firstName: "",
  lastName: "",
  contactNumber: "",
  email: "",
  requirement: "",
};

const INPUT_STYLE = {
  background: "var(--surface-elevated)",
  border: "1px solid var(--border-strong)",
  color: "#F5F5F0",
} as const;

function validateField(name: keyof FormState, value: string): string {
  const trimmed = value.trim();
  switch (name) {
    case "firstName":
      return trimmed ? "" : "First name is required.";
    case "lastName":
      return trimmed ? "" : "Last name is required.";
    case "contactNumber": {
      if (!trimmed) return "Contact number is required.";
      const digits = trimmed.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15)
        return "Enter a valid contact number.";
      return "";
    }
    case "email":
      if (!trimmed) return "Email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed))
        return "Enter a valid email address.";
      return "";
    default:
      return "";
  }
}

export function ContactUs() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [serverMessage, setServerMessage] = useState("");

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleBlur(
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    const key = name as keyof FormState;
    const error = validateField(key, value);
    setErrors((prev) => ({ ...prev, [key]: error || undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors = {};
    (Object.keys(INITIAL_STATE) as Array<keyof FormState>).forEach((key) => {
      const error = validateField(key, form[key]);
      if (error) nextErrors[key] = error;
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    setServerMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (response.ok && data.ok) {
        setStatus("success");
        setForm(INITIAL_STATE);
        setErrors({});
      } else {
        if (data.errors && typeof data.errors === "object") {
          setErrors(data.errors as FieldErrors);
        }
        setStatus("error");
        setServerMessage(
          typeof data.message === "string"
            ? data.message
            : "Something went wrong. Please try again.",
        );
      }
    } catch {
      setStatus("error");
      setServerMessage(
        "Network error. Please check your connection and try again.",
      );
    }
  }

  return (
    <section aria-labelledby="contact-section-headline">
      {/* ── Heading block ── */}
      <div className="flex flex-col items-center text-center px-6 md:px-10 pt-24 md:pt-32 pb-4">
        <p
          className="text-xs font-medium uppercase m-0 mb-5"
          style={{
            color: "var(--accent)",
            letterSpacing: "0.2em",
            fontFamily: "var(--font-geist-mono, ui-monospace, monospace)",
          }}
        >
          Contact Us
        </p>
        <h2
          id="contact-section-headline"
          className="font-semibold tracking-[-0.02em] leading-[1.05] m-0 mb-6"
          style={{ fontSize: "clamp(2.25rem, 5vw, 4.5rem)", color: "#F5F5F0" }}
        >
          Let&apos;s Build Your
          <span
            className="block"
            style={{
              background:
                "linear-gradient(to right, #F5F5F0 0%, #F5F5F0 25%, #FA504D 45%, #CF4240 70%, #692220 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "#F5F5F0",
            }}
          >
            Advantage.
          </span>
        </h2>
        <p
          className="max-w-[600px] m-0 leading-[1.6] text-[var(--text-secondary)]"
          style={{ fontSize: "clamp(1rem, 1.5vw, 1.2rem)" }}
        >
          Tell us where your workflows leak time and money — we&apos;ll show you
          what intelligence can recover.
        </p>
      </div>

      {/* ── Content: 3D placeholder left, form right ── */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 pt-8 pb-24 md:pb-32 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* ── Left: 3D geometric orb ── */}
        <div className="relative min-h-[320px] md:min-h-[440px] order-last lg:order-first m-0 p-0">
          <GeometricOrb
            className="absolute inset-0 rounded-xl overflow-hidden"
            config={{
              background: "#05060A",
              color: "#F24E4B",
              numLines: 24,
              lineWidth: 2,
              radius: 3,
              enableZoom: false,
              enablePan: false,
            }}
          />
        </div>

        {/* ── Right: contact form ── */}
        <div>
          {status === "success" ? (
            <div
              className="rounded-xl px-8 py-10 text-center flex flex-col items-center"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-strong)",
              }}
            >
              <Image
                src="/thanku.webp"
                alt="Thank you"
                width={220}
                height={220}
                priority
                className="mb-6 rounded-xl object-cover"
              />
              <p
                className="m-0 mb-3 font-semibold"
                style={{ fontSize: "1.5rem", color: "#F5F5F0" }}
              >
                Message sent.
              </p>
              <p className="m-0 mb-6 leading-relaxed text-[var(--text-secondary)]">
                Thank you for reaching out — we&apos;ve received your enquiry
                and a confirmation email is on its way to your inbox.
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="px-4 py-2 rounded-md text-xs font-medium transition-all duration-200 hover:opacity-90 cursor-pointer"
                style={{
                  background: "var(--accent)",
                  color: "var(--accent-foreground)",
                }}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-xl p-6 md:p-8 flex flex-col gap-5"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-strong)",
              }}
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <label className="flex flex-col gap-2">
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    First Name <span style={{ color: "var(--accent)" }}>*</span>
                  </span>
                  <input
                    type="text"
                    name="firstName"
                    suppressHydrationWarning
                    value={form.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    autoComplete="given-name"
                    placeholder="Jane"
                    className="w-full rounded-md px-4 py-3 text-sm outline-none transition-colors duration-200 focus:!border-[var(--accent)]"
                    style={INPUT_STYLE}
                  />
                  {errors.firstName && (
                    <span
                      className="text-xs"
                      style={{ color: "var(--accent)" }}
                    >
                      {errors.firstName}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-2">
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Last Name <span style={{ color: "var(--accent)" }}>*</span>
                  </span>
                  <input
                    type="text"
                    name="lastName"
                    suppressHydrationWarning
                    value={form.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    autoComplete="family-name"
                    placeholder="Doe"
                    className="w-full rounded-md px-4 py-3 text-sm outline-none transition-colors duration-200 focus:!border-[var(--accent)]"
                    style={INPUT_STYLE}
                  />
                  {errors.lastName && (
                    <span
                      className="text-xs"
                      style={{ color: "var(--accent)" }}
                    >
                      {errors.lastName}
                    </span>
                  )}
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <label className="flex flex-col gap-2">
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Contact Number{" "}
                    <span style={{ color: "var(--accent)" }}>*</span>
                  </span>
                  <input
                    type="tel"
                    name="contactNumber"
                    suppressHydrationWarning
                    value={form.contactNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    autoComplete="tel"
                    placeholder="+91 98765 43210"
                    className="w-full rounded-md px-4 py-3 text-sm outline-none transition-colors duration-200 focus:!border-[var(--accent)]"
                    style={INPUT_STYLE}
                  />
                  {errors.contactNumber && (
                    <span
                      className="text-xs"
                      style={{ color: "var(--accent)" }}
                    >
                      {errors.contactNumber}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-2">
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Email <span style={{ color: "var(--accent)" }}>*</span>
                  </span>
                  <input
                    type="email"
                    name="email"
                    suppressHydrationWarning
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    autoComplete="email"
                    placeholder="jane@company.com"
                    className="w-full rounded-md px-4 py-3 text-sm outline-none transition-colors duration-200 focus:!border-[var(--accent)]"
                    style={INPUT_STYLE}
                  />
                  {errors.email && (
                    <span
                      className="text-xs"
                      style={{ color: "var(--accent)" }}
                    >
                      {errors.email}
                    </span>
                  )}
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Describe Your Requirement
                </span>
                <textarea
                  name="requirement"
                  value={form.requirement}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell us about the workflow you'd like to automate…"
                  className="w-full rounded-md px-4 py-3 text-sm outline-none resize-y transition-colors duration-200 focus:!border-[var(--accent)]"
                  style={INPUT_STYLE}
                />
              </label>

              {status === "error" && serverMessage && (
                <p
                  className="m-0 text-sm rounded-md px-4 py-3"
                  style={{
                    color: "var(--accent)",
                    border: "1px solid var(--border-strong)",
                    background: "rgba(242,78,75,0.06)",
                  }}
                >
                  {serverMessage}
                </p>
              )}

              <div className="mt-1">
                <SendButton sent={status === "submitting"} disabled={status === "submitting"} />
              </div>

              <p
                className="m-0 text-xs text-center"
                style={{ color: "var(--text-muted)" }}
              >
                We reply to every enquiry — usually within one business day.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default ContactUs;
