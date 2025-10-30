"use client";

import { motion } from "framer-motion";
import { ArrowRight, Bath, Bed, MapPin, Square } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const properties = [
	{
		id: 1,
		title: "Opulent Oceanfront Villa",
		location: "Malibu, California",
		price: "$25,000,000",
		image:
			"https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
		beds: 6,
		baths: 8,
		area: "10,000 sq ft",
		description:
			"Breathtaking oceanfront villa with panoramic views, infinity pool, and private beach access.",
	},
	{
		id: 2,
		title: "Majestic Mountain Retreat",
		location: "Aspen, Colorado",
		price: "$18,500,000",
		image:
			"https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
		beds: 5,
		baths: 7,
		area: "8,500 sq ft",
		description:
			"Luxurious mountain home with ski-in/ski-out access, home theater, and stunning mountain views.",
	},
	{
		id: 3,
		title: "Urban Penthouse Oasis",
		location: "New York City, New York",
		price: "$32,000,000",
		image:
			"https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
		beds: 4,
		baths: 5,
		area: "6,500 sq ft",
		description:
			"Spectacular penthouse with 360-degree city views, private terrace, and state-of-the-art smart home features.",
	},
];

export default function FeaturedProperties() {
	return (
		<section className="bg-gray-50 px-4 py-24">
			<div className="container mx-auto">
				<motion.h2
					animate={{ opacity: 1, y: 0 }}
					className="mb-4 text-center font-bold text-4xl text-gray-800 md:text-5xl"
					initial={{ opacity: 0, y: 20 }}
					transition={{ duration: 0.8 }}
				>
					Propiedades Destacadas
				</motion.h2>
				<motion.p
					animate={{ opacity: 1, y: 0 }}
					className="mx-auto mb-16 max-w-3xl text-center text-gray-600 text-xl"
					initial={{ opacity: 0, y: 20 }}
					transition={{ duration: 0.8, delay: 0.2 }}
				>
					Descubre nuestra selección exclusiva de propiedades de lujo
				</motion.p>
				<div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
					{properties.map((property, index) => (
						<motion.div
							animate={{ opacity: 1, y: 0 }}
							initial={{ opacity: 0, y: 20 }}
							key={property.id}
							transition={{ duration: 0.8, delay: 0.2 * (index + 1) }}
						>
							<Card className="aspect-500/600 bg-white shadow-xl transition-shadow duration-300 hover:shadow-2xl">
								<AspectRatio ratio={16 / 9}>
									<img
										alt={property.title}
										className="h-full w-full object-cover"
										src={property.image}
									/>
								</AspectRatio>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div>
											<CardTitle className="mb-2 text-2xl text-foreground">
												{property.title}
											</CardTitle>
											<CardDescription className="mb-4 flex items-center text-muted-foreground">
												<MapPin className="mr-1 h-4 w-4" />
												{property.location}
											</CardDescription>
										</div>
										<Badge
											className="bg-primary px-3 py-1 font-semibold text-lg text-primary-foreground"
											variant="secondary"
										>
											{property.price}
										</Badge>
									</div>
								</CardHeader>
								<CardContent>
									<p className="mb-6 text-muted-foreground">
										{property.description}
									</p>
									<div className="mb-6 flex items-center justify-between">
										<div className="flex items-center text-muted-foreground">
											<Bed className="mr-2 h-5 w-5" />
											<span>{property.beds} Beds</span>
										</div>
										<div className="flex items-center text-gray-600">
											<Bath className="mr-2 h-5 w-5" />
											<span>{property.baths} Baths</span>
										</div>
										<div className="flex items-center text-gray-600">
											<Square className="mr-2 h-5 w-5" />
											<span>{property.area}</span>
										</div>
									</div>
									<Button className="w-full bg-foreground text-background hover:bg-foreground/90">
										Ver Detalles
									</Button>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					className="mt-16 text-center"
					initial={{ opacity: 0, y: 20 }}
					transition={{ duration: 0.8, delay: 0.8 }}
				>
					<Button
						className="border-gray-800 text-gray-800 hover:bg-gray-100 dark:text-white"
						size="lg"
						variant="outline"
					>
						Ver Todas las Propiedades
						<ArrowRight className="ml-2 h-5 w-5" />
					</Button>
				</motion.div>
			</div>
		</section>
	);
}
