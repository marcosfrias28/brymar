"use client";

import { Bed, Bath, Square, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Property } from "@/utils/types/types";
import { cn } from "@/lib/utils";
import { AnimatedCard } from "@/components/ui/animated-card";
import { hoverAnimations, focusAnimations } from "@/lib/utils/animations";

interface PropertyCardProps {
  property: Property;
  variant?: "horizontal" | "vertical";
}

export function PropertyCard({ property }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <AnimatedCard
      variant="elevated"
      hover="lift"
      className="relative rounded-2xl border border-dark/10 dark:border-white/10 group overflow-hidden"
    >
      <div className="overflow-hidden rounded-t-2xl">
        <Link
          href={`/properties/${property.id}`}
          className={cn("block focus:outline-none", focusAnimations.ring)}
        >
          <div className="w-full h-[300px] relative overflow-hidden">
            <Image
              alt={property.title}
              loading="lazy"
              width={440}
              height={300}
              className={cn(
                "w-full h-full object-cover rounded-t-2xl",
                "transition-all duration-500 ease-out",
                "group-hover:brightness-75 group-hover:scale-110"
              )}
              src={property.imageUrl || "/placeholder.jpg"}
            />
          </div>
        </Link>
        <div
          className={cn(
            "absolute top-6 right-6 p-4 bg-secondary/90 backdrop-blur-sm rounded-full border border-secondary",
            "opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0",
            "transition-all duration-300 ease-out"
          )}
        >
          <ArrowRight className="w-6 h-6 text-secondary-foreground" />
        </div>
      </div>
      <div className="p-6">
        <div className="flex flex-col mobile:flex-row gap-5 mobile:gap-0 justify-between mb-6">
          <div className="space-y-1">
            <Link
              href={`/properties/${property.id}`}
              className={cn("block focus:outline-none", focusAnimations.ring)}
            >
              <h3
                className={cn(
                  "text-xl font-medium text-black dark:text-white",
                  "transition-colors duration-300 group-hover:text-primary"
                )}
              >
                {property.title}
              </h3>
            </Link>
            <p className="text-base font-normal text-black/50 dark:text-white/50 transition-colors duration-200">
              {property.location}
            </p>
          </div>
          <div>
            <button
              className={cn(
                "text-base font-normal text-primary px-5 py-2 rounded-full",
                "bg-secondary/20 border border-secondary/30",
                "transition-all duration-200 hover:bg-secondary/30 hover:scale-105",
                "focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:ring-offset-2"
              )}
            >
              {formatPrice(property.price)}
            </button>
          </div>
        </div>
        <div className="flex">
          <div className="flex flex-col gap-2 border-e border-black/10 dark:border-white/20 pr-2 xs:pr-4 mobile:pr-8 group/stat">
            <Bed
              className={cn(
                "w-5 h-5 text-secondary transition-transform duration-200",
                "group-hover/stat:scale-110"
              )}
            />
            <p className="text-sm mobile:text-base font-normal text-black dark:text-white transition-colors duration-200">
              {property.bedrooms} Bedrooms
            </p>
          </div>
          <div className="flex flex-col gap-2 border-e border-black/10 dark:border-white/20 px-2 xs:px-4 mobile:px-8 group/stat">
            <Bath
              className={cn(
                "w-5 h-5 text-secondary transition-transform duration-200",
                "group-hover/stat:scale-110"
              )}
            />
            <p className="text-sm mobile:text-base font-normal text-black dark:text-white transition-colors duration-200">
              {property.bathrooms} Bathrooms
            </p>
          </div>
          <div className="flex flex-col gap-2 pl-2 xs:pl-4 mobile:pl-8 group/stat">
            <Square
              className={cn(
                "w-5 h-5 text-secondary transition-transform duration-200",
                "group-hover/stat:scale-110"
              )}
            />
            <p className="text-sm mobile:text-base font-normal text-black dark:text-white transition-colors duration-200">
              {property.sqm}m<sup>2</sup>
            </p>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
