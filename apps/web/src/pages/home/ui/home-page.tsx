import { HeroSection } from "@/pages/home/ui/sections/hero";
import { Header } from "@/widgets/header";
import { FeaturedProducts } from "@/pages/home/ui/sections/featured-products";

export function HomePage() {
  return (
    <>
      <Header />
      <HeroSection />
      <FeaturedProducts />
      <FeaturedProducts title="новинки" />
    </>
  );
}
