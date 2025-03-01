"use client";

import { cn } from "@/lib/utils";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/all";
import { Article } from "../article";

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRefs = [
    useRef<HTMLImageElement>(null),
    useRef<HTMLImageElement>(null),
    useRef<HTMLImageElement>(null),
    useRef<HTMLImageElement>(null),
  ];

  useGSAP(() => {
    if (!titleRef.current || !sectionRef.current) return;

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
      title: "Splendida Residenza",
      description:
        "Una residenza unica con vista mozzafiato e comfort moderni.",
    },
    {
      imageSrc: "/residencial/3.webp",
      title: "Eleganza e Stile",
      description: "Appartamenti progettati per garantire il massimo comfort.",
    },
    {
      imageSrc: "/residencial/2.webp",
      title: "Design Moderno",
      description: "Interni spaziosi e rifiniture di alta qualità.",
    },
    {
      imageSrc: "/residencial/4.webp",
      title: "Vivere nel Lusso",
      description: "Una soluzione abitativa per chi cerca il meglio.",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative w-full flex justify-center items-center",
        "h-[275vh] max-xl:h-[225vh] min-h-fit",
        "bg-secondarybackground max-md:p-6 md:p-14"
      )}
    >
      <h2
        ref={titleRef}
        className={cn(
          "absolute top-0 left-auto",
          "text-center text-5xl md:text-7xl font-serif uppercase",
          "bg-clip-text text-transparent bg-aurora mb-10"
        )}
      >
        Marbry Inmobiliaria
      </h2>
      <section
        className={cn(
          "grid grid-cols-1 md:grid-cols-3 grid-rows-4",
          "w-full h-[calc(100%-120px)] max-w-screen-2xl",
          "mx-auto gap-y-4 md:gap-8 p-6 xl:py-20",
          "bg-secondary-foreground rounded-xl"
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
  );
}
