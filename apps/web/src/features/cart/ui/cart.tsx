"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";

import type { Product } from "@/entities/product/model/types";
import { BackButton } from "@/shared/ui/back-button";
import { Button } from "@/shared/ui/button";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { Popup } from "@/shared/ui/popup";

import { CheckoutDialog, useCartStore } from "..";

type CartPageProps = {
  products: Product[];
};

const subscribe = () => () => {};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
  }).format(price);

export function Cart({ products }: CartPageProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const [completedOrder, setCompletedOrder] = useState<{
    id: string | number;
    total: number;
  } | null>(null);

  const productsById = new Map(
    products.map((product) => [product.id, product]),
  );

  const cartItems = items.map((item) => ({
    ...item,
    product: productsById.get(item.productId) ?? null,
  }));

  const availableItems = cartItems.filter(
    (item): item is typeof item & { product: Product } =>
      item.product !== null,
  );

  const unavailableItems = cartItems.filter(
    (item) => item.product === null,
  );

  const totalQuantity = availableItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const totalByn = availableItems.reduce(
    (sum, item) => sum + Number(item.product.priceByn) * item.quantity,
    0,
  );

  const totalRub = availableItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  return (
    <section className="w-full px-5 py-25 sm:px-8 lg:pt-30">
      <BackButton className="mb-5" />

      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-black pb-6">
        <h1 className="font-sans text-3xl font-extrabold lowercase tracking-tight text-black sm:text-4xl lg:text-5xl">
          корзина
        </h1>

        {mounted && items.length > 0 && (
          <Button
            type="button"
            variant="text"
            pd="none"
            onClick={() => clearCart()}
            className="font-sans text-sm lowercase text-black/50 transition-colors hover:text-red-600"
          >
            очистить
          </Button>
        )}
      </div>

      {!mounted ? (
        <p className="py-16 text-center font-sans text-sm lowercase text-black/50">
          загружаем корзину...
        </p>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center sm:py-28">
          <p className="font-sans text-2xl font-extrabold lowercase text-black sm:text-3xl">
            пока тут пусто
          </p>

          <p className="mt-3 font-sans text-sm lowercase text-black/50 sm:text-base">
            самое время выбрать себе что-нибудь
          </p>

          <Button
            href="/catalog"
            className="group mt-8 flex items-center gap-6 border border-black bg-black px-6 py-4 text-sm font-extrabold lowercase text-white transition-colors hover:bg-white hover:text-black"
          >
            в каталог

            <ArrowRight
              size={18}
              strokeWidth={1.5}
              className="transition-transform group-hover:-rotate-45"
            />
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:gap-16">
          <div>
            <ul>
              {cartItems.map((item) => {
                const { product } = item;

                if (!product) {
                  return (
                    <li
                      key={item.productId}
                      className="flex items-start justify-between gap-4 border-b border-black/20 py-6"
                    >
                      <div>
                        <p className="font-sans text-base font-bold lowercase text-black">
                          товар недоступен
                        </p>

                        <p className="mt-1 font-sans text-sm text-black/50">
                          Возможно, товар снят с продажи.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        aria-label="удалить недоступный товар из корзины"
                        className="shrink-0 text-black/50 transition-colors hover:text-red-600"
                      >
                        <Trash2 size={19} strokeWidth={1.5} />
                      </button>
                    </li>
                  );
                }

                return (
                  <li
                    key={item.productId}
                    className="flex gap-4 border-b border-black/20 py-6 first:pt-0 sm:gap-6"
                  >
                    <Link
                      href={`/catalog/${encodeURIComponent(product.slug)}`}
                      className="aspect-square w-28 shrink-0 overflow-hidden bg-neutral-100 sm:w-40"
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-xs lowercase text-black/40">
                          нет фото
                        </span>
                      )}
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          href={`/catalog/${encodeURIComponent(product.slug)}`}
                          className="font-sans text-base font-extrabold lowercase text-black transition-colors hover:text-red-600 sm:text-lg"
                        >
                          {product.name}
                        </Link>

                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          aria-label={`удалить ${product.name} из корзины`}
                          className="shrink-0 text-black/50 transition-colors hover:text-red-600"
                        >
                          <Trash2 size={19} strokeWidth={1.5} />
                        </button>
                      </div>

                      <div className="mt-2 font-sans lowercase">
                        <p className="text-base font-bold text-black sm:text-lg">
                          {product.priceByn} byn
                        </p>

                        <p className="text-xs text-black/40 sm:text-sm">
                          {product.price} rub
                        </p>
                      </div>

                      <div className="mt-4 flex w-fit items-center border border-black sm:mt-auto">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(item.productId, item.quantity - 1)
                          }
                          aria-label={`уменьшить количество: ${product.name}`}
                          className="flex h-9 w-9 items-center justify-center text-black transition-colors hover:bg-black hover:text-white"
                        >
                          <Minus size={16} strokeWidth={1.5} />
                        </button>

                        <span
                          aria-live="polite"
                          className="min-w-8 text-center font-sans text-sm font-bold text-black"
                        >
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(item.productId, item.quantity + 1)
                          }
                          aria-label={`увеличить количество: ${product.name}`}
                          className="flex h-9 w-9 items-center justify-center text-black transition-colors hover:bg-black hover:text-white"
                        >
                          <Plus size={16} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <Link
              href="/catalog"
              className="group mt-6 inline-flex items-center gap-2 font-sans text-sm lowercase text-black transition-colors hover:text-red-600"
            >
              продолжить покупки

              <ArrowRight
                size={16}
                strokeWidth={1.5}
                className="transition-transform group-hover:-rotate-45"
              />
            </Link>
          </div>

          <aside className="h-fit lg:sticky lg:top-24">
            <h2 className="font-sans text-2xl font-extrabold lowercase text-black">
              итого
            </h2>

            <div className="mt-6 flex items-center justify-between gap-4 font-sans text-sm lowercase text-black/50">
              <span>товаров</span>
              <span>{totalQuantity} шт.</span>
            </div>

            <div className="mt-4 flex items-start justify-between gap-4 border-t border-black/20 pt-4 font-sans lowercase">
              <span className="text-base font-bold text-black">сумма</span>

              <div className="text-right">
                <p className="text-xl font-extrabold text-black">
                  {formatPrice(totalByn)} byn
                </p>

                <p className="mt-1 text-sm text-black/40">
                  {formatPrice(totalRub)} rub
                </p>
              </div>
            </div>

            {unavailableItems.length > 0 && (
              <p className="mt-6 font-sans text-sm text-red-600">
                Удали недоступные товары из корзины.
              </p>
            )}

            <CheckoutDialog
              disabled={availableItems.length === 0 || unavailableItems.length > 0}
              totalRub={totalRub}
              totalByn={totalByn}
              onSuccess={(order) => setCompletedOrder(order)}
            />

            <p className="mt-4 font-sans text-sm leading-relaxed lowercase text-black/50">
              доставка рассчитывается при оформлении заказа
            </p>
          </aside>
        </div>
      )}
      <Popup
        open={completedOrder !== null}
        onClose={() => setCompletedOrder(null)}
        title="Заказ оформлен"
        description="Заказ успешно создан"
        contentClassName="w-full max-w-md bg-white"
      >
        <div className="relative px-5 py-6 sm:px-8 sm:py-8">
          <button
            type="button"
            onClick={() => setCompletedOrder(null)}
            aria-label="закрыть"
            className="absolute right-5 top-6 flex h-9 w-9 items-center justify-center border border-black text-black transition-colors hover:bg-black hover:text-white sm:right-8 sm:top-8"
          >
            <X size={19} strokeWidth={1.5} />
          </button>

          <div className="pr-12">
            <p className="font-sans text-sm lowercase text-black/50">
              заказ №{completedOrder?.id}
            </p>

            <h2 className="mt-2 font-sans text-3xl font-extrabold lowercase tracking-tight text-black">
              всё получилось
            </h2>
          </div>

          <p className="mt-3 font-sans text-sm lowercase leading-relaxed text-black/50">
            заказ оформлен. скоро мы свяжемся с тобой, чтобы уточнить детали
          </p>

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-black/20 pt-5 font-sans lowercase">
            <span className="text-sm text-black/50">итого</span>

            <span className="text-lg font-extrabold text-black">
              {completedOrder &&
              typeof completedOrder.total === "number" &&
              Number.isFinite(completedOrder.total)
                ? `${formatPrice(completedOrder.total)} rub`
                : "уточним при связи"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setCompletedOrder(null)}
            className="mt-8 flex min-h-14 w-full items-center justify-center border border-black bg-black px-6 py-4 font-sans text-base font-extrabold lowercase text-white transition-colors hover:bg-white hover:text-black"
          >
            отлично
          </button>
        </div>
      </Popup>
    </section>
  );
}