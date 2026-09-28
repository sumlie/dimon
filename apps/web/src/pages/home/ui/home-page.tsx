import { HeroSection } from "@/pages/home/ui/sections/hero";
import { Header } from "@/widgets/header";
import { FeaturedProducts } from "@/pages/home/ui/sections/featured-products";
import { Manifesto } from "@/pages/home/ui/sections/manifesto";
import { ScrollGallery } from "@/pages/home/ui/sections/scroll-gallery";

export function HomePage() {
  return (
    <>
      <Header />
      <HeroSection />
      <FeaturedProducts />
      <Manifesto />
      <FeaturedProducts title="новинки" />
      <ScrollGallery />
    </>
  );
}
