"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Product } from "@/entities/product/model/products-api";
import { Button } from "@/shared/ui/button";
import { Popup } from "@/shared/ui/popup";

type ProductPopupProps = {
  product: Product | null;
};

export function ProductPopup({ product }: ProductPopupProps) {
  const router = useRouter();

  const close = () => router.back();

  if (!product) return null;

  return (
    <Popup
      open
      onClose={close}
      overlayClassName="fixed inset-0 z-[1000] flex max-h-screen items-center justify-center overflow-y-auto bg-black/60 p-5 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-2xl overflow-hidden border-2 border-black bg-white">
        <Button
          variant="icon"
          size="icon"
          pd="none"
          onClick={close}
          className="absolute right-3 top-3 z-10"
          aria-label="закрыть"
        >
          <X size={20} strokeWidth={2} />
        </Button>

        <div className="grid sm:grid-cols-2">
          <div className="relative aspect-square overflow-hidden border-b-2 border-black sm:border-b-0 sm:border-r-2">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />

            {product.discount ? (
              <span className="absolute left-1.5 top-1.5 flex h-6 items-center justify-center bg-red-600 px-1.5 font-display text-xs leading-none text-white sm:left-2 sm:top-2 sm:h-8 sm:px-2 sm:text-sm">
                {product.discount}
              </span>
            ) : null}
          </div>

          <div className="flex flex-col gap-5 p-6 font-sans">
            <h2 className="font-sans text-2xl font-extrabold lowercase tracking-tight text-black sm:text-3xl">
              {product.name}
            </h2>

            {product.category ? (
              <p className="font-sans text-xs uppercase tracking-widest text-black/50">
                {product.category.name}
              </p>
            ) : null}

            <div className="flex shrink-0 flex-col items-end text-right">
              <span className="flex items-baseline gap-1 sm:gap-1.5">
                {product.oldPrice ? (
                  <span className="text-xs text-neutral-400 line-through sm:text-base">
                    {product.oldPriceByn} byn
                  </span>
                ) : null}
                <span className="text-red-600">{product.priceByn} byn</span>
              </span>
              <span className="flex items-baseline gap-1 text-xs text-neutral-400 sm:gap-1.5 sm:text-sm">
                {product.oldPrice ? (
                  <span className="line-through">{product.oldPrice} rub</span>
                ) : null}
                <span className={product.oldPrice ? "text-red-500" : ""}>
                  {product.price} rub
                </span>
              </span>
            </div>

            {product.description ? (
              <div className="border-t-2 border-black pt-4">
                <p className="font-sans text-sm text-black/60 sm:text-base">
                  {product.description}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Popup>
  );
}
