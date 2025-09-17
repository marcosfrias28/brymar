"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye, Bed, Bath, Square, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Property } from "@/utils/types/types"

interface PropertyCardListProps {
  property: Property
}

export function PropertyCardList({ property }: PropertyCardListProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  return (
    <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full sm:w-48 h-32 sm:h-24 flex-shrink-0">
            <Image
              src={property.imageUrl || "/placeholder.svg"}
              alt={property.title}
              fill
              className="object-cover rounded-l-lg"
            />
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
              {property.type === "residential" ? "Residencial" : property.type === "commercial" ? "Comercial" : "Terreno"}
            </Badge>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <Link href={`/properties/${property.id}`}>
                  <h3 className="font-semibold text-card-foreground text-sm line-clamp-1 mb-1 hover:text-primary transition-colors">{property.title}</h3>
                </Link>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3" />
                  <span className="line-clamp-1">{property.location}</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Bed className="h-3 w-3" />
                    <span>{property.bedrooms}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="h-3 w-3" />
                    <span>{property.bathrooms}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Square className="h-3 w-3" />
                    <span>{property.sqm}m²</span>
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold text-primary">{formatPrice(property.price)}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" className="h-7 px-2 text-xs bg-transparent" asChild>
                <Link href={`/properties/${property.id}`}>
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="h-7 px-2 text-xs bg-transparent" asChild>
                <Link href={`/dashboard/properties/${property.id}/edit`}>
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs text-red-600 hover:text-red-700 bg-transparent"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
