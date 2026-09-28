import Link from "next/link";

import {
  FOOTER_CARRIERS,
  FOOTER_COLUMNS,
  FOOTER_PAYMENT_METHODS,
  FOOTER_SOCIALS,
  SOCIAL_ICONS,
} from "../config/consts";

export function Footer() {
  return (
    <footer className="w-full bg-black text-white">
      <div className="mx-auto px-12 py-20">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-6">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="font-sans text-sm lowercase text-white/40">{column.title}</p>

              <ul className="mt-4 flex flex-col gap-3 font-sans text-base lowercase sm:text-lg">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="transition-colors hover:text-red-600">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 border-t border-white/15 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-sans text-sm lowercase text-white/40">контакты</p>

            <div className="mt-4 flex flex-col gap-2 font-sans text-base lowercase">
              <Link
                href="https://t.me/username"
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit transition-colors hover:text-red-600"
              >
                @soatvey
              </Link>

              <p className="text-white/60">пишите в любое время — не кусаемся</p>
            </div>
          </div>

          <div>
            <p className="font-sans text-sm lowercase text-white/40">социальные сети</p>

            <div className="mt-4 flex gap-4">
              {FOOTER_SOCIALS.map((social) => {
                const Icon = SOCIAL_ICONS[social.icon];

                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center border border-white/20 transition-colors hover:border-red-600 hover:text-red-600"
                  >
                    <Icon size={18} />
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <p className="font-sans text-sm lowercase text-white/40">способы оплаты</p>

            <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs lowercase text-white/60">
              {FOOTER_PAYMENT_METHODS.map((method) => (
                <span key={method} className="border border-white/20 px-2 py-1">
                  {method}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="font-sans text-sm lowercase text-white/40">работаем с</p>

            <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs lowercase text-white/60">
              {FOOTER_CARRIERS.map((carrier) => (
                <span key={carrier} className="border border-white/20 px-2 py-1">
                  {carrier}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/15 pt-8 font-sans text-xs lowercase text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 димон. ип иванов и. и., огрнип 000000000000000
          </p>

          <p>
            разработано при поддержке{" "}
            <Link
              href="https://t.me/bpq012"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 transition-colors hover:text-white"
            >
              summerlie
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
