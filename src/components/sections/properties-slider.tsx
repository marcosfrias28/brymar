"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/all";
import { Bath, Bed, MapPin, Square } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFeaturedProperties } from "@/hooks/use-featured-properties";

gsap.registerPlugin(ScrollTrigger);

type PropertyCardProps = {
	property: any;
	index: number;
	imageRef: React.RefObject<HTMLImageElement | null>;
};

function PropertyCard({ property, index, imageRef }: PropertyCardProps) {
	const formatPrice = (price: number, currency: string) =>
		new Intl.NumberFormat("es-ES", {
			style: "currency",
			currency,
			minimumFractionDigits: 0,
		}).format(price);

	return (
		<Card className="group relative overflow-hidden border-0 bg-background shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
			<div className="relative aspect-[4/3] overflow-hidden">
				<Image
					alt={property.title}
					className="object-cover transition-transform duration-300 group-hover:scale-110"
					fill
					ref={imageRef}
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					src={property.images?.[0] || "/placeholder.svg"}
				/>
				{property.featured && (
					<Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
						Destacada
					</Badge>
				)}
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
				<div className="absolute right-4 bottom-4 left-4">
					<h3 className="mb-1 line-clamp-1 font-semibold text-lg text-white">
						{property.title}
					</h3>
					<div className="flex items-center gap-1 text-sm text-white/90">
						<MapPin className="h-4 w-4" />
						<span className="line-clamp-1">{property.location}</span>
					</div>
				</div>
			</div>

			<CardContent className="p-4">
				<div className="mb-3 flex items-center justify-between">
					<span className="font-bold text-2xl text-primary">
						{formatPrice(property.price, property.currency)}
					</span>
					<Badge className="text-xs" variant="outline">
						{property.type === "house"
							? "Casa"
							: property.type === "apartment"
								? "Apartamento"
								: property.type === "villa"
									? "Villa"
									: "Propiedad"}
					</Badge>
				</div>

				<div className="mb-4 flex items-center gap-4 text-muted-foreground text-sm">
					<div className="flex items-center gap-1">
						<Bed className="h-4 w-4" />
						<span>{property.features?.bedrooms || 0}</span>
					</div>
					<div className="flex items-center gap-1">
						<Bath className="h-4 w-4" />
						<span>{property.features?.bathrooms || 0}</span>
					</div>
					<div className="flex items-center gap-1">
						<Square className="h-4 w-4" />
						<span>{property.features?.area || 0}m²</span>
					</div>
				</div>

				<p className="mb-4 line-clamp-2 text-muted-foreground text-sm">
					{property.description}
				</p>

				<Button asChild className="w-full">
					<Link href={`/properties/${property.id}`}>Ver Detalles</Link>
				</Button>
			</CardContent>
		</Card>
	);
}

export function PropertiesSlider() {
	const sectionRef = useRef<HTMLDivElement>(null);
	const titleRef = useRef<HTMLHeadingElement>(null);
	const { properties, loading, error } = useFeaturedProperties(6);

	// Create refs for each property image
	const imageRefs = Array.from({ length: 6 }, () =>
		useRef<HTMLImageElement | null>(null)
	);

	useGSAP(() => {
		if (!(titleRef.current && sectionRef.current)) {
			return;
		}

		// Animate title
		gsap.fromTo(
			titleRef.current,
			{ y: 100, opacity: 0 },
			{
				y: 0,
				opacity: 1,
				duration: 1,
				scrollTrigger: {
					trigger: sectionRef.current,
					start: "top 80%",
					end: "top 20%",
					scrub: true,
				},
			}
		);

		// Animate property cards
		imageRefs.forEach((imageRef, index) => {
			if (imageRef.current) {
				gsap.from(imageRef.current, {
					y: 100,
					opacity: 0,
					duration: 0.8,
					delay: index * 0.1,
					scrollTrigger: {
						trigger: imageRef.current,
						start: "top 85%",
						end: "top 50%",
						scrub: true,
					},
				});
			}
		});
	}, []);

	if (loading) {
		return (
			<section className="bg-muted/30 px-4 py-16">
				<div className="container mx-auto">
					<div className="mb-12 text-center">
						<h2 className="mb-4 font-bold text-3xl md:text-4xl">
							Propiedades Destacadas
						</h2>
						<p className="text-muted-foreground">
							Descubre nuestras mejores propiedades
						</p>
					</div>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }).map((_, index) => (
							<Card className="animate-pulse" key={index}>
								<div className="aspect-[4/3] bg-muted" />
								<CardContent className="p-4">
									<div className="mb-2 h-4 rounded bg-muted" />
									<div className="mb-4 h-3 rounded bg-muted" />
									<div className="h-8 rounded bg-muted" />
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<section className="bg-muted/30 px-4 py-16">
				<div className="container mx-auto text-center">
					<h2 className="mb-4 font-bold text-3xl md:text-4xl">
						Propiedades Destacadas
					</h2>
					<p className="text-muted-foreground">
						No se pudieron cargar las propiedades. Intenta nuevamente.
					</p>
				</div>
			</section>
		);
	}

	const displayProperties = properties || [];

	return (
		<section className="bg-muted/30 px-4 py-16" ref={sectionRef}>
			<div className="container mx-auto">
				<div className="mb-12 text-center">
					<h2 className="mb-4 font-bold text-3xl md:text-4xl" ref={titleRef}>
						Propiedades Destacadas
					</h2>
					<p className="mx-auto max-w-2xl text-muted-foreground">
						Descubre nuestra selección de propiedades premium, cuidadosamente
						elegidas para ofrecerte la mejor experiencia inmobiliaria.
					</p>
				</div>

				{displayProperties.length > 0 ? (
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{displayProperties
							.slice(0, 6)
							.map((property: any, index: number) => (
								<PropertyCard
									imageRef={imageRefs[index]}
									index={index}
									key={property.id}
									property={property}
								/>
							))}
					</div>
				) : (
					<div className="py-12 text-center">
						<p className="text-muted-foreground">
							No hay propiedades destacadas disponibles en este momento.
						</p>
					</div>
				)}

				{displayProperties.length > 0 && (
					<div className="mt-12 text-center">
						<Button asChild size="lg">
							<Link href="/search">Ver Todas las Propiedades</Link>
						</Button>
					</div>
				)}
			</div>
		</section>
	);
}
