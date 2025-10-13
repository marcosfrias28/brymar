"use client"

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, Eye, MapPin, Bed, Bath, Square } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Property {
  id: string
  title: string
  type: string
  price: number
  bedrooms: number
  bathrooms: number
  area: number
  location: string
  description: string
  images: string[]
  createdAt: string
  featured?: boolean
}

interface PropertyBentoGridProps {
  properties: Property[]
}

export function PropertyBentoGrid({ properties }: PropertyBentoGridProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Create bento layout pattern
  const getBentoClass = (index: number) => {
    const patterns = [
      "col-span-1 row-span-1", // Small
      "col-span-2 row-span-1", // Wide
      "col-span-1 row-span-2", // Tall
      "col-span-1 row-span-1", // Small
      "col-span-1 row-span-1", // Small
      "col-span-2 row-span-2", // Large
    ]
    return patterns[index % patterns.length]
  }

  const getImageHeight = (index: number) => {
    const patterns = [
      "h-48", // Small
      "h-48", // Wide
      "h-80", // Tall
      "h-48", // Small
      "h-48", // Small
      "h-80", // Large
    ]
    return patterns[index % patterns.length]
  }

  return (
    <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 widescreen:grid-cols-4 gap-4 auto-rows-max">
      {properties.map((property, index) => (
        <Card
          key={property.id}
          className={`${getBentoClass(index)} overflow-hidden hover:shadow-xl transition-all duration-300 group`}
        >
          <div className="relative">
            <div className={`relative ${getImageHeight(index)} overflow-hidden`}>
              <Image
                src={property.images[0] || "/placeholder.svg"}
                alt={property.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {property.featured && <Badge className="bg-gradient-aurora text-white border-0">Destacada</Badge>}
                <Badge
                  className={`${
                    property.type === "sale" ? "bg-arsenic text-white" : "bg-blackCoral text-white"
                  } border-0`}
                >
                  {property.type === "sale" ? "Venta" : "Alquiler"}
                </Badge>
              </div>

              {/* Actions */}
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="secondary" size="sm" asChild>
                  <Link href={`/dashboard/properties/${property.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="secondary" size="sm" asChild>
                  <Link href={`/dashboard/properties/${property.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Price */}
              <div className="absolute bottom-3 left-3 text-white">
                <div className="text-xl font-bold">
                  {formatPrice(property.price)}
                  {property.type === "rent" && <span className="text-sm font-normal">/mes</span>}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-arsenic font-serif line-clamp-1 mb-1">{property.title}</h3>
                <div className="flex items-center text-blackCoral text-sm mb-2">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="line-clamp-1">{property.location}</span>
                </div>
              </div>

              {/* Property Details */}
              <div className="flex justify-between text-xs text-blackCoral">
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
  )
}
