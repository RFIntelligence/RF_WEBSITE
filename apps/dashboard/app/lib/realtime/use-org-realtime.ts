"use client";

import { useEffect, useRef, useState } from "react";
import { orgChannel, type RealtimeScope } from "@/app/lib/realtime/channels";

/**
 * Subscribes to the organization-scoped realtime channel.
 *
 * Reuses ONE global Ably connection across the entire client app,
 * rather than opening multiple WebSocket connections.
 */

export interface RealtimeEvent {
  name: string;
  data: unknown;
}

import type * as AblyType from "ably";

interface SharedClient {
  realtime: AblyType.Realtime;
  refCount: number;
}
let sharedClient: SharedClient | null = null;
let sharedClientPromise: Promise<AblyType.Realtime | null> | null = null;

async function getSharedRealtime(): Promise<AblyType.Realtime | null> {
  if (sharedClient) {
    sharedClient.refCount++;
    return sharedClient.realtime;
  }
  if (sharedClientPromise) {
    return sharedClientPromise;
  }

  sharedClientPromise = (async () => {
    try {
      const Ably = await import("ably");
      // Ably client with authCallback or dynamic authUrl
      const realtime = new Ably.Realtime({
        authUrl: "/api/realtime/auth",
        authMethod: "GET",
      });
      sharedClient = { realtime, refCount: 1 };
      return realtime;
    } finally {
      sharedClientPromise = null;
    }
  })();

  return sharedClientPromise;
}

function releaseSharedRealtime() {
  if (sharedClient) {
    sharedClient.refCount--;
    if (sharedClient.refCount <= 0) {
      const clientToClose = sharedClient.realtime;
      sharedClient = null;
      try {
        if (clientToClose && typeof clientToClose.close === "function") {
          clientToClose.close();
        }
      } catch {
        // Silently swallow already-closed or in-flight close errors
      }
    }
  }
}

export function useOrgRealtime(
  organizationId: string | null | undefined,
  scope: RealtimeScope,
  onEvent: (event: RealtimeEvent) => void,
): { live: boolean } {
  const [live, setLive] = useState(false);
  const handlerRef = useRef(onEvent);

  useEffect(() => {
    handlerRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!organizationId) return;

    const channelName = orgChannel(organizationId, scope);
    let closed = false;
    let unsubscriber: (() => void) | null = null;

    async function connect() {
      try {
        // Fast probe to verify realtime auth endpoint is reachable
        const authProbe = `/api/realtime/auth?channel=${encodeURIComponent(channelName)}`;
        const probe = await fetch(authProbe, { method: "GET" });
        if (!probe.ok || closed) return;

        const realtime = await getSharedRealtime();
        if (closed || !realtime) return;

        const channel = realtime.channels.get(channelName);
        const listener = (message: { name?: string; data?: unknown }) => {
          handlerRef.current({ name: message.name ?? "", data: message.data });
        };

        await channel.subscribe(listener);
        unsubscriber = () => {
          try {
            channel.unsubscribe(listener);
          } catch {}
        };

        if (!closed) setLive(true);
      } catch (error) {
        console.warn("realtime: subscription unavailable, falling back", error);
        if (!closed) setLive(false);
      }
    }

    void connect();

    return () => {
      closed = true;
      if (unsubscriber) unsubscriber();
      releaseSharedRealtime();
    };
  }, [organizationId, scope]);

  return { live };
}
