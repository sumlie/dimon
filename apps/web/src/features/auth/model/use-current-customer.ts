"use client";

import { useEffect } from "react";

import { useAuthStore } from "./store";

export function useCurrentCustomer() {
  const customer = useAuthStore((state) => state.customer);
  const identities = useAuthStore((state) => state.identities);

  const loading = useAuthStore(
    (state) => state.loading || !state.initialized,
  );

  const error = useAuthStore((state) => state.error);

  const ensureLoaded = useAuthStore((state) => state.ensureLoaded);
  const refresh = useAuthStore((state) => state.refresh);
  const signOut = useAuthStore((state) => state.signOut);

  useEffect(() => {
    void ensureLoaded();
  }, [ensureLoaded]);

  return {
    customer,
    identities,
    loading,
    error,
    refresh,
    signOut,
  };
}