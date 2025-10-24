"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { BackgroundVideo } from "../ui/background-video";
import { CircularText } from "../ui/circular-text";

export function HeroSection() {
	return (
		<>
			{/* Hero Section Principal */}
			<section className="relative w-full flex flex-col items-center justify-center min-h-screen overflow-hidden">
				{/* Background Video */}
				<BackgroundVideo src="/bg-video.webm" className="z-0" />

				{/* Dark overlay for better text readability */}
				<div className="absolute inset-0 bg-black/40 z-10" />

				<div className="container relative z-20 flex flex-col items-center justify-center min-h-screen px-4 text-center">
					{/* Main hero title */}
					<h1 className="font-serif text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold leading-[110%] tracking-tight text-white uppercase mb-8 max-w-5xl text-pretty">
						Encuentra <div>tu hogar</div> perfecto
					</h1>

					{/* Circular text element */}
					<div className="relative space-x-3">
						<CircularText
							className="max-lg:hidden float-left"
							text="Propiedades en todo el terreno Nacional"
							animate={true}
						/>
						{/* Description text */}
						<p className="text-white/90 text-pretty text-start font-sofia-pro text-xl leading-relaxed max-w-2xl mb-12">
							Nuestra marca internacional se especializa en tasación, ventas,
							compras e inversiones inmobiliarias. Confía en nosotros para
							brindarte un servicio excepcional y ayudarte a encontrar tu
							oportunidad inmobiliaria perfecta.
						</p>
					</div>

					{/* CTA Button */}
					<Link
						href="/properties"
						className="bg-primary group mx-auto w-fit text-primary-foreground px-8 py-4 rounded-full font-sofia-pro font-semibold text-lg hover:bg-primary/90 transition-all duration-300 flex items-center gap-2 shadow-2xl"
					>
						Explorar Propiedades
						<ArrowRight className="size-6 group-hover:-rotate-45 transition-all duration-200" />
					</Link>
				</div>
			</section>
		</>
	);
}
