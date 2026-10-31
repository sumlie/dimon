import { CatalogPage } from "@/pages/catalog";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  return <CatalogPage searchParams={searchParams} />;
}
