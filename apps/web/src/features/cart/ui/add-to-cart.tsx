"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { Button, buttonVariants } from "@/shared/ui/button";

import { useCartStore } from "../";
import { cn } from "@/shared/lib/cn";

type AddToCartButtonProps = {
  productId: string;
};

export function AddToCartButton({ productId }: AddToCartButtonProps) {
  const [mounted, setMounted] = useState(false);

  const quantity = useCartStore(
    (state) =>
      state.items.find((item) => item.productId === productId)?.quantity ?? 0,
  );

  const addItem = useCartStore((state) => state.addItem);
  const setQuantity = useCartStore((state) => state.setQuantity);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentQuantity = mounted ? quantity : 0;

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
          "group mt-8 flex min-h-14 w-full items-center justify-between border border-black bg-black px-6 py-4 text-base font-extrabold cursor-pointerlowercase text-white transition-colors hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50",
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
    <div className="mt-8 flex w-full gap-3">
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
          onClick={() => setQuantity(productId, currentQuantity + 1)}
          aria-label="увеличить количество"
          className="flex h-full min-h-14 w-11 items-center justify-center text-black transition-colors hover:bg-black hover:text-white"
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
  );
}