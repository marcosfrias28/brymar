"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { Edit, Eye, MapPin, Bed, Bath, Square, Calendar } from "lucide-react"
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

interface PropertyListViewProps {
  properties: Property[]
}

export function PropertyListView({ properties }: PropertyListViewProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="space-y-4">
      {properties.map((property) => (
        <Card key={property.id} className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex flex-col desktop:flex-row gap-6">
            {/* Image */}
            <div className="relative w-full desktop:w-80 h-48 flex-shrink-0">
              <Image
                src={property.images[0] || "/placeholder.svg"}
                alt={property.title}
                fill
                className="object-cover rounded-lg"
              />
              {property.featured && (
                <Badge className="absolute top-2 left-2 bg-gradient-aurora text-white">Destacada</Badge>
              )}
              <Badge
                className={`absolute top-2 right-2 ${
                  property.type === "sale" ? "bg-arsenic text-white" : "bg-blackCoral text-white"
                }`}
              >
                {property.type === "sale" ? "Venta" : "Alquiler"}
              </Badge>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-arsenic font-serif mb-2">{property.title}</h3>
                <div className="flex items-center text-blackCoral mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.location}
                </div>
                <p className="text-blackCoral/80 text-sm line-clamp-2">
                  <MarkdownRenderer 
                    content={property.description} 
                    variant="compact"
                    className="text-blackCoral/80 text-sm"
                  />
                </p>
              </div>

              {/* Property Details */}
              <div className="flex flex-wrap gap-4 text-sm text-blackCoral">
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
              <div className="flex flex-col smartphone:flex-row justify-between items-start smartphone:items-center gap-4">
                <div className="text-2xl font-bold text-arsenic">
                  {formatPrice(property.price)}
                  {property.type === "rent" && <span className="text-sm font-normal">/mes</span>}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/properties/${property.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/properties/${property.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" />
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
  )
}
