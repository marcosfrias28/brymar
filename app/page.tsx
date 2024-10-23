import { HeroSection } from '@/components/sections/hero-section';
import { FeaturedProperties } from '@/components/sections/featured-properties';
import { Services } from '@/components/sections/services';
import { Testimonials } from '@/components/sections/testimonials';
import { NewsSection } from '@/components/sections/news-section';
import { ContactForm } from '@/components/sections/contact-form';

export default function Home() {
  return (
    <div className="w-full">
      <HeroSection />
      <FeaturedProperties />
      <Services />
      <Testimonials />
      <NewsSection />
      <ContactForm />
    </div>
  );
}