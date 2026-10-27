"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchMe, logoutCustomer } from "../api/auth";
import type { MeResponse } from "./types";

const EMPTY: MeResponse = { customer: null, identities: [] };

export function useCurrentCustomer() {
  const [data, setData] = useState<MeResponse>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setData(await fetchMe());
    } catch {
      setData(EMPTY);
      setError("Не удалось загрузить профиль");
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await logoutCustomer();
    setData(EMPTY);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...data, loading, error, refresh, signOut };
}
