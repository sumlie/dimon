import {
  fetchCategories,
  fetchProducts,
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
  const searchParamsResult = await searchParams;
  const category = searchParamsResult?.category;
  const [products, categories] = await Promise.all([
    fetchProducts(category),
    fetchCategories(),
  ]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <section className="w-full bg-white px-5 py-16 sm:px-8 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <h1 className="font-sans text-3xl font-extrabold lowercase tracking-tight text-black sm:text-4xl lg:text-5xl">
              каталог
            </h1>

            <div className="mt-8 sm:mt-12">
              <CategoryFilter categories={categories} active={category} />
            </div>

            <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:mt-12 sm:gap-x-4 sm:gap-y-10 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {products.length === 0 && (
              <p className="py-12 text-center text-black/60">
                Товаров пока нет.
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
