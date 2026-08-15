import { Hero } from "@/components/landing/hero";
import { SearchPanel } from "@/components/landing/search-panel";
import { Categories } from "@/components/landing/categories";
import { FeaturedCase } from "@/components/landing/featured-case";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <SearchPanel />
      <Categories />
      <FeaturedCase />
      <Footer />
    </main>
  );
}
