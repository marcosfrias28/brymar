"use client";

import { HeroSection } from "@/components/sections/hero-section";
import { FeaturedProperties } from "@/components/sections/featured-properties";
import { Services } from "@/components/sections/services";
import { Testimonials } from "@/components/sections/testimonials";
import { NewsSection } from "@/components/sections/news-section";
import { ContactForm } from "@/components/sections/contact-form";
import { Intro } from "@/components/sections/intro";
import { useLangStore } from "@/utils/store/lang-store";

export default function Home() {
  const language = useLangStore((prev) => prev.language);

  return (
    <>
      <Intro language={language} />
      <HeroSection language={language} />
      <FeaturedProperties />
      <Services />
      <Testimonials />
      <NewsSection />
      <ContactForm />
    </>
  );
}
