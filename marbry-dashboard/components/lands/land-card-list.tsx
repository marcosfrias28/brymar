"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye, Square, MapPin, Calculator } from "lucide-react"
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
  type: string
}

interface LandCardListProps {
  land: Land
}

export function LandCardList({ land }: LandCardListProps) {
  const pricePerM2 = Math.round(land.price / land.surface)
  const hectares = (land.surface / 10000).toFixed(4)
  const tareas = (land.surface / 629).toFixed(2)

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "commercial":
        return "Comercial"
      case "residential":
        return "Residencial"
      case "agricultural":
        return "Agrícola"
      case "beachfront":
        return "Frente al Mar"
      default:
        return type
    }
  }

  return (
    <Card className="border-blackCoral shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full sm:w-48 h-32 sm:h-24 flex-shrink-0">
            <Image
              src={land.images[0] || "/placeholder.svg"}
              alt={land.name}
              fill
              className="object-cover rounded-l-lg"
            />
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-arsenic text-sm line-clamp-1 mb-1">{land.name}</h3>

                <div className="flex items-center gap-2 text-xs text-blackCoral mb-2">
                  <MapPin className="h-3 w-3" />
                  <span className="line-clamp-1">{land.location}</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-blackCoral">
                  <div className="flex items-center gap-1">
                    <Square className="h-3 w-3" />
                    <span>{land.surface.toLocaleString()}m²</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calculator className="h-3 w-3" />
                    <span>${pricePerM2}/m²</span>
                  </div>
                </div>

                <div className="text-xs text-blackCoral/70 mt-1">
                  {hectares} ha • {tareas} tareas
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold text-arsenic">${land.price.toLocaleString()}</div>
                <Badge variant="secondary" className="text-xs">
                  {getTypeLabel(land.type)}
                </Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" className="h-7 px-2 text-xs bg-transparent">
                <Eye className="h-3 w-3 mr-1" />
                Ver
              </Button>
              <Button size="sm" variant="outline" className="h-7 px-2 text-xs bg-transparent">
                <Edit className="h-3 w-3 mr-1" />
                Editar
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
