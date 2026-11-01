import {
  fetchProducts,
  getCategoriesFromProducts,
} from "@/entities/product/model/products-api";
import { Product as ProductCard } from "@/entities/product/ui/product";
import { CategoryFilter } from "@/features/category-filter";
import { Footer } from "@/widgets/footer/ui/footer";
import { Header } from "@/widgets/header";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const allProducts = await fetchProducts();

  const categories = getCategoriesFromProducts(allProducts);

  const products = category
    ? allProducts.filter((product) => product.category?.slug === category)
    : allProducts;

  return (
    <>
      <Header showLogo />

      <main className="min-h-screen bg-white">
        <section className="w-full bg-white px-5 py-20 sm:px-8 sm:py-24 lg:py-32">
          <div className="flex items-baseline-last justify-between gap-4 sm:gap-6">
            <CategoryFilter
              categories={categories}
              active={category}
              total={products.length}
            />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:mt-12 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {products.length === 0 && (
            <p className="py-12 text-center text-black/60">
              Товаров пока нет.
            </p>
          )}
        </section>
      </main>

      <Footer categories={categories} />
    </>
  );
}