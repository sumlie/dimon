import { RiInstagramLine, RiTelegram2Line, RiTiktokFill } from "react-icons/ri";

export const FOOTER_COLUMNS = [
  {
    title: "покупателям",
    links: [
      { label: "faq", href: "/faq" },
      { label: "как сделать заказ", href: "/order-info" },
      { label: "оплата", href: "/payment-info" },
      { label: "доставка", href: "/order-info" },
      { label: "возврат и обмен", href: "/returns-info" },
      { label: "размерная сетка", href: "/size-guide" },
    ],
  },
  {
    title: "о бренде",
    links: [
      { label: "о нас", href: "/about" },
      { label: "димоны", href: "https://t.me/dimonclo" },
      { label: "сотрудничество", href: "https://t.me/soatvey" },
    ],
  },
  {
    title: "документы",
    links: [
      { label: "пользовательское соглашение", href: "/terms-of-use" },
      { label: "политика конфиденциальности", href: "/privacy-policy" },
      { label: "публичная оферта", href: "/public-offer" },
    ],
  },
];

export const FOOTER_PAYMENT_METHODS = ["visa", "mastercard", "мир", "сбп"];

export const FOOTER_CARRIERS = ["сдэк", "boxberry", "курьером по городу"];

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
