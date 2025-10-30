"use client";

import { ArrowUpIcon } from "lucide-react";
import { CircularButton } from "../ui/circular-button";
import { ImageContainer } from "../ui/image-container";
import { SectionHeader, SectionWrapper } from "../ui/section-wrapper";

export function PropertyShowcaseSection() {
	return (
		<SectionWrapper className="bg-muted/30">
			<div className="container mx-auto px-4">
				{/* Section Header */}
				<SectionHeader
					description="Cada propiedad cuenta una historia única. Nuestro enfoque personalizado garantiza que encuentres no solo una casa, sino tu hogar perfecto."
					subtitle="Experiencia Premium"
					title="Descubre la Excelencia Inmobiliaria"
				/>

				{/* Right side - Property image */}
				<div className="relative flex flex-1 items-center justify-center pt-20">
					<ImageContainer
						alt="Propiedad de lujo con jardín y piscina"
						animateOnScroll={true}
						imageClassName="object-cover"
						initialSize="2xl"
						size="6xl"
						src="/optimized_villa/1.webp"
					/>
					{/* Circular action button */}
					<div className="absolute right-0 bottom-0 z-10">
						<CircularButton
							icon={<ArrowUpIcon className="text-black" />}
							onClick={() => {
								// Scroll to next section
								document
									.getElementById("team-section")
									?.scrollIntoView({ behavior: "smooth" });
							}}
						/>
					</div>
				</div>
			</div>
		</SectionWrapper>
	);
}
