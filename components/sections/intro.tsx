"use client";

import React, { useEffect } from "react";
import Marquee from "../ui/marquee";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "../ui/card";
import { useLangStore } from "@/utils/store/lang-store";
import { HeroSectionTranslations } from "@/lib/translations";
import { useTheme } from "next-themes";
import { Italianno } from "next/font/google";
import { WavyBackground } from "../ui/wavy-background";
import ShineBorder from "../ui/shine-border";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "../ui/button";
import Image from "next/image";
import { motion } from "framer-motion";
import { PropertyCard } from "../property/property-card";

const SELLING_PROPERTIES = [
  {
    id: "sadlkjnfha",
    imgSrc: "/villa/1.jpg",
    baths: 3,
    beds: 3,
    area: 100,
    price: 1000,
    location: "Dominicus, Bayahibe, La Altagracia, DO",
    name: "Villa 1",
  },
  {
    id: "4414safasd",
    imgSrc: "/villa/2.jpg",
    baths: 3,
    beds: 3,
    area: 100,
    price: 1000,
    location: "Dominicus, Bayahibe, La Altagracia, DO",
    name: "Villa 2",
  },
  {
    id: "asffqwwer",
    imgSrc: "/villa/3.jpg",
    baths: 3,
    beds: 3,
    area: 100,
    price: 1000,
    location: "Dominicus, Bayahibe, La Altagracia, DO",
    name: "Villa 3",
  },
  {
    id: "asdfas124qwer",
    imgSrc: "/villa/4.jpg",
    baths: 3,
    beds: 3,
    area: 100,
    price: 1000,
    location: "Dominicus, Bayahibe, La Altagracia, DO",
    name: "Villa 4",
  },
  {
    id: "asdfqwer",
    imgSrc: "/villa2/1.jpg",
    baths: 3,
    beds: 3,
    area: 100,
    price: 1000,
    location: "Dominicus, Bayahibe, La Altagracia, DO",
    name: "Villa 5",
  },
  {
    id: "asdfqwer413rr",
    imgSrc: "/villa2/2.jpg",
    baths: 3,
    beds: 3,
    area: 100,
    price: 1000,
    location: "Dominicus, Bayahibe, La Altagracia, DO",
    name: "Villa 6",
  },
  {
    id: "fqwer413rr",
    imgSrc: "/villa2/3.jpg",
    baths: 3,
    beds: 3,
    area: 100,
    price: 1000,
    location: "Dominicus, Bayahibe, La Altagracia, DO",
    name: "Villa 7",
  },
  {
    id: "asd2313rr",
    imgSrc: "/villa2/4.jpg",
    baths: 3,
    beds: 3,
    area: 100,
    price: 1000,
    location: "Dominicus, Bayahibe, La Altagracia, DO",
    name: "Villa 8",
  },
  {
    id: "as23411134wer",
    imgSrc: "/villa3/1.jpg",
    baths: 3,
    beds: 3,
    area: 100,
    price: 1000,
    location: "Dominicus, Bayahibe, La Altagracia, DO",
    name: "Villa 8",
  },
  {
    id: "a534gfasdf2313rr",
    imgSrc: "/villa3/2.jpg",
    baths: 3,
    beds: 3,
    area: 100,
    price: 1000,
    location: "Dominicus, Bayahibe, La Altagracia, DO",
    name: "Villa 8",
  },
  {
    id: "sadfasdavc",
    imgSrc: "/villa3/3.jpg",
    baths: 3,
    beds: 3,
    area: 100,
    price: 1000,
    location: "Dominicus, Bayahibe, La Altagracia, DO",
    name: "Villa 8",
  },
  {
    id: "sdfaskku822",
    imgSrc: "/villa3/4.jpg",
    baths: 3,
    beds: 3,
    area: 100,
    price: 1000,
    location: "Dominicus, Bayahibe, La Altagracia, DO",
    name: "Villa 8",
  },
];
const italianno = Italianno({ subsets: ["latin"], weight: ["400"] });

export const Intro = () => {
  const language = useLangStore((prev) => prev.language);
  const { title, name, subtitle, cta } = HeroSectionTranslations[language];
  const introPhrase = [...title.split(" ")];
  const firstWord = introPhrase.shift();
  const lastWord = introPhrase.pop();

  const WordsStyle = "bg-clip-text text-transparent bg-aurora bg-clip-text";
  return (
    <section className="relative w-screen min-h-fit h-[150dvh] mt-36 text-center bg-black">
      <div className="w-full h-fit text-center text-foreground px-4 z-10 pt-20 pb-10 bg-background">
        <motion.h1
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
          className="font-extrabold font-serif uppercase text-4xl"
        >
          {name}
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.5,
            ease: "easeInOut",
          }}
          className="font-extrabold font-sans opacity-50 uppercase text-sm"
        >
          {subtitle}
        </motion.h2>
      </div>
      <WavyBackground
        waveWidth={100}
        blur={0}
        waveOpacity={0.8}
        colors={[
          "hsl(213, 12%, 25%)",
          "hsl(220, 10%, 40%)",
          "hsl(24, 24%, 75%)",
          "hsl(162, 27%, 90%)",
        ]}
        containerClassName="h-1/3 row-start-2 z-0 max-lg:my-20"
        className="w-[110dvw] z-20"
        speed="slow"
      >
        <section className="relative text-white flex max-w-4xl flex-col items-center text-center mx-auto">
          <div className="pointer-events-none px-10">
            <p
              className={cn(
                "font-sans font-black desktop:text-8xl smartphone:text-7xl smartphonexs:text-4xl",
                "text-pretty"
              )}
            >
              <span
                className={cn(WordsStyle, "font-thin font-serif bg-aurora")}
              >
                {firstWord?.concat(" ")}
              </span>
              <span>{introPhrase.join(" ").concat(" ")}</span>
            </p>
            <span
              className={cn(
                italianno.className,
                "text-[250px] tablet:text-[350px] smartphonexs:text-[200px] inline-block -mt-56 max-md:-mt-32 -mb-48",
                WordsStyle
              )}
            >
              {lastWord}
            </span>
          </div>
          <Link href="/search">
            <Button
              variant="outline"
              className={cn(
                "relative",
                "smartphonexs:mt-4 p-6 text-3xl smartphonexs:text-xl self-center",
                "border-white rounded-lg text-foreground",
                "hover:transition-all active:border-green-800 bg-background"
              )}
            >
              <span>{cta}</span>
            </Button>
          </Link>
        </section>
      </WavyBackground>
      <div className="h-1/3 w-screen">
        <Marquee reverse>
          {SELLING_PROPERTIES.slice(
            0,
            Math.ceil(SELLING_PROPERTIES.length / 2)
          ).map(({ id, imgSrc, name, location, beds, baths, price, area }) => (
            <PropertyCard
              key={id}
              id={id}
              sqm={area}
              imageUrl={imgSrc}
              title={name}
              location={location}
              bedrooms={beds}
              bathrooms={baths}
              price={price}
            />
          ))}
        </Marquee>
      </div>
      <div className="h-1/3 w-screen">
        <Marquee>
          {SELLING_PROPERTIES.slice(SELLING_PROPERTIES.length / 2).map(
            (
              { id, imgSrc, name, location, beds, baths, price, area },
              index
            ) => (
              <PropertyCard
                key={id}
                id={id}
                sqm={area}
                imageUrl={imgSrc}
                title={name}
                location={location}
                bedrooms={beds}
                bathrooms={baths}
                price={price}
              />
            )
          )}
        </Marquee>
      </div>
    </section>
  );
};
