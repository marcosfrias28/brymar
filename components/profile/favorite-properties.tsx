"use client"

import { Heart, MapPin, Bed, Bath, Square, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

// Mock data for favorite properties - replace with actual user favorites
const favoriteProperties = [
  {
    id: 1,
    title: "Villa Moderna en Punta Cana",
    location: "Punta Cana, República Dominicana",
    price: "$850,000",
    image: "/optimized_villa/1.webp",
    beds: 4,
    baths: 3,
    area: "320 m²",
    status: "sale",
    addedToFavorites: "Hace 2 días"
  },
  {
    id: 2,
    title: "Apartamento Frente al Mar",
    location: "Bávaro, República Dominicana",
    price: "$450,000",
    image: "/optimized_villa2/1.webp",
    beds: 2,
    baths: 2,
    area: "150 m²",
    status: "sale",
    addedToFavorites: "Hace 1 semana"
  },
  {
    id: 3,
    title: "Casa Colonial en Santo Domingo",
    location: "Zona Colonial, Santo Domingo",
    price: "$320,000",
    image: "/optimized_villa3/1.webp",
    beds: 3,
    baths: 2,
    area: "200 m²",
    status: "sale",
    addedToFavorites: "Hace 2 semanas"
  }
]

export function FavoriteProperties() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sale':
        return <Badge className="bg-green-100 text-green-800 border-green-200">En Venta</Badge>
      case 'rent':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">En Alquiler</Badge>
      case 'sold':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Vendida</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Disponible</Badge>
    }
  }

  return (
    <Card className="border-blackCoral shadow-lg">
      <CardHeader>
        <CardTitle className="text-arsenic flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Propiedades Favoritas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {favoriteProperties.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No tienes propiedades favoritas aún</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/search">Explorar Propiedades</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {favoriteProperties.map((property) => (
              <div key={property.id} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={property.image}
                    alt={property.title}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-sm truncate">{property.title}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {property.location}
                      </p>
                    </div>
                    {getStatusBadge(property.status)}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <Bed className="h-3 w-3" />
                      {property.beds}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="h-3 w-3" />
                      {property.baths}
                    </span>
                    <span className="flex items-center gap-1">
                      <Square className="h-3 w-3" />
                      {property.area}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">{property.price}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/properties/${property.id}`}>
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Link>
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700">
                        <Heart className="h-3 w-3" fill="currentColor" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    Agregado a favoritos {property.addedToFavorites}
                  </p>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t">
              <Button asChild className="w-full" variant="outline">
                <Link href="/search">Ver Todas las Propiedades</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}