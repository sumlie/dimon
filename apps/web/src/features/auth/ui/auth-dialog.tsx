"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { RiGoogleFill, RiTelegram2Fill } from "react-icons/ri";
import { Button } from "@/shared/ui/button/button";
import { oauthStartUrl, startTelegram } from "../api/auth";
import { authErrorText } from "../model/error-text";

type Props = {
  open: boolean;
  onClose: () => void;
  redirectTo?: string;
  mode?: "login" | "link";
  initialErrorCode?: string | null;
};

function TelegramWidget({
  botUsername,
  authUrl,
}: {
  botUsername: string;
  authUrl: string;
}) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = container.current;
    if (!node) return;

    node.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-auth-url", authUrl);
    script.setAttribute("data-request-access", "write");
    node.appendChild(script);

    return () => {
      node.innerHTML = "";
    };
  }, [authUrl, botUsername]);

  return <div ref={container} className="flex justify-center" />;
}

export function AuthDialog({
  open,
  onClose,
  redirectTo,
  mode = "login",
  initialErrorCode,
}: Props) {
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [telegram, setTelegram] = useState<{
    botUsername: string;
    authUrl: string;
  } | null>(null);
  const [telegramLoading, setTelegramLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setTelegram(null);
      setTelegramLoading(false);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (open && initialErrorCode) {
      setError(authErrorText(initialErrorCode));
    }
  }, [initialErrorCode, open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  const target =
    redirectTo ||
    (typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : "/account");

  const beginOAuth = (provider: "google" | "yandex") => {
    if (!consent) {
      setError("Подтвердите согласие на обработку данных.");
      return;
    }

    window.location.assign(oauthStartUrl(provider, target, mode));
  };

  const beginTelegram = async () => {
    if (!consent) {
      setError("Подтвердите согласие на обработку данных.");
      return;
    }

    setTelegramLoading(true);
    setError(null);

    try {
      setTelegram(await startTelegram(target, mode));
    } catch (err) {
      const code = err instanceof Error ? err.message : "internal_error";
      setError(authErrorText(code));
    } finally {
      setTelegramLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
        className="relative w-full max-w-md border-2 border-black bg-white p-6 sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute right-4 top-4 text-black transition-colors hover:text-red-600"
        >
          <X size={22} />
        </button>

        <h2
          id="auth-dialog-title"
          className="mb-1 font-impact text-4xl uppercase leading-none"
        >
          {mode === "link" ? "привязать" : "войти"}
        </h2>
        <p className="mb-6 font-sans text-sm text-black/60">
          {mode === "link"
            ? "Выберите сервис, чтобы привязать его к аккаунту."
            : "Войдите через удобный сервис. Email нужен только для связи."}
        </p>

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant="outline"
            pd="sm"
            className="w-full justify-start gap-3 normal-case"
            onClick={() => beginOAuth("google")}
          >
            <RiGoogleFill size={22} />
            <span>Продолжить с Google</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            pd="sm"
            className="w-full justify-start gap-3 normal-case"
            onClick={() => beginOAuth("yandex")}
          >
            <span className="flex h-[22px] w-[22px] items-center justify-center border border-black text-xs font-bold">
              Я
            </span>
            <span>Продолжить с Яндексом</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            pd="sm"
            className="w-full justify-start gap-3 normal-case"
            disabled={telegramLoading}
            onClick={() => void beginTelegram()}
          >
            <RiTelegram2Fill size={22} />
            <span>
              {telegramLoading
                ? "Загружаем Telegram…"
                : "Продолжить с Telegram"}
            </span>
          </Button>

          {telegram ? (
            <div className="border border-black/10 bg-black/[0.02] p-4">
              <p className="mb-3 text-center font-sans text-xs text-black/60">
                Подтвердите вход в Telegram:
              </p>
              <TelegramWidget
                botUsername={telegram.botUsername}
                authUrl={telegram.authUrl}
              />
            </div>
          ) : null}
        </div>

        <label className="mt-6 flex cursor-pointer items-start gap-3 font-sans text-xs leading-relaxed text-black/70">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-black"
          />
          <span>
            Я согласен на обработку персональных данных и принимаю правила
            сервиса.
          </span>
        </label>

        {error ? (
          <p className="mt-4 border-l-2 border-red-600 pl-3 font-sans text-sm text-red-600">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
