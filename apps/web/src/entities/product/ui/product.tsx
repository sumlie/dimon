"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { MouseEvent } from "react";

import type { Product as ProductType } from "../model/types";

type ProductProps = {
  product: ProductType;
};

export function Product({ product }: ProductProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const images = product.images?.length
    ? product.images
    : product.image
      ? [product.image]
      : [];

  const multiple = images.length > 1;
  const productHref = `/catalog/${encodeURIComponent(product.slug)}`;

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!multiple) return;

    const scroller = scrollerRef.current;
    if (!scroller) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width === 0) return;

    const position = (event.clientX - bounds.left) / bounds.width;
    const nextIndex = Math.max(
      0,
      Math.min(images.length - 1, Math.floor(position * images.length)),
    );

    scroller.scrollTo({
      left: scroller.clientWidth * nextIndex,
      behavior: "instant",
    });
  };

  const handleScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller || scroller.clientWidth === 0) return;

    const nextIndex = Math.round(scroller.scrollLeft / scroller.clientWidth);

    setActiveIndex(Math.max(0, Math.min(images.length - 1, nextIndex)));
  };

  return (
    <article className="group flex flex-col">
      <div className="relative">
        {images.length > 0 ? (
          <div
            ref={scrollerRef}
            onMouseMove={handleMouseMove}
            onScroll={handleScroll}
            className="flex aspect-square snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((src, index) => (
              <Link
                key={`${src}-${index}`}
                href={productHref}
                draggable={false}
                className="block h-full w-full shrink-0 snap-start overflow-hidden"
                aria-label={`${product.name} — открыть товар, фото ${index + 1}`}
              >
                <img
                  src={src}
                  alt={`${product.name} — фото ${index + 1}`}
                  draggable={false}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </Link>
            ))}
          </div>
        ) : (
          <Link
            href={productHref}
            className="flex aspect-square items-center justify-center bg-neutral-100 text-sm lowercase text-black/40"
          >
            нет фото
          </Link>
        )}

        {product.discount ? (
          <span className="pointer-events-none absolute left-1.5 top-1.5 flex h-6 items-center justify-center bg-red-600 px-1.5 font-display text-xs leading-none text-white sm:left-2 sm:top-2 sm:h-8 sm:px-2 sm:text-sm">
            {product.discount}
          </span>
        ) : null}
      </div>

      {multiple && (
        <div
          className="mt-2 flex gap-1"
          aria-label={`Фото ${activeIndex + 1} из ${images.length}`}
        >
          {images.map((src, index) => (
            <span
              key={`${src}-${index}`}
              aria-hidden="true"
              className={`h-0.5 flex-1 transition-colors ${
                index === activeIndex ? "bg-black" : "bg-neutral-200"
              }`}
            />
          ))}
        </div>
      )}

      <Link
        href={productHref}
        className="mt-2 flex flex-col items-stretch justify-center gap-2 font-sans text-sm lowercase sm:mt-3 sm:text-base"
      >
        <span className="text-black transition-colors group-hover:text-red-600">
          {product.name}
        </span>

        <span className="flex shrink-0 flex-col items-end text-right">
          <span className="flex items-baseline gap-1 sm:gap-1.5">
            {product.oldPriceByn ? (
              <span className="text-xs text-neutral-400 line-through sm:text-base">
                {product.oldPriceByn} byn
              </span>
            ) : null}

            <span
              className={
                product.oldPriceByn ? "text-red-600" : "text-neutral-500"
              }
            >
              {product.priceByn} byn
            </span>
          </span>

          <span className="flex items-baseline gap-1 text-xs text-neutral-400 sm:gap-1.5 sm:text-sm">
            {product.oldPrice ? (
              <span className="line-through">{product.oldPrice} rub</span>
            ) : null}

            <span className={product.oldPrice ? "text-red-500" : ""}>
              {product.price} rub
            </span>
          </span>
        </span>
      </Link>
    </article>
  );
}