import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { fetchProductById, fetchRelatedProducts } from "@/entities/product/model/products-api";
import { Header } from "@/widgets/header";
import { Footer } from "@/widgets/footer/ui/footer";
import { ProductGallery } from "@/entities/product/ui/product-gallery";
import { FeaturedProducts } from "@/widgets/featured-products";

const ORDER_URL = process.env.NEXT_PUBLIC_ORDER_URL ?? "#";

const INFO_LINKS = [
  { label: "уход за вещами", href: "/care" },
  { label: "доставка и оплата", href: "/delivery" },
];

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await fetchProductById(id);

  const relatedProducts = product
    ? await fetchRelatedProducts(product.category?.slug, product.id)
    : [];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <section className="w-full bg-white px-5 py-10 sm:px-8 sm:py-16 lg:py-20">
          {product ? (
            <>
              <Link
                href="/catalog"
                className="group mb-8 inline-flex items-center gap-1 font-sans text-sm lowercase text-black sm:mb-12"
              >
                <ArrowLeft
                  size={16}
                  strokeWidth={1.5}
                  className="transition-transform group-hover:-translate-x-1"
                />
                назад в каталог
              </Link>

              <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-16">
                <ProductGallery images={product.images} alt={product.name} />

                <div className="flex flex-col font-sans lg:sticky lg:top-8 lg:self-start">
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

                  <a
                    href={ORDER_URL}
                    className="group mt-8 flex w-full items-center justify-between border border-black bg-black px-6 py-4 text-base font-extrabold lowercase text-white transition-colors hover:bg-white hover:text-black"
                  >
                    купить
                    <ArrowRight
                      size={20}
                      strokeWidth={1.5}
                      className="transition-transform group-hover:-rotate-45"
                    />
                  </a>

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
                          className="group flex items-center justify-between py-4 text-sm lowercase text-black"
                        >
                          {l.label}
                          <ArrowRight
                            size={16}
                            strokeWidth={1.5}
                            className="transition-transform group-hover:-translate-x-1"
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
      <Footer />
    </div>
  );
}
