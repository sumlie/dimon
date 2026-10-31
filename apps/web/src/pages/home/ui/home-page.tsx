import { Community } from "@/pages/home/ui/sections/community";
import { FeaturedProducts } from "@/widgets/featured-products";
import { HeroSection } from "@/pages/home/ui/sections/hero";
import { Manifesto } from "@/pages/home/ui/sections/manifesto";
import { ScrollGallery } from "@/pages/home/ui/sections/scroll-gallery";
import { Footer } from "@/widgets/footer/ui/footer";
import { Header } from "@/widgets/header";
import { fetchGalleryPhotos, getSubscriberCount } from "../api";
import { fetchProducts, getCategoriesFromProducts } from "@/entities/product/model/products-api";

export async function HomePage() {
  const [subscriberCount, products, photos] = await Promise.all([
    getSubscriberCount(),
    fetchProducts(),
    fetchGalleryPhotos(),
  ]);

  const categories = getCategoriesFromProducts(products);

  return (
    <>
      <Header />
      <HeroSection />
      <FeaturedProducts prodcutsArray={products} />
      <Manifesto />
      <FeaturedProducts title="новинки" prodcutsArray={products} />
      <ScrollGallery photos={photos} />
      <Community subscriberCount={subscriberCount} />
      <Footer categories={categories} />
    </>
  );
}
