"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Square, MapPin, Calculator } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  secondaryColorClasses,
  badgeVariants,
  interactiveClasses,
} from "@/lib/utils/secondary-colors";
import { Land } from "@/lib/types";
import { useDeleteLand } from "@/hooks/use-lands";

interface LandCardProps {
  land: Land;
  showActions?: boolean;
  variant?: "horizontal" | "vertical";
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  className?: string;
}

export function LandCard({
  land,
  showActions = true,
  variant = "horizontal",
  onEdit,
  onView,
  className,
}: LandCardProps) {
  const deleteLandMutation = useDeleteLand();

  const surface = land.area;
  const pricePerM2 = surface > 0 ? Math.round(land.price / surface) : 0;
  const hectares = (surface / 10000).toFixed(4);
  const tareas = (surface / 629).toFixed(2);
  const isVertical = variant === "vertical";

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "commercial":
        return "Comercial";
      case "residential":
        return "Residencial";
      case "agricultural":
        return "Agrícola";
      case "recreational":
        return "Recreativo";
      case "industrial":
        return "Industrial";
      case "mixed-use":
        return "Uso Mixto";
      case "vacant":
        return "Vacante";
      default:
        return type;
    }
  };

  const handleDelete = async () => {
    if (confirm("¿Estás seguro de que quieres eliminar este terreno?")) {
      await deleteLandMutation.mutateAsync(land.id);
    }
  };

  const handleView = () => {
    if (onView) {
      onView(land.id);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(land.id);
    }
  };

  return (
    <Card
      className={cn(
        "border-blackCoral/20 shadow-sm transition-all duration-200 overflow-hidden hover:shadow-lg",
        secondaryColorClasses.cardHover,
        className
      )}
    >
      <CardContent className="p-0">
        <div
          className={cn(
            "flex",
            isVertical ? "flex-col" : "flex-col sm:flex-row"
          )}
        >
          {/* Image */}
          <div
            className={cn(
              "relative bg-muted flex-shrink-0",
              isVertical ? "w-full h-48" : "w-full sm:w-48 h-32 sm:h-auto"
            )}
          >
            {land.images?.[0]?.url ? (
              <Image
                src={land.images[0].url}
                alt={land.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Square className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <Badge
              variant="secondary"
              className={cn(
                "absolute top-2 right-2 text-xs capitalize",
                badgeVariants.secondarySubtle
              )}
            >
              {getTypeLabel(land.type)}
            </Badge>
          </div>

          {/* Content */}
          <div
            className={cn(
              "flex-1 p-4",
              isVertical ? "space-y-2" : "flex flex-col justify-between"
            )}
          >
            <div
              className={cn(
                isVertical
                  ? "space-y-2"
                  : "flex justify-between items-start gap-4"
              )}
            >
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    "font-semibold text-arsenic line-clamp-2 mb-1",
                    isVertical ? "text-lg" : "text-sm"
                  )}
                >
                  {land.name}
                </h3>

                {land.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {land.description}
                  </p>
                )}

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

              <div
                className={cn(
                  "flex-shrink-0",
                  isVertical
                    ? "flex items-center justify-between w-full"
                    : "text-right"
                )}
              >
                <div
                  className={cn(
                    "font-bold text-arsenic",
                    isVertical ? "text-2xl text-primary" : "text-lg"
                  )}
                >
                  ${land.price.toLocaleString()}
                </div>
                {isVertical && showActions && (
                  <Button size="sm" onClick={handleView}>
                    Ver Detalles
                  </Button>
                )}
              </div>
            </div>

            {/* Actions */}
            {showActions && !isVertical && (
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleView}
                  className={cn(
                    "h-7 px-2 text-xs bg-transparent",
                    interactiveClasses.button
                  )}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleEdit}
                  className={cn(
                    "h-7 px-2 text-xs bg-transparent",
                    interactiveClasses.button
                  )}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={deleteLandMutation.isPending}
                  className={cn(
                    "h-7 px-2 text-xs text-red-600 hover:text-red-700 bg-transparent",
                    secondaryColorClasses.focusRing
                  )}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
