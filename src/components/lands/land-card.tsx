"use client";

import { Square, MapPin, Eye, Edit, Trash2, TreePine } from "lucide-react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { LandSummary } from "@/application/dto/land/SearchLandsOutput";

interface LandCardProps {
  land: LandSummary;
}

export function LandCard({ land }: LandCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      commercial: "Comercial",
      residential: "Residencial",
      agricultural: "Agrícola",
      beachfront: "Frente al Mar",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors = {
      commercial: "bg-chart-1/20 text-chart-1 border-chart-1/30",
      residential: "bg-chart-2/20 text-chart-2 border-chart-2/30",
      agricultural: "bg-chart-3/20 text-chart-3 border-chart-3/30",
      beachfront: "bg-chart-4/20 text-chart-4 border-chart-4/30",
    };
    return (
      colors[type as keyof typeof colors] ||
      "bg-muted text-muted-foreground border-border"
    );
  };

  const getPricePerM2 = () => {
    return land.pricePerSquareMeter || Math.round(land.price / land.area);
  };

  return (
    <Card className="border-blackCoral shadow-lg hover:shadow-xl hover:border-secondary/20 transition-all duration-300 group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        <Image
          src={land.mainImage || "/placeholder.svg"}
          alt={land.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <Badge className={getTypeBadgeColor(land.type)}>
            {getTypeLabel(land.type)}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="bg-white/80 hover:bg-white text-foreground"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white border-blackCoral"
            >
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/lands/${land.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/lands/${land.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
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
          <h3 className="font-semibold text-foreground text-lg mb-1 line-clamp-1">
            {land.title}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-foreground">
              {formatPrice(land.price)}
            </p>
            <p className="text-sm text-secondary-foreground bg-secondary/20 px-2 py-1 rounded-full">
              ${getPricePerM2()}/m²
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-muted-foreground mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm line-clamp-1">{land.location}</span>
        </div>

        {/* Surface */}
        <div className="flex items-center gap-4 text-muted-foreground text-sm mb-3">
          <div className="flex items-center gap-1">
            <Square className="h-4 w-4" />
            <span>{land.area.toLocaleString()} m²</span>
          </div>
          <div className="flex items-center gap-1">
            <TreePine className="h-4 w-4" />
            <span>{(land.area / 10000).toFixed(2)} ha</span>
          </div>
        </div>

        {/* Features */}
        <p className="text-muted-foreground text-sm line-clamp-2">
          {land.features.join(", ") || "Sin características especificadas"}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          asChild
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Link href={`/dashboard/lands/${land.id}`}>Ver Detalles</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
