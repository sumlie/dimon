import {
  RiInstagramLine,
  RiTelegram2Line,
  RiTiktokFill,
} from "react-icons/ri";

export const FOOTER_COLUMNS = [
  {
    title: "каталог",
    links: [
      { label: "футболки", href: "#!" },
      { label: "головные уборы", href: "#!" },
      { label: "нижнее белье", href: "#!" },
      { label: "шарфы", href: "#!" },
      { label: "сеты", href: "#!" },
      { label: "новинки", href: "#!" },
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
    ],
  },
  {
    title: "о бренде",
    links: [
      { label: "о нас", href: "#!" },
      { label: "димоны", href: "#!" },
      { label: "сотрудничество", href: "#!" },
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
    href: "#!",
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
