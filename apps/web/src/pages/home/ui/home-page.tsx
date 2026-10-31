import { Community } from "@/pages/home/ui/sections/community";
import { FeaturedProducts } from "@/widgets/featured-products";
import { HeroSection } from "@/pages/home/ui/sections/hero";
import { Manifesto } from "@/pages/home/ui/sections/manifesto";
import { ScrollGallery } from "@/pages/home/ui/sections/scroll-gallery";
import { Footer } from "@/widgets/footer/ui/footer";
import { Header } from "@/widgets/header";
import { getSubscriberCount } from "../api";

export async function HomePage() {
  const subscriberCount = await getSubscriberCount();

  return (
    <>
      <Header />
      <HeroSection />
      <FeaturedProducts />
      <Manifesto />
      <FeaturedProducts title="новинки" />
      <ScrollGallery />
      <Community subscriberCount={subscriberCount} />
      <Footer />
    </>
  );
}
