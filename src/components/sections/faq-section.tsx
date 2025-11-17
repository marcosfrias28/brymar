"use client";

import { HelpCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useSection } from "@/hooks/use-static-content";
import { FAQSkeleton } from "../skeletons/home/faq-skeleton";
import { SectionHeader, SectionWrapper } from "../ui/section-wrapper";

// Preparado para i18n - Solo 4 FAQ principales
const faqData = [
	{
		id: "faq-1",
		question: "¿Puedo personalizar mi propiedad ideal?",
		answer:
			"Absolutamente. En Marbry Inmobiliaria trabajamos contigo para encontrar propiedades que se adapten perfectamente a tus necesidades específicas, desde apartamentos de lujo hasta villas espaciosas, todo personalizado según tus preferencias y presupuesto.",
	},
	{
		id: "faq-3",
		question: "¿Cuáles son los pasos para comprar con Marbry?",
		answer:
			"Nuestro proceso es simple: 1) Consulta inicial gratuita para entender tus necesidades, 2) Búsqueda personalizada de propiedades, 3) Visitas guiadas a propiedades seleccionadas, 4) Negociación y asesoría legal, 5) Cierre exitoso con soporte completo.",
	},
	{
		id: "faq-4",
		question: "¿Qué hace diferente a Marbry Inmobiliaria?",
		answer:
			"Nuestra combinación única de experiencia local, tecnología avanzada, servicio personalizado y red de contactos exclusiva. Cada cliente recibe atención VIP con acceso a propiedades off-market y asesoría experta durante todo el proceso.",
	},
];

// Imágenes para el lado derecho - Grid corregido
const propertyImages = [
	{
		id: 1,
		src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
		alt: "Villa moderna con piscina",
		className: "col-span-1 row-span-1", // Primera imagen: 1 columna, 1 fila
	},
	{
		id: 2,
		src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop",
		alt: "Interior de apartamento de lujo",
		className: "col-span-1 row-span-1", // Segunda imagen: 1 columna, 1 fila
	},
	{
		id: 3,
		src: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop",
		alt: "Oficina moderna",
		className: "col-span-2 row-span-1", // Tercera imagen: 2 columnas, 1 fila
	},
];

// Componente separado para el header que usa el hook
function FAQSectionHeader() {
	const { data: section, loading: isLoading } = useSection("home", "faq");

	if (isLoading) {
		return (
			<div className="animate-pulse space-y-4 text-center">
				<div className="mx-auto h-4 w-1/4 rounded bg-muted" />
				<div className="mx-auto h-8 w-1/2 rounded bg-muted" />
				<div className="mx-auto h-4 w-3/4 rounded bg-muted" />
			</div>
		);
	}

	const subtitle = section?.subtitle || "FAQs";
	const title = section?.title || "Todo sobre Marbry Inmobiliaria";
	const description =
		section?.description ||
		"Sabemos que comprar, vender o invertir en bienes raíces puede ser abrumador. Aquí tienes las preguntas más frecuentes para guiarte en el proceso.";

	return (
		<SectionHeader
			description={description}
			icon={
				<svg
					aria-hidden="true"
					className="text-2xl text-primary"
					height="1em"
					role="img"
					viewBox="0 0 256 256"
					width="1em"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M224 120v96a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8v-96a15.87 15.87 0 0 1 4.69-11.32l80-80a16 16 0 0 1 22.62 0l80 80A15.87 15.87 0 0 1 224 120"
						fill="currentColor"
					/>
				</svg>
			}
			subtitle={subtitle}
			title={title}
		/>
	);
}

export function FAQSection() {
	const { data: section, loading: isLoading } = useSection("home", "faq");

	if (isLoading) {
		return <FAQSkeleton />;
	}

	// Use static FAQ data
    const displayFAQs = section?.content?.faqs || faqData;
    const faqList = Array.isArray(displayFAQs) ? displayFAQs : faqData;

	return (
		<SectionWrapper className="bg-muted/30">
			{/* Header centrado arriba */}
			<FAQSectionHeader />

			{/* Grid con FAQ a la izquierda e imágenes a la derecha */}
			<div className="mt-12 grid grid-cols-12 items-start gap-10">
				{/* FAQ Accordion - Izquierda */}
				<div className="col-span-12 lg:col-span-7">
					<Accordion
						className="w-full space-y-6"
						collapsible
						defaultValue="faq-1"
						type="single"
					>
                        {faqList.map((faq: any, index: number) => (
							<AccordionItem
								className="overflow-hidden rounded-2xl border-0 bg-background/60 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md"
								key={faq.id}
								value={faq.id}
							>
								<AccordionTrigger className="accordion-trigger px-6 py-6 text-left font-semibold text-foreground text-xl transition-colors hover:text-primary hover:no-underline [&[data-state=open]>div>span:first-child]:bg-primary [&[data-state=open]>div>span:first-child]:text-primary-foreground">
									<div className="flex w-full items-start gap-4">
										<span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-sm transition-all duration-300">
											{index + 1}
										</span>
										<span className="flex-1 text-left">{faq.question}</span>
									</div>
								</AccordionTrigger>
								<AccordionContent className="accordion-content px-6 pt-0 pb-6 pl-16 text-base text-muted-foreground leading-relaxed">
									<div className="pt-2">{faq.answer}</div>
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>

					{/* CTA debajo de los FAQ */}
					<div className="mt-12 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10 p-8 backdrop-blur-sm">
						<div className="text-center">
							<div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
								<HelpCircle className="h-8 w-8 text-primary" />
							</div>
							<h4 className="mb-3 font-semibold text-2xl">
								¿Tienes más preguntas?
							</h4>
							<p className="mx-auto mb-6 max-w-md text-lg text-muted-foreground">
								Nuestro equipo está listo para resolver todas tus dudas sobre
								bienes raíces.
							</p>
							<div className="flex flex-col justify-center gap-4 sm:flex-row">
								<Link href="/contact">
									<Button size="lg">Contactar Experto</Button>
								</Link>
								<Button size="lg" variant="outline">
									Ver Más FAQs
								</Button>
							</div>
						</div>
					</div>
				</div>

				{/* Imágenes Grid - Derecha */}
				<div className="col-span-12 lg:col-span-5">
					<div className="grid h-[800px] grid-cols-2 grid-rows-2 gap-10">
						{propertyImages.map((image) => (
							<div
								className={`${image.className} pointer-events-none relative cursor-none overflow-hidden rounded-2xl`}
								key={image.id}
							>
								<Image
									alt={image.alt}
									className="object-cover"
									fill
									src={image.src}
								/>
							</div>
						))}
					</div>
				</div>
			</div>
		</SectionWrapper>
	);
}
