import {
  RiInstagramLine,
  RiTelegram2Line,
  RiTiktokFill,
} from "react-icons/ri";

export const FOOTER_COLUMNS = [
  {
    title: "каталог",
    links: [
      { label: "худи", href: "#!" },
      { label: "футболки", href: "#!" },
      { label: "лонгсливы", href: "#!" },
      { label: "штаны и шорты", href: "#!" },
      { label: "шапки и кепки", href: "#!" },
      { label: "аксессуары", href: "#!" },
      { label: "новинки", href: "#!" },
      { label: "распродажа", href: "#!" },
    ],
  },
  {
    title: "покупателям",
    links: [
      { label: "faq", href: "#!" },
      { label: "как сделать заказ", href: "#!" },
      { label: "оплата", href: "#!" },
      { label: "доставка", href: "#!" },
      { label: "возврат и обмен", href: "#!" },
      { label: "размерная сетка", href: "#!" },
      { label: "уход за вещами", href: "#!" },
      { label: "статус заказа", href: "#!" },
    ],
  },
  {
    title: "сервис",
    links: [
      { label: "подарочные карты", href: "#!" },
      { label: "реферальная программа", href: "#!" },
      { label: "кэшбек", href: "#!" },
      { label: "трек-номер посылки", href: "#!" },
    ],
  },
  {
    title: "о бренде",
    links: [
      { label: "о нас", href: "#!" },
      { label: "димоны", href: "#!" },
      { label: "сотрудничество", href: "#!" },
      { label: "опт", href: "#!" },
      { label: "вакансии", href: "#!" },
    ],
  },
  {
    title: "инфо",
    links: [
      { label: "блог", href: "#!" },
      { label: "лукбук", href: "#!" },
      { label: "отзывы", href: "#!" },
      { label: "пресса", href: "#!" },
    ],
  },
  {
    title: "документы",
    links: [
      { label: "пользовательское соглашение", href: "#!" },
      { label: "политика конфиденциальности", href: "#!" },
      { label: "публичная оферта", href: "#!" },
      { label: "реквизиты", href: "#!" },
    ],
  },
];

export const FOOTER_PAYMENT_METHODS = [
  "visa",
  "mastercard",
  "мир",
  "сбп",
];

export const FOOTER_CARRIERS = [
  "сдэк",
  "почта россии",
  "boxberry",
  "курьером по городу",
];


export const SOCIAL_ICONS = {
  telegram: RiTelegram2Line,
  instagram: RiInstagramLine,
  tiktok: RiTiktokFill,
} as const;

type SocialIcon = keyof typeof SOCIAL_ICONS;

export const FOOTER_SOCIALS: {
  label: string;
  href: string;
  icon: SocialIcon;
}[] = [
  {
    label: "telegram",
    href: "https://t.me/dimony_chat",
    icon: "telegram",
  },
  {
    label: "instagram",
    href: "#!",
    icon: "instagram",
  },
  {
    label: "tiktok",
    href: "#!",
    icon: "tiktok",
  },
];
