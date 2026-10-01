import { Button } from "@/shared/ui/button";

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
      <div className="mx-auto px-6 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-4 xl:grid-cols-6">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="font-sans text-sm lowercase text-white/40">{column.title}</p>

              <ul className="mt-4 flex flex-col gap-3 lowercase">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Button href={link.href} variant="textInvert" pd="none" className="break-words">
                      {link.label}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 border-t border-white/15 pt-8 sm:mt-16 sm:grid-cols-2 sm:gap-8 sm:pt-10 lg:grid-cols-4">
          <div>
            <p className="font-sans text-sm lowercase text-white/40">контакты</p>

            <div className="mt-4 flex flex-col gap-2 lowercase">
              <Button
                href="https://t.me/username"
                target="_blank"
                rel="noopener noreferrer"
                variant="textInvert"
                pd="none"
                className="w-fit"
              >
                @soatvey
              </Button>

              <p className="font-sans text-base text-white/60 sm:text-lg">
                пишите в любое время — не кусаемся
              </p>
            </div>
          </div>

          <div>
            <p className="font-sans text-sm lowercase text-white/40">социальные сети</p>

            <div className="mt-4 flex gap-4">
              {FOOTER_SOCIALS.map((social) => {
                const Icon = SOCIAL_ICONS[social.icon];

                return (
                  <Button
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="iconBox"
                    size="icon"
                    pd="none"
                  >
                    <Icon size={18} />
                  </Button>
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

        <div className="mt-8 flex flex-col gap-2 border-t border-white/15 pt-6 font-sans text-xs lowercase text-white/40 sm:mt-12 sm:flex-row sm:items-center sm:justify-between sm:pt-8">
          <p>© 2026 димон. ип иванов и. и., огрнип 000000000000000</p>

          <p>
            разработано при поддержке{" "}
            <Button
              href="https://t.me/bpq012"
              target="_blank"
              rel="noopener noreferrer"
              variant="muted"
              size="inherit"
              pd="none"
            >
              summerlie
            </Button>
          </p>
        </div>
      </div>
    </footer>
  );
}
