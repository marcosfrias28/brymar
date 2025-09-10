"use client"

import { Bed, Bath, Square, MapPin, Eye, Edit, Trash2 } from "lucide-react"
import { useLangStore } from "@/utils/store/lang-store"
import { translations } from "@/lib/translations"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Property {
  id: string
  title: string
  type: "sale" | "rent"
  price: number
  bedrooms: number
  bathrooms: number
  area: number
  location: string
  description: string
  images: string[]
  createdAt: string
}

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { language } = useLangStore()
  const t = translations[language]

  const formatPrice = (price: number, type: string) => {
    const formatted = new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price)

    return type === "rent" ? `${formatted}/mes` : formatted
  }

  const getTypeLabel = (type: string) => {
    return type === "sale" ? t.propertyForm.forSale : t.propertyForm.forRent
  }

  const getTypeBadgeColor = (type: string) => {
    return type === "sale"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-blue-100 text-blue-800 border-blue-200"
  }

  return (
    <Card className="border-black-coral shadow-lg hover:shadow-xl transition-all duration-300 group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        <Image
          src={property.images[0] || "/placeholder.svg"}
          alt={property.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <Badge className={getTypeBadgeColor(property.type)}>{getTypeLabel(property.type)}</Badge>
        </div>
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white text-arsenic">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-black-coral">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/properties/${property.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  {t.propertyForm.view}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/properties/${property.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  {t.propertyForm.edit}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                {t.propertyForm.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Title and Price */}
        <div className="mb-3">
          <h3 className="font-semibold text-arsenic text-lg mb-1 line-clamp-1">{property.title}</h3>
          <p className="text-2xl font-bold text-arsenic">{formatPrice(property.price, property.type)}</p>
        </div>

        {/* Location */}
        <div className="flex items-center text-black-coral mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm line-clamp-1">{property.location}</span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 text-black-coral text-sm">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="h-4 w-4" />
            <span>{property.area}m²</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-black-coral/70 text-sm mt-3 line-clamp-2">{property.description}</p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full bg-arsenic hover:bg-black-coral text-white">
          <Link href={`/dashboard/properties/${property.id}`}>Ver Detalles</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
