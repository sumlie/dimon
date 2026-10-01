import { ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Product } from "@/entities/product/ui/product";
import { PRODUCTS } from "@/entities/product";

type FeaturedProductsProps = {
  title?: string;
  catalogHref?: string;
};

export function FeaturedProducts({
  title = "популярное",
  catalogHref = "/catalog",
}: FeaturedProductsProps) {
  return (
    <section className="w-full bg-white px-5 sm:px-8 py-16 sm:py-24 lg:py-32">
      <div className="flex items-baseline-last justify-between gap-4 sm:gap-6">
        <h2 className="font-sans text-3xl font-extrabold lowercase tracking-tight text-black sm:text-4xl lg:text-5xl">
          {title}
        </h2>

        <Button
          href={catalogHref}
          variant="text"
          size="sm"
          pd="none"
          className="shrink-0 items-center gap-1 lowercase"
        >
          весь каталог
          <ArrowRight
            size={16}
            strokeWidth={1.5}
            className="transition-transform group-hover/button:-rotate-45"
          />
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:mt-12 sm:gap-x-4 sm:gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {PRODUCTS.map((product) => (
          <Product key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
