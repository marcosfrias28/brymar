"use client";

import { Bath, Bed, Eye, Heart, MapPin, Square } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data for favorite properties - replace with actual user favorites
const favoriteProperties = [
	{
		id: 1,
		title: "Villa Moderna en Punta Cana",
		location: "Punta Cana, República Dominicana",
		price: "$850,000",
		image: "/optimized_villa/1.webp",
		beds: 4,
		baths: 3,
		area: "320 m²",
		status: "sale",
		addedToFavorites: "Hace 2 días",
	},
	{
		id: 2,
		title: "Apartamento Frente al Mar",
		location: "Bávaro, República Dominicana",
		price: "$450,000",
		image: "/optimized_villa2/1.webp",
		beds: 2,
		baths: 2,
		area: "150 m²",
		status: "sale",
		addedToFavorites: "Hace 1 semana",
	},
	{
		id: 3,
		title: "Casa Colonial en Santo Domingo",
		location: "Zona Colonial, Santo Domingo",
		price: "$320,000",
		image: "/optimized_villa3/1.webp",
		beds: 3,
		baths: 2,
		area: "200 m²",
		status: "sale",
		addedToFavorites: "Hace 2 semanas",
	},
];

export function FavoriteProperties() {
	const getStatusBadge = (status: string) => {
		switch (status) {
			case "sale":
				return (
					<Badge className="border-green-200 bg-green-100 text-green-800">
						En Venta
					</Badge>
				);
			case "rent":
				return (
					<Badge className="border-blue-200 bg-blue-100 text-blue-800">
						En Alquiler
					</Badge>
				);
			case "sold":
				return (
					<Badge className="border-gray-200 bg-gray-100 text-gray-800">
						Vendida
					</Badge>
				);
			default:
				return (
					<Badge className="border-gray-200 bg-gray-100 text-gray-800">
						Disponible
					</Badge>
				);
		}
	};

	return (
		<Card className="border-blackCoral shadow-lg">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-arsenic">
					<Heart className="h-5 w-5 text-red-500" />
					Propiedades Favoritas
				</CardTitle>
			</CardHeader>
			<CardContent>
				{favoriteProperties.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<Heart className="mx-auto mb-4 h-12 w-12 text-gray-300" />
						<p>No tienes propiedades favoritas aún</p>
						<Button asChild className="mt-4" variant="outline">
							<Link href="/search">Explorar Propiedades</Link>
						</Button>
					</div>
				) : (
					<div className="space-y-4">
						{favoriteProperties.map((property) => (
							<div
								className="flex gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
								key={property.id}
							>
								<div className="relative h-24 w-24 flex-shrink-0">
									<Image
										alt={property.title}
										className="rounded-md object-cover"
										fill
										src={property.image}
									/>
								</div>
								<div className="min-w-0 flex-1">
									<div className="mb-2 flex items-start justify-between">
										<div>
											<h3 className="truncate font-semibold text-sm">
												{property.title}
											</h3>
											<p className="mt-1 flex items-center gap-1 text-muted-foreground text-xs">
												<MapPin className="h-3 w-3" />
												{property.location}
											</p>
										</div>
										{getStatusBadge(property.status)}
									</div>

									<div className="mb-2 flex items-center gap-3 text-muted-foreground text-xs">
										<span className="flex items-center gap-1">
											<Bed className="h-3 w-3" />
											{property.beds}
										</span>
										<span className="flex items-center gap-1">
											<Bath className="h-3 w-3" />
											{property.baths}
										</span>
										<span className="flex items-center gap-1">
											<Square className="h-3 w-3" />
											{property.area}
										</span>
									</div>

									<div className="flex items-center justify-between">
										<span className="font-bold text-primary">
											{property.price}
										</span>
										<div className="flex gap-2">
											<Button asChild size="sm" variant="outline">
												<Link href={`/properties/${property.id}`}>
													<Eye className="mr-1 h-3 w-3" />
													Ver
												</Link>
											</Button>
											<Button
												className="text-red-500 hover:text-red-700"
												size="sm"
												variant="ghost"
											>
												<Heart className="h-3 w-3" fill="currentColor" />
											</Button>
										</div>
									</div>

									<p className="mt-2 text-muted-foreground text-xs">
										Agregado a favoritos {property.addedToFavorites}
									</p>
								</div>
							</div>
						))}

						<div className="border-t pt-4">
							<Button asChild className="w-full" variant="outline">
								<Link href="/search">Ver Todas las Propiedades</Link>
							</Button>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
