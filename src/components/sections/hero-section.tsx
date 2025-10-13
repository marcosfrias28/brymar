"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/all";
import { CircularText, ImageContainer } from "../ui/image-container";
import { ArrowRight, ArrowRightCircleIcon, ArrowUpIcon } from "lucide-react";
import { CircularButton } from "../ui/circular-button";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  return (
    <>
      {/* Hero Section Principal */}
      <section className="relative w-full flex flex-col items-center justify-center min-h-screen bg-background">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-12 gap-1 h-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="w-px bg-gradient-to-b from-muted/10 to-accent/10"
              />
            ))}
          </div>
        </div>

        <div className="container relative z-10 flex flex-col lg:flex-row items-center justify-between min-h-screen px-4 max-lg:pt-48">
          {/* Left side - Text content */}
          <div className="flex-1 lg:max-w-3xl mb-16 lg:mb-0">
            {/* Main hero title */}
            <h1 className="font-serif max-lg:text-center text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold leading-[110%] tracking-tight text-foreground uppercase mb-8">
              Encuentra tu hogar perfecto
            </h1>

            {/* Circular text element */}
            <div className="relative mb-8 flex justify-center gap-8">
              <CircularText
                className="max-lg:hidden"
                text="Propiedades en todo el terreno Nacional"
              />
              {/* Description text */}
              <p className="text-muted-foreground max-lg:text-center font-sofia-pro text-xl leading-relaxed max-w-lg mb-12">
                Nuestra marca internacional se especializa en tasación, ventas,
                compras e inversiones inmobiliarias. Confía en nosotros para
                brindarte un servicio excepcional y ayudarte a encontrar tu
                oportunidad inmobiliaria perfecta.
              </p>
            </div>

            {/* CTA Button */}
            <Link
              href="/properties"
              className="bg-primary group max-lg:mx-auto w-fit text-primary-foreground px-8 py-4 rounded-full font-sofia-pro font-semibold text-lg hover:bg-primary/90 transition-all duration-300 flex items-center gap-2"
            >
              Explorar Propiedades
              <ArrowRight className="size-6 group-hover:-rotate-45 transition-all duration-200" />
            </Link>
          </div>

          {/* Right side - Property image */}
          <div className="flex-1 relative flex justify-center lg:justify-end">
            <ImageContainer
              src="/optimized_villa/1.webp"
              alt="Propiedad de lujo con jardín y piscina"
              size="xl"
              rotation={8}
              imageClassName="object-cover"
            />
            {/* Circular action button */}
            <div className="absolute -bottom-8 -right-8 z-10">
              <CircularButton
                icon={<ArrowUpIcon className="text-black" />}
                onClick={() => {
                  // Scroll to next section or navigate to properties
                  document
                    .getElementById("featured-properties")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-muted/20 to-transparent" />
      </section>
    </>
  );
}
