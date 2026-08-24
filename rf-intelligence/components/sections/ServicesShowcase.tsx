"use client";

/**
 * ServicesShowcase — interactive services list.
 *
 * Left column: staggered-hover service titles (TextStaggerHover).
 * Right column: on hover/tap of a title, that service's BentoCard
 * (fake app-window with clickable tabs) clip-reveals in place.
 */

import * as React from "react";
import { motion } from "motion/react";
import {
  DashboardSquare01Icon,
  UserGroupIcon,
  Message01Icon,
  Folder02Icon,
  Add01Icon,
  CircleArrowUpRight02Icon,
  Search01Icon,
  BarChartIcon,
  Tick01Icon,
  Settings02Icon,
  InformationCircleIcon,
  DatabaseIcon,
  Mail01Icon,
  LeftToRightListDashIcon,
} from "@hugeicons/core-free-icons";
import {
  HoverSlider,
  TextStaggerHover,
  HoverSliderImageWrap,
  clipPathVariants,
  useHoverSliderContext,
} from "@/components/ui/animated-slideshow";
import BentoCard, {
  BentoStatPanel,
  BentoListPanel,
  BentoRowsPanel,
  BentoActionsPanel,
  type BentoTab,
} from "@/components/ui/bento-card";

/* ── Per-service bento content ────────────────────────────────────────────── */

const SERVICE_BENTOS: {
  id: string;
  title: string;
  eyebrow: string;
  heading: string;
  tabs: BentoTab[];
}[] = [
  {
    id: "workflow-automation",
    title: "Workflow Automation",
    eyebrow: "Workflow Automation",
    heading: "Kill the repetitive work — approvals, entry and checks, end-to-end.",
    tabs: [
      {
        id: "pipeline",
        label: "Pipeline",
        icon: DashboardSquare01Icon,
        header: "Automation Coverage",
        description: "Share of mapped work now automated.",
        panel: (
          <BentoStatPanel
            statLabel="Coverage"
            statValue="End-to-end"
            statSub="Intake to handoff, mapped before anything ships"
            watermarkIcon={BarChartIcon}
            chips={[
              { value: "Approvals", label: "Routed & approved", icon: LeftToRightListDashIcon },
              { value: "Entry & checks", label: "Captured & validated", icon: Tick01Icon },
            ]}
          />
        ),
      },
      {
        id: "stages",
        label: "Stages",
        icon: LeftToRightListDashIcon,
        badge: "4",
        header: "Pipeline Stages",
        description: "Every step tracked, retried and audited.",
        panel: (
          <BentoListPanel
            listTitle="Active Stages"
            rows={[
              { name: "Intake & capture", role: "Emails, forms and files in", status: "Auto", color: "bg-emerald-400" },
              { name: "Validation rules", role: "Schema and policy checks", status: "Auto", color: "bg-emerald-400" },
              { name: "Human review queue", role: "Exceptions routed to staff", status: "Review", color: "bg-amber-400" },
              { name: "Final handoff", role: "Written back to your systems", status: "Auto", color: "bg-emerald-400" },
            ]}
          />
        ),
      },
      {
        id: "runs",
        label: "Runs",
        icon: DatabaseIcon,
        badge: "12",
        header: "Recent Runs",
        description: "Latest executions across pipelines.",
        panel: (
          <BentoRowsPanel
            rowsTitle="Execution Log"
            rows={[
              { title: "invoice_pipeline.json", meta: "2 min ago", tag: "OK", icon: DatabaseIcon },
              { title: "crm_sync.json", meta: "14 min ago", tag: "OK", icon: DatabaseIcon },
              { title: "report_build.xls", meta: "1 hr ago", tag: "Retry", icon: BarChartIcon },
            ]}
          />
        ),
      },
      {
        id: "actions",
        label: "Setup",
        icon: Add01Icon,
        header: "Quick Setup",
        description: "Spin up automation in minutes.",
        panel: (
          <BentoActionsPanel
            actions={[
              { title: "New workflow", desc: "Automate a manual process.", icon: Folder02Icon },
              { title: "Approval rule", desc: "Add a human checkpoint.", icon: Tick01Icon },
            ]}
            footerNote="Pin a workflow to watch it live"
          />
        ),
      },
    ],
  },
  {
    id: "custom-ai-agents",
    title: "Custom AI Agents",
    eyebrow: "Custom AI Agents",
    heading: "Agents that act, not just answer — inside guardrails you control.",
    tabs: [
      {
        id: "overview",
        label: "Overview",
        icon: DashboardSquare01Icon,
        header: "Agent Performance",
        description: "Success rate across all deployments.",
        panel: (
          <BentoStatPanel
            statLabel="Agent behaviour"
            statValue="Guardrailed"
            statSub="Bounded by rules you define and review"
            watermarkIcon={UserGroupIcon}
            chips={[
              { value: "Your tools", label: "Inside your stack", icon: Message01Icon },
              { value: "Logged", label: "Every action", icon: CircleArrowUpRight02Icon },
            ]}
          />
        ),
      },
      {
        id: "agents",
        label: "Agents",
        icon: UserGroupIcon,
        badge: "12",
        header: "Deployed Agents",
        description: "What each agent owns right now.",
        panel: (
          <BentoListPanel
            listTitle="Fleet"
            rows={[
              { name: "support-triage v2.1", role: "Owns support ticket triage", status: "Active", color: "bg-emerald-400" },
              { name: "sales-brief v1.3", role: "Drafts account briefings", status: "Active", color: "bg-emerald-400" },
              { name: "data-fetcher v0.9", role: "In evaluation sandbox", status: "Canary", color: "bg-amber-400" },
            ]}
          />
        ),
      },
      {
        id: "evals",
        label: "Evals",
        icon: BarChartIcon,
        header: "Eval Suites",
        description: "Guardrails tested on every release.",
        panel: (
          <BentoRowsPanel
            rowsTitle="Latest Results"
            rows={[
              { title: "guardrail_suite.json", meta: "214 cases", tag: "Passed", icon: Search01Icon },
              { title: "tool_use_suite.json", meta: "96 cases", tag: "Passed", icon: Settings02Icon },
              { title: "reasoning_suite.json", meta: "58 cases", tag: "Review", icon: InformationCircleIcon },
            ]}
          />
        ),
      },
      {
        id: "actions",
        label: "Setup",
        icon: Add01Icon,
        header: "Quick Setup",
        description: "Define an agent's job and limits.",
        panel: (
          <BentoActionsPanel
            actions={[
              { title: "New agent", desc: "Give it tools and a goal.", icon: Message01Icon },
              { title: "Guardrail", desc: "Bound what it may do.", icon: Settings02Icon },
            ]}
            footerNote="Every action logged and reversible"
          />
        ),
      },
    ],
  },
  {
    id: "data-intelligence",
    title: "Data Intelligence",
    eyebrow: "Data Intelligence",
    heading: "Pipelines that surface signal — dashboards people actually open.",
    tabs: [
      {
        id: "signal",
        label: "Signal",
        icon: DashboardSquare01Icon,
        header: "Data Freshness",
        description: "SLA across all live sources.",
        panel: (
          <BentoStatPanel
            statLabel="Freshness"
            statValue="Always current"
            statSub="Pipelines built to keep operational views live"
            watermarkIcon={Search01Icon}
            chips={[
              { value: "Streaming", label: "Ingestion", icon: DatabaseIcon },
              { value: "Any source", label: "DBs, APIs, files", icon: Folder02Icon },
            ]}
          />
        ),
      },
      {
        id: "pipelines",
        label: "Pipelines",
        icon: DatabaseIcon,
        badge: "18",
        header: "Pipelines",
        description: "Health of every running pipeline.",
        panel: (
          <BentoListPanel
            listTitle="Health"
            rows={[
              { name: "orders-etl", role: "Postgres → warehouse", status: "Healthy", color: "bg-emerald-400" },
              { name: "marketing-attrib", role: "Ads APIs → warehouse", status: "Healthy", color: "bg-emerald-400" },
              { name: "legacy-sql-sync", role: "AS/400 bridge, retrying", status: "Slow", color: "bg-amber-400" },
            ]}
          />
        ),
      },
      {
        id: "dashboards",
        label: "Views",
        icon: BarChartIcon,
        header: "Live Dashboards",
        description: "Always-current operational views.",
        panel: (
          <BentoRowsPanel
            rowsTitle="Recently Updated"
            rows={[
              { title: "revenue_ops.xls", meta: "5 min ago", tag: "LIVE", icon: BarChartIcon },
              { title: "churn_watch.xls", meta: "12 min ago", tag: "LIVE", icon: Mail01Icon },
              { title: "supply_heatmap.zip", meta: "1 hr ago", tag: "LIVE", icon: Folder02Icon },
            ]}
          />
        ),
      },
      {
        id: "actions",
        label: "Setup",
        icon: Add01Icon,
        header: "Quick Setup",
        description: "Connect a source, get an alert.",
        panel: (
          <BentoActionsPanel
            actions={[
              { title: "New pipeline", desc: "Wire up another source.", icon: DatabaseIcon },
              { title: "Anomaly alert", desc: "Know when numbers break.", icon: InformationCircleIcon },
            ]}
            footerNote="Alerts route to Slack and email"
          />
        ),
      },
    ],
  },
  {
    id: "systems-integration",
    title: "Systems Integration",
    eyebrow: "Systems Integration",
    heading: "Your stack, speaking one language — no more gaps between tools.",
    tabs: [
      {
        id: "coverage",
        label: "Coverage",
        icon: DashboardSquare01Icon,
        header: "Integration Health",
        description: "Delivery and latency across connectors.",
        panel: (
          <BentoStatPanel
            statLabel="Integration health"
            statValue="Bi-directional"
            statSub="Between the platforms you already run"
            watermarkIcon={Folder02Icon}
            chips={[
              { value: "CRM & ERP", label: "Connected", icon: Settings02Icon },
              { value: "Event-driven", label: "No batch delays", icon: CircleArrowUpRight02Icon },
            ]}
          />
        ),
      },
      {
        id: "connectors",
        label: "Links",
        icon: Folder02Icon,
        badge: "9",
        header: "Connected Systems",
        description: "Bridges between your platforms.",
        panel: (
          <BentoListPanel
            listTitle="Connections"
            rows={[
              { name: "Salesforce CRM", role: "Bi-directional contact sync", status: "Linked", color: "bg-emerald-400" },
              { name: "SAP ERP", role: "Orders and inventory", status: "Linked", color: "bg-emerald-400" },
              { name: "Legacy AS/400", role: "Read-only bridge adapter", status: "Bridge", color: "bg-amber-400" },
            ]}
          />
        ),
      },
      {
        id: "events",
        label: "Events",
        icon: DatabaseIcon,
        header: "Event Streams",
        description: "What moved through recently.",
        panel: (
          <BentoRowsPanel
            rowsTitle="Stream Log"
            rows={[
              { title: "contact.updated", meta: "just now", tag: "OK", icon: DatabaseIcon },
              { title: "order.created", meta: "3 min ago", tag: "OK", icon: DatabaseIcon },
              { title: "invoice.paid", meta: "22 min ago", tag: "OK", icon: Mail01Icon },
            ]}
          />
        ),
      },
      {
        id: "actions",
        label: "Setup",
        icon: Add01Icon,
        header: "Quick Setup",
        description: "Link a tool without a rewrite.",
        panel: (
          <BentoActionsPanel
            actions={[
              { title: "New connector", desc: "Plug in any system.", icon: Folder02Icon },
              { title: "Field mapping", desc: "Align schemas visually.", icon: Settings02Icon },
            ]}
            footerNote="Legacy systems welcome"
          />
        ),
      },
    ],
  },
  {
    id: "decision-support",
    title: "Decision Support",
    eyebrow: "Decision Support",
    heading: "Surface only what needs a human — filter the rest automatically.",
    tabs: [
      {
        id: "triage",
        label: "Triage",
        icon: DashboardSquare01Icon,
        header: "Noise Filter",
        description: "Volume reaching human attention.",
        panel: (
          <BentoStatPanel
            statLabel="Noise filter"
            statValue="Filtered first"
            statSub="Only genuine exceptions reach a human"
            watermarkIcon={Message01Icon}
            chips={[
              { value: "Exceptions", label: "Routed for review", icon: InformationCircleIcon },
              { value: "Audit trail", label: "Every decision", icon: Tick01Icon },
            ]}
          />
        ),
      },
      {
        id: "queues",
        label: "Queues",
        icon: Message01Icon,
        badge: "3",
        header: "Attention Queues",
        description: "Only real decisions wait here.",
        panel: (
          <BentoListPanel
            listTitle="Needs a Human"
            rows={[
              { name: "Executive brief", role: "Compiled overnight, ready", status: "Ready", color: "bg-emerald-400" },
              { name: "Exception review", role: "Vendor contract over threshold", status: "Waiting", color: "bg-amber-400" },
              { name: "Weekly digest", role: "Scheduled Friday 09:00", status: "Queued", color: "bg-emerald-400" },
            ]}
          />
        ),
      },
      {
        id: "briefs",
        label: "Briefs",
        icon: Mail01Icon,
        header: "Context Briefs",
        description: "Decisions arrive pre-researched.",
        panel: (
          <BentoRowsPanel
            rowsTitle="Delivered Today"
            rows={[
              { title: "market_shift.pdf", meta: "06:00 AM", tag: "Sent", icon: Mail01Icon },
              { title: "ops_anomaly.json", meta: "08:15 AM", tag: "Sent", icon: DatabaseIcon },
              { title: "headling_plan.xls", meta: "09:30 AM", tag: "Draft", icon: BarChartIcon },
            ]}
          />
        ),
      },
      {
        id: "actions",
        label: "Setup",
        icon: Add01Icon,
        header: "Quick Setup",
        description: "Teach it what matters to you.",
        panel: (
          <BentoActionsPanel
            actions={[
              { title: "New rule", desc: "Filter what you never see.", icon: Search01Icon },
              { title: "Escalation path", desc: "Who hears about exceptions.", icon: CircleArrowUpRight02Icon },
            ]}
            footerNote="Feedback tunes future triage"
          />
        ),
      },
    ],
  },
];

/* ── Card reveal wrapper ──────────────────────────────────────────────────── */

const cardVariants = {
  visible: { ...clipPathVariants.visible, opacity: 1 },
  hidden: { ...clipPathVariants.hidden, opacity: 0 },
};

function BentoReveal({
  index,
  eyebrow,
  children,
}: {
  index: number;
  eyebrow: string;
  children: React.ReactNode;
}) {
  const { activeSlide } = useHoverSliderContext();
  const isActive = activeSlide === index;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate={isActive ? "visible" : "hidden"}
      transition={{ ease: [0.33, 1, 0.68, 1], duration: 0.6 }}
      aria-hidden={!isActive}
      className={[
        "h-full w-full flex items-center",
        isActive ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
      key={`bento-${eyebrow}`}
    >
      {children}
    </motion.div>
  );
}

/* ── Section ──────────────────────────────────────────────────────────────── */

export function ServicesShowcase() {
  return (
    <section
      id="services-showcase"
      aria-labelledby="services-heading"
      className="relative w-full py-24 md:py-32 px-6 md:px-12"
      style={{ background: "var(--background)" }}
    >
      <HoverSlider className="mx-auto w-full max-w-[1200px]">
        {/* eyebrow */}
        <h2
          id="services-heading"
          className="mb-14 text-xs font-medium capitalize tracking-wide"
          style={{ color: "var(--accent)" }}
        >
          / what we build
        </h2>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          {/* ── Left: service titles ── */}
          <div className="flex flex-col gap-2 md:gap-3">
            {SERVICE_BENTOS.map((service, index) => (
              <TitleButton key={service.id} index={index} service={service} />
            ))}
            <p
              className="mt-8 text-xs hidden lg:block"
              style={{ color: "var(--text-muted)" }}
            >
              Hover or tap a service to open its console
            </p>
          </div>

          {/* ── Right: bento cards revealed per service ── */}
          <div className="relative min-h-[520px] md:min-h-[560px]">
            <HoverSliderImageWrap className="absolute inset-0">
              {SERVICE_BENTOS.map((service, index) => (
                <BentoReveal
                  key={service.id}
                  index={index}
                  eyebrow={service.eyebrow}
                >
                  <BentoCard
                    eyebrow={service.eyebrow}
                    heading={service.heading}
                    tabs={service.tabs}
                  />
                </BentoReveal>
              ))}
            </HoverSliderImageWrap>
          </div>
        </div>
      </HoverSlider>
    </section>
  );
}

/* ── Title button — hover via TextStaggerHover, click for touch devices ───── */

function TitleButton({
  index,
  service,
}: {
  index: number;
  service: { title: string };
}) {
  const { changeSlide } = useHoverSliderContext();
  return (
    <button
      type="button"
      onClick={() => changeSlide(index)}
      className="group text-left w-fit cursor-pointer focus-visible:outline-offset-8"
      aria-label={`Show ${service.title} details`}
    >
      <TextStaggerHover
        index={index}
        text={service.title}
        className="block whitespace-nowrap text-[clamp(1.5rem,2.9vw,2.75rem)] font-semibold uppercase tracking-tighter"
      />
    </button>
  );
}
