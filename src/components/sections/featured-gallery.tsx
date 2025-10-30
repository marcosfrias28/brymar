"use client";

import Image from "next/image";
import React from "react";
import { useFeaturedProperties } from "@/hooks/use-featured-properties";
import { Skeleton } from "../ui/skeleton";

// Placeholder images for fallback
const placeholderImages = [
	"https://images.unsplash.com/photo-1719368472026-dc26f70a9b76?q=80&h=800&w=800&auto=format&fit=crop",
	"https://images.unsplash.com/photo-1649265825072-f7dd6942baed?q=80&h=800&w=800&auto=format&fit=crop",
	"https://images.unsplash.com/photo-1555212697-194d092e3b8f?q=80&h=800&w=800&auto=format&fit=crop",
];

const MAX_FEATURED_PROPERTIES = 5;

function FeaturedPropertiesSkeleton() {
	return (
		<div className="container mx-auto mt-10 flex w-full items-center gap-10">
			{Array.from({ length: MAX_FEATURED_PROPERTIES }).map((_, index) => (
				<div
					className="relative h-[600px] w-56 flex-grow animate-pulse overflow-hidden rounded-2xl bg-gray-200"
					key={index}
				>
					<Skeleton className="h-full w-full" />
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
	} = useFeaturedProperties(5);

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
							? typeof property.images[0] === "string"
								? property.images[0]
								: property.images[0]?.url ||
									placeholderImages[index % placeholderImages.length]
							: placeholderImages[index % placeholderImages.length],
					price: property.price,
					location:
						property.address &&
						typeof property.address === "object" &&
						"city" in property.address &&
						"state" in property.address
							? `${property.address.city}, ${property.address.state}`
							: "Location not available",
				}))
			: placeholderImages.map((image, index) => ({
					id: index + 1,
					title: `Featured Property ${index + 1}`,
					image,
					price: 0,
					location: "Coming Soon",
				}));

	return (
		<div className="container mx-auto mt-10 flex w-full items-center gap-10">
			{displayItems.slice(0, MAX_FEATURED_PROPERTIES).map((item, index) => (
				<PropertyImage index={index} item={item} key={item.id} />
			))}
		</div>
	);
}

function PropertyImage({ item, index }: { item: any; index: number }) {
	const [isZoomed, setIsZoomed] = React.useState(false);
	const imageRef = React.useRef<HTMLDivElement>(null);

	const toggleZoom = () => {
		setIsZoomed(!isZoomed);
	};

	// Close zoom when clicking outside
	React.useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				imageRef.current &&
				!imageRef.current.contains(event.target as Node)
			) {
				setIsZoomed(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div
			className={`relative h-[600px] w-72 flex-grow cursor-zoom-in overflow-hidden rounded-2xl transition-all duration-300 ${
				isZoomed ? "!w-full !cursor-zoom-out" : ""
			}`}
			onClick={toggleZoom}
			ref={imageRef}
		>
			<Image
				alt={item.title}
				className={`h-full w-full object-cover object-center transition-transform duration-300 ${
					isZoomed ? "scale-110" : "hover:scale-105"
				}`}
				height={800}
				priority={index < 3}
				src={item.image}
				width={800}
			/>

			{/* Overlay with property info */}
			<div
				className={`absolute inset-0 bg-black/50 opacity-0 ${
					isZoomed ? "opacity-100" : "group-hover:opacity-100"
				} flex flex-col justify-end p-4 transition-opacity duration-300`}
			>
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
	);
}
