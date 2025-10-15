"use client";

import { useFeaturedProperties } from "@/hooks/use-featured-properties";
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";

// Placeholder images for fallback
const placeholderImages = [
  "https://images.unsplash.com/photo-1719368472026-dc26f70a9b76?q=80&h=800&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1649265825072-f7dd6942baed?q=80&h=800&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1555212697-194d092e3b8f?q=80&h=800&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1729086046027-09979ade13fd?q=80&h=800&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1601568494843-772eb04aca5d?q=80&h=800&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1585687501004-615dfdfde7f1?q=80&h=800&w=800&auto=format&fit=crop",
];

const MAX_FEATURED_PROPERTIES = 5;

function FeaturedPropertiesSkeleton() {
  return (
    <div className="container flex items-center gap-10 w-full mt-10 mx-auto">
      {Array.from({ length: MAX_FEATURED_PROPERTIES }).map((_, index) => (
        <div
          key={index}
          className="relative flex-grow w-56 rounded-2xl overflow-hidden h-[600px] bg-gray-200 animate-pulse"
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
    console.error("Featured properties error:", error);
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
    <div className="container flex items-center gap-10 w-full mt-10 mx-auto">
      {displayItems.slice(0, MAX_FEATURED_PROPERTIES).map((item, index) => (
        <div
          key={item.id}
          className="relative group flex-grow transition-all w-72 rounded-2xl overflow-hidden h-[600px] duration-500 hover:w-full"
        >
          <Image
            className="h-full w-full object-cover object-center"
            src={item.image}
            alt={item.title}
            width={800}
            height={800}
            priority={index < 3}
          />

          {/* Overlay with property info on hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <h3 className="text-white font-semibold text-lg mb-1 truncate">
              {item.title}
            </h3>
            <p className="text-white/80 text-sm mb-1">{item.location}</p>
            {item.price > 0 && (
              <p className="text-white font-bold text-lg">
                ${item.price.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
