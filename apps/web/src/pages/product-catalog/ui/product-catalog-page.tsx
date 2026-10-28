"use client";

import { Header } from "@/widgets/header";
import { Footer } from "@/widgets/footer/ui/footer";
import { PRODUCTS } from "@/entities/product";
import { Product } from "@/entities/product/ui/product";
import { ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui/button";

export function ProductCatalogPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <section className="w-full bg-white px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-baseline justify-between gap-4 border-b-2 border-black pb-4 sm:mb-12 sm:pb-6">
              <h1 className="font-sans text-3xl font-extrabold lowercase tracking-tight text-black sm:text-4xl lg:text-5xl">
                весь каталог
              </h1>
              <div className="hidden sm:block">
                <Button
                  href="#!"
                  variant="text"
                  size="sm"
                  pd="none"
                  className="items-center gap-1 lowercase"
                >
                  фильтры
                  <ArrowRight
                    size={16}
                    strokeWidth={1.5}
                    className="transition-transform group-hover/button:-rotate-45"
                  />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {PRODUCTS.map((product) => (
                <Product key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}