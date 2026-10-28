"use client";

import { Header } from "@/widgets/header";
import { Footer } from "@/widgets/footer/ui/footer";
import { ArrowRight, Filter } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Product } from "@/entities/product/ui";
import { useEffect, useState } from "react";

type Product = {
  id: string;
  name: string;
  price: string;
  priceByn: string;
  oldPrice?: string;
  oldPriceByn?: string;
  discount?: string;
  image: string;
  published: boolean;
};

export default function ProductCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/products");
        
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }
        
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-5 py-12 sm:px-8 sm:py-16">
          <div className="flex items-baseline justify-between gap-4 border-b-2 border-black pb-4 mb-8">
            <h1 className="font-sans text-3xl font-extrabold lowercase tracking-tight text-black sm:text-4xl lg:text-5xl">
              весь каталог
            </h1>
          </div>
          
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-square bg-gray-200 border border-black mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-5 py-12 sm:px-8 sm:py-16">
          <div className="flex items-baseline justify-between gap-4 border-b-2 border-black pb-4 mb-8">
            <h1 className="font-sans text-3xl font-extrabold lowercase tracking-tight text-black sm:text-4xl lg:text-5xl">
              весь каталог
            </h1>
          </div>
          
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="default"
              pd="md"
            >
              попробовать снова
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 border-b-2 border-black pb-4 mb-8">
          <h1 className="font-sans text-3xl font-extrabold lowercase tracking-tight text-black sm:text-4xl lg:text-5xl">
            весь каталог
          </h1>
          
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              pd="none"
              className="items-center gap-1 lowercase"
            >
              <Filter size={16} />
              фильтры
            </Button>
          </div>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-black/60 mb-4">В данный момент нет доступных товаров.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <Product key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}