import type { Category, Product } from "./types";

export type { Category, Product };

const PAYLOAD_URL = process.env.PAYLOAD_URL ?? "http://localhost:3001";

type PayloadCategory = {
  id: string | number;
  title: string;
  slug: string;
};

type PayloadProduct = {
  id: string | number;
  title: string;
  slug: string;
  priceRub: number;
  priceByn: number;
  status: string;
  photos?: Array<{ url?: string | null } | string | number> | null;
  description?: string | null;
  oldPrice?: string | null;
  oldPriceByn?: string | null;
  discount?: string | null;
  category?: PayloadCategory | string | number | null;
};

const mediaUrl = (url?: string | null) =>
  url ? (url.startsWith("http") ? url : `${PAYLOAD_URL}${url}`) : "";

const extractImages = (photos: PayloadProduct["photos"]): string[] =>
  (photos ?? [])
    .map((ph) => (typeof ph === "object" && ph ? mediaUrl(ph.url) : ""))
    .filter(Boolean);

export async function fetchProducts(category?: string): Promise<Product[]> {
  const params = new URLSearchParams({
    "where[status][equals]": "published",
    depth: "1",
    limit: "100",
    sort: "-createdAt",
  });

  if (category) {
    const categoryRes = await fetch(
      `${PAYLOAD_URL}/api/categories?limit=1&where[slug][equals]=${encodeURIComponent(category)}`,
      { cache: "no-store" },
    );

    if (!categoryRes.ok) {
      throw new Error(`Payload error: ${categoryRes.status} ${categoryRes.statusText}`);
    }

    const categoryData = (await categoryRes.json()) as { docs?: Array<{ id: string | number }> };
    const categoryDoc = categoryData.docs?.[0];

    if (!categoryDoc) {
      return [];
    }

    params.set("where[category][equals]", String(categoryDoc.id));
  }

  const res = await fetch(`${PAYLOAD_URL}/api/products?${params}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Payload error: ${res.status} ${res.statusText}`);
  }

  const { docs } = (await res.json()) as { docs: PayloadProduct[] };

  return docs.map((p) => {
    const images = extractImages(p.photos);

    return {
      id: String(p.id),
      slug: p.slug,
      name: p.title,
      price: String(p.priceRub),
      priceByn: String(p.priceByn),
      image: images[0] ?? "",
      images,
      published: p.status === "published",
      description: p.description ?? undefined,
      oldPrice: p.oldPrice ?? undefined,
      oldPriceByn: p.oldPriceByn ?? undefined,
      discount: p.discount ?? undefined,
      category:
        p.category && typeof p.category === "object"
          ? {
              id: String(p.category.id),
              name: p.category.title,
              slug: p.category.slug,
            }
          : null,
    };
  });
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const url = `${PAYLOAD_URL}/api/products/${id}?depth=1`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    if (res.status === 404) return null;
    console.error(`fetchProductById: payload error ${res.status} ${res.statusText}`);
    throw new Error(`Payload error: ${res.status} ${res.statusText}`);
  }

  const doc = await res.json();
  const p = doc as {
    id: string | number;
    title: string;
    priceRub: number;
    priceByn: number;
    status: string;
    photos?: Array<{ url?: string | null } | string | number> | null;
    description?: string;
    oldPrice?: string;
    oldPriceByn?: string;
    discount?: string;
    published?: boolean;
    [key: string]: any;
  };

  const images = extractImages(p.photos);

  return {
    id: String(p.id),
    name: p.title,
    price: String(p.priceRub),
    priceByn: String(p.priceByn),
    image: images[0] ?? "",
    images,
    published: p.status === "published",
    description: p.description,
    oldPrice: p.oldPrice,
    oldPriceByn: p.oldPriceByn,
    discount: p.discount,
    category: p.category
      ? {
          id: p.category.id,
          name: p.category.title,
          slug: p.category.slug,
        }
      : null,
  } as Product;
}

export function getRelatedProducts(
  products: Product[],
  categorySlug: string | undefined,
  currentProductId: string,
  limit = 4,
): Product[] {
  const otherProducts = products.filter(
    (product) => product.id !== currentProductId,
  );

  const similarProducts = categorySlug
    ? otherProducts.filter(
        (product) => product.category?.slug === categorySlug,
      )
    : [];

  const remainingProducts = categorySlug
    ? otherProducts.filter(
        (product) => product.category?.slug !== categorySlug,
      )
    : otherProducts;

  return [...similarProducts, ...remainingProducts].slice(
    0,
    Math.max(0, limit),
  );
}

export function getCategoriesFromProducts(products: Product[]) {
  const categories = new Map<
    string,
    { id: string; title: string; slug: string }
  >();

  for (const product of products) {
    const category = product.category;

    if (!category?.slug) continue;

    categories.set(String(category.id), {
      id: String(category.id),
      title: category.name,
      slug: category.slug,
    });
  }

  return Array.from(categories.values());
}