"use client";

import React from "react";

import { Italianno } from "next/font/google";
import { WavyBackground } from "../../ui/wavy-background";
import { IntroPropertiesMarquee } from "./intro-properties-marquee";
import { IntroTitle } from "./intro-title";
import { IntroCTA } from "./intro-cta";

const italianno = Italianno({ subsets: ["latin"], weight: ["400"] });

export const Intro = () => {
  const title = "Encuentra tu hogar perfecto";
  const name = "BRYMAR";
  const subtitle = "Propiedades de lujo y exclusivas";
  const cta = "Explorar Propiedades";

  const WordsStyle = "bg-clip-text text-transparent bg-aurora bg-clip-text";
  return (
    <section className="relative w-screen min-h-fit h-[150dvh] xl:mt-36 text-center bg-black">
      <IntroTitle name={name} subtitle={subtitle} />
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
        <IntroCTA
          title={title}
          cta={cta}
          WordsStyle={WordsStyle}
          italianno={italianno}
        />
      </WavyBackground>
      <IntroPropertiesMarquee />
    </section>
  );
};
