"use client";

import Link from "next/link";
import type { Category } from "@/entities/product/model/products-api";

export type CategoryFilterProps = {
  categories: Category[];
  active?: string;
};

export function CategoryFilter({ categories, active }: CategoryFilterProps) {
  const base =
    "border border-black px-4 py-2 font-sans text-sm lowercase transition-colors whitespace-nowrap";

  return (
    <div className="flex flex-wrap gap-2 sm:overflow-x-auto sm:px-2 pb-1">
      <Link
        href="/catalog"
        className={`${base} ${!active ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"}`}
      >
        все
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/catalog?category=${c.slug}`}
          className={`${base} ${active === c.slug ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"}`}
        >
          {c.title}
        </Link>
      ))}
    </div>
  );
}
