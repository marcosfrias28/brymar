"use client"

import { Square, MapPin, Eye, Edit, Trash2, TreePine } from "lucide-react"
import { useLangStore } from "@/utils/store/lang-store"
import { translations } from "@/lib/translations"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Land {
  id: string
  name: string
  surface: number
  price: number
  location: string
  description: string
  images: string[]
  createdAt: string
  type: "commercial" | "residential" | "agricultural" | "beachfront"
}

interface LandCardProps {
  land: Land
}

export function LandCard({ land }: LandCardProps) {
  const { language } = useLangStore()
  const t = translations[language]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      commercial: "Comercial",
      residential: "Residencial",
      agricultural: "Agrícola",
      beachfront: "Frente al Mar",
    }
    return labels[type as keyof typeof labels] || type
  }

  const getTypeBadgeColor = (type: string) => {
    const colors = {
      commercial: "bg-blue-100 text-blue-800 border-blue-200",
      residential: "bg-green-100 text-green-800 border-green-200",
      agricultural: "bg-yellow-100 text-yellow-800 border-yellow-200",
      beachfront: "bg-cyan-100 text-cyan-800 border-cyan-200",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getPricePerM2 = () => {
    return Math.round(land.price / land.surface)
  }

  return (
    <Card className="border-blackCoral shadow-lg hover:shadow-xl transition-all duration-300 group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        <Image
          src={land.images[0] || "/placeholder.svg"}
          alt={land.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <Badge className={getTypeBadgeColor(land.type)}>{getTypeLabel(land.type)}</Badge>
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
                <Link href={`/dashboard/lands/${land.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  {t.view}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/lands/${land.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  {t.edit}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                {t.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Title and Price */}
        <div className="mb-3">
          <h3 className="font-semibold text-arsenic text-lg mb-1 line-clamp-1">{land.name}</h3>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-arsenic">{formatPrice(land.price)}</p>
            <p className="text-sm text-blackCoral">${getPricePerM2()}/m²</p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-blackCoral mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm line-clamp-1">{land.location}</span>
        </div>

        {/* Surface */}
        <div className="flex items-center gap-4 text-blackCoral text-sm mb-3">
          <div className="flex items-center gap-1">
            <Square className="h-4 w-4" />
            <span>{land.surface.toLocaleString()} m²</span>
          </div>
          <div className="flex items-center gap-1">
            <TreePine className="h-4 w-4" />
            <span>{(land.surface / 10000).toFixed(2)} ha</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-blackCoral/70 text-sm line-clamp-2">{land.description}</p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full bg-arsenic hover:bg-blackCoral text-white">
          <Link href={`/dashboard/lands/${land.id}`}>Ver Detalles</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
