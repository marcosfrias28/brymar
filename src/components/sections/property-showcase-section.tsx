"use client";

import { ImageContainer } from "../ui/image-container";
import { CircularButton } from "../ui/circular-button";
import { ArrowUpIcon, ArrowRight } from "lucide-react";
import { SectionWrapper, SectionHeader } from "../ui/section-wrapper";
import Link from "next/link";

export function PropertyShowcaseSection() {
  return (
    <SectionWrapper className="bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <SectionHeader
          subtitle="Experiencia Premium"
          title="Descubre la Excelencia Inmobiliaria"
          description="Cada propiedad cuenta una historia única. Nuestro enfoque personalizado garantiza que encuentres no solo una casa, sino tu hogar perfecto."
        />

        {/* Right side - Property image */}
        <div className="flex-1 relative flex justify-center items-center pt-20">
          <ImageContainer
            src="/optimized_villa/1.webp"
            alt="Propiedad de lujo con jardín y piscina"
            size="6xl"
            initialSize="2xl"
            imageClassName="object-cover"
            animateOnScroll={true}
          />
          {/* Circular action button */}
          <div className="absolute bottom-0 right-0 z-10">
            <CircularButton
              icon={<ArrowUpIcon className="text-black" />}
              onClick={() => {
                // Scroll to next section
                document
                  .getElementById("team-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
