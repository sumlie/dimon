"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Minus, Plus } from "lucide-react";

import { Button, buttonVariants } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";

import { useCartStore } from "../";

type AddToCartButtonProps = {
  productId: string;
  stock: number;
};

export function AddToCartButton({
  productId,
  stock,
}: AddToCartButtonProps) {
  const [mounted, setMounted] = useState(false);

  const quantity = useCartStore(
    (state) =>
      state.items.find((item) => item.productId === productId)
        ?.quantity ?? 0,
  );

  const addItem = useCartStore((state) => state.addItem);
  const setQuantity = useCartStore((state) => state.setQuantity);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentQuantity = mounted ? quantity : 0;
  const outOfStock = stock <= 0;

  if (outOfStock && currentQuantity === 0) {
    return (
      <button
        type="button"
        disabled
        className="mt-8 flex min-h-14 w-full cursor-not-allowed items-center justify-center border border-black/20 bg-neutral-100 px-6 py-4 font-sans text-base font-extrabold lowercase text-black/40"
      >
        нет в наличии
      </button>
    );
  }

  if (currentQuantity === 0) {
    return (
      <button
        type="button"
        onClick={() => addItem(productId)}
        disabled={!mounted}
        className={cn(
          buttonVariants({
            variant: "default",
            size: "inherit",
            pd: "none",
          }),
          "group mt-8 flex min-h-14 w-full items-center justify-between border border-black bg-black px-6 py-4 text-base font-extrabold lowercase text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50",
        )}
      >
        купить

        <ArrowRight
          size={20}
          strokeWidth={1.5}
          className="transition-transform group-hover:-rotate-45"
        />
      </button>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex w-full gap-3">
        <div className="flex shrink-0 items-center border border-black">
          <button
            type="button"
            onClick={() => setQuantity(productId, currentQuantity - 1)}
            aria-label="уменьшить количество"
            className="flex h-full min-h-14 w-11 items-center justify-center text-black transition-colors hover:bg-black hover:text-white"
          >
            <Minus size={18} strokeWidth={1.5} />
          </button>

          <span
            aria-live="polite"
            className="min-w-8 text-center font-sans text-sm font-bold text-black"
          >
            {currentQuantity}
          </span>

          <button
            type="button"
            disabled={currentQuantity >= stock}
            onClick={() => setQuantity(productId, currentQuantity + 1)}
            aria-label="увеличить количество"
            className="flex h-full min-h-14 w-11 items-center justify-center text-black transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:text-black/25 disabled:hover:bg-transparent"
          >
            <Plus size={18} strokeWidth={1.5} />
          </button>
        </div>

        <Button
          href="/cart"
          className="group flex min-h-14 min-w-0 flex-1 items-center justify-between gap-3 border border-black bg-black px-4 py-4 text-base font-extrabold lowercase text-white transition-colors hover:bg-white hover:text-black sm:px-6"
        >
          перейти в корзину

          <ArrowRight
            size={20}
            strokeWidth={1.5}
            className="shrink-0 transition-transform group-hover:-rotate-45"
          />
        </Button>
      </div>

      {currentQuantity > stock && (
        <p role="status" className="mt-3 font-sans text-sm text-red-600">
          {outOfStock
            ? "товар закончился — удали его из корзины"
            : `осталось ${stock} шт. — уменьши количество в корзине`}
        </p>
      )}
    </div>
  );
}