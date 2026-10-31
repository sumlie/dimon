"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { RiTelegram2Line } from "react-icons/ri";
import { LoginButton } from "@/features/auth";
import { CartButton } from "@/features/cart";
import { cn } from "@/shared/lib/cn";
import { headerRef } from "@/shared/lib/refs";
import { Button } from "@/shared/ui/button";
import { NAV_LINKS } from "../config/links";
import { MobileMenu } from "./mobile-menu";

import { Dimon } from "@/shared/ui/dimon";

const MOBILE_BREAKPOINT = "(min-width: 1024px)";

type HeaderProps = {
  showLogo?: boolean;
};

export function Header({ showLogo = false }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 300);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed left-0 top-0 z-50 flex w-full items-center justify-between px-5 py-3.5 transition-[background-color,backdrop-filter,box-shadow] duration-300 sm:py-4",
        scrolled
          ? "bg-white/70 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] backdrop-blur-md"
          : "bg-white",
      )}
    >
      <nav className="hidden items-center gap-8 font-sans text-lg lowercase lg:flex">
        {NAV_LINKS.map((link) => (
          <Button key={link.label} href={link.href} variant="text" pd="none">
            {link.label}
          </Button>
        ))}
      </nav>

      <Button
        variant="social"
        size="mini"
        pd="none"
        onClick={() => setOpen(true)}
        aria-label="открыть меню"
        className="lg:hidden"
      >
        <span className="flex h-7 w-7 items-center justify-center">
          <Menu size={22} strokeWidth={2} />
        </span>
        <span>меню</span>
      </Button>

      {showLogo && (
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap leading-none tracking-wide text-red-600 uppercase font-display text-[30px] sm:text-[42px]"
        >
          <Dimon />
        </Link>
      )}

      <nav className="flex items-start gap-4 font-sans lg:gap-8">
        <Button
          href="#!"
          variant="social"
          size="mini"
          pd="none"
          className="hidden lg:flex"
        >
          <span className="flex h-7 w-7 items-center justify-center">
            <RiTelegram2Line size={26} />
          </span>
          <span>димоны</span>
        </Button>

        <LoginButton />
        <CartButton />
      </nav>

      {open ? <MobileMenu onClose={() => setOpen(false)} /> : null}
    </header>
  );
}