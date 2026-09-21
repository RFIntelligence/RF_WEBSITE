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
} from "@/app/lib/mock-data";
import { formatRelativeTime } from "@/app/lib/format";
import {
  useOrgRealtime,
  type RealtimeEvent,
} from "@/app/lib/realtime/use-org-realtime";

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

interface SessionResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  organization: {
    id: string;
    name: string;
    plan: string;
  } | null;
}

function OrgIndicator() {
  const [org, setOrg] = React.useState<{ name: string; plan: string } | null>(null);

  React.useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) return;
        const data = (await res.json()) as SessionResponse;
        if (active && data.organization) {
          setOrg({ name: data.organization.name, plan: data.organization.plan });
        }
      } catch {
        // non-fatal
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex h-8 items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs text-[var(--text-secondary)] select-none">
      <Building2 aria-hidden className="size-3.5 text-[var(--text-muted)]" />
      <span className="hidden sm:inline max-w-[140px] truncate font-medium text-[var(--text-primary)]">
        {org?.name ?? "Acme Corp"}
      </span>
      <Badge variant="accent" className="hidden sm:inline-flex py-0 px-1 text-[10px]">
        {org?.plan ?? "Enterprise"}
      </Badge>
    </div>
  );
}

interface ApiNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

function NotificationBell() {
  const [notifications, setNotifications] = React.useState<ApiNotification[]>(
    [],
  );
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [orgId, setOrgId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = (await res.json()) as {
        notifications: ApiNotification[];
        unreadCount: number;
      };
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // The bell is non-critical; leave the last known state in place.
    }
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) return;
        const data = (await res.json()) as {
          organization: { id: string } | null;
        };
        if (!cancelled) setOrgId(data.organization?.id ?? null);
      } catch {
        // Realtime is optional; polling remains available.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRealtime = React.useCallback(
    (event: RealtimeEvent) => {
      if (event.name === "notification:new") void load();
    },
    [load],
  );

  const { live } = useOrgRealtime(orgId, "notifications", handleRealtime);

  React.useEffect(() => {
    if (live) return;
    const interval = setInterval(() => {
      void load();
    }, 20000);
    return () => clearInterval(interval);
  }, [live, load]);

  const markAllRead = React.useCallback(async () => {
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
    } catch {
      void load();
    }
  }, [load]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        >
          <Bell aria-hidden className="size-4" />
          {unreadCount > 0 && (
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
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-[11px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
            >
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 && (
          <p className="px-3 py-3 text-xs text-[var(--text-muted)]">
            You&apos;re all caught up.
          </p>
        )}
        {notifications.map((n) => (
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
                {formatRelativeTime(n.createdAt)}
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
        <OrgIndicator />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
