"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import {
  type AuthIdentity,
  authErrorText,
  unlinkProvider,
  useCurrentCustomer,
} from "@/features/auth";
import { AuthDialog } from "@/features/auth/ui/auth-dialog";
import { ProfileDetails } from "@/features/auth/ui/profile-details";
import { Button } from "@/shared/ui/button/button";
import { Spinner } from "@/shared/ui/spinner";

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  yandex: "Яндекс",
  telegram: "Telegram",
  vk: "VK",
};

function formatDate(value: string | null): string {
  if (!value) return "—";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function AccountPage() {
  const { customer, identities, loading, error, refresh, signOut } =
    useCurrentCustomer();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"login" | "link">("login");
  const [unlinking, setUnlinking] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("auth_error");
    const auth = params.get("auth");

    if (authError) setActionError(authErrorText(authError));
    if (auth === "success") setNotice("Вход выполнен.");
    if (auth === "linked") setNotice("Провайдер привязан.");

    if (authError || auth) {
      params.delete("auth_error");
      params.delete("auth");

      const next = `${window.location.pathname}${params.size ? `?${params}` : ""}`;
      window.history.replaceState(null, "", next);
    }
  }, []);

  const openLogin = () => {
    setDialogMode("login");
    setDialogOpen(true);
  };

  const openLink = () => {
    setDialogMode("link");
    setDialogOpen(true);
  };

  const handleUnlink = async (identity: AuthIdentity) => {
    if (
      !window.confirm(
        `Отвязать ${PROVIDER_LABELS[identity.provider] || identity.provider}?`,
      )
    ) {
      return;
    }

    setUnlinking(identity.provider);
    setActionError(null);
    setNotice(null);

    try {
      await unlinkProvider(identity.provider);
      await refresh();
      setNotice("Провайдер отвязан.");
    } catch (err) {
      const code = err instanceof Error ? err.message : "internal_error";
      setActionError(authErrorText(code));
    } finally {
      setUnlinking(null);
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.assign("/");
  };

  const linkedProviders = new Set(
    identities.map((identity) => identity.provider),
  );

  const availableProviders = ["google", "yandex", "telegram"].filter(
    (provider) => !linkedProviders.has(provider),
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="w-full px-5 py-25 sm:px-8 lg:pt-30">
        <div className="border-b-2 border-black pb-6">
          <h1 className="font-sans text-4xl font-extrabold lowercase tracking-tight text-black sm:text-5xl lg:text-6xl">
            аккаунт
          </h1>
        </div>

        <div className="flex flex-col items-center py-20 text-center sm:py-28">
          <p className="font-sans text-2xl font-extrabold lowercase text-black sm:text-3xl">
            пока ты не вошёл
          </p>

          <p className="mt-3 max-w-sm font-sans text-sm lowercase leading-relaxed text-black/50 sm:text-base">
            войди, чтобы управлять профилем и привязанными сервисами
          </p>

          {error ? (
            <p
              role="alert"
              className="mt-4 font-sans text-sm text-red-600"
            >
              {error}
            </p>
          ) : null}

          {actionError ? (
            <p
              role="alert"
              className="mt-4 font-sans text-sm text-red-600"
            >
              {actionError}
            </p>
          ) : null}

          <Button
            type="button"
            variant="default"
            pd="md"
            onClick={openLogin}
            className="group mt-8 flex items-center justify-between gap-8 border border-black bg-black font-sans text-sm font-extrabold lowercase text-white transition-colors hover:bg-white hover:text-black"
          >
            войти

            <ArrowRight
              size={18}
              strokeWidth={1.5}
              className="transition-transform group-hover:-rotate-45"
            />
          </Button>
        </div>

        <AuthDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          redirectTo="/account"
          mode={dialogMode}
        />
      </div>
    );
  }

  return (
    <div className="w-full px-5 py-25 sm:px-8 lg:pt-30">
      {/* Заголовок */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-black pb-6">
        <div className="min-w-0">
          <p className="mb-3 font-sans text-sm lowercase text-black/50">
            личный кабинет
          </p>

          <h1 className="break-words font-sans text-4xl font-extrabold lowercase tracking-tight text-black sm:text-5xl lg:text-6xl">
            {customer.name}
          </h1>
        </div>

        <Button
          type="button"
          variant="text"
          pd="none"
          onClick={() => void handleLogout()}
          className="shrink-0 font-sans text-sm lowercase text-black/50 transition-colors hover:text-red-600"
        >
          выйти
        </Button>
      </div>

      {/* Уведомления */}
      {notice ? (
        <p
          role="status"
          className="mt-5 border-l-2 border-black pl-3 font-sans text-sm text-black"
        >
          {notice}
        </p>
      ) : null}

      {actionError ? (
        <p
          role="alert"
          className="mt-5 border-l-2 border-red-600 pl-3 font-sans text-sm text-red-600"
        >
          {actionError}
        </p>
      ) : null}

      <div className="grid gap-12 pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:gap-16">
        <ProfileDetails customer={customer} refresh={refresh} />
        <section className="h-fit lg:sticky lg:top-24">
          <h2 className="font-sans text-2xl font-extrabold lowercase tracking-tight text-black">
            вход и сервисы
          </h2>

          <p className="mt-2 font-sans text-sm lowercase leading-relaxed text-black/50">
            управляй способами входа в аккаунт
          </p>

          <div className="mt-6 border-t border-black/20">
            {identities.length === 0 ? (
              <p className="border-b border-black/20 py-5 font-sans text-sm lowercase text-black/50">
                пока нет привязанных сервисов
              </p>
            ) : (
              identities.map((identity) => (
                <div
                  key={identity.provider}
                  className="flex flex-wrap items-center justify-between gap-4 border-b border-black/20 py-5"
                >
                  <div>
                    <p className="font-sans text-base font-bold text-black">
                      {PROVIDER_LABELS[identity.provider] || identity.provider}
                    </p>

                    <p className="mt-1 font-sans text-xs lowercase text-black/50">
                      привязан {formatDate(identity.linkedAt)}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="text"
                    pd="none"
                    disabled={unlinking === identity.provider}
                    onClick={() => void handleUnlink(identity)}
                    className="font-sans text-sm lowercase text-black/50 transition-colors hover:text-red-600"
                  >
                    {unlinking === identity.provider
                      ? "отвязываем…"
                      : "отвязать"}
                  </Button>
                </div>
              ))
            )}
          </div>

          {availableProviders.length > 0 ? (
            <Button
              type="button"
              variant="default"
              pd="md"
              onClick={openLink}
              className="group mt-6 flex w-full items-center justify-between gap-4 border border-black bg-black font-sans text-base font-extrabold lowercase text-white transition-colors hover:bg-white hover:text-black"
            >
              привязать сервис

              <ArrowRight
                size={20}
                strokeWidth={1.5}
                className="shrink-0 transition-transform group-hover:-rotate-45"
              />
            </Button>
          ) : null}
        </section>
      </div>

      <AuthDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        redirectTo="/account"
        mode={dialogMode}
      />
    </div>
  );
}