export type NavLink = {
  label: string;
  href: string;
};

export const NAV_LINKS: NavLink[] = [
  { label: "каталог", href: "/catalog" },
  { label: "доставка", href: "/delivery-info" },
  { label: "оплата", href: "/payment-info" },
  { label: "о нас", href: "/about" },
];
