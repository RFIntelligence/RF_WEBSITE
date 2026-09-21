"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Building2,
  Bell,
  Shield,
  Lock,
  Plus,
  Mail,
  Check,
  Save,
  Trash2,
  ChevronDown,
  Loader2,
  AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Member {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  avatarInitials: string;
  createdAt: string;
}

interface PendingInvitation {
  id: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  expiresAt: string;
  invitedBy: { name: string; email: string };
}

interface Organization {
  id: string;
  name: string;
  plan: string;
}

interface NotificationPrefs {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  emailAlerts: boolean;
  riskSignals: boolean;
  weeklyDigest: boolean;
  slackIntegration: boolean;
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  avatarInitials: string;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

type ApiResult<T> = { data: T; error: null } | { data: null; error: string };

async function apiFetch<T>(url: string, options?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const json = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      const msg =
        typeof json.error === "string" ? json.error : `Request failed (${res.status})`;
      return { data: null, error: msg };
    }
    return { data: json as T, error: null };
  } catch {
    return { data: null, error: "Network error — please try again" };
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-400">
      <AlertCircle className="size-3.5 shrink-0" />
      {message}
    </div>
  );
}

function InlineSuccess({ message }: { message: string }) {
  return (
    <span className="text-xs text-emerald-400 flex items-center gap-1">
      <Check className="size-3.5" />
      {message}
    </span>
  );
}

// ─── Tab: Team Members ────────────────────────────────────────────────────────

function MembersTab({
  currentUser,
  members,
  invitations,
  isAdmin,
  onMembersChange,
  onInvitationsChange,
}: {
  currentUser: CurrentUser;
  members: Member[];
  invitations: PendingInvitation[];
  isAdmin: boolean;
  onMembersChange: () => void;
  onInvitationsChange: () => void;
}) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const [roleChangingId, setRoleChangingId] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    setInviteSuccess(null);
    if (!inviteEmail.trim()) return;
    setInviting(true);

    const result = await apiFetch<unknown>("/api/organization/invitations", {
      method: "POST",
      body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
    });

    setInviting(false);
    if (result.error !== null) {
      setInviteError(result.error);
    } else {
      setInviteEmail("");
      setInviteSuccess(`Invitation sent to ${inviteEmail.trim()}`);
      setTimeout(() => setInviteSuccess(null), 4000);
      onInvitationsChange();
    }
  };

  const handleRemove = async (id: string) => {
    setRemoveError(null);
    setRemovingId(id);
    const result = await apiFetch<unknown>(`/api/organization/members/${id}`, {
      method: "DELETE",
    });
    setRemovingId(null);
    if (result.error !== null) {
      setRemoveError(result.error);
    } else {
      onMembersChange();
    }
  };

  const handleRoleChange = async (id: string, newRole: "ADMIN" | "MEMBER") => {
    setRoleError(null);
    setRoleChangingId(id);
    const result = await apiFetch<unknown>(`/api/organization/members/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ role: newRole }),
    });
    setRoleChangingId(null);
    if (result.error !== null) {
      setRoleError(result.error);
    } else {
      onMembersChange();
    }
  };

  return (
    <div className="space-y-6">
      {/* Invite Box — Admins only */}
      {isAdmin && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3">
          <h2 className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Mail className="size-4 text-[var(--accent)]" />
            Invite New Team Member
          </h2>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as "ADMIN" | "MEMBER")}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button
              type="submit"
              disabled={inviting}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {inviting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              {inviting ? "Sending…" : "Send Invitation"}
            </button>
          </form>
          {inviteError && <InlineError message={inviteError} />}
          {inviteSuccess && <InlineSuccess message={inviteSuccess} />}
        </div>
      )}

      {/* Pending invitations */}
      {isAdmin && invitations.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-elevated)]/40 font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
            Pending Invitations ({invitations.length})
          </div>
          <div className="divide-y divide-[var(--border)]">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="p-4 flex items-center justify-between text-xs hover:bg-[var(--surface-elevated)]/40 transition-colors"
              >
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{inv.email}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Invited by {inv.invitedBy.name} ·{" "}
                    {inv.role}
                  </p>
                </div>
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members Table */}
      {removeError && <InlineError message={removeError} />}
      {roleError && <InlineError message={roleError} />}

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-elevated)]/40 font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-wider grid grid-cols-[1.5fr_1fr_80px]">
          <span>User</span>
          <span>Role</span>
          <span className="text-right">Action</span>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {members.map((member) => {
            const isSelf = member.id === currentUser.id;
            const isChangingRole = roleChangingId === member.id;
            const isRemoving = removingId === member.id;

            return (
              <div
                key={member.id}
                className="p-4 grid grid-cols-[1.5fr_1fr_80px] items-center text-xs hover:bg-[var(--surface-elevated)]/40 transition-colors"
              >
                {/* User info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-8 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center font-mono font-semibold text-xs text-[var(--text-primary)] shrink-0">
                    {member.avatarInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--text-primary)] truncate">
                      {member.name}
                      {isSelf && (
                        <span className="ml-1.5 text-[10px] text-[var(--text-muted)]">(you)</span>
                      )}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] truncate">
                      {member.email}
                    </p>
                  </div>
                </div>

                {/* Role selector — Admin only, not for self */}
                <div>
                  {isAdmin && !isSelf ? (
                    <div className="relative inline-flex items-center">
                      <select
                        value={member.role}
                        disabled={isChangingRole}
                        onChange={(e) =>
                          handleRoleChange(member.id, e.target.value as "ADMIN" | "MEMBER")
                        }
                        className="appearance-none rounded-xs pl-2 pr-6 py-0.5 text-[10px] font-mono uppercase bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none disabled:opacity-60 cursor-pointer"
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="MEMBER">Member</option>
                      </select>
                      {isChangingRole ? (
                        <Loader2 className="absolute right-1 size-3 animate-spin text-[var(--text-muted)]" />
                      ) : (
                        <ChevronDown className="absolute right-1 size-3 text-[var(--text-muted)] pointer-events-none" />
                      )}
                    </div>
                  ) : (
                    <span className="rounded-xs px-2 py-0.5 text-[10px] font-mono uppercase bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)]">
                      {member.role}
                    </span>
                  )}
                </div>

                {/* Remove button — Admin only, not for self */}
                <div className="text-right">
                  {isAdmin && !isSelf && (
                    <button
                      onClick={() => handleRemove(member.id)}
                      disabled={isRemoving}
                      className="text-[var(--text-muted)] hover:text-rose-400 p-1 transition-colors disabled:opacity-40"
                      title="Remove member"
                    >
                      {isRemoving ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Company Profile ─────────────────────────────────────────────────────

function OrganizationTab({
  org,
  onOrgChange,
}: {
  org: Organization;
  onOrgChange: (updated: Organization) => void;
}) {
  const [name, setName] = useState(org.name);
  const [plan, setPlan] = useState(org.plan);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Sync if parent org changes (e.g. on initial load).
  useEffect(() => {
    setName(org.name);
    setPlan(org.plan);
  }, [org.name, org.plan]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);

    const result = await apiFetch<{ organization: Organization }>("/api/organization", {
      method: "PATCH",
      body: JSON.stringify({ name: name.trim(), plan }),
    });

    setSaving(false);
    if (result.error !== null) {
      setError(result.error);
    } else {
      onOrgChange(result.data.organization);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <form
        onSubmit={handleSave}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4"
      >
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          Organization Profile
        </h2>

        <div className="space-y-1.5">
          <label className="text-xs text-[var(--text-muted)] font-medium">
            Organization Name
          </label>
          <input
            type="text"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-[var(--text-muted)] font-medium">
            Subscription Tier
          </label>
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none"
          >
            <option value="Enterprise">Enterprise ($2,400 / mo)</option>
            <option value="Pro">Pro ($800 / mo)</option>
            <option value="Starter">Starter ($200 / mo)</option>
          </select>
        </div>

        {error && <InlineError message={error} />}

        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
          {saved && <InlineSuccess message="Saved!" />}
        </div>
      </form>
    </div>
  );
}

// ─── Tab: Notification Preferences ───────────────────────────────────────────

function NotificationsTab({ prefs }: { prefs: NotificationPrefs }) {
  const [local, setLocal] = useState<NotificationPrefs>(prefs);
  const [saving, setSaving] = useState<string | null>(null); // field key being saved
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<string | null>(null);

  // Sync if parent prefs change on initial load.
  useEffect(() => {
    setLocal(prefs);
  }, [prefs]);

  const handleToggle = async (field: keyof NotificationPrefs, value: boolean) => {
    setLocal((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setSaving(field);

    const result = await apiFetch<{ preferences: NotificationPrefs }>(
      "/api/notification-preferences",
      { method: "PATCH", body: JSON.stringify({ [field]: value }) },
    );

    setSaving(null);
    if (result.error !== null) {
      // Roll back optimistic update.
      setLocal((prev) => ({ ...prev, [field]: !value }));
      setErrors((prev) => ({ ...prev, [field]: result.error! }));
    } else {
      setLocal(result.data.preferences);
      setSaved(field);
      setTimeout(() => setSaved(null), 1500);
    }
  };

  const toggleRow = (
    field: keyof NotificationPrefs,
    label: string,
    description: string,
  ) => (
    <div key={field} className="flex items-center justify-between pt-3 first:pt-2">
      <div>
        <p className="text-xs font-medium text-[var(--text-primary)]">{label}</p>
        <p className="text-[11px] text-[var(--text-muted)]">{description}</p>
        {errors[field] && (
          <p className="text-[11px] text-rose-400 mt-0.5">{errors[field]}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-4">
        {saving === field && <Loader2 className="size-3 animate-spin text-[var(--text-muted)]" />}
        {saved === field && <Check className="size-3 text-emerald-400" />}
        <input
          type="checkbox"
          checked={local[field]}
          disabled={saving === field}
          onChange={(e) => handleToggle(field, e.target.checked)}
          className="size-4 accent-[var(--accent)] disabled:opacity-60"
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-xl space-y-4">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          Notification Preferences
        </h2>
        <div className="space-y-4 divide-y divide-[var(--border)]">
          {toggleRow(
            "riskSignals",
            "Critical Risk Signals",
            "Instant alerts when account sentiment drops drastically.",
          )}
          {toggleRow(
            "emailAlerts",
            "Email Summary Briefs",
            "Daily morning briefing with top insights.",
          )}
          {toggleRow(
            "weeklyDigest",
            "Weekly Digest",
            "Weekly summary of activity and insights.",
          )}
          {toggleRow(
            "slackIntegration",
            "Slack Integration Webhook",
            "Stream notifications into #rf-intelligence Slack channel.",
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Security & Access ───────────────────────────────────────────────────

function SecurityTab() {
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [ssoEnforced, setSsoEnforced] = useState(true);

  return (
    <div className="max-w-xl space-y-4">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Lock className="size-4 text-emerald-400" />
          Security & Compliance Policies
        </h2>
        <div className="space-y-4 divide-y divide-[var(--border)]">
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xs font-medium text-[var(--text-primary)]">
                Enforce Multi-Factor Auth (MFA)
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                Require authenticator apps for all team members.
              </p>
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
              <p className="text-xs font-medium text-[var(--text-primary)]">
                Single Sign-On (SAML/Okta SSO)
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                Restrict login to corporate identity provider.
              </p>
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
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = "members" | "organization" | "notifications" | "security";

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState<Tab>("members");

  // Remote state
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);

  // Loading / bootstrap error
  const [loading, setLoading] = useState(true);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    const result = await apiFetch<{ members: Member[] }>("/api/organization/members");
    if (result.error === null) setMembers(result.data.members);
  }, []);

  const loadInvitations = useCallback(async () => {
    const result = await apiFetch<{ invitations: PendingInvitation[] }>(
      "/api/organization/invitations",
    );
    if (result.error === null) setInvitations(result.data.invitations);
  }, []);

  // Bootstrap: load everything in parallel on mount.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [userRes, orgRes, membersRes, prefsRes] = await Promise.all([
        apiFetch<{ user: CurrentUser }>("/api/users/me"),
        apiFetch<{ organization: Organization }>("/api/organization"),
        apiFetch<{ members: Member[] }>("/api/organization/members"),
        apiFetch<{ preferences: NotificationPrefs }>("/api/notification-preferences"),
      ]);

      if (cancelled) return;

      if (userRes.error !== null || orgRes.error !== null || membersRes.error !== null) {
        setBootstrapError(
          userRes.error ?? orgRes.error ?? membersRes.error ?? "Failed to load page data",
        );
        setLoading(false);
        return;
      }

      setCurrentUser(userRes.data.user);
      setOrg(orgRes.data.organization);
      setMembers(membersRes.data.members);
      if (prefsRes.error === null) setPrefs(prefsRes.data.preferences);

      // Load pending invites only if the user is an Admin.
      if (userRes.data.user.role === "ADMIN") {
        const invRes = await apiFetch<{ invitations: PendingInvitation[] }>(
          "/api/organization/invitations",
        );
        if (!cancelled && invRes.error === null) setInvitations(invRes.data.invitations);
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="mx-auto max-w-[1200px] space-y-6">
        <div>
          <p className="dash-eyebrow">/ team & organization</p>
          <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
            Account Settings & Workspace Controls
          </h1>
        </div>
        <div className="flex items-center justify-center py-20 text-[var(--text-muted)]">
          <Loader2 className="size-6 animate-spin mr-2" />
          <span className="text-sm">Loading…</span>
        </div>
      </div>
    );
  }

  if (bootstrapError || !currentUser || !org) {
    return (
      <div className="mx-auto max-w-[1200px] space-y-6">
        <div>
          <p className="dash-eyebrow">/ team & organization</p>
          <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
            Account Settings & Workspace Controls
          </h1>
        </div>
        <InlineError message={bootstrapError ?? "Failed to load page data"} />
      </div>
    );
  }

  const isAdmin = currentUser.role === "ADMIN";

  const defaultPrefs: NotificationPrefs = {
    emailEnabled: true,
    inAppEnabled: true,
    emailAlerts: true,
    riskSignals: true,
    weeklyDigest: true,
    slackIntegration: false,
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: "members",
      label: "Team Members",
      icon: <Users className="size-4" />,
      badge: String(members.length),
    },
    {
      id: "organization",
      label: "Company Profile",
      icon: <Building2 className="size-4" />,
    },
    {
      id: "notifications",
      label: "Notification Toggles",
      icon: <Bell className="size-4" />,
    },
    {
      id: "security",
      label: "Security & Access",
      icon: <Shield className="size-4" />,
    },
  ];

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      {/* Header */}
      <div>
        <p className="dash-eyebrow">/ team & organization</p>
        <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
          Account Settings & Workspace Controls
        </h1>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Manage workspace profile, invite team members, configure alert preferences, and
          enforce security policies.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-[var(--border)] gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && (
              <span className="text-[10px] font-mono text-[var(--text-muted)]">
                ({tab.badge})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "members" && (
        <MembersTab
          currentUser={currentUser}
          members={members}
          invitations={invitations}
          isAdmin={isAdmin}
          onMembersChange={loadMembers}
          onInvitationsChange={loadInvitations}
        />
      )}

      {activeTab === "organization" && isAdmin && (
        <OrganizationTab org={org} onOrgChange={setOrg} />
      )}
      {activeTab === "organization" && !isAdmin && (
        <div className="max-w-xl rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Organization Profile
            </h2>
            <div className="space-y-1.5">
              <p className="text-xs text-[var(--text-muted)] font-medium">Organization Name</p>
              <p className="text-xs text-[var(--text-primary)]">{org.name}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-[var(--text-muted)] font-medium">Subscription Tier</p>
              <p className="text-xs text-[var(--text-primary)]">{org.plan}</p>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              Only Admins can edit the organization profile.
            </p>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <NotificationsTab prefs={prefs ?? defaultPrefs} />
      )}

      {activeTab === "security" && <SecurityTab />}
    </div>
  );
}
