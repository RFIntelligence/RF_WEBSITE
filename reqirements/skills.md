# RF Intelligence — Engineering Skills & Standards

> Internal engineering handbook for Kiro. Defines how the site is built, not what it contains (see requirements.md/design.md for that).

---

## 1. Engineering Philosophy

Build like a senior production engineering team.

**Prefer:** maintainability, reusability, type safety, clear architecture, small focused components, predictable state, secure defaults, progressive enhancement.

**Avoid:** giant components, duplicated code, hardcoded repeated values, magic numbers, temporary hacks, unnecessary dependencies, overengineering.

## 2. Frontend Architecture

**Recommended stack:** A React-based meta-framework with file-based routing, server-side rendering/static generation, and built-in image optimization (e.g. Next.js) with TypeScript throughout, styled via a utility-first CSS system driven entirely by the design tokens in design.md (e.g. Tailwind configured to read the token set, or CSS custom properties + a lightweight styling layer — final choice is an implementation decision, not a client requirement).

**Why this fits:**
- **SEO** — needs server-rendered/prerendered HTML with real meta tags per route (§23 of requirements.md); a client-only SPA would require extra work to match this out of the box.
- **Performance** — built-in image optimization and code-splitting directly serve the Core Web Vitals requirement.
- **Maintainability** — file-based routing maps cleanly onto the fixed IA in requirements.md §7.
- **Animations** — React's component model plus CSS/lightweight JS (or a minimal animation utility) is sufficient; no need for a heavy animation framework given the "restraint" design principle.
- **DX** — TypeScript catches structural mistakes early across a project with many repeated component shapes (cards, steps, FAQ items).

This is a recommendation for Kiro to implement with, not a hardcoded client requirement — if the actual scaffolding Kiro operates in differs, the principles (SSR/SSG for SEO, token-driven styling, TypeScript, componentization) still apply and should be adapted rather than dropped.

## 3. Component Architecture

- One component = one responsibility. A `ServiceCard` renders a service; it does not also manage popup state.
- Presentational vs. container separation for anything with data/state (e.g., `ROICalculator` container computes values; a presentational component renders the inputs/outputs).
- Shared primitives (`Button`, `Card`, `SectionHeader`, `Input`) live in a common component layer and are the only way section components build UI — no ad hoc one-off buttons.
- Section-level components (`Hero`, `ProblemSection`, `ServicesSection`, etc.) compose primitives; they do not redefine spacing/typography locally.
- Diagram/flow components (`WorkflowDiagram`, `RFBrainVisualization`, `ComparisonSlider`) are isolated, independently testable units with clearly typed props (e.g., an ordered list of stage objects) so content changes don't require touching animation logic.

## 4. Design Tokens

All colors, spacing, radii, shadows, type scale, and motion durations/easings originate from a single token source (matching design.md) — implemented as CSS custom properties (for instant theme-switching) optionally mirrored into the styling system's config. No component may hardcode a hex value, a raw pixel spacing value, or an arbitrary transition duration.

## 5. Animation Engineering

- Prefer CSS transitions/animations and the Web Animations API for simple effects; reach for a JS animation library only where genuinely necessary (e.g., orchestrating the multi-stage workflow/RF Brain diagrams) rather than by default.
- All animations must be interruptible (e.g., re-triggering on fast repeated hover shouldn't queue/stutter).
- All animations must respect `prefers-reduced-motion` with a defined static fallback (per design.md §10).
- Scroll-triggered entrance animations should use an efficient observer-based approach (e.g. IntersectionObserver), not scroll-event polling.
- Background/particle animation (dynamic background, RF Brain) must be capped in complexity (node/particle count) and paused when off-screen or tab is inactive.

## 6. State Management

Use the simplest approach that fits each feature:
- Local component state for isolated UI (accordion open/closed, slider position).
- Lightweight shared state (e.g., React context) only for genuinely cross-cutting concerns: active theme, popup visibility/suppression state.
- No global state management library unless a specific feature's complexity actually demands it — not introduced speculatively.

## 7. Forms

- Client-side validation for immediate UX feedback (required fields, email format, phone format).
- **Server-side validation is mandatory** for every form regardless of client-side checks — never trust the client.
- All business/lead forms (popup, Book a Demo, Contact) submit to a server-side endpoint that validates, sanitizes, persists, and triggers notification — never a client-only "mailto:" or third-party form-embed as the sole mechanism, to preserve control over lead data and validation.
- CAPTCHA/anti-bot protection (e.g., an invisible challenge) applied at the API layer for all public form endpoints.

## 8. API Security

- No secrets (API keys, DB credentials, notification-service keys) ever committed to the repo or shipped in client-side bundles.
- All secrets loaded via environment variables, scoped per environment (dev/staging/production).
- Server endpoints validate origin/method, apply rate limiting, and return generic error responses to the client while logging full detail server-side only.

## 9. Database

- Schema: a `leads` table/collection (covers popup + contact submissions) and a `demo_requests` table/collection (Book a Demo submissions), each capturing the fields defined in requirements.md §19, plus `consent_given` (boolean) + `consent_timestamp`, `created_at`, `source` (which form/trigger generated it), and `status` (e.g., new/contacted/closed — supports the Admin view in §27).
- Validation enforced at the database layer where possible (required fields, enum-constrained fields like company size) in addition to API-level validation — defense in depth.
- Permissions: the public-facing API role can only INSERT into leads/demo_requests, never read/update/delete; only the admin-facing service role can read/export/update.
- Migrations: schema changes tracked via versioned migration files, never manual ad hoc changes to production schema.
- Backups: automated, regular, tested-restorable backups of lead/demo data — this is customer business data and must be treated accordingly.

## 10. Authentication

If/when the admin dashboard (requirements.md §27) is implemented: secure session-based or token-based authentication, hashed+salted credentials (or delegated to a managed auth provider), no admin routes reachable without authentication, and rate-limited login attempts. Exact provider/mechanism is an implementation decision — **UNDEFINED / REQUIRES CLIENT INPUT** on whether multi-user roles are needed (requirements.md §27).

## 11. Analytics

- Fire the events listed in requirements.md §22 through a single analytics abstraction (one function/hook other components call), not scattered direct calls to a specific vendor SDK — keeps the vendor swappable.
- Analytics/marketing scripts only load after appropriate consent is given via the cookie banner (requirements.md — Cookie Consent) — no silent tracking before consent.

## 12. SEO Engineering

- Centralized metadata configuration per route (title, description, OG tags, canonical) rather than copy-pasted per page.
- Semantic heading structure enforced per page template (single H1).
- `sitemap.xml` and `robots.txt` generated from the route list, kept in sync with requirements.md §7 automatically rather than hand-maintained in two places.
- Structured data (Organization schema at minimum; FAQPage schema for the FAQ section) added via a shared schema-generation utility.

## 13. Accessibility Engineering

- Use semantic HTML elements first (`<nav>`, `<button>`, `<header>`, `<section>` with headings) before reaching for ARIA.
- All custom interactive components (slider, accordion, calculator, popup/modal) implement full keyboard support and correct ARIA roles/states (e.g., `aria-expanded` on accordion triggers, focus trapping in the modal, `aria-label` on icon-only buttons).
- Automated accessibility linting (e.g., an eslint a11y plugin) enabled in CI as a baseline check, supplemented by manual keyboard/screen-reader testing per phase (see requirements.md's per-feature acceptance criteria).

## 14. Performance Engineering

- Images: served via the framework's optimized image pipeline, responsive `srcset`, modern formats (WebP/AVIF with fallback).
- Lazy loading for below-the-fold sections/images/heavy interactive widgets (calculator, RF Brain visualization) — these should not block initial page load.
- JS: code-split per route; heavy interactive features (calculator, quiz, slider) loaded on-demand rather than in the initial bundle where feasible.
- Animation: capped particle/node counts, paused when off-screen, GPU-friendly properties (transform/opacity) preferred over layout-triggering properties.
- Core Web Vitals treated as a release gate, not an afterthought — measured per phase, not only at the end.

## 15. Error Handling

- Consistent error architecture: every API endpoint returns a typed error shape (code + human-readable message); the frontend maps error codes to the human-friendly copy defined in requirements.md §28.
- Users only ever see the human-friendly mapped message — raw stack traces/status codes are logged server-side, never rendered client-side.
- A global error boundary catches unexpected render failures and shows a graceful fallback rather than a blank/broken page.
- 404 page follows the same design system as the rest of the site (not a bare default framework 404).

## 16. Testing

- **Component tests:** for shared primitives and complex interactive components (slider, calculator, quiz, accordion, forms).
- **Integration tests:** form submission flows end-to-end (fill → submit → success/error state), popup trigger logic, theme persistence.
- **Form testing:** every validation rule and every error state explicitly tested, not just the happy path.
- **Responsive testing:** each shipped phase checked at defined breakpoints (mobile/tablet/desktop) before being marked complete — matches the per-phase acceptance criteria in the blueprint.
- **Accessibility testing:** keyboard-only pass and screen-reader spot-check per interactive feature.
- **Browser testing:** current versions of major browsers (Chrome, Safari, Firefox, Edge) at minimum.
- **Production build testing:** the production build (not just dev server) is run and inspected before a phase is marked approved — dev-mode-only bugs must not slip through.

## 17. Code Quality

Linting and formatting enforced (consistent config, run in CI/pre-commit); strict type checking (no `any` escape hatches used casually); meaningful, intention-revealing naming (no `data2`, `handleClick1`); small, single-purpose functions; clear abstractions over clever one-liners.

## 18. Git / Development Workflow

- One phase (per PROJECT_BUILD_BLUEPRINT.md) = one focused set of commits/PR, reviewed and approved before the next phase starts — mirrors the "do not rush" working philosophy.
- Commit messages describe the phase/feature, not generic "updates."
- No direct pushes of unreviewed work to a production branch; production deploys happen from an approved, tested state only.
- Environment configuration (dev/staging/production) kept separate, with secrets never shared across environments.
