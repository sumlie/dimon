import type { Category, Product } from "./types";

export type { Category, Product };

// URL админки Payload (откуда берём товары)
const PAYLOAD_URL = process.env.PAYLOAD_URL ?? "http://localhost:3001";

// Тип категории, как она приходит из Payload
type PayloadCategory = {
  id: string | number;
  title: string;
  slug: string;
};

// Тип товара, как он приходит из Payload (только нужные поля)
type PayloadProduct = {
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
};

// URL картинки
const mediaUrl = (url?: string | null) =>
  url ? (url.startsWith("http") ? url : `${PAYLOAD_URL}${url}`) : "";

// Собирает все картинки товара из массива photos
const extractImages = (photos: PayloadProduct["photos"]): string[] =>
  (photos ?? [])
    .map((ph) => (typeof ph === "object" && ph ? mediaUrl(ph.url) : ""))
    .filter(Boolean);

/**
 * Загружает список опубликованных товаров из Payload.
 * Если передан slug категории, возвращает товары только этой категории.
 * Возвращает массив в формате, подходящем для карточки товара (entities/product).
 */
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

    // Если категории нет — товаров в ней нет
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
      name: p.title,
      price: String(p.priceRub),
      priceByn: String(p.priceByn),
      image: images[0] ?? "",
      images,
      published: p.status === "published",
    };
  });
}

/**
 * Загружает ОДИН товар по его ID из Payload.
 * Возвращает товар в формате entities/product или null, если не найден.
 */
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

/**
 * Загружает список всех категорий из Payload.
 * Возвращает массив в формате, подходящем для фильтра категорий (entities/product).
 */
export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${PAYLOAD_URL}/api/categories?limit=100`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Payload error: ${res.status} ${res.statusText}`);
  }

  const { docs } = (await res.json()) as { docs: PayloadCategory[] };

  return docs.map((c) => ({
    id: String(c.id),
    title: c.title,
    slug: c.slug,
  }));
}


export async function fetchRelatedProducts(
  categorySlug: string | undefined,
  currentProductId: string,
  limit = 4,
): Promise<Product[]> {
  const [categoryProducts, allProducts] = await Promise.all([
    categorySlug ? fetchProducts(categorySlug) : Promise.resolve([]),
    fetchProducts(),
  ]);

  const relatedProducts = categoryProducts
    .filter((product) => product.id !== currentProductId)
    .slice(0, limit);

  if (relatedProducts.length >= limit) {
    return relatedProducts;
  }

  const selectedIds = new Set([
    currentProductId,
    ...relatedProducts.map((product) => product.id),
  ]);

  const additionalProducts = allProducts
    .filter((product) => !selectedIds.has(product.id))
    .slice(0, limit - relatedProducts.length);

  return [...relatedProducts, ...additionalProducts];
}