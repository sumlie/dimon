"use client";

import { Button } from "@/shared/ui/button";
import { ArrowRight } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { headerRef } from "@/shared/lib/refs";
import { Dimon } from "@/shared/ui/dimon";

export const SCROLL_DISTANCE = 450;

const TARGET_FONT_SIZE_MOBILE = 30;
const TARGET_FONT_SIZE_DESKTOP = 42;
const DESKTOP_BREAKPOINT = "(min-width: 1024px)";

export function HeroSection() {
  const spacerRef = useRef<HTMLDivElement>(null);
  const flyingRef = useRef<HTMLHeadingElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);

  const start = useRef({ top: 0, left: 0 });
  const startFontSize = useRef(0);
  const targetFontSize = useRef(TARGET_FONT_SIZE_DESKTOP);

  const [mounted, setMounted] = useState(false);
  useLayoutEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!mounted) return;

    const isDesktop = window.matchMedia(DESKTOP_BREAKPOINT);
    const syncTarget = () => {
      targetFontSize.current = isDesktop.matches
        ? TARGET_FONT_SIZE_DESKTOP
        : TARGET_FONT_SIZE_MOBILE;
    };

    const measure = () => {
      if (!spacerRef.current) return;
      const rect = spacerRef.current.getBoundingClientRect();

      startFontSize.current = parseFloat(getComputedStyle(spacerRef.current).fontSize);
      start.current = { top: rect.top + rect.height / 2, left: rect.left + rect.width / 2 };
    };

    let ticking = false;
    const update = () => {
      const header = headerRef.current;
      if (!flyingRef.current || !header) return;

      const progress = Math.min(Math.max(window.scrollY / SCROLL_DISTANCE, 0), 1);
      const ease = progress * (2 - progress);

      const headerRect = header.getBoundingClientRect();
      const targetTop = headerRect.top + headerRect.height / 2;
      const targetLeft = window.innerWidth / 2;

      const top = start.current.top + (targetTop - start.current.top) * ease;
      const left = start.current.left + (targetLeft - start.current.left) * ease;
      const fontSize =
        startFontSize.current + (targetFontSize.current - startFontSize.current) * ease;

      flyingRef.current.style.top = `${top}px`;
      flyingRef.current.style.left = `${left}px`;
      flyingRef.current.style.fontSize = `${fontSize}px`;

      if (fadeRef.current) {
        fadeRef.current.style.opacity = `${Math.max(1 - progress * 1.6, 0)}`;
        fadeRef.current.style.pointerEvents = progress > 0.4 ? "none" : "auto";
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };
    const onResize = () => {
      syncTarget();
      measure();
      update();
    };

    syncTarget();
    measure();
    update();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    isDesktop.addEventListener("change", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      isDesktop.removeEventListener("change", onResize);
    };
  }, [headerRef, mounted]);

  const flyingH1 = (
    <h1
      ref={flyingRef}
      className="fixed left-0 top-0 z-60 pointer-events-none -translate-x-1/2 -translate-y-1/2 whitespace-nowrap leading-none tracking-wide text-red-600 uppercase font-display"
    >
      <Dimon />
    </h1>
  );

  return (
    <section className="relative h-dvh w-full">
      <div className="h-full w-full sticky top-0 flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-8 sm:gap-10 lg:gap-12">
          <div
            ref={spacerRef}
            aria-hidden
            className="invisible font-display leading-none tracking-wide uppercase"
            style={{ fontSize: "clamp(4.5rem, 22vw, 11.625rem)" }}
          >
            <Dimon />
          </div>

          <div ref={fadeRef} className="flex flex-col items-center gap-8 sm:gap-10 lg:gap-12">
            <p className="w-[90%] text-center font-sans text-base sm:w-[75%] sm:text-lg lg:w-[60%] lg:text-xl">
              одежда без рамок и единой идеи. просто создаём то, что нравится нам и вам, и
              распространяем ДИМОНа дальше.
            </p>

            <Button href="#!" pd="lg">
              каталог
              <ArrowRight
                strokeWidth={1.5}
                width={22}
                className="transition-transform group-hover/button:-rotate-45"
              />
            </Button>
          </div>

          {mounted ? createPortal(flyingH1, document.body) : null}
        </div>
      </div>
    </section>
  );
}
