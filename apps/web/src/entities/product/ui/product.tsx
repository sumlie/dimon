import Link from "next/link";

import type { Product as ProductType } from "../model/types";

type ProductProps = {
  product: ProductType;
};

export function Product({ product }: ProductProps) {
  return (
    <Link href="#!" className="group flex flex-col">
      <div className="relative aspect-square overflow-hidden border-2 border-black">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {product.discount ? (
          <span className="absolute left-2 top-2 flex h-8 items-center justify-center bg-red-600 px-2 font-display text-sm leading-none text-white">
            {product.discount}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex items-baseline justify-between font-sans text-base lowercase">
        <span className="text-black transition-colors group-hover:text-red-600">
          {product.name}
        </span>

        <span className="flex flex-col items-end text-right">
          <span className="flex items-baseline gap-1.5">
            {product.oldPrice ? (
              <span className="text-neutral-400 line-through">
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

          <span className="flex items-baseline gap-1.5 text-sm text-neutral-400">
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
