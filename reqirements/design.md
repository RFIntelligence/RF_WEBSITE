# RF Intelligence — Design System

> This file is the single source of visual truth for Kiro. All components must derive values from the tokens defined here — never hardcode colors, spacing, or type sizes inline.

---

## 1. Brand Personality

Premium · Enterprise · Intelligent · Technical · Trustworthy · Minimal · Confident · Sophisticated.

The brand is derived from the supplied RF logo: black background, white "RF" mark, a single blue accent stroke/geometric cut. This says: disciplined, technical, monochrome-first with one deliberate accent — not a multi-color "AI gradient" brand.

## 2. Design Principles

1. **Clarity over decoration** — every element earns its place by communicating something.
2. **Restraint over visual noise** — one accent color, controlled motion, no competing focal points.
3. **Motion with purpose** — animation always represents a system concept (data flow, state change), never decoration.
4. **Technology without cliché** — no robot illustrations, no generic neural-net stock art, no neon.
5. **Strong hierarchy** — typography and spacing do the work; color is used sparingly to direct attention.
6. **Enterprise credibility** — the site should look like it belongs to a company with real infrastructure, not a weekend template.
7. **Consistent interaction patterns** — the same hover/focus/active language everywhere.
8. **Accessibility first** — accessibility is a design constraint from the first mockup, not a post-hoc pass.
9. **Performance first** — every visual decision (blur, particle count, video) is evaluated against its performance cost.

## 3. Color System

Semantic tokens only — components reference tokens, never raw hex values.

```
--background            /* page base */
--surface               /* card/panel base */
--surface-elevated      /* modal, popover, elevated card */
--text-primary
--text-secondary
--text-muted
--border
--border-subtle
--accent                /* RF brand blue, from logo */
--accent-hover
--accent-foreground     /* text/icon color placed on top of --accent */
--success
--warning
--error
--focus-ring
```

### Dark theme (default)
- `--background`: near-black (e.g. `#0A0B0D`–`#0E0F12` range — exact hex is an implementation decision to be picked to match the logo's black, not pure `#000`).
- `--surface`: a slightly lifted near-black (subtle, not a visible "card" unless intentional).
- `--text-primary`: off-white (not pure `#FFF`, to avoid harsh contrast).
- `--accent`: the blue extracted from the RF logo mark.
- `--border`: low-opacity white (hairline).
- Glass surfaces: low-opacity white fill + subtle blur, used selectively (see §9).

### Light theme
- `--background`: white/off-white.
- `--surface`: white with a faint elevation shadow instead of a border where possible.
- `--text-primary`: near-black.
- `--accent`: same brand blue (may need a slightly deepened variant for AA contrast on white).
- `--border`: light grey.
- Shadows replace glass/blur as the primary depth cue in light mode — heavy glassmorphism reads poorly on light backgrounds.

**Rule:** No rainbow palette. No secondary accent hue beyond the single brand blue, `--success`/`--warning`/`--error` (used only for functional states, never decoratively), and neutrals.

## 4. Typography

- **Font strategy:** one primary sans-serif typeface for both display and body (a technical, geometric-leaning grotesk reads as enterprise/technical; a secondary monospace may be used sparingly for labels like step numbers "01–06" or data-like UI to reinforce the "intelligence/technical" feel). Exact typeface choice: **UNDEFINED / REQUIRES CLIENT INPUT or designer selection** — not specified in PDF; pick a licensed, performant variable font (e.g., a self-hosted variable font) rather than an arbitrary decorative one.
- **Display (H1/hero):** large, tight letter-spacing, strong weight (600–700), tight-but-readable line-height (~1.05–1.15).
- **H2/section headings:** slightly looser than display, still weight 600+.
- **H3/subheadings:** 500–600 weight.
- **Body:** 400 weight, line-height ~1.5–1.6 for long-form paragraphs (Problem/About sections).
- **Labels/eyebrow text (e.g. "SERVICE 01"):** uppercase, small, letter-spacing wide, often monospace or semi-bold sans.
- **Scale:** use a modular type scale (e.g. 1.25–1.333 ratio) rather than ad hoc pixel values — defined once as tokens (`--font-size-xs` … `--font-size-6xl`).

## 5. Spacing System

Single spacing scale token set (e.g. 4px base: `--space-1` = 4px, `--space-2` = 8px … up through large section paddings like `--space-24` = 96px). All margins/paddings/gaps reference these tokens. No arbitrary one-off pixel values in components.

## 6. Grid and Layout

- **Max content width:** a single constrained container width (e.g. ~1280–1440px) used across all standard sections; full-bleed only for background visuals/dynamic background layers.
- **Desktop grid:** 12-column.
- **Tablet:** simplified grid (often collapses multi-column card grids to 2 columns).
- **Mobile:** single column, generous vertical rhythm.
- **Section spacing:** consistent vertical rhythm token between major homepage sections (e.g. `--space-20`/`--space-24` between sections on desktop, reduced proportionally on mobile).
- **Full-width vs constrained:** hero background/dynamic visuals may run full-bleed; text content and cards stay within the constrained container for readability.

## 7. Border Radius

Minimal, purposeful radius. Avoid the "everything is a heavily rounded card" SaaS look.
- Buttons/inputs: small–moderate radius (e.g. 6–10px).
- Cards/panels: slightly larger but still restrained (e.g. 8–12px), not pill-shaped.
- Avoid large radius on large surfaces — it reads as "template," not enterprise.

## 8. Shadows

Subtle only. Used primarily in light mode for elevation (since dark mode relies more on surface-color separation and hairline borders). No glowing colored shadows around buttons/cards as a default state — a soft accent glow is reserved for a hovered/active primary CTA only, and even then, subtle.

## 9. Glassmorphism

Used **selectively**, not globally:
- Appropriate: navbar background on scroll, popover/modal backgrounds, floating lead-popup card, possibly the hero's small credibility chip.
- Not appropriate: turning every service/benefit card into a glass panel — that immediately reads as "generic AI template."
- Glass treatment = low-opacity surface fill + backdrop blur + hairline border. Keep blur radius modest for performance.

## 10. Motion System

- **Entrance animations:** subtle fade/translate-up on scroll into view (short distance, ~150–300ms perceived weight equivalent, no bounce).
- **Hover animations:** small scale/brightness/border changes on interactive elements; never large layout shifts.
- **Page transitions:** simple fade or none — avoid heavy route-transition choreography that delays content.
- **Scroll animations:** used for the workflow diagrams (hero, "RF Brain") to show progression, not for gratuitous parallax.
- **Micro-interactions:** button press states, toggle switch animation, accordion expand/collapse.
- **Duration:** short (150–350ms typical UI; slightly longer, 400–600ms, for larger diagram state changes).
- **Easing:** standard ease-out for entrances, ease-in-out for toggles/state changes — consistent easing curve tokens, not ad hoc per component.
- **Reduced motion:** every animation must have a reduced/disabled fallback via `prefers-reduced-motion`, including the dynamic background and workflow diagrams (fallback to static state).

Motion must always communicate hierarchy or system behavior (e.g., data moving through the RF pipeline) — never exist "because AI websites need animation."

## 11. Dynamic Background

Concept: a subtle network of nodes/lines/data points/particles representing **Business → Data → Intelligence → Automation → Result**.

- Extremely subtle opacity/contrast relative to foreground text — must never compete with reading the content.
- Should feel technical/precise (thin lines, small nodes) rather than "sci-fi" (no thick glowing orbs, no lens-flare).
- Behavior: slow, continuous, non-distracting drift; may subtly react to scroll position (optional, not required) but never to a degree that reads as "busy."
- Must be fully disableable under reduced-motion preference, replaced by a static, still-attractive version of the same visual.
- Performance budget: this is a background decoration, not a hero feature — it must not compromise Core Web Vitals; consider canvas/WebGL only if lightweight, otherwise lightweight SVG/CSS is preferable.

## 12. 3D / WebGL Usage

The PDF calls for "3D design" as part of the aesthetic. Apply narrowly:
- Candidate uses: a subtle 3D depth/perspective treatment on the hero workflow visual or the "RF Brain" visualization (e.g., layered depth, not full 3D object scenes).
- **Do not** add floating generic 3D objects (spheres, blobs, abstract shapes) with no product meaning — this is explicitly called out as an anti-pattern in §20.
- If 3D is used, it must be justified by what it communicates (depth of the automation pipeline, layered data flow) and must be performance-budgeted (lazy-loaded, capped frame rate, disabled on low-power/reduced-motion).
- **UNDEFINED / REQUIRES CLIENT INPUT:** the exact extent of 3D usage — the PDF is directional ("3D design") without a concrete spec. Treat as a stretch enhancement on top of a fully working 2D version, never a blocking dependency.

## 13. Component System

Reusable components (built once, composed everywhere):
Navbar, ThemeToggle, Button, SectionHeader, Card, ServiceCard, WorkflowNode, WorkflowDiagram, StepIndicator, ComparisonSlider, FAQ (accordion), Modal, LeadForm, DemoForm, Toast, Footer, CookieBanner, InteractiveCalculator (ROI), AutomationQuiz ("What Should We Automate?"), IndustryCard, DifferentiationCard, TrustBadgeList.

## 14. Component States

Every interactive component defines: Default, Hover, Focus, Active, Disabled, Loading, Success, Error. No component ships without at minimum Default/Hover/Focus/Disabled defined; form-related components additionally require Loading/Success/Error.

## 15. Buttons

- **Primary:** solid accent fill, used only for the single primary conversion action per view (Book a Demo).
- **Secondary:** outline or subtle-fill, for secondary actions (Explore RF Intelligence, Talk to RF).
- **Ghost:** text-only with hover underline/background, for tertiary/nav-level actions.
- **Text/link:** inline text links.
- **Destructive:** not currently needed by any spec'd flow (no delete-style user action exists in the public site); reserve token for future/admin use.

The primary CTA visual language (color, shape, hover behavior) must be identical everywhere "Book a Demo" appears.

## 16. Forms

- Inputs: clear label above field, visible border, subtle focus ring using `--focus-ring`/`--accent`.
- Selects: consistent with input styling, native or custom but always keyboard-operable.
- Textareas: resizable vertically only, consistent styling with inputs.
- Checkboxes: custom-styled but must remain a real, keyboard/screen-reader operable checkbox — never a fake div.
- Validation: inline, per-field, on blur and on submit; never block-level "form has errors" with no field-level indication.
- Errors: red-toned (`--error`) text directly under the field, human-readable.
- Loading: submit button shows a loading state (spinner/disabled) — prevents double submission.
- Success: clear confirmation state (see requirements.md §21 confirmation copy) replacing or overlaying the form.

## 17. Responsive Design

Dedicated behavior per breakpoint — never a naive shrink:
- **Navigation:** desktop full nav → mobile hamburger with full-screen or slide-in menu; theme toggle always reachable.
- **Hero:** desktop side-by-side text/visual → mobile stacked, visual simplified/resized, never cropped awkwardly.
- **Interactive diagrams** (workflow, RF Brain, Before/After): desktop horizontal flow → mobile vertical flow or swipeable/steppable version; touch targets enlarged.
- **Forms:** single column on mobile, adequate tap target size (≥44px), appropriate input types (`type="email"`, `type="tel"`) to trigger correct mobile keyboards.
- **Cards:** desktop multi-column grid → tablet 2-column → mobile single column, never simply scaled down.
- **Sliders (Before/After):** must have a touch-drag mode on mobile plus accessible button controls.
- **Calculators:** desktop side-by-side input/output → mobile stacked with output appearing directly below relevant inputs (not requiring scroll-and-forget).

## 18. Accessibility (Design-Level)

- Contrast: WCAG AA minimum for all text/background combinations in both themes.
- Focus: visible, consistent focus ring token on every interactive element, including custom components (slider, accordion, calculator).
- Keyboard: full site operable without a mouse, including all interactive/unique features.
- Motion: reduced-motion alternative for every animated feature.
- Touch targets: minimum ~44×44px on mobile for buttons/toggles/checkboxes.
- Screen readers: meaningful accessible names/labels for icon-only controls (theme toggle, hamburger, slider handles), and text equivalents for diagram-based content (workflow flows, RF Brain) so the information isn't visual-only.

## 19. Visual Hierarchy

Each page should guide attention in this order: **Primary message → Supporting explanation → Proof/value → Interaction → CTA.** Concretely on the homepage: Hero (primary message) → What is RF/Problem (supporting explanation) → Services/How It Works/Benefits/Why RF (proof/value) → Before/After/RF Brain/interactive tools (interaction) → Final CTA + popup (CTA). Every section should have exactly one clear focal point; avoid competing headlines/CTAs within a single section.

## 20. Anti-AI-Slop Rules

**DO NOT:**
- Use random/unmotivated gradients.
- Use generic AI/robot imagery or neural-network stock art.
- Overuse glowing borders or blue/purple glow effects.
- Use excessive rounded "bubble" cards.
- Use huge meaningless numbers ("10,000+ businesses automated") without real data.
- Add random floating 3D objects with no product meaning.
- Add animation without a specific communicative purpose.
- Use buzzword-heavy copy beyond what the PDF itself specifies.
- Copy common AI-SaaS landing page layouts wholesale (hero-with-gradient-blob → logo strip → 3-column features → generic testimonial carousel).
- Create decorative UI with no product meaning.

Every visual element must be traceable to a reason: it communicates the product, guides hierarchy, or supports usability. If a component can be removed with no loss of understanding, it should not exist.
