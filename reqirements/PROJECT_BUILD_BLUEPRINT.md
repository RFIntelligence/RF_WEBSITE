# RF Intelligence — PROJECT_BUILD_BLUEPRINT

> Execution roadmap for Kiro. Persistent context: `requirements.md`, `design.md`, `skills.md`, this file. Kiro should not need to reread the original client PDF once these four files exist.
>
> **Core workflow enforced on every phase:**
> `UNDERSTAND → PLAN → IMPLEMENT → RUN → INSPECT → TEST → REFINE → POLISH → VERIFY → APPROVE → NEXT FEATURE`
>
> Kiro implements ONLY the phase (or sub-feature of a phase) explicitly requested — e.g. "Implement Phase 2" or "Implement only the Hero section from Phase 2." Kiro never jumps ahead to later phases or sections unprompted, never builds backend before the frontend section it serves is approved, and never auto-continues to the next phase after finishing one.

---

## Definition of "Perfect Enough" (Definition of Done)

A feature is not complete because it compiles, renders, or "the button exists." It must satisfy all of the following before being marked approved:

**Visual Quality:** strong hierarchy; correct spacing/typography per design.md; consistent alignment; premium appearance; no awkward empty areas or visual clutter; no generic AI aesthetic (design.md §20 anti-slop rules pass).

**UX Quality:** interaction is intuitive; CTA is obvious; all component states (design.md §14) are clear; no confusing behavior.

**Responsive Quality:** desktop, tablet, and mobile each feel intentionally designed — not a shrunk desktop layout.

**Accessibility:** keyboard navigation works; focus states visible; contrast passes AA; semantic structure correct; reduced-motion respected.

**Technical Quality:** zero console errors; no broken links; no hydration issues; no unnecessary re-renders; no obvious performance problems; no secrets exposed.

**Production Quality:** real functionality (not mocked where a real flow is expected); real validation; real error states; no fake claims/content; no placeholder production links; no unfinished UI.

This checklist is run explicitly at the INSPECT/TEST/VERIFY steps of every phase, against the checks listed in requirements.md §29.

---

## Phase Structure

### PHASE 0 — Project Foundation
1. **Objective:** Establish the technical foundation before any UI exists.
2. **Features:** Project scaffold, routing skeleton matching requirements.md §7 (empty placeholder routes), TypeScript config, linting/formatting config, base folder structure (components/sections/tokens/lib), environment variable scaffolding (no real secrets yet), base layout shell (no styling yet).
3. **Components required:** none yet (infrastructure only).
4. **Dependencies:** none.
5. **UX requirements:** N/A.
6. **Design requirements:** none yet — this phase precedes visual design.
7. **Technical requirements:** framework installed per skills.md §2; strict TypeScript; lint/format configs in place; `.env.example` documented; CI pipeline stub (lint + typecheck at minimum).
8. **Acceptance criteria:** project boots with zero errors; every route in requirements.md §7 resolves (even as blank placeholders) with no 404 on defined paths; lint/typecheck pass with zero errors.
9. **Testing requirements:** smoke test that the app builds and starts in both dev and production build modes.
10. **What must NOT be implemented yet:** any visual design, any content, any component, any backend/API logic.

---

### PHASE 1 — Design System + Global Shell
1. **Objective:** Implement design.md as real, usable code — tokens, theme system, and the shared component primitives — before any page content is built.
2. **Features:** Design tokens (color/typography/spacing/radius/shadow/motion) as CSS variables for dark + light themes; theme provider + persistence mechanism; base primitives: `Button` (primary/secondary/ghost/text), `SectionHeader`, `Card`, `Input`, base `Toast`.
3. **Components required:** `ThemeProvider`, `ThemeToggle` (functional but not yet placed in a real navbar), `Button`, `Card`, `SectionHeader`, `Input`, `Toast`.
4. **Dependencies:** Phase 0.
5. **UX requirements:** theme toggle instantly switches theme with no flash-of-wrong-theme on load; persists across reload.
6. **Design requirements:** exact token implementation per design.md §3–§8; every primitive must expose the states in design.md §14 at least for Default/Hover/Focus/Disabled.
7. **Technical requirements:** tokens implemented as CSS custom properties; theme persistence per skills.md §6 (no `localStorage` misuse issues — this is a real deployed site, standard `localStorage` is fine here, unlike the artifacts sandbox restriction); components fully typed.
8. **Acceptance criteria:** a components sandbox/preview page (dev-only) shows every primitive in every state, both themes, all passing contrast checks.
9. **Testing requirements:** component tests for `Button`, `ThemeToggle`, `Card`, `Input` covering all defined states.
10. **What must NOT be implemented yet:** navbar, hero, or any real page content; forms beyond the base `Input` primitive; any interactive diagrams.

---

### PHASE 2 — Navbar + Hero
1. **Objective:** Ship the first-impression experience of the homepage.
2. **Features:** Sticky navbar (desktop + mobile hamburger), theme toggle in-place, Book a Demo CTA in nav; Hero section (headline, supporting text, primary/secondary CTA, credibility line); Hero interactive workflow visual (Business Input → RF Intelligence → AI Understands → AI Decides → AI Executes → Business Result); dynamic background (subtle, disableable).
3. **Components required:** `Navbar`, `MobileMenu`, `ThemeToggle` (wired in), `Hero`, `WorkflowDiagram` (initial version, hero variant), `DynamicBackground`.
4. **Dependencies:** Phase 1.
5. **UX requirements:** per requirements.md §8.1–§8.3; message understandable within 10–15 seconds; CTA unmistakable.
6. **Design requirements:** design.md §2 (restraint), §10 (motion), §11 (dynamic background), §19 (visual hierarchy — primary message first).
7. **Technical requirements:** dynamic background performance-budgeted per skills.md §5/§14; reduced-motion fallback implemented, not just planned.
8. **Acceptance criteria:** full Definition of Done above; specifically — no layout shift from the background animation; hero legible in both themes; mobile nav fully functional.
9. **Testing requirements:** responsive check at mobile/tablet/desktop; reduced-motion toggle verified; keyboard nav through navbar and hero CTAs.
10. **What must NOT be implemented yet:** Services, About, Footer, backend, any section below the hero.

---

### PHASE 3 — What Is RF Intelligence
1. **Objective:** Deliver the company-explanation section.
2. **Features:** Section per requirements.md §8.4 — explanation copy + Understand → Decide → Execute visual.
3. **Components required:** `StepIndicator` or a 3-stage variant of a shared step component; `SectionHeader`.
4. **Dependencies:** Phase 1 (tokens/primitives); logically follows Phase 2 but does not require Phase 2's specific components.
5. **UX requirements:** reinforce hero's message with concrete explanation.
6. **Design requirements:** design.md §19 — this is "supporting explanation," should visually read as calmer/more explanatory than the hero.
7. **Technical requirements:** content sourced from requirements.md §8.4 verbatim intent — no invented capabilities.
8. **Acceptance criteria:** Definition of Done; copy matches source content; three-stage visual clear at all breakpoints.
9. **Testing requirements:** responsive + accessibility (heading structure, alt text if icons used).
10. **What must NOT be implemented yet:** Problem section, Services, or anything below.

---

### PHASE 4 — Problem Section
1. **Objective:** Communicate the operational pain points.
2. **Features:** "Businesses Are Still Running on Manual Work" heading, pain-point list, headline, consequence list per requirements.md §8.5.
3. **Components required:** list/grid component (reuse `Card` or a lightweight list item component).
4. **Dependencies:** Phase 1.
5. **UX requirements:** visitor should self-recognize their own operational pain.
6. **Design requirements:** no invented icons that look like generic AI clip-art; restrained iconography or none at all is acceptable.
7. **Technical requirements:** none beyond standard section component.
8. **Acceptance criteria:** Definition of Done; no fabricated statistics attached.
9. **Testing requirements:** responsive + accessibility.
10. **What must NOT be implemented yet:** Why Intelligent Automation section onward.

---

### PHASE 5 — Intelligent Automation Section (Why Businesses Need This)
1. **Objective:** Show the traditional-vs-intelligent-automation contrast and scaling triggers.
2. **Features:** Traditional flow vs. Intelligent Automation flow diagram; scaling-trigger list, per requirements.md §8.6.
3. **Components required:** a simple two-track flow/compare component (distinct from the full Before/After slider built later).
4. **Dependencies:** Phase 1.
5. **UX requirements:** the contrast must be immediately visually legible (not just two paragraphs).
6. **Design requirements:** design.md §6 grid guidance for side-by-side layout; mobile stacks the two flows vertically.
7. **Technical requirements:** none beyond a static/lightly-animated compare component.
8. **Acceptance criteria:** Definition of Done.
9. **Testing requirements:** responsive + accessibility.
10. **What must NOT be implemented yet:** Services section, interactive slider (Phase 10).

---

### PHASE 6 — Services
1. **Objective:** Present all six service categories.
2. **Features:** Six service cards with exact content from requirements.md §12/§8.7; interactive step visualization for the Business Process Automation example; "Tell Us What You Want To Automate" CTA.
3. **Components required:** `ServiceCard`, `WorkflowDiagram` (business-process variant).
4. **Dependencies:** Phase 1 (and reuses the `WorkflowDiagram` pattern established in Phase 2/3, refined here for a 7-stage process).
5. **UX requirements:** each service scannable in seconds; the process example should be the standout interactive moment of this section.
6. **Design requirements:** grid per design.md §6/§13; no more/fewer than six cards.
7. **Technical requirements:** content data-driven (array of 6 service objects) rather than six hand-duplicated JSX blocks.
8. **Acceptance criteria:** Definition of Done; AI Agents copy avoids overclaiming autonomy.
9. **Testing requirements:** responsive (grid collapses correctly at tablet/mobile), accessibility, CTA link/anchor correctness.
10. **What must NOT be implemented yet:** How RF Works, Benefits, or later sections.

---

### PHASE 7 — How RF Works
1. **Objective:** Present the 5-stage process.
2. **Features:** Discover → Analyse → Design → Deploy → Optimise interactive step section per requirements.md §8.8.
3. **Components required:** `StepIndicator` (5-stage, possibly clickable/expandable per stage).
4. **Dependencies:** Phase 1.
5. **UX requirements:** visitor understands the engagement process, not just the technology.
6. **Design requirements:** consistent with the visual language already established for step/flow diagrams (Phases 2/3/6) — a shared underlying pattern, not a new one-off style.
7. **Technical requirements:** data-driven 5-item array.
8. **Acceptance criteria:** Definition of Done; exact 5 stages, correct order.
9. **Testing requirements:** responsive + accessibility (each step reachable/announced correctly via keyboard/screen reader if interactive).
10. **What must NOT be implemented yet:** Benefits onward.

---

### PHASE 8 — Benefits
1. **Objective:** Present the seven client benefits with properly hedged language.
2. **Features:** Benefit cards per requirements.md §8.9/§13, entrance-animated per design.md §10.
3. **Components required:** `BenefitCard` (variant of `Card`).
4. **Dependencies:** Phase 1.
5. **UX requirements:** benefits feel credible, not hyped.
6. **Design requirements:** no big fabricated numbers; motion is entrance/hover only.
7. **Technical requirements:** content review step required — Kiro must flag if any benefit copy drifts toward an unhedged guarantee.
8. **Acceptance criteria:** Definition of Done; a copy audit against requirements.md §14's hedging rule is explicitly part of VERIFY.
9. **Testing requirements:** responsive + accessibility.
10. **What must NOT be implemented yet:** Why RF onward.

---

### PHASE 9 — Why RF (Differentiation)
1. **Objective:** Deliver the differentiation comparison and six differentiation cards.
2. **Features:** Traditional Software / Automation Tools / RF Intelligence comparison; 01–06 differentiation cards per requirements.md §8.10/§15.
3. **Components required:** `ComparisonTable` or 3-column comparison component; `DifferentiationCard`.
4. **Dependencies:** Phase 1.
5. **UX requirements:** this is one of the most important trust-building sections — must feel confident, not defensive.
6. **Design requirements:** exactly six numbered cards, exact titles; comparison must be scannable, not paragraph-heavy.
7. **Technical requirements:** data-driven card list.
8. **Acceptance criteria:** Definition of Done.
9. **Testing requirements:** responsive + accessibility.
10. **What must NOT be implemented yet:** Before/After slider (next phase), Industries, Security, etc.

---

### PHASE 10 — Before/After Interactive Experience
1. **Objective:** Ship the flagship interactive comparison slider.
2. **Features:** Draggable Before/After slider per requirements.md §8.11/§16, with accessible non-drag control fallback.
3. **Components required:** `ComparisonSlider`.
4. **Dependencies:** Phase 1; conceptually follows Phase 5's simpler static compare, now upgraded to the full interactive version.
5. **UX requirements:** this must feel like "one of the coolest parts of the website" per the client brief — genuinely polished interaction, not a rough drag handle.
6. **Design requirements:** design.md §9 (glass only where appropriate on the handle/UI chrome, not gratuitously), §10 (motion), §17 (responsive — touch-drag on mobile).
7. **Technical requirements:** keyboard-operable (arrow keys move the slider; buttons as an alternative control), touch-friendly hit area, no layout jank while dragging.
8. **Acceptance criteria:** Definition of Done; verified keyboard-only operation; verified on an actual touch device or emulation.
9. **Testing requirements:** component test for slider value/state changes; accessibility test for keyboard operation; responsive test.
10. **What must NOT be implemented yet:** Industries onward.

---

### PHASE 11 — Industries
1. **Objective:** Present the four industry/use-case categories.
2. **Features:** Wholesale & Distribution, Manufacturing, Logistics, Professional Services cards with bullet content; "Don't see your industry?" callout + "Talk to RF" CTA, per requirements.md §8.12/§16.
3. **Components required:** `IndustryCard`.
4. **Dependencies:** Phase 1.
5. **UX requirements:** visitor in one of these industries should immediately self-identify.
6. **Design requirements:** grid consistent with other card sections.
7. **Technical requirements:** data-driven.
8. **Acceptance criteria:** Definition of Done; exactly four industries plus the catch-all callout.
9. **Testing requirements:** responsive + accessibility.
10. **What must NOT be implemented yet:** Security/Trust onward.

---

### PHASE 12 — Security + Trust
1. **Objective:** Build visitor trust honestly.
2. **Features:** Security section (control list, hedged claim language) + Trust section (honest attribute list, no fake logos/testimonials) per requirements.md §8.13/§8.14.
3. **Components required:** `TrustBadgeList`, security control list component (can reuse a generic list/`Card` pattern).
4. **Dependencies:** Phase 1.
5. **UX requirements:** reads as confident and honest, not defensive or evasive.
6. **Design requirements:** no fabricated logos/testimonials under any circumstance — this is explicitly gated in VERIFY.
7. **Technical requirements:** none beyond content components.
8. **Acceptance criteria:** Definition of Done; explicit copy audit confirms no "100% secure" or absolute claim language anywhere.
9. **Testing requirements:** responsive + accessibility; content audit.
10. **What must NOT be implemented yet:** FAQ, final CTA, footer, legal pages.

---

### PHASE 13 — FAQ + Conversion Sections
1. **Objective:** Ship the FAQ accordion and the homepage's final CTA section.
2. **Features:** All 9 FAQ items per requirements.md §8.15 as an accessible accordion; final CTA section reinforcing Book a Demo per requirements.md §8.16.
3. **Components required:** `FAQAccordion`, final CTA banner (reuses `SectionHeader` + `Button`).
4. **Dependencies:** Phase 1.
5. **UX requirements:** answers questions honestly, including the pricing hedge; final CTA is the last strong nudge before footer.
6. **Design requirements:** accordion open/close motion per design.md §10; consistent CTA styling with nav/hero CTA.
7. **Technical requirements:** `aria-expanded`/`aria-controls` correctness on the accordion; FAQPage schema markup added here (ties to requirements.md §23 SEO).
8. **Acceptance criteria:** Definition of Done; all 9 FAQs present with hedged pricing/timeline language intact.
9. **Testing requirements:** keyboard operation of accordion; screen-reader announcement check; responsive check.
10. **What must NOT be implemented yet:** footer, legal pages.

---

### PHASE 14 — Footer + Legal
1. **Objective:** Ship the footer and the legal page shells.
2. **Features:** Footer per requirements.md §8.17 (company blurb, nav, company links, legal links, social, copyright); six legal route shells (`/legal/*`) with structurally correct pages ready to receive final attorney-reviewed copy.
3. **Components required:** `Footer`.
4. **Dependencies:** Phase 1; logically the closing phase of the homepage build.
5. **UX requirements:** footer is comprehensive but not visually heavy; legal pages are readable, well-typeset long-form content pages.
6. **Design requirements:** legal pages use the same typography system (design.md §4) as the rest of the site — not an unstyled dump.
7. **Technical requirements:** legal page content marked clearly (in code comments/CMS notes) as **placeholder pending qualified legal counsel review** — this must not be silently forgotten before launch.
8. **Acceptance criteria:** Definition of Done; every footer link resolves to a real route (no dead `#` links); legal pages render with a visible "pending final legal review" notice until the client confirms sign-off.
9. **Testing requirements:** link-check across all footer links; responsive + accessibility.
10. **What must NOT be implemented yet:** About, Book a Demo, Contact, Industries-as-dedicated-page, or any backend logic — **at this point the full homepage scroll experience is complete** and should be reviewed holistically before moving to dedicated pages.

> **Milestone checkpoint after Phase 14:** run the full homepage top-to-bottom review (desktop/tablet/mobile, dark/light, keyboard, reduced motion, console-clean, Core Web Vitals) before proceeding to Phase 15. This is the first "whole experience" review point.

---

### PHASE 15 — About
1. **Objective:** Build the dedicated About page.
2. **Features:** About RF Intelligence content, Mission, Vision (requirements.md — "About Us Page"/§27 equivalent in requirements.md's numbered PDF sections), Founder section (photo, name, position, short bio, LinkedIn link).
3. **Components required:** `FounderCard`.
4. **Dependencies:** Phase 1 (design system); does not depend on homepage phases functionally, only reuses shared primitives.
5. **UX requirements:** honest tone — no invented years of experience or customer claims.
6. **Design requirements:** founder section should remain secondary in visual weight to the product-focused content per the client's explicit note ("Do not overdo this section").
7. **Technical requirements:** founder photo/bio/LinkedIn are real content — **UNDEFINED / REQUIRES CLIENT INPUT** (founder name/photo/bio/LinkedIn URL must come from the client; do not invent).
8. **Acceptance criteria:** Definition of Done; no fabricated experience/customer claims; founder section present but clearly not the page's dominant element.
9. **Testing requirements:** responsive + accessibility (image alt text for founder photo).
10. **What must NOT be implemented yet:** Book a Demo, Contact, Industries pages.

---

### PHASE 16 — Book a Demo
1. **Objective:** Build the dedicated demo-booking page (frontend only; backend wiring is Phase 20).
2. **Features:** Headline + explanation copy; form (left) + calendar/scheduling UI (right) per requirements.md §21; client-side validation; UI-only success/failure states (wired to real backend in Phase 20).
3. **Components required:** `DemoForm`, scheduling UI component (exact scheduling mechanism **UNDEFINED / REQUIRES CLIENT INPUT** per requirements.md §21 — build against a generic date/time-picker abstraction now, swap in the chosen provider later without reworking the page).
4. **Dependencies:** Phase 1; the `Input`/`Button` primitives from Phase 1.
5. **UX requirements:** low-friction, feels like scheduling a real meeting, not filling a generic contact form.
6. **Design requirements:** two-column desktop layout (form/calendar) collapsing to stacked on mobile per design.md §17.
7. **Technical requirements:** form built with full client-side validation now; explicitly stubbed (not silently faked) submission handler pending Phase 20 backend.
8. **Acceptance criteria:** Definition of Done for the frontend experience; it must be explicit in code/comments that submission is not yet wired to a real backend until Phase 20.
9. **Testing requirements:** form validation tests; responsive + accessibility.
10. **What must NOT be implemented yet:** real backend persistence/notification (Phase 20); the interactive mini-demo experience (Phase 18, separate feature).

---

### PHASE 17 — Contact
1. **Objective:** Build the dedicated Contact page (frontend only).
2. **Features:** "Let's Build Smarter Operations" heading, contact details (email/phone/location/LinkedIn — all **UNDEFINED / REQUIRES CLIENT INPUT**, do not invent), contact form.
3. **Components required:** reuse `LeadForm`-style component configured for contact fields.
4. **Dependencies:** Phase 1.
5. **UX requirements:** simple, low-friction, clearly not the primary conversion path (Book a Demo remains primary).
6. **Design requirements:** consistent with Book a Demo page's form styling.
7. **Technical requirements:** contact field list flagged as **UNDEFINED** in requirements.md §19 — confirm with client before finalizing; build against the reasonable default (Name/Email/Company/Message) in the meantime.
8. **Acceptance criteria:** Definition of Done; explicit placeholder markers on any unconfirmed contact detail (email/phone/address) rather than invented values.
9. **Testing requirements:** form validation tests; responsive + accessibility.
10. **What must NOT be implemented yet:** backend wiring (Phase 20).

---

### PHASE 18 — Interactive Automation Tool ("What Should We Automate?" + Interactive Business Flow)
1. **Objective:** Build the two lighter interactive lead-gen/engagement tools, and (only if separately requested and confirmed feasible) the mini demo experience.
2. **Features:** 3-question "What Should We Automate?" quiz ending in "This looks like a potential automation opportunity" + "Discuss It With RF" CTA (requirements.md §11/§41); clickable Interactive Business Flow (Input → AI Understanding → Decision → Action → Result) where each stage reveals an explanation (requirements.md §43); the interactive mini-demo (requirements.md §11 item 8 / PDF §24) is **UNDEFINED / REQUIRES CLIENT INPUT on feasibility** — treat as an optional sub-phase, only build after explicit confirmation, and never let it block the rest of this phase.
3. **Components required:** `AutomationQuiz`, `InteractiveBusinessFlow`.
4. **Dependencies:** Phase 1; conceptually pairs well with the Services (Phase 6) and How It Works (Phase 7) sections already built, though technically independent.
5. **UX requirements:** genuinely feels like a quick, low-effort interaction that produces a satisfying "yes, this applies to me" moment.
6. **Design requirements:** consistent visual language with existing step/flow components (§2/§6/§7 phases) rather than a new one-off style.
7. **Technical requirements:** quiz result should route/link into the lead popup or Book a Demo pre-filled where feasible (nice-to-have, not blocking).
8. **Acceptance criteria:** Definition of Done for whichever sub-features are built; mini-demo explicitly excluded unless separately confirmed and requested.
9. **Testing requirements:** interaction tests for the quiz's question flow and the flow-diagram's click states; accessibility (keyboard operable stage clicks).
10. **What must NOT be implemented yet:** ROI Calculator (Phase 19), backend (Phase 20).

---

### PHASE 19 — ROI Calculator
1. **Objective:** Build the automation ROI calculator.
2. **Features:** Inputs (employees involved, hours/week, avg employee cost, frequency, estimated automation %) → outputs (estimated annual manual workload, estimated potential time saved, estimated potential operational value), always paired with the "Illustrative estimate — actual results depend on the workflow and implementation" disclaimer, per requirements.md §11/§42.
3. **Components required:** `InteractiveCalculator`.
4. **Dependencies:** Phase 1.
5. **UX requirements:** immediate, live-updating output as inputs change; feels credible, not gimmicky.
6. **Design requirements:** desktop side-by-side input/output, mobile stacked, per design.md §17.
7. **Technical requirements:** calculation logic isolated in a pure, unit-testable function separate from the UI component (skills.md §3).
8. **Acceptance criteria:** Definition of Done; disclaimer always visibly attached to output, never presentable without it.
9. **Testing requirements:** unit tests on the calculation function (edge cases: zero values, very large values); accessibility (labeled inputs, live-region announcement of output changes for screen readers); responsive.
10. **What must NOT be implemented yet:** backend/lead-storage tie-in beyond an optional CTA link into the demo/lead flow.

---

### PHASE 20 — Backend + Lead Management
1. **Objective:** Wire real backend persistence and notifications for every form built in prior phases (popup, Book a Demo, Contact).
2. **Features:** API endpoints for lead + demo-request submission; server-side validation (skills.md §7); database schema + persistence (skills.md §9); team notification on new submission; rate limiting + anti-bot protection (skills.md §7/§26); the lead popup itself (trigger logic: time-on-site, exit-intent, Book-a-Demo click, 50–70% scroll — requirements.md §11 item 9) is also built/wired in this phase since it's fundamentally a lead-capture feature.
3. **Components required:** `LeadPopupModal` (frontend), API route handlers, database access layer.
4. **Dependencies:** Phases 1, 16, 17 (forms must exist to be wired); Phase 0 environment scaffolding.
5. **UX requirements:** real, working submit → success/error flow on every form; popup does not show repeatedly after dismissal/submission.
6. **Design requirements:** popup modal follows design.md §9 (glass is appropriate here) and §16 (form styling).
7. **Technical requirements:** full skills.md §7–§10 compliance — server-side validation, secrets in env vars only, rate limiting, DB permission scoping, backups configured.
8. **Acceptance criteria:** Definition of Done; a real test submission is verifiably persisted and triggers a real notification; error paths (server down, validation failure) tested and produce the correct human-friendly messages from requirements.md §28.
9. **Testing requirements:** integration tests for each form's full submit flow (success + every defined error path); security checks (rate limit triggers correctly, no secret leakage in responses/bundle).
10. **What must NOT be implemented yet:** Admin dashboard (Phase 22) — leads must persist correctly before building a UI to view them.

---

### PHASE 21 — Analytics
1. **Objective:** Wire the analytics events defined in requirements.md §22.
2. **Features:** Event tracking for homepage visit, Services viewed, Why RF clicked, Book Demo clicked, Demo form started/completed, Contact form submitted, theme switched, FAQ interaction — all gated behind cookie/analytics consent.
3. **Components required:** a shared analytics utility/hook (skills.md §11) consumed by existing components (no new UI components).
4. **Dependencies:** Cookie consent banner must exist (build alongside this phase if not already present — it's referenced in requirements.md but not tied to an earlier explicit phase; treat cookie banner + analytics wiring as one combined phase).
5. **UX requirements:** cookie banner is clear about necessary/analytics/marketing categories and lets users manage preferences; no tracking fires before consent.
6. **Design requirements:** cookie banner follows design.md button/card styling — not a jarring unstyled overlay.
7. **Technical requirements:** consent state gates script loading entirely (not just event firing) per skills.md §11.
8. **Acceptance criteria:** Definition of Done; verified via browser network inspection that no analytics request fires pre-consent.
9. **Testing requirements:** consent-gating test; event-firing verification for each listed event.
10. **What must NOT be implemented yet:** Admin (Phase 22).

---

### PHASE 22 — Admin
1. **Objective:** Build the internal admin capability.
2. **Features:** Authenticated view of leads + demo requests; CSV export; basic content-editing capability (scope pending client confirmation per requirements.md §27); enquiry detail view.
3. **Components required:** admin layout/dashboard, auth flow (skills.md §10), lead/demo-request table view, export action.
4. **Dependencies:** Phase 20 (real lead data must exist to view).
5. **UX requirements:** functional, internal-tool-grade UI — does not need the same marketing polish as the public site, but must still be usable and accessible.
6. **Design requirements:** can use a simpler internal design language, but must still respect the base design tokens for consistency (not a totally unstyled admin panel).
7. **Technical requirements:** skills.md §10 auth requirements; strict access control (public API role cannot read lead data — only the admin service role, per skills.md §9).
8. **Acceptance criteria:** Definition of Done; unauthenticated access to any admin route is impossible; export produces a correct, complete CSV.
9. **Testing requirements:** auth flow tests (login success/failure, session expiry); authorization tests (non-admin cannot reach admin API routes); export correctness test.
10. **What must NOT be implemented yet:** anything beyond the confirmed admin scope — do not speculatively add content-management features beyond what's client-confirmed.

---

### PHASE 23 — SEO
1. **Objective:** Complete SEO implementation across the whole site.
2. **Features:** Per-route metadata (titles/descriptions/OG tags/canonical), `sitemap.xml`, `robots.txt`, Organization + FAQPage schema, alt text audit across all images, keyword review (no stuffing) per requirements.md §23.
3. **Components required:** shared metadata utility (skills.md §12).
4. **Dependencies:** all page phases (1–19) should be complete/near-complete so real per-page content exists to write accurate metadata against.
5. **UX requirements:** N/A (SEO is not user-facing UI, but correct social preview cards are user-facing when links are shared).
6. **Design requirements:** OG image should follow brand visual language (design.md §1–§3), not a generic placeholder.
7. **Technical requirements:** sitemap generated from the actual route list, not hand-maintained separately.
8. **Acceptance criteria:** Definition of Done; every route has a unique, accurate title/description; sitemap/robots.txt validate; structured data validates against schema.org requirements.
9. **Testing requirements:** automated check that every route has required metadata present; manual social-share preview check.
10. **What must NOT be implemented yet:** N/A — this phase is largely additive/auditing and doesn't block others once content exists.

---

### PHASE 24 — Accessibility
1. **Objective:** Full-site accessibility audit and remediation pass.
2. **Features:** Site-wide keyboard navigation audit, screen-reader pass, contrast audit (both themes), reduced-motion audit across every animated feature, form label/error accessibility audit, touch-target size audit.
3. **Components required:** none new — this is a remediation pass across all existing components.
4. **Dependencies:** all prior UI phases substantially complete.
5. **UX requirements:** N/A.
6. **Design requirements:** any contrast/token adjustments feed back into design.md's token values, not one-off component overrides.
7. **Technical requirements:** automated a11y linting (skills.md §13) plus manual verification, since automated tools alone are insufficient (they typically catch a minority of real issues).
8. **Acceptance criteria:** Definition of Done; WCAG AA verified across representative pages/components, not just spot-checked.
9. **Testing requirements:** full keyboard-only pass through every page and interactive feature; screen-reader pass on at least the homepage and one dedicated page; automated a11y test suite passing.
10. **What must NOT be implemented yet:** N/A.

---

### PHASE 25 — Performance Optimization
1. **Objective:** Full-site performance pass.
2. **Features:** Core Web Vitals measurement and remediation across all pages; image optimization audit; JS bundle audit (code-splitting effectiveness); animation performance audit (dynamic background, RF Brain, slider, calculator).
3. **Components required:** none new — optimization pass.
4. **Dependencies:** all prior UI/interactive phases complete.
5. **UX requirements:** N/A.
6. **Design requirements:** if any visual effect must be simplified for performance, the simplified version must still comply with design.md's restraint principles (i.e., simplifying should rarely feel like a downgrade if the original was appropriately restrained to begin with).
7. **Technical requirements:** skills.md §14 checklist applied and measured (not just "should be fast" — actual Lighthouse/Web Vitals numbers recorded per page).
8. **Acceptance criteria:** Definition of Done; documented before/after performance metrics per key page (home, services, book-a-demo).
9. **Testing requirements:** Lighthouse/Web Vitals runs on production build for all major routes.
10. **What must NOT be implemented yet:** N/A.

---

### PHASE 26 — Security Hardening
1. **Objective:** Full-site security review before launch.
2. **Features:** HTTPS/header audit, dependency vulnerability scan, API endpoint penetration-style review (rate limiting, input validation, injection resistance), secrets audit (confirm zero secrets in client bundle), database permission review, backup verification (actually test a restore, not just confirm backups run).
3. **Components required:** none new — audit pass.
4. **Dependencies:** Phase 20 (backend), Phase 22 (admin) complete.
5. **UX requirements:** N/A.
6. **Design requirements:** N/A.
7. **Technical requirements:** skills.md §8/§26 full checklist run and documented.
8. **Acceptance criteria:** Definition of Done; documented sign-off against every item in requirements.md §26.
9. **Testing requirements:** automated dependency scan; manual header inspection; a real backup-restore drill.
10. **What must NOT be implemented yet:** N/A — this is the final gate before Phase 27.

---

### PHASE 27 — QA + Production Readiness
1. **Objective:** Final holistic review before launch.
2. **Features:** Full click-through of every route/flow on production build; cross-browser check; final content audit (no placeholder text, no fake claims, no dead links, no `#` hrefs); final legal-review status check (confirm qualified counsel has reviewed legal pages, or explicitly flag as outstanding); final analytics/consent verification.
3. **Components required:** none new.
4. **Dependencies:** all prior phases.
5. **UX requirements:** the entire client-facing journey (requirements.md §6/§49) walked end-to-end and confirmed coherent.
6. **Design requirements:** final design-system consistency pass — no stray one-off styles introduced across 27 phases of work.
7. **Technical requirements:** production build deployed to a staging environment and tested there, not only locally.
8. **Acceptance criteria:** every item in requirements.md §29 (global Definition of Done) verified true for the site as a whole, not just per-feature.
9. **Testing requirements:** full regression pass across all phases' test suites; manual end-to-end walkthrough on real devices where possible.
10. **What must NOT be implemented yet:** N/A — this is launch readiness, not a further-feature phase.

---

## Change Management Process

When a later instruction modifies existing, approved work (e.g., "make the hero less busy"):
1. Identify exactly which approved phase/component is affected.
2. Check the change against requirements.md/design.md — if it conflicts with a hard client requirement (not a design preference), **surface the conflict before implementing** rather than silently overriding it.
3. Implement the change scoped only to the affected component(s) — do not refactor unrelated approved sections as a side effect.
4. Re-run the Definition of Done checklist for the changed component only (not a full site re-verification, unless the change is structural/global — e.g., a token change in design.md, which does require a broader visual re-check).
5. Preserve: design system integrity, brand identity, existing approved functionality, accessibility, responsiveness, performance, and all other previously-approved sections untouched.

## Requirement Classification (applies across all four files)

- **A. Hard client requirements** — explicit content/structure/rules from the PDF (e.g., six services, hedged benefit language, no fake testimonials). Never overridden without explicit client sign-off.
- **B. Recommended implementation decisions** — Kiro/architect judgment calls where the PDF gives direction but not a spec (e.g., exact framework choice, exact token hex values, scheduling-widget provider). These may be revised through normal engineering iteration.
- **C. Open questions** — see below; must go back to the client.
- **D. Assumptions** — reasonable defaults used to keep frontend work moving (e.g., Contact form field list) — always explicitly labeled as an assumption in the relevant file, never presented as confirmed fact.

---

## Architecture Summary

- **Frontend:** TypeScript + a React-based SSR/SSG framework (per skills.md §2) for SEO-correct, performant delivery of a content-heavy, interaction-rich marketing site; token-driven styling (design.md tokens as CSS custom properties) for consistent, theme-aware components; component library built primitives-up (Phase 1) before any page content, so every later phase composes from a stable, tested foundation.
- **Backend:** Server-side API routes (within the same framework or a thin separate service) handling form validation, persistence, and notification — never client-only form handling for business-critical leads.
- **Data architecture:** two core tables (`leads`, `demo_requests`) plus supporting fields for consent/audit (skills.md §9); public API role is insert-only; admin role has read/export/update, gated behind real authentication.
- **Component architecture:** primitives → section components → page compositions; diagram/flow components isolated and data-driven so content edits don't require touching animation logic.
- **Animation strategy:** CSS/Web Animations API first; a JS animation approach reserved for the genuinely multi-stage diagrams (hero workflow, RF Brain, Before/After slider); everything gated by `prefers-reduced-motion`; performance-budgeted (capped particle/node counts, paused off-screen).
- **Design system strategy:** single token source of truth (design.md) driving both themes; strict "no hardcoded values in components" discipline enforced via lint/review.
- **SEO strategy:** per-route metadata generated from a central config once real content exists (Phase 23), sitemap/robots generated from the actual route list, structured data for Organization + FAQ.
- **Security strategy:** defense in depth — client + server validation, environment-scoped secrets, rate limiting/anti-bot on public endpoints, least-privilege database roles, audited before launch (Phase 26).
- **Deployment strategy:** environment-separated (dev/staging/production), production deploys only from reviewed/approved states, staging used for final QA (Phase 27) before go-live. Specific hosting provider is **UNDEFINED / REQUIRES CLIENT INPUT** (not specified in the PDF).

## Dependency Map

```
Phase 0 (Foundation)
  └── Phase 1 (Design System + Shell)
        ├── Phase 2 (Navbar + Hero)
        │     └── Phase 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14
        │           (homepage sections, each independently built on Phase 1 primitives;
        │            sequential order reflects intended scroll order and review milestones,
        │            not hard technical dependency between every pair — e.g. Phase 8 doesn't
        │            technically require Phase 7's code, but is sequenced to match the
        │            page's real build/review order)
        ├── Phase 15 (About)         — depends only on Phase 1
        ├── Phase 16 (Book a Demo)   — depends only on Phase 1
        ├── Phase 17 (Contact)       — depends only on Phase 1
        ├── Phase 18 (Automation Tool/Business Flow) — depends only on Phase 1
        └── Phase 19 (ROI Calculator) — depends only on Phase 1

Phase 20 (Backend + Lead Mgmt) — depends on Phase 16 + Phase 17 (forms must exist) + Phase 0 env scaffolding
Phase 21 (Analytics)           — depends on Phase 20's consent/cookie work being present (or built alongside)
Phase 22 (Admin)               — depends on Phase 20 (real lead data)
Phase 23 (SEO)                 — depends on Phases 1–19 having real content
Phase 24 (Accessibility)       — depends on Phases 1–22 substantially complete
Phase 25 (Performance)         — depends on Phases 1–22 substantially complete
Phase 26 (Security Hardening)  — depends on Phase 20 + Phase 22
Phase 27 (QA/Production)       — depends on all preceding phases
```

## Critical Risks

- **Over-animation:** the PDF explicitly wants "high-quality animations" AND "restraint" — the biggest execution risk is drifting toward decorative motion. Mitigated by design.md §10/§20 and per-phase Definition of Done checks.
- **Performance degradation from interactive/visual features:** dynamic background, RF Brain visualization, slider, and calculator are all candidates for jank if unbudgeted. Mitigated by skills.md §5/§14 and a dedicated Phase 25.
- **Scope creep:** the sheer number of interactive features (quiz, calculator, business-flow, mini-demo, RF Brain) risks ballooning beyond what an early-stage company's actual site needs. Mitigated by strict phase-by-phase approval gating — no phase starts without explicit instruction.
- **Unsupported claims slipping into copy:** benefits, security, and pricing sections are the highest-risk areas for accidental absolute claims. Mitigated by explicit hedging-language requirements and copy audits at VERIFY steps (Phases 8, 12, 13).
- **Backend complexity/timing:** building backend before frontend forms are finalized risks rework. Mitigated by sequencing (Phase 20 strictly after Phases 16–17).
- **Privacy/legal exposure:** legal pages must not be presented as legally sufficient without real counsel review. Mitigated by explicit "pending legal review" markers (Phase 14) and requirements.md §18's hard rule.
- **Interactive feature complexity (mini-demo):** the PDF itself hedges this with "if technically possible" — treated as optional/deferred to avoid it becoming a blocking dependency for the rest of Phase 18.
- **Mobile UX for complex diagrams:** workflow diagrams, RF Brain, and the Before/After slider all need genuinely redesigned (not shrunk) mobile behavior — a recurring risk across Phases 2, 6, 10. Mitigated by design.md §17's explicit per-feature mobile requirements.
- **Accessibility of custom interactive components:** slider, calculator, quiz, and accordion are all custom UI that's easy to get wrong for keyboard/screen-reader users. Mitigated by component-level accessibility requirements baked into each relevant phase, plus a dedicated Phase 24 audit.
- **SEO for a highly animated/JS-heavy site:** mitigated by SSR/SSG architecture choice (skills.md §2) rather than a client-only SPA.
- **Security of lead/demo data:** this is real business data (company info, contact details, operational challenges) — mitigated by skills.md §8–§10/§26 and a dedicated hardening phase.

## Open Questions (require client input before or during the relevant phase)

1. Should Services/Why RF/Benefits/How It Works exist only as homepage anchor sections, only as standalone pages, or both (homepage teaser + full page)? *(affects requirements.md §7/§8 and Phases 2–19 IA)*
2. Exact scheduling/calendar provider or mechanism for Book a Demo. *(Phase 16)*
3. Contact page field list (assumed default: Name/Email/Company/Message). *(Phase 17)*
4. Feasibility and scope of the interactive mini-demo experience ("if technically possible" per PDF). *(Phase 18)*
5. Admin authentication model — single user vs. multi-user with roles. *(Phase 22)*
6. Exact scope of "change basic website content" in Admin — which fields are CMS-editable. *(Phase 22)*
7. Lead export format confirmation (assumed default: CSV). *(Phase 22)*
8. Official contact details — email, phone, registered/business location, LinkedIn URL, other official social channels. *(Phases 14, 17, footer)*
9. Founder name(s), photo(s), short bio, LinkedIn URL(s) — one or multiple founders. *(Phase 15)*
10. Whether a Refund/Cancellation Policy is applicable to RF's business model. *(Phase 14 legal pages)*
11. Confirmation that a qualified Indian (and, if applicable, EU-aware) technology/privacy lawyer will review all legal documents before launch, and the review timeline relative to launch. *(Phase 14/27, hard requirement per PDF)*
12. Hosting/deployment provider preference, if any. *(Deployment strategy)*
13. Whether IT Rules "intermediary" obligations apply to RF's business model — requires legal determination, not an engineering assumption. *(Phase 14)*
14. Exact typeface selection (PDF is directional, not prescriptive). *(design.md §4, Phase 1)*
15. Exact extent of 3D/WebGL usage beyond the directional "3D design" note. *(design.md §12, Phase 2/10 as stretch enhancement)*

Frontend work through Phase 19 is not blocked by these — each phase either uses a clearly-labeled reasonable default (D. Assumptions) or defers the affected piece (e.g., mini-demo) without holding up the rest of the phase.
