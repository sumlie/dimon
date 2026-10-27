"use client";

import { useEffect, useState } from "react";
import {
  type AuthIdentity,
  authErrorText,
  unlinkProvider,
  useCurrentCustomer,
} from "@/features/auth";
import { AuthDialog } from "@/features/auth/ui/auth-dialog";
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
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="font-impact text-5xl uppercase leading-none">аккаунт</h1>
        <p className="mt-4 font-sans text-black/60">
          Войдите, чтобы управлять профилем и привязанными сервисами.
        </p>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        <Button
          type="button"
          variant="default"
          pd="md"
          className="mt-8"
          onClick={openLogin}
        >
          войти
        </Button>
        <AuthDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          redirectTo="/account"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-24">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-black pb-5">
        <div>
          <p className="font-sans text-xs uppercase tracking-widest text-black/50">
            личный кабинет
          </p>
          <h1 className="font-impact text-5xl uppercase leading-none">
            {customer.name}
          </h1>
        </div>
        <Button
          type="button"
          variant="text"
          pd="none"
          onClick={() => void handleLogout()}
        >
          выйти
        </Button>
      </div>

      {notice ? (
        <p className="mt-5 border-l-2 border-black pl-3 font-sans text-sm">
          {notice}
        </p>
      ) : null}
      {actionError ? (
        <p className="mt-5 border-l-2 border-red-600 pl-3 font-sans text-sm text-red-600">
          {actionError}
        </p>
      ) : null}

      <section className="mt-8 grid gap-4 font-sans text-sm sm:grid-cols-2">
        <div className="border border-black/10 p-5">
          <p className="text-xs uppercase tracking-widest text-black/40">
            email
          </p>
          <p className="mt-2 break-all">{customer.email}</p>
          <p className="mt-1 text-xs text-black/50">
            {customer.emailVerifiedAt ? "подтверждён" : "не подтверждён"}
          </p>
        </div>
        <div className="border border-black/10 p-5">
          <p className="text-xs uppercase tracking-widest text-black/40">
            в системе с
          </p>
          <p className="mt-2">{formatDate(customer.createdAt)}</p>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-impact text-3xl uppercase leading-none">
            вход и сервисы
          </h2>
          {availableProviders.length > 0 ? (
            <Button type="button" variant="outline" pd="sm" onClick={openLink}>
              привязать сервис
            </Button>
          ) : null}
        </div>

        <div className="mt-4 divide-y divide-black/10 border border-black/10">
          {identities.length === 0 ? (
            <p className="p-5 font-sans text-sm text-black/50">
              Нет привязанных сервисов.
            </p>
          ) : null}

          {identities.map((identity) => (
            <div
              key={identity.provider}
              className="flex flex-wrap items-center justify-between gap-3 p-5"
            >
              <div>
                <p className="font-sans text-base">
                  {PROVIDER_LABELS[identity.provider] || identity.provider}
                </p>
                <p className="font-sans text-xs text-black/50">
                  привязан {formatDate(identity.linkedAt)}
                </p>
              </div>
              <Button
                type="button"
                variant="text"
                pd="none"
                disabled={unlinking === identity.provider}
                onClick={() => void handleUnlink(identity)}
              >
                {unlinking === identity.provider ? "отвязываем…" : "отвязать"}
              </Button>
            </div>
          ))}
        </div>
      </section>

      <AuthDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        redirectTo="/account"
        mode={dialogMode}
      />
    </div>
  );
}
