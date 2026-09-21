"use client";

import { useEffect, useRef, useCallback } from "react";
import useSWR from "swr";
import type { DashboardData } from "@/app/types/dashboard";
import type { Project } from "@/app/types/project";
import { useSession } from "@/app/providers/session-provider";
import { useOrgRealtime, type RealtimeEvent } from "@/app/lib/realtime/use-org-realtime";

const fetcher = async (url: string): Promise<DashboardData> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard: ${res.status}`);
  }
  return res.json();
};

export function useDashboard() {
  const { session } = useSession();
  const orgId = session?.organization?.id ?? null;

  const { data, error, isLoading, mutate } = useSWR<DashboardData>(
    orgId ? "/api/dashboard" : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 10_000,
      shouldRetryOnError: true,
      errorRetryCount: 3,
    }
  );

  // BroadcastChannel for syncing updates across browser tabs
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !orgId) return;

    try {
      const bc = new BroadcastChannel(`rf-dashboard-${orgId}`);
      channelRef.current = bc;
      bc.onmessage = (event) => {
        if (event.data?.type === "invalidate") {
          void mutate();
        }
      };
    } catch {
      // BroadcastChannel not supported
    }

    return () => {
      try {
        channelRef.current?.close();
      } catch {}
    };
  }, [orgId, mutate]);

  const broadcastUpdate = useCallback(() => {
    try {
      channelRef.current?.postMessage({ type: "invalidate", timestamp: Date.now() });
    } catch {}
  }, []);

  // Realtime subscription via shared Ably connection
  const handleRealtimeEvent = useCallback(
    (event: RealtimeEvent) => {
      if (event.name === "org:data-changed") {
        void mutate();
        broadcastUpdate();
      }
    },
    [mutate, broadcastUpdate]
  );

  const { live } = useOrgRealtime(orgId, "notifications", handleRealtimeEvent);

  // Visible-tab polling fallback (30-60s jittered) if realtime is disconnected
  useEffect(() => {
    if (live || !orgId) return;

    let timer: NodeJS.Timeout;
    const schedulePoll = () => {
      const jitter = Math.floor(Math.random() * 30000); // 30s + 0-30s jitter = 30-60s
      timer = setTimeout(() => {
        if (typeof document !== "undefined" && document.visibilityState === "visible") {
          void mutate();
        }
        schedulePoll();
      }, 30000 + jitter);
    };

    schedulePoll();

    const onVisChange = () => {
      if (document.visibilityState === "visible") {
        void mutate();
      }
    };
    document.addEventListener("visibilitychange", onVisChange);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisChange);
    };
  }, [live, orgId, mutate]);

  // Handle local optimistic / reactive events (e.g. project created)
  useEffect(() => {
    function onProjectCreated(e: Event) {
      const project = (e as CustomEvent<Project>).detail;
      void mutate((prev) => {
        if (!prev) return prev;
        const newProjects = [project, ...prev.projects].slice(0, 5);
        return { ...prev, projects: newProjects };
      }, false);
      broadcastUpdate();
      void mutate();
    }

    window.addEventListener("rf:project-created", onProjectCreated);
    return () => window.removeEventListener("rf:project-created", onProjectCreated);
  }, [mutate, broadcastUpdate]);

  return {
    data,
    error,
    isLoading: isLoading && !data,
    mutate,
    broadcastUpdate,
  };
}
