import Link from "next/link";

import type { Product as ProductType } from "../model/types";

type ProductProps = {
  product: ProductType;
};

export function Product({ product }: ProductProps) {
  return (
    <Link href="#!" className="group flex flex-col">
      <div className="relative aspect-square overflow-hidden border border-black sm:border-2">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {product.discount ? (
          <span className="absolute left-1.5 top-1.5 flex h-6 items-center justify-center bg-red-600 px-1.5 font-display text-xs leading-none text-white sm:left-2 sm:top-2 sm:h-8 sm:px-2 sm:text-sm">
            {product.discount}
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex flex-col justify-center items-stretch gap-2 font-sans text-sm lowercase sm:mt-3 sm:text-base">
        <span className="text-black transition-colors group-hover:text-red-600">
          {product.name}
        </span>

        <span className="flex shrink-0 flex-col items-end text-right">
          <span className="flex items-baseline gap-1 sm:gap-1.5">
            {product.oldPrice ? (
              <span className="text-xs text-neutral-400 line-through sm:text-base">
                {product.oldPrice}
              </span>
            ) : null}

            <span
              className={
                product.oldPrice ? "text-red-600" : "text-neutral-500"
              }
            >
              {product.price}
            </span>
          </span>

          <span className="flex items-baseline gap-1 text-xs text-neutral-400 sm:gap-1.5 sm:text-sm">
            {product.oldPriceByn ? (
              <span className="line-through">{product.oldPriceByn}</span>
            ) : null}

            <span className={product.oldPriceByn ? "text-red-500" : ""}>
              {product.priceByn}
            </span>
          </span>
        </span>
      </div>
    </Link>
  );
}
