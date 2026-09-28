import type { Product } from "../model/types";

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "ВАЗ 2107",
    price: "4 900 rub",
    priceByn: "165 byn",
    oldPrice: "6 900 rub",
    oldPriceByn: "233 byn",
    discount: "-29%",
    image: "/images/0.png",
  },
  {
    id: "2",
    name: "пивас с пасанами",
    price: "2 100 rub",
    priceByn: "71 byn",
    image: "/images/1.png",
  },
  {
    id: "3",
    name: "разъебная шапка",
    price: "2 700 rub",
    priceByn: "91 byn",
    oldPrice: "3 500 rub",
    oldPriceByn: "118 byn",
    discount: "-23%",
    image: "/images/2.png",
  },
  {
    id: "4",
    name: "еще одна жига",
    price: "1 500 rub",
    priceByn: "51 byn",
    image: "/images/3.png",
  },
];
