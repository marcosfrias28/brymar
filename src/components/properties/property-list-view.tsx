"use client";

import { Bath, Bed, Calendar, Edit, Eye, MapPin, Square } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

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

type PropertyListViewProps = {
	properties: Property[];
};

export function PropertyListView({ properties }: PropertyListViewProps) {
	const formatPrice = (price: number) =>
		new Intl.NumberFormat("es-DO", {
			style: "currency",
			currency: "DOP",
			minimumFractionDigits: 0,
		}).format(price);

	return (
		<div className="space-y-4">
			{properties.map((property) => (
				<Card
					className="p-6 transition-shadow hover:shadow-lg"
					key={property.id}
				>
					<div className="flex desktop:flex-row flex-col gap-6">
						{/* Image */}
						<div className="relative h-48 desktop:w-80 w-full flex-shrink-0">
							<Image
								alt={property.title}
								className="rounded-lg object-cover"
								fill
								src={property.images[0] || "/placeholder.svg"}
							/>
							{property.featured && (
								<Badge className="absolute top-2 left-2 bg-gradient-aurora text-white">
									Destacada
								</Badge>
							)}
							<Badge
								className={`absolute top-2 right-2 ${
									property.type === "sale"
										? "bg-arsenic text-white"
										: "bg-blackCoral text-white"
								}`}
							>
								{property.type === "sale" ? "Venta" : "Alquiler"}
							</Badge>
						</div>

						{/* Content */}
						<div className="flex-1 space-y-4">
							<div>
								<h3 className="mb-2 font-semibold font-serif text-arsenic text-xl">
									{property.title}
								</h3>
								<div className="mb-2 flex items-center text-blackCoral">
									<MapPin className="mr-1 h-4 w-4" />
									{property.location}
								</div>
								<p className="line-clamp-2 text-blackCoral/80 text-sm">
									<MarkdownRenderer
										className="text-blackCoral/80 text-sm"
										content={property.description}
										variant="compact"
									/>
								</p>
							</div>

							{/* Property Details */}
							<div className="flex flex-wrap gap-4 text-blackCoral text-sm">
								<div className="flex items-center gap-1">
									<Bed className="h-4 w-4" />
									{property.bedrooms} hab.
								</div>
								<div className="flex items-center gap-1">
									<Bath className="h-4 w-4" />
									{property.bathrooms} baños
								</div>
								<div className="flex items-center gap-1">
									<Square className="h-4 w-4" />
									{property.area} m²
								</div>
								<div className="flex items-center gap-1">
									<Calendar className="h-4 w-4" />
									{new Date(property.createdAt).toLocaleDateString("es-DO")}
								</div>
							</div>

							{/* Price and Actions */}
							<div className="flex flex-col items-start justify-between gap-4 smartphone:flex-row smartphone:items-center">
								<div className="font-bold text-2xl text-arsenic">
									{formatPrice(property.price)}
									{property.type === "rent" && (
										<span className="font-normal text-sm">/mes</span>
									)}
								</div>

								<div className="flex gap-2">
									<Button asChild size="sm" variant="outline">
										<Link href={`/dashboard/properties/${property.id}`}>
											<Eye className="mr-1 h-4 w-4" />
											Ver
										</Link>
									</Button>
									<Button asChild size="sm" variant="outline">
										<Link href={`/dashboard/properties/${property.id}/edit`}>
											<Edit className="mr-1 h-4 w-4" />
											Editar
										</Link>
									</Button>
								</div>
							</div>
						</div>
					</div>
				</Card>
			))}
		</div>
	);
}
