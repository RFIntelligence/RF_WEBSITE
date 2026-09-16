"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Search, Bell, ChevronDown, Check, Building2, LogOut, Settings, User } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { Input } from "@/app/components/ui/input";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/app/components/ui/dropdown-menu";
import {
  MOCK_USER,
  MOCK_ORGS,
  MOCK_NOTIFICATIONS,
} from "@/app/lib/mock-data";

// ─── Page title map ───────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/ai-insights": "AI Insights",
  "/ask-rf": "Ask RF",
  "/conversations": "Customer Conversations",
  "/reports": "Reports & Documents",
  "/messages": "Messages",
  "/team": "Team & Account",
};

function usePageTitle() {
  const pathname = usePathname();
  for (const [prefix, title] of Object.entries(PAGE_TITLES)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return title;
  }
  return "Dashboard";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function OrgSwitcher() {
  const [activeOrg, setActiveOrg] = React.useState(MOCK_ORGS[0]!.id);
  const current = MOCK_ORGS.find((o) => o.id === activeOrg) ?? MOCK_ORGS[0]!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Switch organisation"
          className="flex h-8 items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        >
          <Building2 aria-hidden className="size-3.5 text-[var(--text-muted)]" />
          <span className="hidden sm:inline max-w-[120px] truncate font-medium text-[var(--text-primary)]">
            {current.name}
          </span>
          <Badge variant="accent" className="hidden sm:inline-flex py-0 px-1 text-[10px]">
            {current.plan}
          </Badge>
          <ChevronDown aria-hidden className="size-3 text-[var(--text-muted)]" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuLabel>Organisations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={activeOrg} onValueChange={setActiveOrg}>
          {MOCK_ORGS.map((org) => (
            <DropdownMenuRadioItem key={org.id} value={org.id} className="gap-2">
              <div className="flex flex-1 items-center justify-between">
                <span>{org.name}</span>
                {org.id === activeOrg && (
                  <Check aria-hidden className="size-3.5 text-[var(--accent)]" />
                )}
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationBell() {
  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.read);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications${unread.length > 0 ? `, ${unread.length} unread` : ""}`}
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        >
          <Bell aria-hidden className="size-4" />
          {unread.length > 0 && (
            <span
              aria-hidden
              className="absolute right-1.5 top-1.5 flex h-2 w-2 items-center justify-center rounded-full bg-[var(--accent)]"
            />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unread.length > 0 && (
            <Badge variant="accent">{unread.length} new</Badge>
          )}
        </div>
        <DropdownMenuSeparator />
        {MOCK_NOTIFICATIONS.map((n) => (
          <DropdownMenuItem key={n.id} className="flex-col items-start gap-0.5 py-2.5">
            <div className="flex w-full items-start justify-between gap-2">
              <span
                className={cn(
                  "text-xs font-medium leading-snug",
                  n.read
                    ? "text-[var(--text-secondary)]"
                    : "text-[var(--text-primary)]"
                )}
              >
                {!n.read && (
                  <span
                    aria-hidden
                    className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] align-middle"
                  />
                )}
                {n.title}
              </span>
              <span className="shrink-0 text-[11px] text-[var(--text-muted)]">
                {n.relativeTime}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-snug">
              {n.body}
            </p>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="User menu"
          className="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm outline-none transition-colors hover:bg-[var(--surface-elevated)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        >
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-[10px]">
              {MOCK_USER.avatarInitials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:block text-xs font-medium text-[var(--text-primary)] max-w-[120px] truncate">
            {MOCK_USER.name}
          </span>
          <ChevronDown aria-hidden className="hidden md:block size-3 text-[var(--text-muted)]" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <div className="px-2 py-2">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
            {MOCK_USER.name}
          </p>
          <p className="text-xs text-[var(--text-muted)] truncate">
            {MOCK_USER.email}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2">
          <User aria-hidden className="size-4" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2">
          <Settings aria-hidden className="size-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-[var(--dash-status-error)] focus:text-[var(--dash-status-error)]">
          <LogOut aria-hidden className="size-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

interface TopBarProps {
  sidebarCollapsed: boolean;
}

export function TopBar({ sidebarCollapsed }: TopBarProps) {
  const title = usePageTitle();

  return (
    <header
      aria-label="Top bar"
      style={{
        height: "var(--dash-topbar-height)",
        background: "var(--dash-topbar-bg)",
        borderBottom: "1px solid var(--dash-topbar-border)",
        backdropFilter: "blur(var(--glass-blur))",
        WebkitBackdropFilter: "blur(var(--glass-blur))",
        display: "flex",
        alignItems: "center",
        gap: 12,
        paddingInline: 16,
        position: "sticky",
        top: 0,
        zIndex: 30,
        // Offset for sidebar — matches sidebar width transition
        marginLeft: sidebarCollapsed
          ? "var(--dash-sidebar-collapsed)"
          : "var(--dash-sidebar-width)",
        transition: "margin-left 200ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* Page title */}
      <h1 className="hidden sm:block shrink-0 text-sm font-semibold text-[var(--text-primary)] tracking-tight min-w-[120px]">
        {title}
      </h1>

      {/* Spacer / Search */}
      <div className="flex flex-1 items-center gap-2 max-w-xs">
        <div className="relative w-full">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[var(--text-muted)]"
          />
          <Input
            type="search"
            placeholder="Search…"
            aria-label="Global search"
            className="h-7 pl-8 text-xs bg-[var(--surface)] border-[var(--border)]"
          />
        </div>
      </div>

      {/* Right cluster */}
      <div className="ml-auto flex items-center gap-1">
        <OrgSwitcher />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
