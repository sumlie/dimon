const PAYLOAD_URL = process.env.PAYLOAD_URL ?? "http://localhost:3001";

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
  category?: {
    slug: string;
    name: string;
  };
};

// Общий тип товара (те же поля, что и в Product cards)
export type Product = {
  id: string;
  name: string;
  price: string;
  priceByn: string;
  oldPrice?: string;
  oldPriceByn?: string;
  discount?: string;
  image: string;
  published: boolean;
  description?: string;
  category?: {
    slug: string;
    name: string;
  };
};

export type Category = {
  id: string;
  title: string;
  slug: string;
};

const mediaUrl = (url?: string | null) =>
  url ? (url.startsWith("http") ? url : `${PAYLOAD_URL}${url}`) : "";

/**
 * Загружает список опубликованных товаров из Payload.
 * Если categorySlug указан, фильтрует по нему.
 * Возвращает массив в формате, подходящем для карточки товара (entities/product).
 */
export async function fetchProducts(categorySlug?: string): Promise<Product[]> {
  const params = new URLSearchParams({
    "where[status][equals]": "published",
    depth: "1",
    limit: "100",
    sort: "-createdAt",
  });

  if (categorySlug) {
    params.set("where[category.slug][equals]", categorySlug);
  }

  const res = await fetch(`${PAYLOAD_URL}/api/products?${params}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Payload error: ${res.status} ${res.statusText}`);
  }

  const { docs } = (await res.json()) as { docs: PayloadProduct[] };

  return docs.map((p) => {
    const first = p.photos?.[0];
    return {
      id: String(p.id),
      name: p.title,
      price: String(p.priceRub),
      priceByn: String(p.priceByn),
      image: typeof first === "object" && first ? mediaUrl(first.url) : "",
      published: p.status === "published",
      description: p.description,
      oldPrice: p.oldPrice,
      oldPriceByn: p.oldPriceByn,
      discount: p.discount,
      category: p.category
        ? { slug: p.category.slug, name: p.category.name }
        : undefined,
    };
  });
}

/**
 * Загружает список категорий из Payload.
 */
export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(
    `${PAYLOAD_URL}/api/categories?limit=100&sort=title`,
    {
      cache: "no-store",
    },
  );
  if (!res.ok) {
    throw new Error(`Payload error: ${res.status} ${res.statusText}`);
  }

  const { docs } = (await res.json()) as {
    docs: Array<{ id: string | number; title: string; slug: string }>;
  };
  return docs.map((c) => ({ id: String(c.id), title: c.title, slug: c.slug }));
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
    console.error(
      `fetchProductById: payload error ${res.status} ${res.statusText}`,
    );
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
    category?: {
      slug: string;
      name: string;
    };
    [key: string]: any;
  };

  return {
    id: String(p.id),
    name: p.title,
    price: String(p.priceRub),
    priceByn: String(p.priceByn),
    image:
      typeof p.photos?.[0] === "object" && p.photos?.[0]
        ? mediaUrl(p.photos[0].url)
        : "",
    published: p.status === "published",
    description: p.description,
    oldPrice: p.oldPrice,
    oldPriceByn: p.oldPriceByn,
    discount: p.discount,
    category: p.category
      ? { slug: p.category.slug, name: p.category.name }
      : undefined,
  } as Product;
}
