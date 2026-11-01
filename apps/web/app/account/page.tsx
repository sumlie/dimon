import {
  fetchProducts,
  getCategoriesFromProducts,
} from "@/entities/product/model/products-api";
import { AccountPage } from "@/pages/account";
import { Footer } from "@/widgets/footer/ui/footer";
import { Header } from "@/widgets/header";

export default async function Page() {
  const products = await fetchProducts();
  const categories = getCategoriesFromProducts(products);

  return (
    <>
      <Header showLogo />

      <main className="min-h-screen bg-white">
        <AccountPage />
      </main>

      <Footer categories={categories} />
    </>
  );
}