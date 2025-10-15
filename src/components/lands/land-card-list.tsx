"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, Eye, Square, MapPin, Calculator } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  secondaryColorClasses,
  badgeVariants,
  interactiveClasses,
} from "@/lib/utils/secondary-colors";

import { LandSummary } from "@/application/dto/land/SearchLandsOutput";

interface Land extends LandSummary {
  // Additional properties if needed
}

interface LandCardListProps {
  lands: LandSummary[];
  loading?: boolean;
}

function LandCard({ land }: { land: LandSummary }) {
  const surface = land.area;
  const pricePerM2 =
    land.pricePerSquareMeter ||
    (surface > 0 ? Math.round(land.price / surface) : 0);
  const hectares = (surface / 10000).toFixed(4);
  const tareas = (surface / 629).toFixed(2);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "commercial":
        return "Comercial";
      case "residential":
        return "Residencial";
      case "agricultural":
        return "Agrícola";
      case "beachfront":
        return "Frente al Mar";
      default:
        return type;
    }
  };

  return (
    <Card
      className={cn(
        "border-blackCoral/20 shadow-sm transition-all duration-200",
        secondaryColorClasses.cardHover
      )}
    >
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full sm:w-48 h-32 sm:h-24 flex-shrink-0">
            <Image
              src={land.mainImage || "/placeholder.svg"}
              alt={land.title}
              fill
              className="object-cover rounded-l-lg"
            />
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-arsenic text-sm line-clamp-1 mb-1">
                  {land.title}
                </h3>

                <div className="flex items-center gap-2 text-xs text-blackCoral mb-2">
                  <MapPin className="h-3 w-3" />
                  <span className="line-clamp-1">
                    {land.location || "Ubicación no especificada"}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-blackCoral">
                  <div className="flex items-center gap-1">
                    <Square className="h-3 w-3" />
                    <span>{surface.toLocaleString()}m²</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calculator className="h-3 w-3" />
                    <span>${pricePerM2.toLocaleString()}/m²</span>
                  </div>
                </div>

                <div className="text-xs text-blackCoral/70 mt-1">
                  {hectares} ha • {tareas} tareas
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold text-arsenic">
                  ${land.price.toLocaleString()}
                </div>
                <Badge
                  variant="secondary"
                  className={cn("text-xs", badgeVariants.secondarySubtle)}
                >
                  {getTypeLabel(land.type)}
                </Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                asChild
                className={cn(
                  "h-7 px-2 text-xs bg-transparent",
                  interactiveClasses.button
                )}
              >
                <Link href={`/dashboard/lands/${land.id}`}>
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                asChild
                className={cn(
                  "h-7 px-2 text-xs bg-transparent",
                  interactiveClasses.button
                )}
              >
                <Link href={`/dashboard/lands/${land.id}`}>
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={cn(
                  "h-7 px-2 text-xs text-red-600 hover:text-red-700 bg-transparent",
                  secondaryColorClasses.focusRing
                )}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <Card className="border-blackCoral/20 shadow-sm">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-48 h-32 sm:h-24 flex-shrink-0">
            <Skeleton className="w-full h-full rounded-l-lg" />
          </div>
          <div className="flex-1 p-4 space-y-3">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex gap-4">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-7 w-14" />
              <Skeleton className="h-7 w-8" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LandCardList({ lands, loading = false }: LandCardListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <LoadingSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!lands || lands.length === 0) {
    return (
      <Card
        className={cn("border-blackCoral/20", secondaryColorClasses.accent)}
      >
        <CardContent className="p-8 text-center">
          <div className="text-blackCoral/60 mb-2">
            <Square className="h-12 w-12 mx-auto mb-4 opacity-50" />
          </div>
          <h3 className="text-lg font-semibold text-arsenic mb-2">
            No hay terrenos disponibles
          </h3>
          <p className="text-blackCoral/70 mb-4">
            No se encontraron terrenos que coincidan con los filtros
            seleccionados.
          </p>
          <Button
            variant="outline"
            asChild
            className={cn(interactiveClasses.button)}
          >
            <Link href="/dashboard/lands/new">Agregar primer terreno</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {lands.map((land) => (
        <LandCard key={land.id} land={land} />
      ))}
    </div>
  );
}
