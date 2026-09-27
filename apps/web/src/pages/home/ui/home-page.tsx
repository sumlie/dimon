import { HeroSection } from "@/pages/home/ui/sections/hero";
import { Header } from "@/widgets/header";

export function HomePage() {
  return (
    <>
      <Header />
      <HeroSection />
      <div className="w-full h-dvh"></div>
    </>
  );
}
