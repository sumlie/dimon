import {
  fetchProducts,
  getCategoriesFromProducts,
} from "@/entities/product/model/products-api";
import { Cart } from "@/features/cart/ui/cart";
import { Footer } from "@/widgets/footer/ui/footer";
import { Header } from "@/widgets/header";

export async function CartPage() {
  const products = await fetchProducts();
  const categories = getCategoriesFromProducts(products);

  return (
    <>
      <Header showLogo />

      <main className="min-h-screen bg-white">
        <Cart products={products} />
      </main>

      <Footer categories={categories} />
    </>
  );
}