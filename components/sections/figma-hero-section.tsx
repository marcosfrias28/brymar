"use client";

import { cn } from "@/lib/utils";
import { FigmaImageContainer, CircularText } from "@/components/ui/figma-image-container";
import { FigmaCircularButton, ArrowIcon } from "@/components/ui/figma-circular-button";

export function FigmaHeroSection() {
  return (
    <section className="relative w-full min-h-screen bg-figma-dark-green overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 gap-1 h-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-px bg-gradient-to-b from-white/10 to-black/10" />
          ))}
        </div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between min-h-screen px-4 lg:px-20 py-20">
        {/* Left side - Text content */}
        <div className="flex-1 lg:max-w-3xl mb-16 lg:mb-0">
          {/* Main hero title */}
          <h1 className="font-satoshi text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold leading-[110%] tracking-tight text-figma-hero-gradient uppercase mb-8">
            Experience the epitome of home comfort.
          </h1>

          {/* Circular text element */}
          <div className="relative w-44 h-44 mb-8">
            <CircularText text="The best property platform for" className="absolute" />
          </div>

          {/* Description text */}
          <p className="text-figma-light-gray font-sofia-pro text-xl leading-relaxed max-w-lg mb-12">
            Our international brand specializes in property appraisal, sales, purchases, and investments. Trust us to deliver exceptional service and help you find your perfect real estate opportunity.
          </p>
        </div>

        {/* Right side - Property image */}
        <div className="flex-1 relative flex justify-center lg:justify-end">
          {/* Main property image container */}
          <div className="relative">
            <FigmaImageContainer
              src="/hero-grid/house-3.avif"
              alt="Luxury property with garden and pool"
              size="xl"
              rotation={5.5}
              className="mb-8"
              imageClassName="object-cover"
            />
            
            {/* Circular action button */}
            <div className="absolute -bottom-8 -right-8">
              <FigmaCircularButton
                icon={<ArrowIcon className="text-black" />}
                onClick={() => {
                  // Scroll to next section or navigate to properties
                  document.getElementById('featured-properties')?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave or curve decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}
