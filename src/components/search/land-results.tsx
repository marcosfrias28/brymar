"use client";

import { useState } from "react";
import { LayoutGrid, List, MapPin, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { InlineErrorState } from "@/components/ui/error-states";
import { cn } from "@/lib/utils";
import { LandSummary } from "@/application/dto/land/SearchLandsOutput";

interface LandResultsProps {
  lands: LandSummary[];
  total: number;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  onViewChange?: (view: "results" | "map") => void;
  currentView?: "results" | "map";
  onSortChange?: (sortBy: string) => void;
  sortBy?: string;
  view?: "grid" | "list" | "map";
  onViewModeChange?: (view: "grid" | "list" | "map") => void;
  className?: string;
}

export function LandResults({
  lands,
  total,
  isLoading = false,
  error,
  onRetry,
  onViewChange,
  currentView = "results",
  onSortChange,
  sortBy: externalSortBy = "newest",
  view: externalView = "grid",
  onViewModeChange,
  className,
}: LandResultsProps) {
  // Use external state if provided, otherwise fall back to local state
  const [localView, setLocalView] = useState<"grid" | "list">("grid");
  const [localSortBy, setLocalSortBy] = useState("newest");

  const view = onViewModeChange ? externalView : localView;
  const sortBy = onSortChange ? externalSortBy : localSortBy;

  const sortOptions = [
    { value: "newest", label: "Más recientes" },
    { value: "price-low", label: "Precio: menor a mayor" },
    { value: "price-high", label: "Precio: mayor a menor" },
    { value: "area-large", label: "Área: mayor a menor" },
    { value: "area-small", label: "Área: menor a mayor" },
  ];

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <InlineErrorState message={error} onRetry={onRetry} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Results Header - Fixed */}
      <div className="flex-shrink-0 border-b bg-background">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">
                {total} terrenos encontrados
              </h2>
              {total > 0 && (
                <Badge variant="secondary">
                  {lands.length} de {total}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Sort Options */}
              <Select
                value={sortBy}
                onValueChange={(value) => {
                  if (onSortChange) {
                    onSortChange(value);
                  } else {
                    setLocalSortBy(value);
                  }
                }}
              >
                <SelectTrigger className="w-48">
                  <SortAsc className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "rounded-r-none",
                    view === "grid" && "bg-muted"
                  )}
                  onClick={() => {
                    if (onViewModeChange) {
                      onViewModeChange("grid");
                    } else {
                      setLocalView("grid");
                    }
                  }}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "rounded-none border-x",
                    view === "list" && "bg-muted"
                  )}
                  onClick={() => {
                    if (onViewModeChange) {
                      onViewModeChange("list");
                    } else {
                      setLocalView("list");
                    }
                  }}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "rounded-l-none",
                    (currentView === "map" || view === "map") && "bg-muted"
                  )}
                  onClick={() => {
                    if (onViewModeChange) {
                      onViewModeChange("map");
                    } else {
                      onViewChange?.("map");
                    }
                  }}
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <LoadingSpinner />
              <p className="text-muted-foreground">Buscando terrenos...</p>
            </div>
          </div>
        ) : lands.length > 0 ? (
          <div className="p-4">
            <div
              className={cn(
                "grid gap-4",
                view === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              )}
            >
              {lands.map((land) => (
                <LandCard
                  key={land.id}
                  land={land}
                  variant={view === "list" ? "horizontal" : "vertical"}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4 p-8">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  No se encontraron terrenos
                </h3>
                <p className="text-muted-foreground mt-1">
                  Intenta ajustar tus filtros de búsqueda para encontrar más
                  resultados.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple Land Card Component
function LandCard({
  land,
  variant = "vertical",
}: {
  land: LandSummary;
  variant?: "vertical" | "horizontal";
}) {
  const isHorizontal = variant === "horizontal";

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className={cn("flex", isHorizontal ? "flex-row" : "flex-col")}>
        {/* Image */}
        <div
          className={cn(
            "relative bg-muted",
            isHorizontal ? "w-48 h-32" : "w-full h-48"
          )}
        >
          {land.mainImage ? (
            <img
              src={land.mainImage}
              alt={land.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <Badge className="absolute top-2 right-2 capitalize">
            {land.type}
          </Badge>
        </div>

        {/* Content */}
        <CardContent className={cn("p-4", isHorizontal && "flex-1")}>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg line-clamp-2">{land.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {land.features.join(", ") || "Sin características especificadas"}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{land.area.toLocaleString()} m²</span>
              <span>{land.location}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-primary">
                ${land.price.toLocaleString()}
              </div>
              <Button size="sm">Ver Detalles</Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
