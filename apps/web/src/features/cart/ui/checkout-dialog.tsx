"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, X } from "lucide-react";

import { Popup } from "@/shared/ui/popup";
import { useCartStore } from "../";

type DeliveryRegion =
  | "belarus"
  | "moscow"
  | "russia"
  | "cis"
  | "world";

type DeliveryPrices = Record<DeliveryRegion, number>;

type Fulfillment = "delivery" | "pickup";

type CheckoutResult = {
  id: string | number;
  total: number;
};

type CheckoutDialogProps = {
  disabled?: boolean;
  totalRub: number;
  totalByn: number;
  onSuccess: (result: CheckoutResult) => void;
};

type CdekPoint = {
  code: string;
  address: string;
};

type AppliedPromo = {
  code: string;
  discountPercent: number;
};

const PICKUP_ADDRESS = "Минск, проспект Машерова, 60";

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

const inputClassName =
  "w-full border border-black/20 bg-white px-4 py-3 font-sans text-sm text-black outline-none transition-colors placeholder:text-black/30 focus:border-black";

const labelClassName =
  "flex flex-col gap-2 font-sans text-sm lowercase text-black";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
  }).format(value);

function isDeliveryPrices(value: unknown): value is DeliveryPrices {
  if (!value || typeof value !== "object") return false;

  const prices = value as Record<string, unknown>;

  return DELIVERY_REGIONS.every(({ value: region }) => {
    const price = prices[region];

    return (
      typeof price === "number" &&
      Number.isFinite(price) &&
      price >= 0
    );
  });
}

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
  onSuccess,
}: CheckoutDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const [fulfillment, setFulfillment] =
    useState<Fulfillment>("delivery");

  const [deliveryRegion, setDeliveryRegion] = useState<
    DeliveryRegion | ""
  >("");

  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [cdekPoint, setCdekPoint] = useState<CdekPoint | null>(null);

  const [deliveryPrices, setDeliveryPrices] =
    useState<DeliveryPrices | null>(null);

  const [deliveryPricesLoading, setDeliveryPricesLoading] =
    useState(false);

  const [deliveryPricesError, setDeliveryPricesError] = useState<
    string | null
  >(null);

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] =
    useState<AppliedPromo | null>(null);

  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const promoRequestRef = useRef(0);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();

    async function loadDeliveryPrices() {
      setDeliveryPricesLoading(true);
      setDeliveryPricesError(null);
      setDeliveryPrices(null);

      try {
        const response = await fetch("/api/auth/delivery-prices", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Не удалось загрузить стоимость доставки.");
        }

        const data: unknown = await response.json();

        if (!isDeliveryPrices(data)) {
          throw new Error("Сервер вернул некорректные цены доставки.");
        }

        if (!controller.signal.aborted) {
          setDeliveryPrices(data);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setDeliveryPricesError(
          err instanceof Error
            ? err.message
            : "Не удалось загрузить стоимость доставки.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setDeliveryPricesLoading(false);
        }
      }
    }

    void loadDeliveryPrices();

    return () => controller.abort();
  }, [open]);

  const cdekCountry =
    deliveryRegion === "belarus"
      ? "BY"
      : deliveryRegion === "moscow" || deliveryRegion === "russia"
        ? "RU"
        : null;

  const deliveryRub =
    fulfillment === "pickup"
      ? 0
      : deliveryRegion && deliveryPrices
        ? deliveryPrices[deliveryRegion]
        : null;

  const discountPercent = appliedPromo?.discountPercent ?? 0;

  const discountRub =
    Math.round((totalRub * 100 * discountPercent) / 100) / 100;

  const discountByn =
    Math.round((totalByn * 100 * discountPercent) / 100) / 100;

  const orderTotalRub =
    deliveryRub === null
      ? null
      : Math.round(
          (totalRub - discountRub + deliveryRub) * 100,
        ) / 100;

  const orderTotalByn =
    Math.round((totalByn - discountByn) * 100) / 100;

  const changeFulfillment = (next: Fulfillment) => {
    setFulfillment(next);
    setDeliveryRegion("");
    setDeliveryMethod("");
    setCdekPoint(null);
    setError(null);
  };

  const applyPromoCode = async () => {
    const code = promoCode.trim().toUpperCase();

    if (!code) {
      setAppliedPromo(null);
      setPromoError("Введи промокод.");
      return;
    }

    const requestId = ++promoRequestRef.current;

    setPromoLoading(true);
    setPromoError(null);
    setAppliedPromo(null);

    try {
      const response = await fetch("/api/auth/promocode", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "Не удалось проверить промокод.";

        throw new Error(message);
      }

      if (
        !data ||
        typeof data !== "object" ||
        !("code" in data) ||
        typeof data.code !== "string" ||
        !("discountPercent" in data) ||
        typeof data.discountPercent !== "number" ||
        !Number.isFinite(data.discountPercent) ||
        data.discountPercent < 1 ||
        data.discountPercent > 100
      ) {
        throw new Error("Сервер вернул некорректный ответ.");
      }

      if (requestId !== promoRequestRef.current) return;

      setPromoCode(data.code);

      setAppliedPromo({
        code: data.code,
        discountPercent: data.discountPercent,
      });
    } catch (err) {
      if (requestId !== promoRequestRef.current) return;

      setPromoError(
        err instanceof Error
          ? err.message
          : "Не удалось проверить промокод.",
      );
    } finally {
      if (requestId === promoRequestRef.current) {
        setPromoLoading(false);
      }
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) return;

    setError(null);

    if (items.length === 0) {
      setError("Корзина пуста.");
      return;
    }

    if (fulfillment === "delivery") {
      if (!deliveryRegion || deliveryRub === null) {
        setError("Выбери регион доставки.");
        return;
      }

      if (!deliveryMethod) {
        setError("Выбери способ доставки.");
        return;
      }

      if (deliveryMethod === "cdek" && cdekCountry && !cdekPoint) {
        setError("Выбери пункт выдачи СДЭК на карте.");
        return;
      }
    }

    if (promoLoading) {
      setError("Дождись проверки промокода.");
      return;
    }

    if (promoCode.trim() && !appliedPromo) {
      setError("Примени промокод или очисти поле.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    const checkoutItems = items.map((item) => ({
      product: Number(item.productId),
      quantity: item.quantity,
    }));

    if (
      checkoutItems.some(
        (item) =>
          !Number.isSafeInteger(item.product) ||
          item.product <= 0 ||
          !Number.isSafeInteger(item.quantity) ||
          item.quantity <= 0,
      )
    ) {
      setError("Не удалось прочитать товары в корзине. Обнови страницу.");
      return;
    }

    const checkoutData = {
      items: checkoutItems,

      customerName: String(
        formData.get("customerName") ?? "",
      ).trim(),

      email: String(formData.get("email") ?? "").trim(),
      username: String(formData.get("username") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),

      deliveryRegion:
        fulfillment === "pickup" ? "belarus" : deliveryRegion,

      deliveryMethod:
        fulfillment === "pickup" ? "pickup" : deliveryMethod,

      deliveryAddress:
        fulfillment === "pickup"
          ? PICKUP_ADDRESS
          : deliveryMethod === "cdek" && cdekCountry
            ? cdekPoint?.address ?? ""
            : String(formData.get("deliveryAddress") ?? "").trim(),

      cdekPointCode:
        fulfillment === "delivery" &&
        deliveryMethod === "cdek" &&
        cdekCountry
          ? cdekPoint?.code ?? ""
          : "",

      comment: String(formData.get("comment") ?? "").trim(),

      promoCode: appliedPromo?.code ?? "",
    };

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/checkout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutData),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof result?.error === "string"
            ? result.error
            : "Не удалось оформить заказ.",
        );
      }

      if (!result || result.id == null) {
        throw new Error("Сервер вернул некорректный ответ.");
      }

      setOpen(false);
      form.reset();

      setFulfillment("delivery");
      setDeliveryRegion("");
      setDeliveryMethod("");
      setCdekPoint(null);

      setPromoCode("");
      setAppliedPromo(null);
      setPromoError(null);

      onSuccess({
        id: result.id,
        total: result.total,
      });

      clearCart();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось оформить заказ. Попробуй ещё раз.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="group mt-6 flex w-full cursor-pointer items-center justify-between gap-4 border border-black bg-black px-6 py-4 font-sans text-base font-extrabold lowercase text-white transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-black/20 disabled:bg-black/20 disabled:text-white"
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
        onClose={() => {
          if (!submitting) setOpen(false);
        }}
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
            disabled={submitting}
            onClick={() => {
              if (!submitting) setOpen(false);
            }}
            aria-label="закрыть оформление заказа"
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-black text-black transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
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
                получение
              </h3>

              {deliveryRub !== null && (
                <span className="font-sans text-sm lowercase text-red-600">
                  {deliveryRub === 0
                    ? "бесплатно"
                    : `+ ${formatPrice(deliveryRub)} rub`}
                </span>
              )}
            </div>

            <div
              role="group"
              aria-label="Способ получения заказа"
              className="mt-5 flex border-b border-black/20"
            >
              <button
                type="button"
                aria-pressed={fulfillment === "delivery"}
                onClick={() => changeFulfillment("delivery")}
                className={`-mb-px border-b-2 px-1 pb-3 font-sans text-sm font-bold lowercase transition-colors ${
                  fulfillment === "delivery"
                    ? "border-black text-black"
                    : "border-transparent text-black/40 hover:text-black"
                }`}
              >
                доставка
              </button>

              <button
                type="button"
                aria-pressed={fulfillment === "pickup"}
                onClick={() => changeFulfillment("pickup")}
                className={`-mb-px ml-8 border-b-2 px-1 pb-3 font-sans text-sm font-bold lowercase transition-colors ${
                  fulfillment === "pickup"
                    ? "border-black text-black"
                    : "border-transparent text-black/40 hover:text-black"
                }`}
              >
                самовывоз
              </button>
            </div>

            {fulfillment === "pickup" ? (
              <div className="mt-5 border border-black/20 p-5 font-sans">
                <p className="text-sm lowercase text-black/50">
                  адрес самовывоза
                </p>

                <p className="mt-2 text-base font-bold text-black">
                  {PICKUP_ADDRESS}
                </p>

                <p className="mt-2 text-sm lowercase leading-relaxed text-black/50">
                  детали получения уточним после оформления заказа
                </p>
              </div>
            ) : (
              <>
                <label className={`${labelClassName} mt-5`}>
                  <span>
                    регион доставки{" "}
                    <span className="text-red-600">*</span>
                  </span>

                  <select
                    required
                    value={deliveryRegion}
                    disabled={deliveryPricesLoading || !deliveryPrices}
                    onChange={(event) => {
                      setDeliveryRegion(
                        event.target.value as DeliveryRegion | "",
                      );
                      setCdekPoint(null);
                      setError(null);
                    }}
                    className={inputClassName}
                  >
                    <option value="" disabled>
                      {deliveryPricesLoading
                        ? "загружаем регионы..."
                        : "выбери регион доставки"}
                    </option>

                    {DELIVERY_REGIONS.map((region) => {
                      const price = deliveryPrices?.[region.value];

                      return (
                        <option key={region.value} value={region.value}>
                          {region.label}
                          {price != null
                            ? price === 0
                              ? " — бесплатно"
                              : ` — ${formatPrice(price)} rub`
                            : ""}
                        </option>
                      );
                    })}
                  </select>
                </label>

                {deliveryPricesError && (
                  <p
                    role="alert"
                    className="mt-2 font-sans text-sm text-red-600"
                  >
                    {deliveryPricesError} Закрой и открой оформление
                    заказа ещё раз.
                  </p>
                )}

                <label className={`${labelClassName} mt-5`}>
                  <span>
                    способ доставки{" "}
                    <span className="text-red-600">*</span>
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

                {deliveryMethod === "cdek" && (
                  <div className="mt-5">
                    {cdekCountry ? (
                      <>
                        <p className="font-sans text-sm lowercase text-black">
                          пункт выдачи{" "}
                          <span className="text-red-600">*</span>
                        </p>

                        <div className="mt-2">
                          <CdekMap
                            key={deliveryRegion}
                            country={cdekCountry}
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
                      </>
                    ) : (
                      <p className="font-sans text-sm leading-relaxed text-black/50">
                        {deliveryRegion
                          ? "Выбор пункта СДЭК для этого региона пока не подключён. Укажи адрес ниже."
                          : "Сначала выбери регион доставки."}
                      </p>
                    )}
                  </div>
                )}

                {deliveryMethod &&
                  (deliveryMethod !== "cdek" ||
                    (deliveryRegion && !cdekCountry)) && (
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
                  )}
              </>
            )}
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

          <div className="mt-8 border-t border-black/20 pt-6">
            <label
              htmlFor="promo-code"
              className="font-sans text-sm lowercase text-black"
            >
              промокод
            </label>

            <div className="mt-2 flex gap-2">
              <input
                id="promo-code"
                type="text"
                value={promoCode}
                onChange={(event) => {
                  promoRequestRef.current += 1;
                  setPromoLoading(false);
                  setPromoCode(event.target.value);
                  setAppliedPromo(null);
                  setPromoError(null);
                }}
                maxLength={40}
                autoComplete="off"
                placeholder="введи промокод"
                className="min-w-0 flex-1 border border-black/20 bg-white px-4 py-3 font-sans text-sm uppercase text-black outline-none transition-colors placeholder:normal-case placeholder:text-black/30 focus:border-black"
              />

              <button
                type="button"
                disabled={promoLoading}
                onClick={() => void applyPromoCode()}
                className="shrink-0 border border-black bg-black px-4 font-sans text-sm font-bold lowercase text-white transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {promoLoading ? "проверяем…" : "применить"}
              </button>
            </div>

            {appliedPromo && (
              <p
                role="status"
                className="mt-2 font-sans text-sm text-black/60"
              >
                промокод {appliedPromo.code} принят — скидка{" "}
                {appliedPromo.discountPercent}%
              </p>
            )}

            {promoError && (
              <p
                role="alert"
                className="mt-2 font-sans text-sm text-red-600"
              >
                {promoError}
              </p>
            )}
          </div>

          <div className="mt-8 border-t-2 border-black pt-5 font-sans lowercase">
            <div className="flex items-center justify-between gap-4 text-sm text-black/50">
              <span>товары</span>

              <span className="text-right">
                {formatPrice(totalByn)} byn / {formatPrice(totalRub)} rub
              </span>
            </div>

            {appliedPromo && (
              <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                <span className="text-black/50">
                  скидка {appliedPromo.discountPercent}%
                </span>

                <span className="text-right text-red-600">
                  − {formatPrice(discountByn)} byn /{" "}
                  {formatPrice(discountRub)} rub
                </span>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between gap-4 text-sm">
              <span className="text-black/50">
                {fulfillment === "pickup" ? "самовывоз" : "доставка"}
              </span>

              <span
                className={
                  deliveryRub ? "text-red-600" : "text-black/50"
                }
              >
                {deliveryRub === null
                  ? "не выбрана"
                  : deliveryRub === 0
                    ? "бесплатно"
                    : `+ ${formatPrice(deliveryRub)} rub`}
              </span>
            </div>

            <div className="mt-4 flex items-start justify-between gap-4 border-t border-black/20 pt-4">
              <span className="text-lg font-extrabold">итого</span>

              <div className="text-right">
                <p className="text-xl font-extrabold">
                  {orderTotalRub === null
                    ? "выбери регион"
                    : `${formatPrice(orderTotalByn)} byn / ${formatPrice(orderTotalRub)} rub`}
                </p>

                {deliveryRub !== null && deliveryRub > 0 && (
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
            disabled={
              submitting ||
              (fulfillment === "delivery" && deliveryPricesLoading)
            }
            className="group mt-8 flex w-full cursor-pointer items-center justify-between gap-4 border border-black bg-black px-6 py-4 font-sans text-base font-extrabold lowercase text-white transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "оформляем заказ..." : "подтвердить заказ"}

            <ArrowRight
              size={20}
              strokeWidth={1.5}
              className="shrink-0 transition-transform group-hover:-rotate-45"
            />
          </button>
        </form>
      </Popup>
    </>
  );
}