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
import { PropertyCard } from "@/components/properties/property-card";
import { PropertyMap } from "@/components/properties/property-map";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { InlineErrorState } from "@/components/ui/error-states";
import { cn } from "@/lib/utils";
import { PropertySearchResult } from "@/presentation/hooks/use-properties";

interface PropertyResultsProps {
  properties: PropertySearchResult[];
  total: number;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  onViewChange?: (view: "results" | "map") => void;
  currentView?: "results" | "map";
  className?: string;
}

export function PropertyResults({
  properties,
  total,
  isLoading = false,
  error,
  onRetry,
  onViewChange,
  currentView = "results",
  className,
}: PropertyResultsProps) {
  const [view, setView] = useState<"grid" | "list" | "map">("grid");
  const [sortBy, setSortBy] = useState("newest");

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
                {isLoading ? "Buscando..." : `${total} propiedades encontradas`}
              </h2>
              {total > 0 && (
                <Badge variant="secondary">
                  {properties.length} de {total}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Sort Options */}
              <Select value={sortBy} onValueChange={setSortBy}>
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
                  onClick={() => setView("grid")}
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
                  onClick={() => setView("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("rounded-l-none", view === "map" && "bg-muted")}
                  onClick={() => {
                    setView("map");
                    onViewChange?.("map");
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
              <p className="text-muted-foreground">Buscando propiedades...</p>
            </div>
          </div>
        ) : view === "map" ? (
          <div className="h-full">
            <PropertyMap properties={properties} />
          </div>
        ) : properties.length > 0 ? (
          <div className="p-8">
            <div
              className={cn(
                "grid gap-8",
                view === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              )}
            >
              {properties.map((property) => (
                <PropertyCard
                  key={property.getId().value}
                  property={property}
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
                  No se encontraron propiedades
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
