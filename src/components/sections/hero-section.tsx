"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { BackgroundVideo } from "../ui/background-video";
import { CircularText } from "../ui/circular-text";

export function HeroSection() {
	return (
		<>
			{/* Hero Section Principal */}
			<section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden">
				{/* Background Video */}
				<BackgroundVideo className="z-0" src="/bg-video.webm" />

				{/* Dark overlay for better text readability */}
				<div className="absolute inset-0 z-10 bg-black/40" />

				<div className="container relative z-20 flex min-h-screen flex-col items-center justify-center px-4 text-center">
					{/* Main hero title */}
					<h1 className="mb-8 max-w-5xl text-pretty font-bold font-serif text-6xl text-white uppercase leading-[110%] tracking-tight md:text-7xl lg:text-8xl xl:text-9xl">
						Encuentra <div>tu hogar</div> perfecto
					</h1>

					{/* Circular text element */}
					<div className="relative space-x-3">
						<CircularText
							animate={true}
							className="float-left max-lg:hidden"
							text="Propiedades en todo el terreno Nacional"
						/>
						{/* Description text */}
						<p className="mb-12 max-w-2xl text-pretty text-start font-sofia-pro text-white/90 text-xl leading-relaxed">
							Nuestra marca internacional se especializa en tasación, ventas,
							compras e inversiones inmobiliarias. Confía en nosotros para
							brindarte un servicio excepcional y ayudarte a encontrar tu
							oportunidad inmobiliaria perfecta.
						</p>
					</div>

					{/* CTA Button */}
					<Link
						className="group mx-auto flex w-fit items-center gap-2 rounded-full bg-primary px-8 py-4 font-semibold font-sofia-pro text-lg text-primary-foreground shadow-2xl transition-all duration-300 hover:bg-primary/90"
						href="/properties"
					>
						Explorar Propiedades
						<ArrowRight className="group-hover:-rotate-45 size-6 transition-all duration-200" />
					</Link>
				</div>
			</section>
		</>
	);
}
