"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { RiTelegram2Line } from "react-icons/ri";
import { Button } from "@/shared/ui/button";
import { LoginButton } from "@/features/auth";
import { CartButton } from "@/features/cart";
import { headerRef } from "@/shared/lib/refs";
import { NAV_LINKS } from "../config/links";
import { MobileMenu } from "./mobile-menu";
import { cn } from "@/shared/lib/cn";

const MOBILE_BREAKPOINT = "(min-width: 1024px)";

export function Header() {
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
        "fixed left-0 top-0 z-50 flex w-full items-center justify-between px-5 py-3.5 transition-[background-color,backdrop-filter,box-shadow] duration-300 sm:px-8 sm:py-4",
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

      <nav className="flex items-start gap-4 font-sans lg:gap-8">
        <Button href="#!" variant="social" size="mini" pd="none" className="hidden lg:flex">
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
