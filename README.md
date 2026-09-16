# RF Intelligence

> An intelligence layer for business operations — not another dashboard.

RF Intelligence is the marketing and lead-generation site for an early-stage automation company. It presents what the company does, how its Understand → Decide → Execute approach works, and drives qualified visitors to **Book a Demo**.

The site is built to communicate one thing within seconds of landing: this is enterprise-grade automation, not a generic startup landing page.

---

## ✨ Highlights

- **Interactive 3D hero** — real-time WebGL scenes (custom GLSL terrain, glass shard effects) rendered with Three.js
- **Cinematic motion design** — physics-based transitions and scroll-driven animations via Framer Motion
- **Full marketing site** — About, Services, Industries, Benefits, How It Works, Why RF, Contact, and Book-a-Demo pages
- **Legal & trust pages** — Privacy Policy, Terms of Service, Cookie Policy, Security, Data Processing
- **Design system** — reusable bento cards, animated slideshows, resizable navbar, themed buttons; tokens centralized in `lib/tokens.ts`
- **Production-ready stack** — Next.js App Router, TypeScript strict mode, Tailwind CSS v4, ESLint + Prettier

## 🧱 Tech Stack

| Layer      | Technology                                        |
| ---------- | ------------------------------------------------- |
| Framework  | [Next.js](https://nextjs.org) 16 (App Router)     |
| Language   | TypeScript                                        |
| UI         | React 19, Tailwind CSS 4, shadcn/ui               |
| 3D / WebGL | Three.js with custom GLSL shaders                 |
| Motion     | Framer Motion                                     |
| Icons      | Hugeicons, Tabler, Lucide                         |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
cd rf-intelligence
npm install
```

### Run in development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

## 📁 Project Structure

```
rf-intelligence/
├── app/                  # Routes (App Router)
│   ├── page.tsx          # Landing page
│   ├── about/            # Company overview
│   ├── services/         # Service offerings
│   ├── industries/       # Industry use cases
│   ├── benefits/         # Before/after value
│   ├── how-it-works/     # Process explainer
│   ├── why-rf/           # Differentiation
│   ├── book-a-demo/      # Primary conversion path
│   ├── contact/
│   └── legal/            # Policy pages
├── components/
│   ├── canvas/           # WebGL scenes (GLSL hills, glass shards)
│   ├── sections/         # Page-level sections (Hero, Navbar, etc.)
│   └── ui/               # Reusable UI primitives
└── lib/                  # Theme context, design tokens, utilities
```

## 🎯 Design Principles

1. **Clarity under decoration** — every animation serves the story, not the other way around.
2. **B2B first** — the visitor journey is optimized for operations decision-makers evaluating automation.
3. **One conversion goal** — all CTAs consistently lead to *Book a Demo*.
4. **Trust by default** — security, privacy, and data-handling pages are first-class citizens.

## 🤝 Contributing

Branches are feature-scoped and merged into `main` via pull requests. Run `npm run lint` before opening a PR. Prettier config lives in `.prettierrc`.

## 📄 License

Private and proprietary — © RF Intelligence. All rights reserved.
