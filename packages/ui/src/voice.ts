/**
 * RF Intelligence — Voice & Tone Constants
 * ─────────────────────────────────────────────────────────────────────────────
 * Brand register: enterprise-grade automation, not a generic startup landing
 * page. Terse, declarative, B2B. Short sentences. Claims hedged. No hype.
 *
 * Framing: Understand → Decide → Execute
 *
 * Use these in dashboard copy, empty states, onboarding text, and error
 * messages so the product keeps the same voice as the marketing site.
 *
 * Rules enforced in copy:
 *   • No em dashes in headlines
 *   • No superlatives (best-ever, unbelievable, incredible)
 *   • No numeric guarantees — use "Designed to…" / "Built to…"
 *   • Every CTA funnels toward a demo or the contact form
 *   • Capitalise display/impact headings (WhyRF pattern)
 *   • Eyebrow labels: uppercase, wide tracking, "/" prefix where appropriate
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Brand positioning ────────────────────────────────────────────────────────

export const brand = {
  name:        "RF Intelligence",
  tagline:     "The intelligence layer behind modern business.",
  description: "An AI automation company building the intelligence layer behind modern business operations.",
  url:         "https://www.rfintelligenceco.com",
  email:       "Intelligencerf@gmail.com",
  linkedin:    "https://www.linkedin.com/company/rfintelligence/",
  copyright:   `© ${new Date().getFullYear()} RF Intelligence. All rights reserved.`,
} as const;

// ─── Core framing ─────────────────────────────────────────────────────────────
// The Understand → Decide → Execute triad appears in hero copy, WhyRF, and
// should recur in dashboard onboarding and section headings.

export const framing = {
  triad:       ["Understand", "Decide", "Execute"] as const,
  triadPhrase: "Understand. Decide. Execute.",
  positioning: "Not Another Tool.",
  contrast:    {
    traditional:  "Records.",
    automation:   "Repeats.",
    rf:           "Runs.",
    rfExpanded:   "Understands, decides, executes.",
  },
} as const;

// ─── CTAs ─────────────────────────────────────────────────────────────────────

export const cta = {
  primary:        "Book Free Demo",
  secondary:      "See How It Works",
  explore:        "Explore RF Intelligence",
  seeInAction:    "See It in Action",
  mapWorkflow:    "Map My Workflow",
  bookDemo:       "Book a Demo",
  getStarted:     "Get Started",
  viewDashboard:  "View Dashboard",
  contactUs:      "Contact Us",
} as const;

// ─── Hero / marketing copy ────────────────────────────────────────────────────

export const hero = {
  headlineLine1: "The Intelligence Layer Behind",
  headlineLine2: "Modern Business.",
  subheadline:   "RF Intelligence turns repetitive operational work into automated systems — so your team spends less time on tasks and more time on decisions that matter.",
} as const;

// ─── Section headings & eyebrows ─────────────────────────────────────────────

export const sections = {
  about: {
    eyebrow:  "About RF",
    heading:  "We find signal in the noise.",
    body:     "We started RF Intelligence after watching the same pattern across every team we worked with — smart people spending their time on work that didn't need their judgment. Approvals, data entry, status checks. So we built the layer that filters it out: automated systems that handle the repeatable work reliably, and surface only what actually needs a human decision.",
    badge:    "Signal, Not Noise",
  },
  services: {
    eyebrow: "/ what we build",
    items: [
      { title: "Workflow Automation",  tagline: "Kill the repetitive work — approvals, entry and checks, end-to-end." },
      { title: "Custom AI Agents",     tagline: "Agents that act, not just answer — inside guardrails you control." },
      { title: "Data Intelligence",    tagline: "Pipelines that surface signal — dashboards people actually open." },
      { title: "Systems Integration",  tagline: "Your stack, speaking one language — no more gaps between tools." },
      { title: "Decision Support",     tagline: "Surface only what needs a human — filter the rest automatically." },
    ],
  },
  howItWorks: {
    eyebrow:  "How It Works",
    heading:  "From Manual To Autonomous.",
    stages:   ["Discover", "Analyse", "Design", "Deploy", "Optimise"] as const,
  },
  benefits: {
    eyebrow:    "/ benefits",
    heading:    "Less busywork. More business.",
    subheading: "Seven outcomes RF is designed to pursue on your operations — stated honestly, because results depend on the workflow.",
    /** All benefit copy uses "Designed to…" — never numeric guarantees */
    hedgePrefix: "Designed to",
    items: [
      "Reduce Manual Work",
      "Improve Operational Efficiency",
      "Reduce Human Error",
      "Scale Operations",
      "Faster Response",
      "Better Visibility",
      "Lower Operational Costs",
    ] as const,
  },
  contact: {
    eyebrow:     "Contact Us",
    heading:     "Let's Build Your Advantage.",
    subheading:  "Tell us where your workflows leak time and money — we'll show you what intelligence can recover.",
    placeholder: "Tell us about the workflow you'd like to automate…",
    replyNote:   "We reply to every enquiry — usually within one business day.",
  },
  footer: {
    tagline:     "An AI automation company building the intelligence layer behind modern business operations.",
    closing:     "Thank you for visiting.",
  },
} as const;

// ─── Dashboard copy ───────────────────────────────────────────────────────────
// Same register as the marketing site: terse, declarative, B2B.
// Onboarding guides users through the Understand → Decide → Execute triad.

export const dashboard = {
  // Page / layout titles
  titles: {
    home:       "Operations Overview",
    workflows:  "Workflows",
    agents:     "Agents",
    pipelines:  "Data Pipelines",
    settings:   "Settings",
    login:      "RF Intelligence",
  },

  // Sidebar / nav labels
  nav: {
    overview:   "Overview",
    workflows:  "Workflows",
    agents:     "Agents",
    data:       "Data",
    reports:    "Reports",
    settings:   "Settings",
    help:       "Help",
  },

  // Onboarding — mirrors Understand → Decide → Execute framing
  onboarding: {
    welcome:    "Welcome to RF Intelligence.",
    step1: {
      label:   "Understand",
      heading: "Connect your first workflow.",
      body:    "Tell us where your team is spending time on work that doesn't need their judgment. Approvals, data entry, status checks — start there.",
      cta:     "Add a Workflow",
    },
    step2: {
      label:   "Decide",
      heading: "Review what RF found.",
      body:    "We've mapped the repeatable steps in your workflow. Confirm which ones RF should handle automatically and which stay with your team.",
      cta:     "Review Automations",
    },
    step3: {
      label:   "Execute",
      heading: "RF is running.",
      body:    "Your workflow is live. RF handles the repeatable work and surfaces only what needs a decision. Check the overview to see what's been filtered.",
      cta:     "View Overview",
    },
  },

  // Empty states — no-data / first-run messages
  emptyStates: {
    workflows: {
      heading: "No workflows yet.",
      body:    "Add a workflow and RF will map the steps that can run automatically.",
      cta:     "Add Your First Workflow",
    },
    agents: {
      heading: "No agents deployed.",
      body:    "Agents act on your behalf — inside the guardrails you set. Deploy one to get started.",
      cta:     "Deploy an Agent",
    },
    data: {
      heading: "No pipelines connected.",
      body:    "Connect a data source and RF will surface the signal your team actually needs.",
      cta:     "Connect a Source",
    },
    reports: {
      heading: "No reports yet.",
      body:    "Reports appear once RF has enough activity data to surface meaningful patterns.",
      body2:   "Check back after your first workflow runs.",
    },
    activityFeed: {
      heading: "Nothing to surface.",
      body:    "RF filters out the noise. When something needs your attention, it will appear here.",
    },
    notifications: {
      heading: "All clear.",
      body:    "No items need your attention right now.",
    },
  },

  // Status / feedback messages
  status: {
    running:    "Running",
    paused:     "Paused",
    error:      "Needs attention",
    completed:  "Completed",
    pending:    "Pending",
    deploying:  "Deploying",
  },

  // Inline copy — tooltips, descriptions, helper text
  inline: {
    lastRun:        "Last run",
    nextRun:        "Next run",
    successRate:    "Success rate",
    itemsProcessed: "Items processed",
    savedTime:      "Time recovered",
    guardrails:     "Inside guardrails you control.",
    autoHandled:    "Handled automatically by RF.",
    needsDecision:  "Needs your decision.",
    filterNote:     "RF filters the rest automatically.",
  },

  // Error / loading states
  error: {
    generic:      "Something went wrong. Try again or contact support.",
    notFound:     "This page doesn't exist.",
    unauthorized: "You don't have access to this resource.",
    loadFail:     "Couldn't load data. Check your connection and try again.",
  },

  loading: {
    default:    "Loading…",
    workflows:  "Loading workflows…",
    data:       "Fetching data…",
    agents:     "Loading agents…",
  },

  // Auth / login screen
  auth: {
    signIn:     "Sign in to RF Intelligence",
    signInBody: "Your operations overview is waiting.",
    emailLabel: "Work email",
    passLabel:  "Password",
    signInCta:  "Sign In",
    forgotPass: "Forgot password?",
    noAccount:  "Need access? Contact your administrator.",
  },
} as const;

// ─── Type exports ─────────────────────────────────────────────────────────────

export type BrandConstants      = typeof brand;
export type FramingConstants    = typeof framing;
export type CTAConstants        = typeof cta;
export type DashboardCopy       = typeof dashboard;
export type SectionsCopy        = typeof sections;
