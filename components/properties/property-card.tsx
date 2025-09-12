"use client"

import { Bed, Bath, Square, MapPin, Eye, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Property } from "@/utils/types/types"



interface PropertyCardProps {
  property: Property
  variant?: "horizontal" | "vertical"
}

export function PropertyCard({ property }: PropertyCardProps) {

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  return (
    <Card className="border-blackCoral shadow-lg hover:shadow-xl transition-all duration-300 group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        <Image
          src={property.imageUrl || "/placeholder.jpg"}
          alt={property.title}
          width={400}
          height={200}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="mb-2">
            {property.type === "residential" ? "Residencial" : property.type === "commercial" ? "Comercial" : "Terreno"}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white text-arsenic">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-blackCoral">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/properties/${property.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/properties/${property.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Title and Price */}
        <div className="mb-3">
          <h3 className="font-semibold text-arsenic text-lg mb-1 line-clamp-1">{property.title}</h3>
          <p className="text-lg font-semibold text-primary mb-2">
            {formatPrice(property.price)}
          </p>
        </div>

        {/* Location */}
        <div className="flex items-center text-blackCoral mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm line-clamp-1">{property.location}</span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 text-blackCoral text-sm">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Square className="h-4 w-4 mr-1" />
            {property.sqm} m²
          </div>
        </div>

        {/* Description */}
        <p className="text-blackCoral/70 text-sm mt-3 line-clamp-2">{property.description}</p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full bg-arsenic hover:bg-blackCoral text-white">
          <Link href={`/dashboard/properties/${property.id}`}>Ver Detalles</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
