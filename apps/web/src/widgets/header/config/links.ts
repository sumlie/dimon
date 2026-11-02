export type NavLink = {
  label: string;
  href: string;
  external?: boolean;
};

export const NAV_LINKS: NavLink[] = [
  { label: "каталог", href: "/catalog" },
  { label: "доставка", href: "/delivery-info", external: true },
  { label: "оплата", href: "/payment-info", external: true },
  { label: "о нас", href: "/about", external: true },
];