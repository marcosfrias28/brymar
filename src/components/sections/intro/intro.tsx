"use client";

import { Italianno } from "next/font/google";
import { WavyBackground } from "../../ui/wavy-background";
import { IntroCTA } from "./intro-cta";
import { IntroPropertiesMarquee } from "./intro-properties-marquee";
import { IntroTitle } from "./intro-title";

const italianno = Italianno({ subsets: ["latin"], weight: ["400"] });

export const Intro = () => {
	const title = "Encuentra tu hogar perfecto";
	const name = "BRYMAR";
	const subtitle = "Propiedades de lujo y exclusivas";
	const cta = "Explorar Propiedades";

	const WordsStyle = "bg-clip-text text-transparent bg-primary bg-clip-text";
	return (
		<section className="relative h-[150dvh] min-h-fit w-screen bg-black text-center xl:mt-36">
			<IntroTitle name={name} subtitle={subtitle} />
			<WavyBackground
				blur={0}
				className="z-20 w-[110dvw]"
				colors={[
					"hsl(213, 12%, 25%)",
					"hsl(220, 10%, 40%)",
					"hsl(24, 24%, 75%)",
					"hsl(162, 27%, 90%)",
				]}
				containerClassName="h-1/3 row-start-2 z-0 max-lg:my-20"
				speed="slow"
				waveOpacity={0.8}
				waveWidth={100}
			>
				<IntroCTA
					cta={cta}
					italianno={italianno}
					title={title}
					WordsStyle={WordsStyle}
				/>
			</WavyBackground>
			<IntroPropertiesMarquee />
		</section>
	);
};
