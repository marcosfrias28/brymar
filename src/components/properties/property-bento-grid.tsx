"use client";

import { Bath, Bed, Edit, Eye, MapPin, Square } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Property = {
	id: string;
	title: string;
	type: string;
	price: number;
	bedrooms: number;
	bathrooms: number;
	area: number;
	location: string;
	description: string;
	images: string[];
	createdAt: string;
	featured?: boolean;
};

type PropertyBentoGridProps = {
	properties: Property[];
};

export function PropertyBentoGrid({ properties }: PropertyBentoGridProps) {
	const formatPrice = (price: number) =>
		new Intl.NumberFormat("es-DO", {
			style: "currency",
			currency: "DOP",
			minimumFractionDigits: 0,
		}).format(price);

	// Create bento layout pattern
	const getBentoClass = (index: number) => {
		const patterns = [
			"col-span-1 row-span-1", // Small
			"col-span-2 row-span-1", // Wide
			"col-span-1 row-span-2", // Tall
			"col-span-1 row-span-1", // Small
			"col-span-1 row-span-1", // Small
			"col-span-2 row-span-2", // Large
		];
		return patterns[index % patterns.length];
	};

	const getImageHeight = (index: number) => {
		const patterns = [
			"h-48", // Small
			"h-48", // Wide
			"h-80", // Tall
			"h-48", // Small
			"h-48", // Small
			"h-80", // Large
		];
		return patterns[index % patterns.length];
	};

	return (
		<div className="grid auto-rows-max desktop:grid-cols-3 grid-cols-1 tablet:grid-cols-2 widescreen:grid-cols-4 gap-4">
			{properties.map((property, index) => (
				<Card
					className={`${getBentoClass(index)} group overflow-hidden transition-all duration-300 hover:shadow-xl`}
					key={property.id}
				>
					<div className="relative">
						<div
							className={`relative ${getImageHeight(index)} overflow-hidden`}
						>
							<Image
								alt={property.title}
								className="object-cover transition-transform duration-300 group-hover:scale-105"
								fill
								src={property.images[0] || "/placeholder.svg"}
							/>

							{/* Overlays */}
							<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

							{/* Badges */}
							<div className="absolute top-3 left-3 flex gap-2">
								{property.featured && (
									<Badge className="border-0 bg-gradient-aurora text-white">
										Destacada
									</Badge>
								)}
								<Badge
									className={`${
										property.type === "sale"
											? "bg-arsenic text-white"
											: "bg-blackCoral text-white"
									} border-0`}
								>
									{property.type === "sale" ? "Venta" : "Alquiler"}
								</Badge>
							</div>

							{/* Actions */}
							<div className="absolute top-3 right-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
								<Button asChild size="sm" variant="secondary">
									<Link href={`/dashboard/properties/${property.id}`}>
										<Eye className="h-4 w-4" />
									</Link>
								</Button>
								<Button asChild size="sm" variant="secondary">
									<Link href={`/dashboard/properties/${property.id}/edit`}>
										<Edit className="h-4 w-4" />
									</Link>
								</Button>
							</div>

							{/* Price */}
							<div className="absolute bottom-3 left-3 text-white">
								<div className="font-bold text-xl">
									{formatPrice(property.price)}
									{property.type === "rent" && (
										<span className="font-normal text-sm">/mes</span>
									)}
								</div>
							</div>
						</div>

						{/* Content */}
						<div className="space-y-3 p-4">
							<div>
								<h3 className="mb-1 line-clamp-1 font-semibold font-serif text-arsenic">
									{property.title}
								</h3>
								<div className="mb-2 flex items-center text-blackCoral text-sm">
									<MapPin className="mr-1 h-3 w-3" />
									<span className="line-clamp-1">{property.location}</span>
								</div>
							</div>

							{/* Property Details */}
							<div className="flex justify-between text-blackCoral text-xs">
								<div className="flex items-center gap-1">
									<Bed className="h-3 w-3" />
									{property.bedrooms}
								</div>
								<div className="flex items-center gap-1">
									<Bath className="h-3 w-3" />
									{property.bathrooms}
								</div>
								<div className="flex items-center gap-1">
									<Square className="h-3 w-3" />
									{property.area}m²
								</div>
							</div>
						</div>
					</div>
				</Card>
			))}
		</div>
	);
}
