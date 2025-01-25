import Image from "next/image";
import { Card } from "@/components/ui/card";

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  sqm: number;
  bedrooms: number;
  bathrooms: number;
  imageUrl: string;
}

export function PropertyCard({
  imageUrl,
  title,
  location,
  bedrooms,
  bathrooms,
  price,
  sqm,
}: PropertyCardProps) {
  return (
    <div className="property-card border-0 overflow-hidden">
      <Image
        src={imageUrl}
        alt={title}
        height={400}
        width={400}
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
