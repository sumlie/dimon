"use client";

import { useEffect, useState } from "react";
import { completeOnboarding, fetchOnboardingProfile } from "@/features/auth";
import { Button } from "@/shared/ui/button/button";
import { Spinner } from "@/shared/ui/spinner";

export function AuthCompletePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [provider, setProvider] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const profile = await fetchOnboardingProfile();
        setProvider(profile.provider);
        setEmail(profile.email);
        setName(profile.name);
      } catch {
        setError("Сессия регистрации истекла. Начните вход заново.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const result = await completeOnboarding({ email, name, consent });
      window.location.assign(result.redirectTo);
    } catch (err) {
      const code = err instanceof Error ? err.message : "internal_error";
      if (code === "email_exists") {
        setError(
          "Аккаунт с таким email уже существует. Войдите в него, чтобы привязать провайдера.",
        );
      } else if (code === "email_required" || code === "invalid_request") {
        setError("Проверьте email и имя.");
      } else if (code === "name_required") {
        setError("Укажите имя.");
      } else {
        setError("Не удалось завершить регистрацию. Попробуйте позже.");
      }
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error && !email && !name) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="font-impact text-4xl uppercase leading-none">
          регистрация
        </h1>
        <p className="mt-4 font-sans text-sm text-red-600">{error}</p>
        <Button href="/" variant="default" pd="md" className="mt-8">
          на главную
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-24">
      <p className="font-sans text-xs uppercase tracking-widest text-black/50">
        почти готово
      </p>
      <h1 className="mt-1 font-impact text-5xl uppercase leading-none">
        завершить регистрацию
      </h1>
      <p className="mt-4 font-sans text-sm text-black/60">
        {provider === "telegram"
          ? "Telegram не передаёт email. Укажите его, чтобы мы могли связаться с вами."
          : "Заполните недостающие данные для аккаунта."}
      </p>

      <form
        onSubmit={(event) => void submit(event)}
        className="mt-8 flex flex-col gap-5"
      >
        <label className="flex flex-col gap-2 font-sans text-sm">
          <span>Имя</span>
          <input
            required
            minLength={1}
            maxLength={120}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="border-2 border-black bg-transparent px-3 py-2 outline-none focus:border-red-600"
          />
        </label>

        <label className="flex flex-col gap-2 font-sans text-sm">
          <span>Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="border-2 border-black bg-transparent px-3 py-2 outline-none focus:border-red-600"
          />
        </label>

        <label className="flex cursor-pointer items-start gap-3 font-sans text-xs leading-relaxed text-black/70">
          <input
            type="checkbox"
            required
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
          <p className="font-sans text-sm text-red-600">{error}</p>
        ) : null}

        <Button type="submit" variant="default" pd="md" disabled={saving}>
          {saving ? "создаём аккаунт…" : "создать аккаунт"}
        </Button>
      </form>
    </div>
  );
}
