import { HeroSection } from '@/components/sections/hero-section';
import { CategoriesSection } from '@/components/sections/categories-section';
import { FeaturedPropertiesSection } from '@/components/sections/featured-properties-section';
import { TeamSection } from '@/components/sections/team-section';
import { FAQSection } from '@/components/sections/faq-section';
import { Footer } from '@/components/sections/footer';

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturedPropertiesSection />
      <TeamSection />
      <FAQSection />
      <Footer />
    </>
  );
}
