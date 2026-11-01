"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { RiGoogleFill, RiTelegram2Fill } from "react-icons/ri";

import { Button } from "@/shared/ui/button/button";
import { Popup } from "@/shared/ui/popup";

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

  if (!open) return null;

  const target =
    redirectTo ||
    (typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : "/account");

  const beginOAuth = (provider: "google" | "yandex") => {
    if (!consent) {
      setError("Подтверди согласие на обработку данных.");
      return;
    }

    window.location.assign(oauthStartUrl(provider, target, mode));
  };

  const beginTelegram = async () => {
    if (!consent) {
      setError("Подтверди согласие на обработку данных.");
      return;
    }

    setTelegramLoading(true);
    setError(null);

    try {
      const result = await startTelegram(target, mode);
      setTelegram(result);
    } catch (err) {
      const code =
        err instanceof Error ? err.message : "internal_error";

      setError(authErrorText(code));
    } finally {
      setTelegramLoading(false);
    }
  };

  const isLinkMode = mode === "link";

  return (
    <Popup
      open={open}
      onClose={onClose}
      title={isLinkMode ? "Привязать сервис" : "Вход в аккаунт"}
      description={
        isLinkMode
          ? "Выбери сервис для привязки к аккаунту"
          : "Выбери удобный способ входа"
      }
      contentClassName="w-full max-w-md bg-white"
    >
      <div className="relative px-5 py-6 sm:px-8 sm:py-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="закрыть"
          className="absolute right-5 top-6 flex h-9 w-9 items-center justify-center border border-black text-black transition-colors hover:bg-black hover:text-white sm:right-8 sm:top-8"
        >
          <X size={19} strokeWidth={1.5} />
        </button>

        <div className="pr-12">
          <h2 className="font-sans text-3xl font-extrabold lowercase tracking-tight text-black">
            {isLinkMode ? "привязать сервис" : "войти"}
          </h2>
        </div>

        <p className="mt-3 font-sans text-sm lowercase leading-relaxed text-black/50">
          {isLinkMode
            ? "выбери сервис, который хочешь привязать к аккаунту"
            : "выбери удобный способ входа в аккаунт"}
        </p>

        <div className="mt-7 flex flex-col gap-3">
          <Button
            type="button"
            variant="outline"
            pd="sm"
            disabled={telegramLoading}
            onClick={() => void beginTelegram()}
            className="group flex min-h-14 w-full items-center justify-between gap-4 border border-black px-4 font-sans text-sm font-bold text-black transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex min-w-0 items-center gap-3">
              <RiTelegram2Fill size={20} className="shrink-0" />

              <span>
                {telegramLoading
                  ? "загружаем Telegram…"
                  : "продолжить с Telegram"}
              </span>
            </span>

            <ArrowRight
              size={18}
              strokeWidth={1.5}
              className="shrink-0 transition-transform group-hover:-rotate-45"
            />
          </Button>
          <Button
            type="button"
            variant="outline"
            pd="sm"
            onClick={() => beginOAuth("google")}
            className="group flex min-h-14 w-full items-center justify-between gap-4 border border-black px-4 font-sans text-sm font-bold text-black transition-colors hover:bg-black hover:text-white"
          >
            <span className="flex min-w-0 items-center gap-3">
              <RiGoogleFill size={20} className="shrink-0" />

              <span>продолжить с Google</span>
            </span>

            <ArrowRight
              size={18}
              strokeWidth={1.5}
              className="shrink-0 transition-transform group-hover:-rotate-45"
            />
          </Button>

          <Button
            type="button"
            variant="outline"
            pd="sm"
            onClick={() => beginOAuth("yandex")}
            className="group flex min-h-14 w-full items-center justify-between gap-4 border border-black px-4 font-sans text-sm font-bold text-black transition-colors hover:bg-black hover:text-white"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center text-xl font-bold">
                Я
              </span>

              <span>продолжить с Яндексом</span>
            </span>

            <ArrowRight
              size={18}
              strokeWidth={1.5}
              className="shrink-0 transition-transform group-hover:-rotate-45"
            />
          </Button>
        </div>

        {telegram && (
          <div className="mt-4 border border-black/20 bg-neutral-50 p-5">
            <p className="mb-4 text-center font-sans text-sm lowercase text-black/50">
              подтверди вход в Telegram
            </p>

            <TelegramWidget
              botUsername={telegram.botUsername}
              authUrl={telegram.authUrl}
            />
          </div>
        )}

        <div className="mt-7 border-t border-black/20 pt-5">
          <div className="flex items-start gap-3 font-sans text-xs leading-relaxed text-black/60">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => {
                setConsent(event.target.checked);

                if (event.target.checked) {
                  setError(null);
                }
              }}
              aria-label="Согласие с пользовательским соглашением и политикой конфиденциальности"
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-black"
            />

            <span>
              я принимаю{" "}
              <Link
                href="/terms-of-use"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black underline underline-offset-2 transition-colors hover:text-red-600"
              >
                пользовательское соглашение
              </Link>{" "}
              и соглашаюсь с{" "}
              <Link
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black underline underline-offset-2 transition-colors hover:text-red-600"
              >
                политикой конфиденциальности
              </Link>
            </span>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 border-l-2 border-red-600 pl-3 font-sans text-sm text-red-600"
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </Popup>
  );
}