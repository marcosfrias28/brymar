import Image from "next/image";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  sqm: number;
  bedrooms: number;
  bathrooms: number;
  imageUrl: string;
  className?: string;
}

export function PropertyCard({
  className,
  imageUrl,
  title,
  location,
  bedrooms,
  bathrooms,
  price,
  sqm,
}: PropertyCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl border-0 overflow-hidden",
        "max-lg:max-w-96 max-w-screen-sm mb-4 aspect-square",
        className
      )}
    >
      <Image
        src={imageUrl}
        alt={title}
        height={600}
        width={600}
        className="w-full h-full object-cover hover:scale-110 transition-all duration-500"
      />
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-b from-transparent from-10% to-black pointer-events-none">
        <h3>{title}</h3>
        <p>{location}</p>
        <p>{`${bedrooms} Beds, ${bathrooms} Baths, ${sqm} mt²`}</p>
        <p>{price}</p>
      </div>
    </div>
  );
}
