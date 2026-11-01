import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getRelatedProducts, getCategoriesFromProducts, fetchProducts  } from "@/entities/product/model/products-api";
import { Header } from "@/widgets/header";
import { Footer } from "@/widgets/footer/ui/footer";
import { ProductGallery } from "@/entities/product/ui/product-gallery";
import { FeaturedProducts } from "@/widgets/featured-products";
import { BackButton } from "@/shared/ui/back-button";
import { AddToCartButton } from "@/features/cart/ui/add-to-cart";

const ORDER_URL = process.env.NEXT_PUBLIC_ORDER_URL ?? "#";

const INFO_LINKS = [
  { label: "уход за вещами", href: "/care" },
  { label: "доставка и оплата", href: "/delivery" },
];

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: encodedSlug } = await params;

  let slug: string;

  try {
    slug = decodeURIComponent(encodedSlug);
  } catch {
    slug = encodedSlug;
  }

  const allProducts = await fetchProducts();

  const product = allProducts.find((item) => item.slug === slug) ?? null;

  const categories = getCategoriesFromProducts(allProducts);

  const relatedProducts = product
    ? getRelatedProducts(allProducts, product.category?.slug, product.id)
    : [];

  return (
    <div className="min-h-screen bg-white">
      <Header showLogo />
      <main>
        <section className="w-full bg-white px-5 py-25 sm:px-8 lg:pt-30">
          {product ? (
            <>
              <BackButton className="mb-5" />

              <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-16">
                <ProductGallery images={product.images} alt={product.name} />

                <div className="flex flex-col font-sans lg:sticky lg:top-24 lg:self-start">
                  <h1 className="text-3xl font-extrabold lowercase tracking-tight text-black sm:text-4xl lg:text-5xl">
                    {product.name}
                  </h1>

                  <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span
                      className={`text-2xl font-extrabold sm:text-3xl ${
                        product.oldPriceByn ? "text-red-600" : "text-black"
                      }`}
                    >
                      {product.priceByn} byn
                    </span>
                    {product.oldPriceByn ? (
                      <span className="text-base text-neutral-400 line-through">
                        {product.oldPriceByn} byn
                      </span>
                    ) : null}
                    {product.discount ? (
                      <span className="border border-red-600 px-1.5 py-0.5 text-xs lowercase text-red-600">
                        {product.discount}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 flex items-baseline gap-2 text-sm text-neutral-400">
                    <span className={product.oldPrice ? "text-red-500" : ""}>
                      {product.price} rub
                    </span>
                    {product.oldPrice ? (
                      <span className="line-through">{product.oldPrice} rub</span>
                    ) : null}
                  </div>
                  <AddToCartButton productId={product.id} />
                  

                  {product.description ? (
                    <div className="mt-10 border-t-2 border-black pt-6">
                      <h2 className="mb-3 text-sm font-extrabold lowercase text-black">
                        описание
                      </h2>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-black/60 sm:text-base">
                        {product.description}
                      </p>
                    </div>
                  ) : null}

                  <ul className="mt-8 border-t border-black">
                    {INFO_LINKS.map((l) => (
                      <li key={l.href} className="border-b border-black">
                        <Link
                          href={l.href}
                          className="group flex items-center justify-between py-4 text-sm lowercase text-black hover:text-red-500"
                        >
                          {l.label}
                          <ArrowRight
                            size={16}
                            strokeWidth={1.5}
                            className="transition-transform group-hover:-rotate-45 group-hover:text-red-500"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <p className="py-12 text-center text-black/60">Товар не найден.</p>
          )}
        </section>
        <FeaturedProducts prodcutsArray={relatedProducts} title="вам понравится"/>

      </main>
      <Footer categories={categories} />
    </div>
  );
}
