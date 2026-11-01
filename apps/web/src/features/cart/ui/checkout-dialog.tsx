"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, X } from "lucide-react";

import { Popup } from "@/shared/ui/popup";

type CheckoutDialogProps = {
  disabled?: boolean;
  totalRub: number;
  totalByn: number;
};

type CdekPoint = {
  code: string;
  address: string;
};

const CDEK_DELIVERY_RUB = 700;

const inputClassName =
  "w-full border border-black/20 bg-white px-4 py-3 font-sans text-sm text-black outline-none transition-colors placeholder:text-black/30 focus:border-black";

const labelClassName =
  "flex flex-col gap-2 font-sans text-sm lowercase text-black";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
  }).format(value);

const CdekMap = dynamic(() => import("./cdek-widget"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[350px] items-center justify-center border border-black/20 font-sans text-sm lowercase text-black/50">
      загружаем карту...
    </div>
  ),
});

export function CheckoutDialog({
  disabled = false,
  totalRub,
  totalByn,
}: CheckoutDialogProps) {
  const [open, setOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [cdekPoint, setCdekPoint] = useState<CdekPoint | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deliveryRub = deliveryMethod === "cdek" ? CDEK_DELIVERY_RUB : 0;
  const orderTotalRub = totalRub + deliveryRub;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    if (deliveryMethod === "cdek" && !cdekPoint) {
      setError("Выбери пункт выдачи СДЭК на карте.");
      return;
    }

    const checkoutData = {
      customerName: String(formData.get("customerName") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      username: String(formData.get("username") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      deliveryMethod,
      deliveryAddress:
        deliveryMethod === "cdek"
          ? cdekPoint?.address ?? ""
          : String(formData.get("deliveryAddress") ?? "").trim(),
      cdekPointCode:
        deliveryMethod === "cdek" ? cdekPoint?.code ?? null : null,
      comment: String(formData.get("comment") ?? "").trim(),
    };

    // Пока форма не отправляет заказ.
    // Позже подключим запрос к серверу.
    console.log("Данные оформления:", checkoutData);
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="group mt-6 flex w-full items-center justify-between gap-4 border border-black bg-black px-6 py-4 font-sans text-base font-extrabold lowercase text-white transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-black/20 disabled:bg-black/20 disabled:text-white"
      >
        оформить заказ

        <ArrowRight
          size={20}
          strokeWidth={1.5}
          className="shrink-0 transition-transform group-hover:-rotate-45"
        />
      </button>

      <Popup
        open={open}
        onClose={() => setOpen(false)}
        title="Оформление заказа"
        description="Заполни контактные данные и адрес доставки"
        contentClassName="max-w-2xl bg-white"
      >
        <div className="flex items-start justify-between gap-4 border-b border-black px-5 py-5 sm:px-8 sm:py-6">
          <div>
            <h2 className="font-sans text-2xl font-extrabold lowercase tracking-tight sm:text-3xl">
              оформление заказа
            </h2>

            <p className="mt-2 font-sans text-sm lowercase text-black/50">
              оставь данные — мы свяжемся с тобой
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="закрыть оформление заказа"
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-black text-black transition-colors hover:bg-black hover:text-white"
          >
            <X size={19} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-6 sm:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className={labelClassName}>
              <span>
                имя и фамилия <span className="text-red-600">*</span>
              </span>

              <input
                name="customerName"
                type="text"
                autoComplete="name"
                required
                maxLength={100}
                placeholder="как к тебе обращаться"
                className={inputClassName}
              />
            </label>

            <label className={labelClassName}>
              <span>
                email <span className="text-red-600">*</span>
              </span>

              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                placeholder="example@mail.com"
                className={inputClassName}
              />
            </label>

            <label className={labelClassName}>
              <span>
                telegram <span className="text-red-600">*</span>
              </span>

              <input
                name="username"
                type="text"
                required
                maxLength={100}
                placeholder="@username"
                className={inputClassName}
              />
            </label>

            <label className={labelClassName}>
              телефон

              <input
                name="phone"
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
              <h3 className="font-sans text-lg font-extrabold lowercase">
                доставка
              </h3>

              {deliveryMethod === "cdek" && (
                <span className="font-sans text-sm lowercase text-red-600">
                  + {formatPrice(CDEK_DELIVERY_RUB)} rub
                </span>
              )}
            </div>

            <label className={`${labelClassName} mt-5`}>
              <span>
                способ доставки <span className="text-red-600">*</span>
              </span>

              <select
                name="deliveryMethod"
                required
                value={deliveryMethod}
                onChange={(event) => {
                  setDeliveryMethod(event.target.value);
                  setCdekPoint(null);
                  setError(null);
                }}
                className={inputClassName}
              >
                <option value="" disabled>
                  выбери способ доставки
                </option>

                <option value="cdek">сдэк</option>
                <option value="belmail">белпочта</option>
                <option value="euromail">европочта</option>
              </select>
            </label>

            {deliveryMethod === "cdek" ? (
              <div className="mt-5">
                <p className="font-sans text-sm lowercase text-black">
                  пункт выдачи <span className="text-red-600">*</span>
                </p>

                <div className="mt-2">
                  <CdekMap
                    onChoose={(point) => {
                      setCdekPoint({
                        code: point.code,
                        address: point.address,
                      });

                      setError(null);
                    }}
                  />
                </div>

                <label className={`${labelClassName} mt-4`}>
                  выбранный пункт

                  <input
                    type="text"
                    value={cdekPoint?.address ?? ""}
                    readOnly
                    placeholder="выбери пункт на карте"
                    className={`${inputClassName} bg-neutral-50`}
                  />
                </label>
              </div>
            ) : deliveryMethod ? (
              <label className={`${labelClassName} mt-5`}>
                <span>
                  адрес или пункт выдачи{" "}
                  <span className="text-red-600">*</span>
                </span>

                <textarea
                  name="deliveryAddress"
                  required
                  maxLength={500}
                  rows={3}
                  placeholder="страна, город, адрес или адрес пункта выдачи"
                  className={`${inputClassName} resize-y`}
                />
              </label>
            ) : null}
          </div>

          <label className={`${labelClassName} mt-6`}>
            комментарий к заказу

            <textarea
              name="comment"
              maxLength={1000}
              rows={3}
              placeholder="если хочешь что-то уточнить"
              className={`${inputClassName} resize-y`}
            />
          </label>

          <div className="mt-8 border-t-2 border-black pt-5 font-sans lowercase">
            <div className="flex items-center justify-between gap-4 text-sm text-black/50">
              <span>товары</span>

              <span className="text-right">
                {formatPrice(totalByn)} byn / {formatPrice(totalRub)} rub
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-4 text-sm">
              <span className="text-black/50">доставка</span>

              {deliveryMethod === "cdek" ? (
                <span className="text-red-600">
                  + {formatPrice(deliveryRub)} rub
                </span>
              ) : (
                <span className="text-black/50">
                  {deliveryMethod ? "бесплатно" : "не выбрана"}
                </span>
              )}
            </div>

            <div className="mt-4 flex items-start justify-between gap-4 border-t border-black/20 pt-4">
              <span className="text-lg font-extrabold">итого</span>

              <div className="text-right">
                <p className="text-xl font-extrabold">
                  {formatPrice(totalByn)} byn / {formatPrice(orderTotalRub)} rub
                </p>

                {deliveryMethod === "cdek" && (
                  <p className="mt-1 text-xs text-black/50">
                    сумма в byn указана без доставки
                  </p>
                )}
              </div>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-5 border-l-2 border-red-600 pl-3 font-sans text-sm text-red-600"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="group mt-8 flex w-full items-center justify-between gap-4 border border-black bg-black px-6 py-4 font-sans text-base font-extrabold lowercase text-white transition-colors hover:bg-white hover:text-black"
          >
            подтвердить заказ

            <ArrowRight
              size={20}
              strokeWidth={1.5}
              className="shrink-0 transition-transform group-hover:-rotate-45"
            />
          </button>

          <p className="mt-3 font-sans text-xs leading-relaxed text-black/50">
            Пока форма работает в тестовом режиме и не отправляет заказ.
          </p>
        </form>
      </Popup>
    </>
  );
}