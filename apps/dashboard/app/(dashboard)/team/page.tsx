"use client";

import React, { useState } from "react";
import {
  Users,
  Building2,
  UserCheck,
  Shield,
  Bell,
  Lock,
  Plus,
  Mail,
  Check,
  Save,
  Trash2,
  KeyRound,
} from "lucide-react";
import { currentUser, orgs } from "@/app/lib/mock-data";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Member" | "Viewer";
  avatarInitials: string;
  status: "Active" | "Pending";
}

const INITIAL_TEAM: TeamMember[] = [
  {
    id: "usr_jordan",
    name: "Jordan Ellis",
    email: "jordan.ellis@acmecorp.com",
    role: "Admin",
    avatarInitials: "JE",
    status: "Active",
  },
  {
    id: "usr_priya",
    name: "Priya Sharma",
    email: "priya.sharma@acmecorp.com",
    role: "Manager",
    avatarInitials: "PS",
    status: "Active",
  },
  {
    id: "usr_tom",
    name: "Tom Kwan",
    email: "tom.kwan@acmecorp.com",
    role: "Member",
    avatarInitials: "TK",
    status: "Active",
  },
  {
    id: "usr_ana",
    name: "Ana Reyes",
    email: "ana.reyes@acmecorp.com",
    role: "Member",
    avatarInitials: "AR",
    status: "Active",
  },
  {
    id: "usr_marcus",
    name: "Marcus Lee",
    email: "marcus.lee@acmecorp.com",
    role: "Member",
    avatarInitials: "ML",
    status: "Pending",
  },
];

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState<"organization" | "members" | "notifications" | "security">("members");
  
  // Organization State
  const [orgName, setOrgName] = useState("Acme Corp");
  const [orgPlan, setOrgPlan] = useState("Enterprise");
  const [isSavedOrg, setIsSavedOrg] = useState(false);

  // Members State
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Admin" | "Manager" | "Member">("Member");

  // Notifications State
  const [notificationsConfig, setNotificationsConfig] = useState({
    emailAlerts: true,
    riskSignals: true,
    weeklyDigest: true,
    slackIntegration: false,
  });

  // Security State
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [ssoEnforced, setSsoEnforced] = useState(true);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const initials = inviteEmail.substring(0, 2).toUpperCase();
    const newMember: TeamMember = {
      id: `usr_${Date.now()}`,
      name: inviteEmail.split("@")[0].replace(".", " "),
      email: inviteEmail.trim(),
      role: inviteRole,
      avatarInitials: initials,
      status: "Pending",
    };

    setTeam((prev) => [...prev, newMember]);
    setInviteEmail("");
  };

  const handleRemoveMember = (id: string) => {
    setTeam((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavedOrg(true);
    setTimeout(() => setIsSavedOrg(false), 2000);
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      {/* Top Header */}
      <div>
        <p className="dash-eyebrow">/ team & organization</p>
        <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
          Account Settings & Workspace Controls
        </h1>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Manage workspace profile, invite team members, configure alert preferences, and enforce security policies.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-[var(--border)] gap-1">
        <button
          onClick={() => setActiveTab("members")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === "members"
              ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Users className="size-4" />
          Team Members ({team.length})
        </button>

        <button
          onClick={() => setActiveTab("organization")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === "organization"
              ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Building2 className="size-4" />
          Company Profile
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === "notifications"
              ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Bell className="size-4" />
          Notification Toggles
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === "security"
              ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Shield className="size-4" />
          Security & Access
        </button>
      </div>

      {/* Tab 1: Team Members Table & Invite Form */}
      {activeTab === "members" && (
        <div className="space-y-6">
          {/* Invite Box */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3">
            <h2 className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Mail className="size-4 text-[var(--accent)]" />
              Invite New Team Member
            </h2>
            <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@acmecorp.com"
                className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none"
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Member">Member</option>
              </select>
              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
              >
                <Plus className="size-4" />
                Send Invitation
              </button>
            </form>
          </div>

          {/* Members Table */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-elevated)]/40 font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-wider grid grid-cols-[1.5fr_1fr_1fr_80px]">
              <span>User</span>
              <span>Role</span>
              <span>Status</span>
              <span className="text-right">Action</span>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {team.map((member) => (
                <div
                  key={member.id}
                  className="p-4 grid grid-cols-[1.5fr_1fr_1fr_80px] items-center text-xs hover:bg-[var(--surface-elevated)]/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center font-mono font-semibold text-xs text-[var(--text-primary)] shrink-0">
                      {member.avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--text-primary)] truncate">
                        {member.name}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="rounded-xs px-2 py-0.5 text-[10px] font-mono uppercase bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)]">
                      {member.role}
                    </span>
                  </div>

                  <div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono ${
                        member.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {member.status}
                    </span>
                  </div>

                  <div className="text-right">
                    {member.id !== currentUser.id && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-[var(--text-muted)] hover:text-rose-400 p-1 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Company Profile */}
      {activeTab === "organization" && (
        <div className="max-w-xl space-y-6">
          <form onSubmit={handleSaveOrg} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Organization Profile
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs text-[var(--text-muted)] font-medium">Organization Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[var(--text-muted)] font-medium">Subscription Tier</label>
              <select
                value={orgPlan}
                onChange={(e) => setOrgPlan(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none"
              >
                <option value="Enterprise">Enterprise ($2,400 / mo)</option>
                <option value="Pro">Pro ($800 / mo)</option>
                <option value="Starter">Starter ($200 / mo)</option>
              </select>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
              >
                <Save className="size-4" />
                Save Changes
              </button>
              {isSavedOrg && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <Check className="size-3.5" /> Saved!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Notification Toggles */}
      {activeTab === "notifications" && (
        <div className="max-w-xl space-y-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Notification Preferences
            </h2>

            <div className="space-y-4 divide-y divide-[var(--border)]">
              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-xs font-medium text-[var(--text-primary)]">Critical Risk Signals</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Instant alerts when account sentiment drops drastically.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsConfig.riskSignals}
                  onChange={(e) =>
                    setNotificationsConfig({ ...notificationsConfig, riskSignals: e.target.checked })
                  }
                  className="size-4 accent-[var(--accent)]"
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-xs font-medium text-[var(--text-primary)]">Email Summary Briefs</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Daily morning briefing with top insights.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsConfig.emailAlerts}
                  onChange={(e) =>
                    setNotificationsConfig({ ...notificationsConfig, emailAlerts: e.target.checked })
                  }
                  className="size-4 accent-[var(--accent)]"
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-xs font-medium text-[var(--text-primary)]">Slack Integration Webhook</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Stream notifications into #rf-intelligence Slack channel.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsConfig.slackIntegration}
                  onChange={(e) =>
                    setNotificationsConfig({ ...notificationsConfig, slackIntegration: e.target.checked })
                  }
                  className="size-4 accent-[var(--accent)]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security & Access Settings */}
      {activeTab === "security" && (
        <div className="max-w-xl space-y-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Lock className="size-4 text-emerald-400" />
              Security & Compliance Policies
            </h2>

            <div className="space-y-4 divide-y divide-[var(--border)]">
              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-xs font-medium text-[var(--text-primary)]">Enforce Multi-Factor Auth (MFA)</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Require authenticator apps for all team members.</p>
                </div>
                <input
                  type="checkbox"
                  checked={mfaEnabled}
                  onChange={(e) => setMfaEnabled(e.target.checked)}
                  className="size-4 accent-[var(--accent)]"
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="text-xs font-medium text-[var(--text-primary)]">Single Sign-On (SAML/Okta SSO)</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Restrict login to corporate identity provider.</p>
                </div>
                <input
                  type="checkbox"
                  checked={ssoEnforced}
                  onChange={(e) => setSsoEnforced(e.target.checked)}
                  className="size-4 accent-[var(--accent)]"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
