"use client";

import { RiTelegram2Line } from "react-icons/ri";
import { ButtonLink } from "@/shared/ui/button";
import { LoginButton } from "@/features/auth";
import { CartButton } from "@/features/cart";
import { headerRef } from "@/shared/lib/refs";

export function Header() {
  return (
    <header
      ref={headerRef}
      className="fixed left-0 top-0 z-20 flex w-full items-center justify-between bg-white px-8 py-4"
    >
      <nav className="flex items-center gap-8 font-sans text-lg lowercase">
        <ButtonLink href="#!" variant="text" pd="none">
          каталог
        </ButtonLink>

        <ButtonLink href="#!" variant="text" pd="none">
          доставка
        </ButtonLink>

        <ButtonLink href="#!" variant="text" pd="none">
          блог
        </ButtonLink>

        <ButtonLink href="#!" variant="text" pd="none">
          о нас
        </ButtonLink>
      </nav>

      <nav className="flex items-start gap-8 font-sans text-sm">
        <ButtonLink href="#!" variant="social" size="mini" pd="none">
          <span className="flex h-7 w-7 items-center justify-center">
            <RiTelegram2Line size={26} />
          </span>

          <span>димоны</span>
        </ButtonLink>

        <LoginButton />

        <CartButton />
      </nav>
    </header>
  );
}
