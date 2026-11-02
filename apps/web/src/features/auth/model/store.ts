"use client";

import { create } from "zustand";

import { fetchMe, logoutCustomer } from "../api/auth";
import type { MeResponse } from "./types";

const EMPTY: MeResponse = {
  customer: null,
  identities: [],
};

type AuthStore = MeResponse & {
  loading: boolean;
  initialized: boolean;
  error: string | null;

  ensureLoaded: () => Promise<void>;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

let pendingRequest: Promise<void> | null = null;

let requestVersion = 0;

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...EMPTY,

  loading: false,
  initialized: false,
  error: null,

  ensureLoaded: async () => {
    if (get().initialized) return;

    await get().refresh();
  },

  refresh: async () => {
    if (pendingRequest) {
      await pendingRequest;
      return;
    }

    const version = requestVersion;

    set({
      loading: true,
      error: null,
    });

    const request = (async () => {
      try {
        const data = await fetchMe();

        if (version !== requestVersion) return;

        set({
          ...data,
          initialized: true,
          error: null,
        });
      } catch {
        if (version !== requestVersion) return;

        set({
          ...EMPTY,
          initialized: true,
          error: "Не удалось загрузить профиль",
        });
      } finally {
        if (version === requestVersion) {
          set({ loading: false });
        }
      }
    })();

    pendingRequest = request;

    try {
      await request;
    } finally {
      if (pendingRequest === request) {
        pendingRequest = null;
      }
    }
  },

  signOut: async () => {
    await logoutCustomer();

    requestVersion += 1;
    pendingRequest = null;

    set({
      ...EMPTY,
      loading: false,
      initialized: true,
      error: null,
    });
  },
}));