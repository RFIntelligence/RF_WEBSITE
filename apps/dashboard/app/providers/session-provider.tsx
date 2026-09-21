"use client";

import React, { createContext, useContext } from "react";
import useSWR from "swr";

export interface SessionData {
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

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("Failed to load session");
  return res.json();
};

interface SessionContextValue {
  session: SessionData | null;
  isLoading: boolean;
  error: Error | unknown;
  mutate: () => Promise<SessionData | null | undefined>;
}

const SessionContext = createContext<SessionContextValue>({
  session: null,
  isLoading: true,
  error: null,
  mutate: async () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { data, error, isLoading, mutate } = useSWR<SessionData | null>(
    "/api/auth/session",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30_000,
      refreshInterval: 0,
      shouldRetryOnError: false,
    }
  );

  return (
    <SessionContext.Provider
      value={{
        session: data ?? null,
        isLoading,
        error,
        mutate,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
