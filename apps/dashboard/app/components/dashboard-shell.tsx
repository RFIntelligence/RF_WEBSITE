"use client";

import * as React from "react";
import { AppSidebar } from "@/app/components/app-sidebar";
import { TopBar } from "@/app/components/top-bar";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="min-h-dvh bg-[var(--background)]">
      <AppSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />

      {/* Main column — offset by sidebar width */}
      <div
        style={{
          marginLeft: collapsed
            ? "var(--dash-sidebar-collapsed)"
            : "var(--dash-sidebar-width)",
          transition: "margin-left 200ms cubic-bezier(0.16,1,0.3,1)",
          display: "flex",
          flexDirection: "column",
          minHeight: "100dvh",
        }}
      >
        <TopBar sidebarCollapsed={collapsed} />

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 outline-none"
          style={{ padding: "24px" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
