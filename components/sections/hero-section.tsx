"use client";

import { cn } from "@/lib/utils";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/all";
import { useTranslation } from "react-i18next";
import Article from "./article";

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
        "w-full h-[275vh] max-xl:h-[225vh] min-h-fit",
        "bg-secondarybackground max-md:p-6 md:p-14 max-md:mt-20 p-20"
      )}
    >
      <h2
        ref={titleRef}
        className={cn(
          "text-center",
          "text-5xl md:text-7xl font-serif uppercase bg-clip-text text-transparent bg-aurora"
        )}
      >
        Marbry Inmobiliaria
      </h2>
      <div className="relative bg-secondary-foreground max-w-screen-xl mx-auto w-full h-full rounded-xl">
        {articlesData.map((article, index) => (
          <Article
            key={index}
            index={index}
            imageSrc={article.imageSrc}
            title={article.title}
            description={article.description}
            className={cn(
              index === 3 && "top-[3%] -left-72 lg:-left-32",
              index === 2 && "top-[27%] -right-72 lg:-right-32",
              index === 1 && "bottom-[27%] -left-72 lg:-left-32",
              index === 0 && "bottom-[3%] -right-72 lg:-right-32"
            )}
            imageClassName="rounded-xl w-[600px] md:w-[900px] lg:w-[1100px] h-full aspect-video"
            imageRef={imageRefs[index] as React.RefObject<HTMLImageElement>}
          />
        ))}
      </div>
    </section>
  );
}
