import { ProductCatalogPage } from "@/pages/product-catalog";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  return <ProductCatalogPage searchParams={searchParams} />;
}
