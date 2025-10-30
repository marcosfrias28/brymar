"use client";

import Image from "next/image";
import { useFeaturedProperties } from "@/hooks/use-featured-properties";

// Placeholder images for fallback
const placeholderImages = [
	"https://images.unsplash.com/photo-1719368472026-dc26f70a9b76?q=80&h=800&w=800&auto=format&fit=crop",
	"https://images.unsplash.com/photo-1649265825072-f7dd6942baed?q=80&h=800&w=800&auto=format&fit=crop",
	"https://images.unsplash.com/photo-1555212697-194d092e3b8f?q=80&h=800&w=800&auto=format&fit=crop",
	"https://images.unsplash.com/photo-1729086046027-09979ade13fd?q=80&h=800&w=800&auto=format&fit=crop",
	"https://images.unsplash.com/photo-1601568494843-772eb04aca5d?q=80&h=800&w=800&auto=format&fit=crop",
	"https://images.unsplash.com/photo-1585687501004-615dfdfde7f1?q=80&h=800&w=800&auto=format&fit=crop",
];

function FeaturedPropertiesSkeleton() {
	return (
		<div className="mx-auto mt-10 flex h-[400px] w-full max-w-4xl items-center gap-2">
			{Array.from({ length: 6 }).map((_, index) => (
				<div
					className="relative h-[400px] w-56 flex-grow animate-pulse overflow-hidden rounded-lg bg-gray-200"
					key={index}
				>
					<div className="h-full w-full animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
				</div>
			))}
		</div>
	);
}

export function FeaturedPropertiesGallery() {
	const {
		properties: featuredProperties,
		loading,
		error,
	} = useFeaturedProperties(6);

	if (loading) {
		return <FeaturedPropertiesSkeleton />;
	}

	if (error) {
	}

	// If no featured properties, use placeholder data
	const displayItems =
		featuredProperties.length > 0
			? featuredProperties.map((property, index) => ({
					id: property.id,
					title: property.title,
					image:
						Array.isArray(property.images) && property.images.length > 0
							? property.images[0]
							: placeholderImages[index % placeholderImages.length],
					price: property.price,
					location: `${property.address.city}, ${property.address.state}`,
				}))
			: placeholderImages.map((image, index) => ({
					id: index + 1,
					title: `Featured Property ${index + 1}`,
					image,
					price: 0,
					location: "Coming Soon",
				}));

	return (
		<div className="mx-auto mt-10 flex h-[400px] w-full max-w-4xl items-center gap-2">
			{displayItems.slice(0, 6).map((item, index) => (
				<div
					className="group relative h-[400px] w-56 flex-grow overflow-hidden rounded-lg transition-all duration-500 hover:w-full"
					key={item.id}
				>
					<Image
						alt={item.title}
						className="h-full w-full object-cover object-center"
						height={800}
						priority={index < 3}
						src={item.image}
						width={800}
					/>

					{/* Overlay with property info on hover */}
					<div className="absolute inset-0 flex flex-col justify-end bg-black/50 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
						<h3 className="mb-1 truncate font-semibold text-lg text-white">
							{item.title}
						</h3>
						<p className="mb-1 text-sm text-white/80">{item.location}</p>
						{item.price > 0 && (
							<p className="font-bold text-lg text-white">
								${item.price.toLocaleString()}
							</p>
						)}
					</div>
				</div>
			))}
		</div>
	);
}
