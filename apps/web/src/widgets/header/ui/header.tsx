"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { RiTelegram2Line } from "react-icons/ri";
import { Button, ButtonLink } from "@/shared/ui/button";
import { LoginButton } from "@/features/auth";
import { CartButton } from "@/features/cart";
import { headerRef } from "@/shared/lib/refs";
import { NAV_LINKS } from "../config/links";
import { MobileMenu } from "./mobile-menu";

const MOBILE_BREAKPOINT = "(min-width: 1024px)";

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        setOpen(false);
      }
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      className="fixed left-0 top-0 z-50 flex w-full items-center justify-between bg-white px-6 py-4 sm:px-8"
    >
      <nav className="hidden items-center gap-8 font-sans text-lg lowercase lg:flex">
        {NAV_LINKS.map((link) => (
          <ButtonLink key={link.label} href={link.href} variant="text" pd="none">
            {link.label}
          </ButtonLink>
        ))}
      </nav>

      <div className="lg:hidden" />

      <nav className="hidden items-start gap-8 font-sans text-sm lg:flex">
        <ButtonLink href="#!" variant="social" size="mini" pd="none">
          <span className="flex h-7 w-7 items-center justify-center">
            <RiTelegram2Line size={26} />
          </span>
          <span>димоны</span>
        </ButtonLink>

        <LoginButton />
        <CartButton />
      </nav>

      <div className="flex items-start gap-6 lg:hidden">
        <LoginButton />
        <CartButton />

        <Button
          variant="social"
          size="mini"
          pd="none"
          onClick={() => setOpen(true)}
          aria-label="открыть меню"
        >
          <span className="flex h-7 w-7 items-center justify-center">
            <Menu size={22} strokeWidth={2} />
          </span>
          <span>меню</span>
        </Button>
      </div>

      {open ? <MobileMenu onClose={() => setOpen(false)} /> : null}
    </header>
  );
}
