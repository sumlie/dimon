"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export function CategoryFilter({ categories, active = "все товары", total }: {
  categories: { id: string; title: string; slug: string }[];
  active?: string;
  total: number;
}) {
  const [open, setOpen] = useState(false);
  const current = categories.find((c) => c.slug === active)?.title ?? "все товары";
  const all = [{ id: "all", title: "все товары", slug: "" }, ...categories];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-baseline gap-3"
      >
        <h1 className="font-sans text-3xl font-extrabold lowercase tracking-tight text-black sm:text-4xl lg:text-5xl">
          {current}
        </h1>
        <sup className="font-sans text-sm text-black/40">{total}</sup>
        <ChevronDown
          size={24}
          strokeWidth={1.5}
          className={`self-center mt-2 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul className="absolute left-0 top-full z-10 mt-4 min-w-64 border border-black bg-white">
          {all.map((c) => (
            <li key={c.id} className="border-b border-black last:border-b-0">
              <Link
                href={c.slug ? `/catalog?category=${c.slug}` : "/catalog"}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between px-4 py-3 font-sans text-sm lowercase transition-colors hover:bg-black hover:text-white ${
                  (active ?? "") === c.slug ? "font-extrabold" : ""
                }`}
              >
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}