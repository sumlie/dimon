"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, X } from "lucide-react";
import { RiTelegram2Line } from "react-icons/ri";
import { Button, ButtonLink } from "@/shared/ui/button";
import { Dimon } from "@/shared/ui/dimon";
import { NAV_LINKS } from "../config/links";

type MobileMenuProps = {
  onClose: () => void;
};

export function MobileMenu({ onClose }: MobileMenuProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const menu = (
    <div className="fixed inset-0 z-90 flex flex-col overflow-hidden bg-white lg:hidden">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-8deg] select-none font-display text-[13rem] uppercase leading-none text-red-600/7">
        <Dimon />
      </div>

      <div className="relative z-10 flex items-center justify-end px-6 py-4 sm:px-8">
        <Button
          variant="icon"
          size="icon"
          pd="none"
          onClick={onClose}
          aria-label="закрыть меню"
        >
          <X size={24} strokeWidth={1.75} />
        </Button>
      </div>

      <nav className="relative z-10 flex flex-1 flex-col justify-center px-6 font-sans lowercase sm:px-8">
        <div className="mx-auto w-fit flex-col items-center">
          {NAV_LINKS.map((link, i) => (
            <ButtonLink
              key={link.label}
              href={link.href}
              variant="text"
              pd="none"
              onClick={onClose}
              className="group/nav grid grid-cols-[2.5rem_1fr] items-baseline py-4 text-3xl"
            >
              <span className="font-mono text-base text-red-600">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="transition-transform group-hover/nav:translate-x-2">
                {link.label}
              </span>
            </ButtonLink>
          ))}
        </div>
      </nav>

      <div className="relative z-10 border-t-2 border-black px-6 py-6 sm:px-8">
        <ButtonLink
          href="#!"
          pd="lg"
          onClick={onClose}
          className="w-full justify-center gap-2"
        >
          <RiTelegram2Line size={20} />
          димоны
          <ArrowRight
            strokeWidth={1.5}
            width={22}
            className="transition-transform group-hover/button:-rotate-45"
          />
        </ButtonLink>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(menu, document.body);
}
