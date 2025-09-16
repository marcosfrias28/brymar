"use client";

import { cn } from "@/lib/utils";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/all";
import { Article } from "../article";
import { CircularText, ImageContainer } from "../ui/image-container";
import { ArrowUpIcon } from "lucide-react";
import { CircularButton } from "../ui/circular-button";

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const imageRefs = [
    useRef<HTMLImageElement>(null),
    useRef<HTMLImageElement>(null),
    useRef<HTMLImageElement>(null),
    useRef<HTMLImageElement>(null),
  ];

  useGSAP(() => {
    if (!titleRef.current || !sectionRef.current) return;

    // Hero content animation
    if (heroContentRef.current) {
      gsap.fromTo(
        heroContentRef.current,
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power2.out",
        }
      );
    }

    // Title animation for properties grid
    gsap.fromTo(
      titleRef.current,
      { y: 200, scale: 0.4, opacity: 0 },
      {
        y: -50,
        scale: 1,
        opacity: 1,
        duration: 1.5,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "20% 65%",
          scrub: true,
        },
      }
    );

    imageRefs.forEach((imageRef, index) => {
      gsap.from(imageRef.current, {
        x: index % 2 === 1 ? -200 : 200,
        opacity: 0,
        duration: 1.2,
        scrollTrigger: {
          trigger: imageRef.current,
          start: "top bottom",
          end: "center center",
          scrub: true,
        },
      });
    });
  }, []);

  const articlesData = [
    {
      imageSrc: "/residencial/1.webp",
      title: "Residencia Espléndida",
      description:
        "Una residencia única con vistas impresionantes y comodidades modernas.",
    },
    {
      imageSrc: "/residencial/3.webp",
      title: "Elegancia y Estilo",
      description: "Apartamentos diseñados para garantizar el máximo confort.",
    },
    {
      imageSrc: "/residencial/2.webp",
      title: "Diseño Moderno",
      description: "Interiores espaciosos y acabados de alta calidad.",
    },
    {
      imageSrc: "/residencial/4.webp",
      title: "Vivir en el Lujo",
      description: "Una solución habitacional para quienes buscan lo mejor.",
    },
  ];

  return (
    <>
      {/* Hero Section Principal */}
      <section className="relative w-full flex flex-col items-center justify-center min-h-screen bg-background overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-12 gap-1 h-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-px bg-gradient-to-b from-muted/10 to-accent/10" />
            ))}
          </div>
        </div>

        <div ref={heroContentRef} className="container relative z-10 flex flex-col lg:flex-row items-center justify-between min-h-screen px-4 lg:px-20 py-20">
          {/* Left side - Text content */}
          <div className="flex-1 lg:max-w-3xl mb-16 lg:mb-0">

            {/* Main hero title */}
            <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold leading-[110%] tracking-tight text-foreground uppercase mb-8">
              Encuentra tu hogar perfecto
            </h1>

            {/* Circular text element */}
            <div className="relative mb-8 flex justify-center gap-8 ">
              <CircularText text="Propiedades en todo el terreno Nacional" />
              {/* Description text */}
            <p className="text-muted-foreground font-sofia-pro text-xl leading-relaxed max-w-lg mb-12">
              Nuestra marca internacional se especializa en tasación, ventas, compras e inversiones inmobiliarias. Confía en nosotros para brindarte un servicio excepcional y ayudarte a encontrar tu oportunidad inmobiliaria perfecta.
            </p>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => {
                document.getElementById('featured-properties')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-sofia-pro font-semibold text-lg hover:bg-primary/90 transition-all duration-300 flex items-center gap-2"
            >
              Explorar Propiedades
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
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
                  document.getElementById('featured-properties')?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </div>
          </div>
          
        </div>

        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-muted/20 to-transparent" />
      </section>

      {/* Properties Grid Section */}
      <section
        id="featured-properties"
        ref={sectionRef}
        className={cn(
          "relative w-full flex justify-center items-center",
          "min-h-fit",
          "bg-muted max-md:p-6 md:p-14"
        )}
      >
        <h2
          ref={titleRef}
          className={cn(
            "absolute top-0 left-auto",
            "text-center text-5xl md:text-7xl font-serif uppercase",
            "bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80 mb-10"
          )}
        >
          Propiedades Destacadas
        </h2>
        <section
          className={cn(
            "grid grid-cols-1 md:grid-cols-3 grid-rows-4",
            "w-full h-[minmax(800px,100%)] max-w-7xl",
            "mx-auto gap-y-4 md:gap-8 p-6 xl:py-20",
            "bg-background rounded-xl shadow-lg"
          )}
        >
          {articlesData.map((article, index) => (
            <Article
              key={index}
              index={index}
              imageSrc={article.imageSrc}
              title={article.title}
              description={article.description}
              className={cn(
                index === 0 &&
                "row-start-1 col-start-2 col-span-2 max-md:col-span-1",
                index === 1 &&
                "row-start-2 col-start-1 col-span-2 max-md:col-span-1",
                index === 2 &&
                "row-start-3 col-start-2 col-span-2 max-md:col-span-1",
                index === 3 &&
                "row-start-4 col-start-1 col-span-2 max-md:col-span-1"
              )}
              imageClassName="rounded-xl w-full h-full object-cover"
              imageRef={imageRefs[index] as React.RefObject<HTMLImageElement>}
            />
          ))}
        </section>
      </section>
    </>
  );
}

