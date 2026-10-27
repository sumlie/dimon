import type {
  MeResponse,
  OnboardingProfile,
  TelegramStartResponse,
} from "../model/types";

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => null)) as
    | (T & { error?: string })
    | null;

  if (!response.ok) {
    throw new Error(data?.error || "request_failed");
  }

  return data as T;
}

export function oauthStartUrl(
  provider: "google" | "yandex",
  redirectTo: string,
  mode: "login" | "link" = "login",
): string {
  const params = new URLSearchParams({
    redirectTo,
    mode,
    consent: "1",
  });
  return `/api/auth/${provider}/start?${params.toString()}`;
}

export async function fetchMe(): Promise<MeResponse> {
  const response = await fetch("/api/auth/me", {
    cache: "no-store",
    credentials: "include",
  });

  return readJson<MeResponse>(response);
}

export async function logoutCustomer(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  await readJson<{ ok: true }>(response);
}

export async function unlinkProvider(provider: string): Promise<void> {
  const response = await fetch(`/api/auth/links/${provider}`, {
    method: "DELETE",
    credentials: "include",
  });
  await readJson<{ ok: true }>(response);
}

export async function startTelegram(
  redirectTo: string,
  mode: "login" | "link" = "login",
): Promise<TelegramStartResponse> {
  const params = new URLSearchParams({
    redirectTo,
    mode,
    consent: "1",
  });
  const response = await fetch(
    `/api/auth/telegram/start?${params.toString()}`,
    {
      cache: "no-store",
      credentials: "include",
    },
  );

  return readJson<TelegramStartResponse>(response);
}

export async function fetchOnboardingProfile(): Promise<OnboardingProfile> {
  const response = await fetch("/api/auth/onboarding", {
    cache: "no-store",
    credentials: "include",
  });
  return readJson<OnboardingProfile>(response);
}

export async function completeOnboarding(data: {
  email: string;
  name: string;
  consent: boolean;
}): Promise<{ ok: true; redirectTo: string }> {
  const response = await fetch("/api/auth/onboarding", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return readJson<{ ok: true; redirectTo: string }>(response);
}
