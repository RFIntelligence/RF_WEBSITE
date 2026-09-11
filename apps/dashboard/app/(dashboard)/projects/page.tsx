"use client";

import React, { useState } from "react";
import { activeProjects, ActiveProject } from "@/app/lib/mock-data";
import { ActiveProjectsList } from "@/app/components/dashboard/active-projects-list";
import { FolderKanban, Plus, Search, Filter } from "lucide-react";

export default function ProjectsPage() {
  const [projectsList, setProjectsList] = useState<ActiveProject[]>(activeProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredProjects = projectsList.filter((proj) => {
    if (statusFilter !== "all" && proj.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        proj.name.toLowerCase().includes(q) ||
        proj.accountName.toLowerCase().includes(q) ||
        proj.ownerName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateProject = () => {
    const newProj: ActiveProject = {
      id: `proj_${Date.now()}`,
      name: "Q4 Enterprise Security Audit",
      accountName: "Acme Corp",
      status: "on_track",
      progress: 15,
      dueDate: "2026-10-15T00:00:00Z",
      ownerInitials: "JE",
      ownerName: "Jordan Ellis",
      openTasks: 3,
      activities: [
        {
          id: `act_${Date.now()}`,
          timestamp: "Just now",
          author: "Jordan Ellis",
          authorInitials: "JE",
          action: "Created new project",
          type: "status",
        },
      ],
    };
    setProjectsList((prev) => [newProj, ...prev]);
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="dash-eyebrow">/ projects</p>
          <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
            Active Engagements & Milestones
          </h1>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Track milestones, owners, and delivery status across all active engagements.
          </p>
        </div>

        <button
          onClick={handleCreateProject}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
        >
          <Plus className="size-4" />
          New Project
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-3 flex-wrap border-b border-[var(--border)] pb-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name, account, or owner..."
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-8 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <Filter className="size-3.5" />
          <span>Status:</span>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-2.5 py-1 text-xs text-[var(--text-primary)] focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="on_track">On Track</option>
          <option value="at_risk">At Risk</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Projects List */}
      <ActiveProjectsList projects={filteredProjects} />
    </div>
  );
}
