import { fetchProductById } from "@/entities/product/model/products-api";
import { ProductPopup } from "@/features/product-detail";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await fetchProductById(id);

  if (!product) {
    return (
      <div className="flex min-h-screen bg-white">
        <p className="py-12 text-center text-black/60">Товар не найден.</p>
      </div>
    );
  }

  return <ProductPopup product={product} />;
}
