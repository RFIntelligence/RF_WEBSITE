# RF Intelligence — Product Requirements

> Source of truth: `RF_Intelligence_Website.pdf` (client document). This file translates that document into engineering requirements. Anything not explicitly stated in the PDF is marked **UNDEFINED / REQUIRES CLIENT INPUT** — it must never be silently invented.

---

## 1. Product Overview

RF Intelligence is an early-stage **AI automation company**. The website's job is to present RF as a serious enterprise technology company that helps businesses turn repetitive operational workflows into intelligent, automated systems — not as a generic "AI startup" or SaaS dashboard product.

The website is the primary trust and lead-generation instrument for the company. It must let a visitor understand, within 10–15 seconds of landing: what RF is, what problem it solves, what it actually does, how it benefits businesses, why to trust it, how it differs from traditional automation/software, and how to book a demo.

## 2. Business Objective

The website must:
- Establish RF Intelligence as a credible, enterprise-grade automation company.
- Clearly communicate the "intelligence layer" positioning (not a dashboard, not a SaaS tool).
- Educate visitors on the problem (manual operational work) and RF's solution (Understand → Decide → Execute automation).
- Drive qualified visitors to **Book a Demo** or to describe what they want automated.
- Be credible to secondary audiences (investors, partners, future employees) without shifting primary focus away from B2B clients.

## 3. Target Users

- **B2B clients — PRIMARY AUDIENCE.** Business owners and operations decision-makers evaluating automation for their business.
- Business owners
- Operations teams
- Decision makers
- Investors
- Partners
- Potential employees

All design, copy, and IA decisions should optimize for the B2B client journey first. Investor/partner/careers content is present but secondary and must not dominate the homepage.

## 4. Core Value Proposition

> "RF Intelligence isn't another software dashboard. It is an intelligence layer designed to help businesses automate the work behind their operations."

Primary desired visitor reaction: **"I want to see what RF could automate in my business."**

Hero messaging must lead with value, never with "Welcome to RF Intelligence."

## 5. Primary Conversion Goal

- **Primary:** Book a Demo
- **Secondary:** Discuss / "Tell Us What You Want To Automate"

CTA copy must stay consistent site-wide (see §40 equivalent in design system — do not invent multiple CTA phrasings beyond what the PDF specifies per page).

## 6. User Journey

```
Visitor
 → Understands what RF is (hero, 10–15s)
 → Recognizes their operational problem (Problem section)
 → Understands RF's solution (What is RF / How RF Works)
 → Understands differentiation (Why RF)
 → Sees potential benefits (Benefits, Before/After)
 → Builds trust (Security, Trust, FAQ)
 → Takes action (Book a Demo / lead popup)
 → Submits lead
 → RF receives lead (stored + team notified)
```

## 7. Information Architecture

```
/
/about              (About RF Intelligence + Founder section)
/services
/why-rf
/benefits
/how-it-works
/industries
/book-a-demo
/contact
/legal/privacy-policy
/legal/terms-of-service
/legal/cookie-policy
/legal/security
/legal/data-processing
/legal/ai-disclaimer
/404
```

**Homepage vs. dedicated page distinction (per PDF):**
- Sections the PDF explicitly treats as **homepage scroll sections** (with anchors, and standalone nav-triggered pages where the PDF says navigation can route to a dedicated page): Hero, Hero interactive visual, What is RF Intelligence, The Problem, Why Businesses Need Intelligent Automation, Live Automation Visualization ("RF Brain"), Before/After slider, Trust section, FAQ, final CTA, Footer.
- Sections that **also warrant their own dedicated route** because the PDF calls them out as major navigation items: Services, Why RF, Benefits, How It Works, Industries, Book a Demo, About RF, Contact.
- **UNDEFINED / REQUIRES CLIENT INPUT:** whether Services/Why RF/Benefits/How It Works appear *only* as homepage sections with anchor links, *only* as standalone pages, or both (homepage teaser + full dedicated page). Recommendation (design judgment, not a requirement): homepage carries a condensed version of each section with a link to the full dedicated page. Flag for client confirmation before Phase 3+.

## 8. Homepage Requirements

Each section below: Purpose / Content / User Intent / Visual Concept / Interaction / CTA / Responsive Behavior / Acceptance Criteria.

### 8.1 Navbar
- **Purpose:** Persistent wayfinding + primary conversion access.
- **Content:** RF logo, Home, About RF, Services, Why RF, Benefits, How It Works, Book a Demo; right side: theme toggle + Book a Demo CTA button.
- **User Intent:** Orient and navigate without friction.
- **Visual:** Sticky, dark-first, subtle border/blur on scroll.
- **Interaction:** Smooth scroll for on-page anchors; route navigation for dedicated pages; sticky on scroll.
- **CTA:** Book a Demo (button, always visible).
- **Responsive:** Mobile collapses to `☰` menu; theme switcher remains visible.
- **Acceptance:** All links functional, no dead anchors, keyboard-navigable, correct active-state per route/section.

### 8.2 Hero
- **Purpose:** Communicate core value prop in <15 seconds.
- **Content:** Headline ("The Intelligence Layer Behind Modern Business." or alternative), supporting paragraph, primary CTA (Book a Demo), secondary CTA (Explore RF Intelligence), small credibility line ("AI-powered business automation. Built for real-world operations.").
- **Visual:** Dynamic background (nodes/lines/particles), hero workflow visual beside/behind text.
- **Interaction:** CTA buttons; background animation continuously subtle-running; respects reduced motion.
- **CTA:** Book a Demo (primary), Explore RF Intelligence (secondary, scrolls to "What is RF").
- **Responsive:** Mobile stacks text above/below visual; background animation simplified or reduced on low-power devices.
- **Acceptance:** Headline legible over animation at all breakpoints/themes; no motion-sickness-inducing effects; LCP unaffected by animation.

### 8.3 Hero Interactive Visual (Workflow)
- **Content:** Business Input → RF Intelligence → AI Understands → AI Decides → AI Executes → Business Result.
- **Interaction:** Continuous subtle animated flow; optionally highlights active stage.
- **Failure behavior:** If animation fails to load/render, layout must degrade to a static labeled diagram — never a blank space.
- **Acceptance:** Runs at 60fps target or degrades gracefully; accessible text equivalent of the flow exists for screen readers.

### 8.4 What is RF Intelligence
- **Content:** Company explanation paragraph (as provided) + Understand → Decide → Execute framework.
- **Visual:** Three-stage visual (cards or connected diagram).
- **CTA:** none required explicitly; optional link to /about.
- **Acceptance:** Content matches PDF wording/intent; no invented capability claims.

### 8.5 The Problem
- **Content:** "Businesses Are Still Running on Manual Work." + list of manual pain points (data entry, spreadsheets, emails, WhatsApp, follow-ups, order processing, inventory updates, customer comms, reconciliation, reporting, human-dependent workflows) + consequences (lost time, higher costs, human errors, slow response, poor scalability, burnout, inconsistent processes, missed opportunities).
- **Headline:** "Your employees shouldn't spend their day doing work a machine can handle."
- **Visual:** List/grid, optionally with subtle iconography (no generic robot art).
- **Acceptance:** No fabricated statistics attached to these pain points.

### 8.6 Why Businesses Need Intelligent Automation
- **Content:** Traditional flow (Human → Software → Human → Decision → Human → Action) vs. Intelligent Automation flow (Business Data → RF Intelligence → AI → Action). Plus scaling triggers (order volume, customer growth, repetitive workload, new locations, complexity, need for faster response).
- **Visual:** Side-by-side or before/after flow diagram (distinct from the dedicated Before/After slider in §8.11 — this one is a static/simple compare, not the full interactive slider).
- **Acceptance:** Clear visual contrast between the two flows.

### 8.7 Services
- **Content:** 6 categories exactly as specified — Workflow Automation, AI-Powered Operations, Business Process Automation, AI Agents, System Integration, Custom AI Automation — each with its example list from the PDF.
- **Visual:** Card grid; Business Process Automation example should be shown as an interactive step flow (Customer order received → Information extracted → Order validated → Inventory checked → Team notified → Customer updated → Records updated).
- **CTA:** "Tell Us What You Want To Automate" (Custom AI Automation card).
- **Acceptance:** Exactly six services, no invented seventh; AI Agents copy avoids claiming full autonomy per PDF caution.

### 8.8 How RF Works
- **Content:** Discover → Analyse → Design → Deploy → Optimise, each with the one-line description from the PDF.
- **Visual:** Interactive horizontal step sequence (5 steps).
- **Acceptance:** Steps in this exact order and count.

### 8.9 Benefits
- **Content:** Reduce Manual Work, Improve Operational Efficiency, Reduce Human Error, Scale Operations, Faster Response, Better Visibility, Lower Operational Costs.
- **Language rule:** Every benefit must use hedged language ("Designed to...", "Potentially...", "Depending on the workflow...") — **never** a hard numeric guarantee (e.g., never "reduces costs by 80%").
- **Visual:** Animated stat/benefit cards — but "animated" refers to entrance/hover motion, not fabricated big numbers.
- **Acceptance:** Zero unhedged outcome claims; zero invented statistics.

### 8.10 Why RF (Differentiation)
- **Content:** Comparison (Traditional Software / Automation Tools / RF Intelligence) + 6 differentiation cards (Business First, Workflow Specific, AI + Automation, Integration Friendly, Human-in-the-Loop, Designed for Scale).
- **Visual:** 3-column comparison + numbered card grid (01–06).
- **Acceptance:** All six differentiators present, numbered as specified.

### 8.11 Before/After Interactive Slider
- **Content:** LEFT ("Before RF"): Employee → Email → Spreadsheet → Manual verification → System update → Follow-up → Report → Hours of work. RIGHT ("With RF Intelligence"): Business Input → RF Intelligence → AI understands → Automation executes → Human approval when required → Completed → Real-time visibility.
- **Interaction:** Draggable/interactive slider revealing left vs right state.
- **Accessibility:** Must have a non-drag fallback (buttons/keyboard) for users who cannot use a pointer slider.
- **Acceptance:** Fully operable via keyboard; content matches PDF exactly; no added claims.

### 8.12 Industries / Use Cases
- **Content:** Wholesale & Distribution, Manufacturing, Logistics, Professional Services — each with the bullet list from the PDF. Plus "Don't see your industry?" callout with CTA "Talk to RF."
- **Acceptance:** Exactly the four industries listed; no additional invented industries.

### 8.13 Security
- **Content:** "Built With Security in Mind" + control list (data protection, secure auth, encryption in transit/at rest where applicable, access control, RBAC, audit logging, secure APIs, monitoring, data minimisation, controlled access, secure infrastructure, backup/recovery).
- **Hard rule:** Never claim "100% secure." Use: "We implement security controls designed to protect customer information and continuously improve our security practices."
- **Acceptance:** No absolute security claims anywhere on the site.

### 8.14 Trust
- **Content:** "Built for Businesses That Want to Move Faster." Honest attribute list only (AI-powered, workflow-focused, integration-ready, security-conscious, human-controlled, built for scale). **No logos, no client counts, no testimonials** until real customers exist — flagged as future-state ("Once legitimate customers are acquired, this section can become 'Trusted by' with actual logos").
- **Acceptance:** Zero fabricated logos/testimonials/numbers.

### 8.15 FAQ
- **Content:** The 9 Q&As specified in the PDF exactly (What is RF Intelligence / What businesses can use it / Does RF replace employees / Can RF integrate with existing software / Is data secure / Can RF build custom automation / How long does implementation take / How much does RF cost / Can I request a demo).
- **Pricing answer:** must use hedged language exactly as specified — no invented pricing figures.
- **Acceptance:** All 9 present; accordion is keyboard accessible.

### 8.16 Final CTA
- **Content:** Reinforces Book a Demo before footer.
- **Acceptance:** Single consistent CTA phrase, matches nav CTA.

### 8.17 Footer
- **Content:** Company blurb, nav links, Company links (About, Contact, Careers, Partnerships), Legal links (6 documents), Social (LinkedIn + other official channels — **UNDEFINED / REQUIRES CLIENT INPUT** for "other official channels"), copyright line "© 2026 RF Intelligence. All rights reserved."
- **Acceptance:** No broken links; legal links point to real (even if placeholder-marked "under legal review") pages, never dead `#`.

## 9. Navigation Requirements

- **Desktop:** persistent top nav, sticky on scroll, smooth-scroll to homepage anchors, route transitions to dedicated pages.
- **Mobile:** hamburger (`☰`) menu; theme toggle remains visible/reachable; Book a Demo CTA remains reachable (either in menu or as a persistent element).
- **Sticky behavior:** navbar remains visible while scrolling; may add background/blur once scrolled past hero.
- **Theme switcher:** visible in nav on both desktop and mobile.
- **CTA:** Book a Demo, consistently placed on the right.

## 10. Dark/Light Theme

- **Dark mode is default.**
- Light mode must be a fully realized theme, not an afterthought — dedicated palette (white/off-white bg, dark text, same accent, light grey borders, subtle shadows).
- Theme choice **persists** across visits (client-side storage — mechanism is an implementation decision, see skills.md).
- Toggle lives in the navbar on both breakpoints.
- Design tokens must exist for both themes (see design.md §3).
- Contrast requirements: WCAG AA minimum in both themes.

## 11. Interactive Features

Each feature below requires: Objective / User Interaction / Expected Behavior / Failure Behavior / Accessibility / Mobile Behavior / Performance Constraints. Detailed spec deferred to design.md §10–12 and implemented per-phase in the blueprint; summarized here for completeness:

1. **Hero workflow animation** — see §8.3.
2. **Dynamic background** (nodes/lines/particles representing Business → Data → Intelligence → Automation → Result) — must be disableable for reduced-motion users; never interferes with text readability; must not degrade Core Web Vitals.
3. **"RF Brain" live automation visualization** — Input (data/documents/emails/orders/requests) → RF Intelligence (AI processing: understanding/decision/automation) → Output (completed task). Animated, visually impressive, but purposeful (communicates the pipeline, not decoration).
4. **Before/After slider** — see §8.11.
5. **Interactive Business Flow** — visitor clicks through Input → AI Understanding → Decision → Action → Result, each stage clickable to reveal an explanation of what RF does at that stage.
6. **"What Should We Automate?" tool** — 3-question mini quiz (task type → frequency → team size involved) ending in "This looks like a potential automation opportunity" + CTA "Discuss It With RF." Lead-gen mechanism.
7. **ROI Calculator** — inputs: employees involved, hours/week, avg employee cost, frequency, estimated automation %. Outputs: estimated annual manual workload, estimated potential time saved, estimated potential operational value. **Must display:** "Illustrative estimate — actual results depend on the workflow and implementation." Never presented as guaranteed.
8. **Demo experience (interactive mini-demo)** — e.g., visitor selects "I process customer orders" → shown Customer Order → AI reads order → RF validates → Inventory checked → Order processed → Customer notified → Dashboard updated. Marked **UNDEFINED / REQUIRES CLIENT INPUT**: PDF says "If technically possible" — confirm scope/feasibility before building (candidate for a later phase, not core path).
9. **Lead popup** — triggers: time-on-site, exit-intent, "Book a Demo" click, 50–70% scroll. Must not show repeatedly (session/persistent suppression after first dismissal or submission).
10. **FAQ accordion** — see §8.15.
11. **Theme switching** — see §10.

## 12. Services

Exactly six, as enumerated in §8.7. Do not invent capabilities beyond what's listed under each. AI Agents copy must avoid implying full autonomy unless the actual product supports it (PDF explicit caution).

## 13. How RF Works

DISCOVER → ANALYSE → DESIGN → DEPLOY → OPTIMISE (exact order, exact 5 stages, one-line descriptions per §8.8).

## 14. Benefits

See §8.9. Hedged language is a hard requirement, not a style preference.

## 15. Differentiation

See §8.10. Six differentiators, numbered 01–06, exact titles from PDF.

## 16. Industries

Wholesale & Distribution, Manufacturing, Logistics, Professional Services — exact bullet lists per §8.12. No additional industries without client confirmation.

## 17. Security

See §8.13 for content. See §26 (skills.md) for engineering-level security requirements (headers, validation, rate limiting, etc.).

## 18. Privacy and Legal

Required legal pages: Privacy Policy, Terms of Service, Cookie Policy, Data Processing Terms/DPA (where applicable), Security Policy, Acceptable Use Policy, AI Disclaimer, Intellectual Property Notice, Refund/Cancellation Policy (if applicable — **UNDEFINED**, confirm applicability), Contact/Grievance information (where legally required).

**Jurisdictional note (from PDF):** India DPDP Act considerations (lawful processing, notice to individuals about personal data and purposes) apply; GDPR considerations apply if RF processes personal data of EU-based individuals in circumstances GDPR covers (transparency, purpose limitation, data minimisation, storage limitation, security, accountability). Whether the IT Rules' "intermediary" obligations apply is **not assumed** — that determination requires legal review.

**Hard rule:** The website must not present itself as legally compliant merely because legal-sounding pages exist. All final legal documents require review by qualified counsel before launch. This must be stated internally in the codebase/CMS notes and is a client action item, not an engineering deliverable.

## 19. Forms

| Form | Fields | Consent |
|---|---|---|
| Lead popup ("Let's Automate Something.") | Full Name, Work Email, Phone Number, Company Name, Job Title, Industry, Company Size, "What process would you like to automate?", Current system/tools used, Optional message | Unchecked-by-default consent checkbox linked to Privacy Policy: "I agree to RF Intelligence processing my information to respond to my enquiry and provide the requested service." |
| Book a Demo | Name, Company, Work email, Phone, Industry, Team size, Main operational challenge, Preferred demo date/time | Same consent pattern (implementation decision: confirm exact consent copy — reuse popup's or client-provided variant) |
| Contact page | Standard contact form (fields **UNDEFINED / REQUIRES CLIENT INPUT** — PDF doesn't enumerate; recommend Name, Email, Company, Message as a reasonable minimum, subject to client confirmation) | Consent checkbox recommended, pending client confirmation |

Consent checkboxes must never be pre-checked where consent is the legal basis.

## 20. Lead Management

- **Collection:** via popup, Book a Demo form, Contact form.
- **Storage:** persisted to a database (see skills.md §9).
- **Notifications:** relevant team member notified on new lead/demo request (channel — email at minimum; **UNDEFINED** whether Slack/other integrations are required).
- **Validation:** client-side + mandatory server-side validation.
- **Consent:** recorded with timestamp alongside lead record.
- **Error handling:** see §28.

## 21. Demo Booking

- Form (left) + calendar/scheduling interface (right).
- **UNDEFINED / REQUIRES CLIENT INPUT:** which scheduling system/provider to embed or build (e.g., Calendly-style embed vs. custom calendar). Do not assume a specific third-party tool.
- Submission confirmation copy: "Request received. Our team will review your requirements and get back to you."
- Failure states: see §28.

## 22. Analytics

Track (event names are an implementation detail, but coverage is required):
- Homepage visit
- Services viewed
- Why RF clicked
- Book Demo clicked
- Demo form started
- Demo form completed
- Contact form submitted
- Theme switched
- FAQ interaction

Analytics implementation must be privacy-conscious and consent-aware (see Cookie Consent, §20/skills.md §11).

## 23. SEO

- Proper page titles and meta descriptions per page.
- Open Graph metadata.
- Structured heading hierarchy (single H1 per page).
- Descriptive alt text on all meaningful images.
- Canonical URLs.
- `sitemap.xml`, `robots.txt`.
- Schema markup where appropriate (Organization at minimum; **UNDEFINED** whether Service/FAQ schema is desired — reasonable default: add FAQPage schema to the FAQ section since content is already structured as Q&A).
- Target keywords (non-exhaustive, no stuffing): AI automation, business automation, AI business automation, workflow automation, AI agents, intelligent automation, business process automation, enterprise AI automation, AI automation India.

## 24. Accessibility

Keyboard navigation for all interactive elements (including sliders, accordions, popups, calculators); screen-reader-friendly semantic HTML and ARIA where needed; visible focus states; WCAG AA contrast in both themes; reduced-motion support for all animated/interactive features; accessible form labeling and error messaging.

## 25. Performance

Mobile/desktop/tablet responsive; optimized images (modern formats, responsive sizes); lazy loading below the fold; optimized/lightweight animations; minimal unnecessary JavaScript; fast initial load; good Core Web Vitals (LCP, CLS, INP). Animations must never make the site feel slow — this is an explicit, testable acceptance criterion, not a nice-to-have.

## 26. Security Engineering

HTTPS; secure HTTP headers (CSP, HSTS, X-Content-Type-Options, etc.); server-side input validation on all forms (client-side alone is insufficient); rate limiting on form/API endpoints; CAPTCHA or equivalent anti-bot protection on public forms; secure API design; environment variables for all secrets (never hardcoded/exposed in frontend bundles); secure authentication if/when admin accounts exist; protections against common web vulnerabilities (XSS, CSRF, injection); correct database permission scoping; logging/monitoring; secure, tested backups.

## 27. Admin

Proposed capability (per PDF, marked as "ideally"):
- View leads
- View demo requests
- Export leads
- Change basic website content
- View enquiry information

**Implementation-decision flags:**
- Authentication mechanism for admin — **UNDEFINED / REQUIRES CLIENT INPUT** (single admin user vs. multi-user with roles).
- "Change basic content" scope (which fields are CMS-editable) — **UNDEFINED**, needs client input; a minimal safe default is text/CTA copy only, not structural layout.
- Export format (CSV assumed as a safe, standard default) — confirm with client.

Admin is explicitly a later-phase deliverable (Phase 22) and must not block frontend phases.

## 28. Error States

Required professional (never raw/technical) states for:
- Form submission failed
- Invalid email
- Required field missing
- Server unavailable
- Demo booking unavailable
- Network error
- 404 Page Not Found

Users must never see strings like "undefined" or "500 internal server error." All error copy must be human-authored, calm, and actionable (what to do next — retry, contact directly, etc.).

## 29. Acceptance Criteria (Global Definition of Done)

A feature is NOT complete unless it:
- Works functionally, in full.
- Looks visually correct against design.md.
- Is responsive across desktop/tablet/mobile with intentional (not merely shrunk) layouts.
- Is accessible (keyboard, screen reader, contrast, reduced motion).
- Handles all realistic error states gracefully.
- Performs well (no jank, no Core Web Vitals regressions).
- Produces zero console errors.
- Has no broken interactions or dead links.
- Follows the design system (tokens, components) rather than one-off styling.
- Contains no fake/fabricated content (logos, testimonials, stats, certifications, partnerships).
- Contains no unsupported or absolute claims (security, savings, outcomes).
- Is genuinely production-ready, not merely "renders."
