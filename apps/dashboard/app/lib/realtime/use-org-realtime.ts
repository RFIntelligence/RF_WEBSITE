"use client";

import { useEffect, useRef, useState } from "react";
import { orgChannel, type RealtimeScope } from "@/app/lib/realtime/channels";

/**
 * Subscribes to the organization-scoped realtime channel.
 *
 * The channel authorization endpoint verifies that the current session belongs
 * to the channel's organization before issuing credentials. When realtime is
 * not configured (or the connection cannot be established) `live` stays `false`
 * and callers are expected to fall back to polling.
 */

export interface RealtimeEvent {
  name: string;
  data: unknown;
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

    const channel = orgChannel(organizationId, scope);
    const authUrl = `/api/realtime/auth?channel=${encodeURIComponent(channel)}`;
    let closed = false;
    let client: { close: () => void } | null = null;

    async function connect() {
      try {
        const probe = await fetch(authUrl, { method: "GET" });
        if (!probe.ok || closed) return;

        const Ably = await import("ably");
        if (closed) return;

        const realtime = new Ably.Realtime({ authUrl });
        client = realtime;

        await realtime.channels.get(channel).subscribe((message) => {
          handlerRef.current({ name: message.name ?? "", data: message.data });
        });

        if (!closed) setLive(true);
      } catch (error) {
        console.warn("realtime: subscription unavailable, falling back", error);
        if (!closed) setLive(false);
      }
    }

    void connect();

    return () => {
      closed = true;
      client?.close();
    };
  }, [organizationId, scope]);

  return { live };
}
