export type Product = {
  id: string;
  name: string;
  price: string;
  priceByn: string;
  oldPrice?: string;
  oldPriceByn?: string;
  discount?: string;
  image: string;
  images: string[];
  published: boolean;
  description?: string;
  category?: {
    id: string | number;
    name: string;
    slug: string;
  } | null;
};

export type Category = {
  id: string;
  title: string;
  slug: string;
};
