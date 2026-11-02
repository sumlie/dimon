import { RiInstagramLine, RiTelegram2Line, RiTiktokFill } from "react-icons/ri";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type FooterColumn = {
  title: string;
  links: FooterLink[];
};

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "покупателям",
    links: [
      { label: "faq", href: "/faq", external: true, },
      { label: "как сделать заказ", href: "/order-info", external: true, },
      { label: "оплата", href: "/payment-info", external: true, },
      { label: "доставка", href: "/delivery-info", external: true, },
      { label: "возврат и обмен", href: "/returns-info", external: true, },
    ],
  },
  {
    title: "о бренде",
    links: [
      { label: "о нас", href: "/about", external: true, },
      {
        label: "димоны",
        href: "https://t.me/dimonclo",
        external: true,
      },
      {
        label: "сотрудничество",
        href: "https://t.me/soatvey",
        external: true,
      },
    ],
  },
  {
    title: "документы",
    links: [
      {
        label: "пользовательское соглашение",
        href: "/terms-of-use",
        external: true,
      },
      {
        label: "политика конфиденциальности",
        href: "/privacy-policy",
        external: true,
      },
      { label: "публичная оферта", href: "/public-offer", external: true, },
    ],
  },
];

export const FOOTER_PAYMENT_METHODS = ["visa", "mastercard", "мир", "сбп"];

export const FOOTER_CARRIERS = ["сдэк", "белпочта", "европочта"];

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
