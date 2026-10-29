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
};

export type Category = {
  id: string;
  title: string;
  slug: string;
};
