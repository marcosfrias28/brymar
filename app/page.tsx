import { HeroSection } from "@/components/sections/hero-section";
import { FeaturedProperties } from "@/components/sections/featured-properties";
import { Services } from "@/components/sections/services";
import { NewsSection } from "@/components/sections/news-section";
import { ContactForm } from "@/components/sections/contact-form";
import { Intro } from "@/components/sections/intro/intro";

export default function Home() {
  return (
    <>
      <Intro />
      <HeroSection />
      <FeaturedProperties />
      <Services />
      <NewsSection />
      <ContactForm />
    </>
  );
}
