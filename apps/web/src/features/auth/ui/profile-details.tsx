"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/shared/ui/button/button";
import { useCurrentCustomer } from "@/features/auth";

import { updateProfile } from "../api/auth";
import type { AuthCustomer, DeliveryRegion } from "../model/types";

type ProfileDetailsProps = {
  customer: AuthCustomer;
  refresh: () => Promise<void>;
};

type DeliveryMethod = "" | "cdek" | "belmail" | "euromail";

const DELIVERY_REGIONS: {
  value: DeliveryRegion;
  label: string;
}[] = [
  { value: "belarus", label: "Беларусь" },
  { value: "moscow", label: "Москва и Московская область" },
  { value: "russia", label: "Другие регионы России" },
  { value: "cis", label: "Страны СНГ" },
  { value: "world", label: "Остальной мир" },
];

const DELIVERY_LABELS: Record<string, string> = {
  cdek: "сдэк",
  belmail: "белпочта",
  euromail: "европочта",
};

const inputClassName =
  "w-full border border-black/20 bg-white px-4 py-3 font-sans text-sm text-black outline-none transition-colors placeholder:text-black/30 focus:border-black";

const labelClassName =
  "flex flex-col gap-2 font-sans text-sm lowercase text-black";

// const CdekMap = dynamic(
//   () => import("../../cart/ui/cdek-widget"),
//   {
//     ssr: false,
//     loading: () => (
//       <div className="flex h-[350px] items-center justify-center border border-black/20 font-sans text-sm lowercase text-black/50">
//         загружаем карту...
//       </div>
//     ),
//   },
// );

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/20 py-5 font-sans">
      <p className="text-sm lowercase text-black/50">{label}</p>

      <div className="min-w-0 max-w-sm whitespace-pre-line break-words text-right text-sm text-black sm:text-base">
        {children}
      </div>
    </div>
  );
}

function getDeliveryMethod(value?: string | null): DeliveryMethod {
  if (
    value === "cdek" ||
    value === "belmail" ||
    value === "euromail"
  ) {
    return value;
  }

  return "";
}

export function ProfileDetails({
  customer,
  refresh,
}: ProfileDetailsProps) {
  const { identities } = useCurrentCustomer();

  const hasTelegram = identities.some(
    (identity) => identity.provider === "telegram",
  );

  const hasEmailProvider = identities.some(
    (identity) =>
      identity.provider === "google" ||
      identity.provider === "yandex",
  );

  const lockUsername = hasTelegram && Boolean(customer.username?.trim());
  const lockEmail = hasEmailProvider;

  const defaultAddress = customer.addresses.find(
    (address) => address.isDefault,
  );

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(customer.name);
  const [email, setEmail] = useState(customer.email);
  const [phone, setPhone] = useState(customer.phone ?? "");
  const [username, setUsername] = useState(
    customer.username ?? "",
  );

  const [deliveryRegion, setDeliveryRegion] = useState<
    DeliveryRegion | ""
  >(customer.deliveryRegion ?? "");

  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>(
      getDeliveryMethod(defaultAddress?.deliveryMethod),
    );

  const [deliveryAddress, setDeliveryAddress] = useState(
    defaultAddress?.address ?? "",
  );

  const [cdekPointCode, setCdekPointCode] = useState(
    customer.cdekPointCode ?? "",
  );

  const cdekCountry =
    deliveryRegion === "belarus"
      ? "BY"
      : deliveryRegion === "moscow" ||
          deliveryRegion === "russia"
        ? "RU"
        : null;

  const usesCdekMap =
    deliveryMethod === "cdek" && cdekCountry !== null;

  const resetFields = () => {
    const currentAddress = customer.addresses.find(
      (address) => address.isDefault,
    );

    setName(customer.name);
    setEmail(customer.email);
    setPhone(customer.phone ?? "");
    setUsername(customer.username ?? "");

    setDeliveryRegion(customer.deliveryRegion ?? "");
    setDeliveryMethod(
      getDeliveryMethod(currentAddress?.deliveryMethod),
    );
    setDeliveryAddress(currentAddress?.address ?? "");
    setCdekPointCode(customer.cdekPointCode ?? "");

    setError(null);
  };

  const openEditor = () => {
    resetFields();
    setEditing(true);
  };

  const cancelEditing = () => {
    resetFields();
    setEditing(false);
  };

  const clearDelivery = () => {
    setDeliveryRegion("");
    setDeliveryMethod("");
    setDeliveryAddress("");
    setCdekPointCode("");
    setError(null);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (saving) return;

    setError(null);

    const trimmedName = name.trim();
    const trimmedAddress = deliveryAddress.trim();

    if (!trimmedName) {
      setError("Укажи имя и фамилию.");
      return;
    }

    const hasDeliveryData = Boolean(
      deliveryRegion ||
        deliveryMethod ||
        trimmedAddress ||
        cdekPointCode,
    );

    if (
      hasDeliveryData &&
      (!deliveryRegion || !deliveryMethod || !trimmedAddress)
    ) {
      setError(
        "Укажи регион, способ и адрес доставки или очисти данные доставки.",
      );
      return;
    }

    setSaving(true);

    try {
      await updateProfile({
        name: trimmedName,
        phone: phone.trim(),
        username: username.trim(),

        deliveryRegion,
        deliveryMethod,
        deliveryAddress: trimmedAddress,
        cdekPointCode: deliveryMethod === "cdek" ? cdekPointCode : "",
      });

      await refresh();
      setEditing(false);
    } catch {
      setError(
        "Не удалось сохранить данные. Попробуй ещё раз.",
      );
    } finally {
      setSaving(false);
    }
  };

  const regionLabel = DELIVERY_REGIONS.find(
    (region) => region.value === customer.deliveryRegion,
  )?.label;

  const deliveryLabel = defaultAddress?.deliveryMethod
    ? DELIVERY_LABELS[defaultAddress.deliveryMethod] ??
      defaultAddress.deliveryMethod
    : "не указан";

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-sans text-2xl font-extrabold lowercase tracking-tight text-black sm:text-3xl">
            твои данные
          </h2>

          <p className="mt-2 font-sans text-sm lowercase text-black/50">
            сохрани их, чтобы быстрее оформлять заказы
          </p>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={openEditor}
            className="font-sans text-sm lowercase text-black/50 transition-colors hover:text-red-600"
          >
            изменить
          </button>
        )}
      </div>

      {!editing ? (
        <div className="mt-5 border-t border-black">
          <InfoRow label="имя и фамилия">
            {customer.name || "не указано"}
          </InfoRow>

          <InfoRow label="email">
            <p className="break-all">{customer.email}</p>

            <p className="mt-1 text-xs lowercase text-black/50">
              {customer.emailVerifiedAt
                ? "подтверждён"
                : "не подтверждён"}
            </p>
          </InfoRow>

          <InfoRow label="telegram">
            {customer.username || "не указан"}
          </InfoRow>

          <InfoRow label="телефон">
            {customer.phone || "не указан"}
          </InfoRow>

          <InfoRow label="регион доставки">
            {regionLabel || "не указан"}
          </InfoRow>

          <InfoRow label="способ доставки">
            {deliveryLabel}
          </InfoRow>

          <InfoRow label="адрес доставки">
            {defaultAddress?.address || "не указан"}
          </InfoRow>

          {defaultAddress?.deliveryMethod === "cdek" &&
            customer.cdekPointCode && (
              <InfoRow label="код пункта сдэк">
                {customer.cdekPointCode}
              </InfoRow>
            )}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-5 border-t border-black pt-5"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className={labelClassName}>
              имя и фамилия

              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                type="text"
                autoComplete="name"
                required
                maxLength={120}
                placeholder="как к тебе обращаться"
                className={inputClassName}
              />
            </label>

            <label className={labelClassName}>
              email

              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                readOnly={lockEmail}
                className={
                  lockEmail
                    ? `${inputClassName} bg-neutral-50 text-black/50`
                    : inputClassName
                }
              />

              {lockEmail && (
                <span className="text-xs text-black/40">
                  email связан с Google или Яндексом
                </span>
              )}
            </label>

            <label className={labelClassName}>
              telegram для связи

              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                type="text"
                maxLength={33}
                placeholder="@username"
                readOnly={lockUsername}
                className={
                  lockUsername
                    ? `${inputClassName} bg-neutral-50 text-black/50`
                    : inputClassName
                }
              />

              {lockUsername && (
                <span className="text-xs text-black/40">
                  telegram привязан к аккаунту
                </span>
              )}
            </label>

            <label className={labelClassName}>
              телефон

              <input
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                type="tel"
                autoComplete="tel"
                maxLength={30}
                placeholder="+375 ..."
                className={inputClassName}
              />
            </label>
          </div>

          <div className="mt-8 border-t border-black/20 pt-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-sans text-lg font-extrabold lowercase text-black">
                доставка
              </h3>

              <button
                type="button"
                onClick={clearDelivery}
                className="font-sans text-xs lowercase text-black/50 transition-colors hover:text-red-600"
              >
                очистить
              </button>
            </div>

            <p className="mt-2 font-sans text-xs leading-relaxed text-black/40">
              сохрани адрес для будущих заказов
            </p>

            <label className={`${labelClassName} mt-5`}>
              регион доставки

              <select
                value={deliveryRegion}
                onChange={(event) => {
                  setDeliveryRegion(
                    event.target.value as DeliveryRegion | "",
                  );

                  // При смене региона старый пункт больше
                  // нельзя считать подходящим.
                  setDeliveryAddress("");
                  setCdekPointCode("");
                  setError(null);
                }}
                className={inputClassName}
              >
                <option value="">не выбран</option>

                {DELIVERY_REGIONS.map((region) => (
                  <option
                    key={region.value}
                    value={region.value}
                  >
                    {region.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={`${labelClassName} mt-5`}>
              способ доставки

              <select
                value={deliveryMethod}
                onChange={(event) => {
                  setDeliveryMethod(
                    event.target.value as DeliveryMethod,
                  );

                  setDeliveryAddress("");
                  setCdekPointCode("");
                  setError(null);
                }}
                className={inputClassName}
              >
                <option value="">не выбран</option>
                <option value="cdek">сдэк</option>
                <option value="belmail">белпочта</option>
                <option value="euromail">европочта</option>
              </select>
            </label>

            {deliveryMethod && deliveryRegion && (
              <div className="mt-5">
                <label className={labelClassName}>
                  {deliveryMethod === "cdek"
                    ? "адрес пункта сдэк"
                    : "адрес или пункт выдачи"}

                  <textarea
                    value={deliveryAddress}
                    onChange={(event) => {
                      setDeliveryAddress(event.target.value);

                      setCdekPointCode("");

                      setError(null);
                    }}
                    rows={3}
                    maxLength={500}
                    placeholder="страна, город, адрес или адрес пункта выдачи"
                    className={`${inputClassName} resize-y`}
                  />
                </label>

                {deliveryMethod === "cdek" && (
                  <a
                    href="https://www.cdek.ru/ru/offices/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block font-sans text-xs text-black/60 underline underline-offset-2 transition-colors hover:text-red-600"
                  >
                    найти пункт на карте сдэк
                  </a>
                )}
              </div>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="mt-5 border-l-2 border-red-600 pl-3 font-sans text-sm text-red-600"
            >
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              type="submit"
              variant="default"
              pd="md"
              disabled={saving}
              className="group flex w-full flex-1 items-center justify-between gap-4 font-sans text-base font-extrabold lowercase"
            >
              {saving ? "сохраняем..." : "сохранить"}

              <ArrowRight
                size={20}
                strokeWidth={1.5}
                className="shrink-0 transition-transform group-hover/button:-rotate-45"
              />
            </Button>

            <Button
              type="button"
              variant="outline"
              pd="md"
              onClick={cancelEditing}
              disabled={saving}
              className="w-full font-sans text-sm font-bold lowercase sm:w-auto"
            >
              отмена
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}