"use client";

import { ArrowRight, X } from "lucide-react";
import { RiTelegram2Line } from "react-icons/ri";

import { Button } from "@/shared/ui/button";
import { Popup } from "@/shared/ui/popup";

import { NAV_LINKS } from "../config/links";

type MobileMenuProps = {
  onClose: () => void;
};

export function MobileMenu({ onClose }: MobileMenuProps) {
  return (
    <Popup
      open
      onClose={onClose}
      title="Мобильное меню"
      contentClassName="inset-0 flex h-dvh max-h-none w-full max-w-none translate-x-0 translate-y-0 flex-col overflow-x-hidden overflow-y-auto bg-white lg:hidden"
    >
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-black px-5 py-5 sm:px-8 sm:py-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="закрыть меню"
          className="flex h-9 w-9 shrink-0 items-center justify-center border border-black text-black transition-colors hover:bg-black hover:text-white"
        >
          <X size={19} strokeWidth={1.5} />
        </button>

        <div className="flex flex-col items-end">
          <h2 className="font-sans text-2xl font-extrabold lowercase tracking-tight sm:text-3xl">
            меню
          </h2>

          <p className="mt-2 font-sans text-sm lowercase text-black/50">
            всё, что тебе нужно
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-6 sm:px-8">
        <nav aria-label="Главное меню" className="pt-4">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="border-b border-black/20">
                <Button
                  href={link.href}
                  variant="text"
                  pd="none"
                  onClick={onClose}
                  className="group/nav flex w-full items-center justify-between gap-4 py-5 text-left font-sans text-base font-bold lowercase text-black transition-colors hover:text-red-600"
                >
                  {link.label}

                  <ArrowRight
                    size={19}
                    strokeWidth={1.5}
                    className="shrink-0 transition-transform group-hover/nav:-rotate-45"
                  />
                </Button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto pt-10">
          <Button
            href="https://t.me/dimonclo"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="group mt-4 flex w-full items-center justify-between gap-4 border border-black bg-black px-6 py-4 font-sans text-base font-extrabold lowercase text-white transition-colors hover:bg-white hover:text-black"
          >
            <span className="flex items-center gap-3">
              <RiTelegram2Line size={21} />
              димоны
            </span>

            <ArrowRight
              size={20}
              strokeWidth={1.5}
              className="shrink-0 transition-transform group-hover:-rotate-45"
            />
          </Button>
        </div>
      </div>
    </Popup>
  );
}