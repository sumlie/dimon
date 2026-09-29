import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from '@/shared/ui/button';

import { Product, PRODUCTS } from "@/entities/product";

type FeaturedProductsProps = {
  title?: string;
  catalogHref?: string;
};

export function FeaturedProducts({
  title = "популярное",
  catalogHref = "/catalog",
}: FeaturedProductsProps) {
  return (
    <section className="w-full bg-white px-8 py-24 sm:py-32">
      <div className="flex items-end justify-between gap-6">
        <h2 className="font-sans text-4xl font-extrabold lowercase tracking-tight text-black sm:text-5xl">
          {title}
        </h2>

        <ButtonLink
          href={catalogHref}
          variant="text"
          size="sm"
          pd="none"
          className="group hidden shrink-0 items-center gap-1 lowercase sm:flex"
        >
          весь каталог

          <ArrowRight
            size={16}
            strokeWidth={1.5}
            className="transition-transform group-hover:-rotate-45"
          />
        </ButtonLink>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {PRODUCTS.map((product) => (
          <Product key={product.id} product={product} />
        ))}
      </div>

      <Link
        href={catalogHref}
        className="group mt-14 flex w-fit items-center gap-1 font-sans text-sm lowercase text-black transition-colors hover:text-red-600 sm:hidden"
      >
        весь каталог

        <ArrowRight
          size={16}
          strokeWidth={1.5}
          className="transition-transform group-hover:-rotate-45"
        />
      </Link>
    </section>
  );
}
