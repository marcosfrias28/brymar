"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Edit,
  Trash2,
  Eye,
  Bed,
  Bath,
  Square,
  MapPin,
  DollarSign,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { secondaryColorClasses } from '@/lib/utils/secondary-colors';
import { cn } from '@/lib/utils';

interface Property {
  id: number;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area?: number;
  sqm?: number;
  status: "sale" | "rent";
  type?: string;
  imageUrl?: string;
}

interface PropertyCardListProps {
  properties: Property[];
}

export function PropertyCardList({ properties }: PropertyCardListProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No hay propiedades</h3>
          <p>No se encontraron propiedades que coincidan con los filtros.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <Card
          key={property.id}
          className={cn(
            "border shadow-sm transition-all duration-200",
            secondaryColorClasses.cardHover
          )}
        >
          <CardContent className="p-0">
            {/* Image */}
            <div className="relative w-full h-48">
              <Image
                src={property.imageUrl || "/placeholder.svg"}
                alt={property.title}
                fill
                className="object-cover rounded-t-lg"
              />
              <Badge
                className={cn(
                  "absolute top-3 left-3 text-xs",
                  property.status === "sale"
                    ? "bg-green-500 text-white"
                    : "bg-blue-500 text-white"
                )}
              >
                {property.status === "sale" ? "En Venta" : "En Alquiler"}
              </Badge>
              {property.id % 7 === 0 && (
                <Badge
                  className={cn(
                    "absolute top-3 right-3 text-xs",
                    secondaryColorClasses.badge
                  )}
                >
                  Destacada
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="space-y-3">
                <div>
                  <Link href={`/properties/${property.id}`}>
                    <h3 className="font-semibold text-foreground text-base line-clamp-2 mb-2 hover:text-primary transition-colors">
                      {property.title}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{property.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                      <span>{property.area || property.sqm || 0}m²</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold text-primary">
                    {formatPrice(property.price)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      "flex-1 text-xs",
                      secondaryColorClasses.interactive
                    )}
                    asChild
                  >
                    <Link href={`/dashboard/properties/${property.id}`}>
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      "flex-1 text-xs",
                      secondaryColorClasses.interactive
                    )}
                    asChild
                  >
                    <Link href={`/dashboard/properties/${property.id}/edit`}>
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
