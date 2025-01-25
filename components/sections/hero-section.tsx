"use client";

import { useLangStore } from "@/utils/store/lang-store";
import { HeroSectionTranslations } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/all";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  language: AvailableLanguages;
}

interface ArticleProps {
  imageSrc: string;
  title: string;
  description: string;
  imageRef: React.RefObject<HTMLImageElement>;
}

const Article = ({ imageSrc, title, description, imageRef }: ArticleProps) => {
  return (
    <article className="flex flex-row w-full hover:scale-105 rounded-xl transition-transform duration-500 overflow-hidden">
      <Image
        ref={imageRef}
        src={imageSrc}
        alt={title}
        height={0}
        width={0}
        className="w-1/2 h-fit"
      />
      <div className="p-4">
        <h1 className="text-lg font-bold mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </article>
  );
};

export function HeroSection({ language }: HeroSectionProps) {
  const { title, subtitle, cta } = HeroSectionTranslations[language];

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
      { y: 500, scale: 0.9, opacity: 0 },
      {
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 1.5,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "center center",
          scrub: true,
        },
      }
    );

    imageRefs.forEach((imageRef, index) => {
      gsap.from(imageRef.current, {
        x: index % 2 === 0 ? -200 : 200,
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
      imageSrc: "/residencial/2.webp",
      title: "Eleganza e Stile",
      description: "Appartamenti progettati per garantire il massimo comfort.",
    },
    {
      imageSrc: "/residencial/3.webp",
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
        "relative w-full min-h-screen",
        "bg-secondarybackground p-20"
      )}
    >
      <h2
        ref={titleRef}
        className={cn(
          "sticky top-20 z-20 text-center py-5",
          "text-9xl font-serif uppercase bg-clip-text text-transparent bg-aurora"
        )}
      >
        {title}
      </h2>

      <div className="grid grid-rows-4 gap-6 mt-10">
        {articlesData.map((article, index) => (
          <Article
            key={index}
            imageSrc={article.imageSrc}
            title={article.title}
            description={article.description}
            imageRef={imageRefs[index] as React.RefObject<HTMLImageElement>}
          />
        ))}
      </div>
    </section>
  );
}
