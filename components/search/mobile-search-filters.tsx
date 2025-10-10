"use client";

import { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Building2,
  DollarSign,
  Bed,
  Bath,
  Maximize,
  Filter,
  RotateCcw,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MobileSearchFiltersProps {
  filters: Record<string, any>;
  onFilterChange: (filterName: string, value: any) => void;
  isLoading?: boolean;
  className?: string;
}

export function MobileSearchFilters({
  filters,
  onFilterChange,
  isLoading = false,
  className,
}: MobileSearchFiltersProps) {
  // Local state for sliders
  const [localPriceRange, setLocalPriceRange] = useState([
    filters.minPrice || 50000,
    filters.maxPrice || 2000000,
  ]);

  // Property types (reduced for mobile)
  const propertyTypes = [
    { value: "casa", label: "Casa" },
    { value: "apartamento", label: "Apartamento" },
    { value: "villa", label: "Villa" },
    { value: "comercial", label: "Comercial" },
  ];

  // Property status
  const propertyStatus = [
    { value: "venta", label: "Venta" },
    { value: "alquiler", label: "Alquiler" },
  ];

  // Essential amenities only
  const amenities = [
    { id: "piscina", label: "Piscina" },
    { id: "garaje", label: "Garaje" },
    { id: "jardin", label: "Jardín" },
    { id: "terraza", label: "Terraza" },
  ];

  // Update local ranges when filters change from URL
  useEffect(() => {
    setLocalPriceRange([
      filters.minPrice || 50000,
      filters.maxPrice || 2000000,
    ]);
  }, [filters.minPrice, filters.maxPrice]);

  // Handle slider changes
  const handlePriceRangeChange = (values: number[]) => {
    setLocalPriceRange(values);
    onFilterChange("minPrice", values[0]);
    onFilterChange("maxPrice", values[1]);
  };

  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    const currentAmenities = filters.amenities || [];
    let newAmenities;

    if (checked) {
      newAmenities = [...currentAmenities, amenityId];
    } else {
      newAmenities = currentAmenities.filter((id: string) => id !== amenityId);
    }

    onFilterChange("amenities", newAmenities);
  };

  const resetFilters = () => {
    Object.keys(filters).forEach((key) => {
      onFilterChange(key, undefined);
    });
    setLocalPriceRange([50000, 2000000]);
  };

  const activeFiltersCount = Object.keys(filters).length;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Quick Filters Row */}
      <div className="grid grid-cols-2 gap-2">
        {/* Location */}
        <div className="relative">
          <MapPin className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Ubicación..."
            className="pl-7 h-8 text-xs"
            value={filters.location || ""}
            onChange={(e) => onFilterChange("location", e.target.value)}
          />
        </div>

        {/* Sort By */}
        <Select
          value={filters.sortBy || "newest"}
          onValueChange={(value) =>
            onFilterChange("sortBy", value === "newest" ? undefined : value)
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <ArrowUpDown className="mr-1 h-3 w-3" />
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Más recientes</SelectItem>
            <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
            <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
            <SelectItem value="area-large">Área: mayor a menor</SelectItem>
            <SelectItem value="area-small">Área: menor a mayor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Second Row - Property Type and Status */}
      <div className="grid grid-cols-2 gap-2">
        {/* Property Type */}
        <Select
          value={filters.propertyType || ""}
          onValueChange={(value) =>
            onFilterChange("propertyType", value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {propertyTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Property Status */}
        <Select
          value={filters.status || ""}
          onValueChange={(value) =>
            onFilterChange("status", value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="venta">Venta</SelectItem>
            <SelectItem value="alquiler">Alquiler</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range - Compact */}
      <div className="space-y-2">
        <Label className="text-xs font-medium flex items-center gap-1">
          <DollarSign className="h-3 w-3" />$
          {localPriceRange[0].toLocaleString()} - $
          {localPriceRange[1].toLocaleString()}
        </Label>
        <Slider
          min={10000}
          max={5000000}
          step={10000}
          value={localPriceRange}
          onValueChange={handlePriceRangeChange}
          className="py-2"
          disabled={isLoading}
        />
      </div>

      {/* Bedrooms and Bathrooms */}
      <div className="grid grid-cols-2 gap-2">
        <Select
          value={filters.bedrooms || ""}
          onValueChange={(value) =>
            onFilterChange("bedrooms", value === "any" ? undefined : value)
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <Bed className="mr-1 h-3 w-3" />
            <SelectValue placeholder="Hab." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Cualquiera</SelectItem>
            <SelectItem value="1">1+</SelectItem>
            <SelectItem value="2">2+</SelectItem>
            <SelectItem value="3">3+</SelectItem>
            <SelectItem value="4">4+</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.bathrooms || ""}
          onValueChange={(value) =>
            onFilterChange("bathrooms", value === "any" ? undefined : value)
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <Bath className="mr-1 h-3 w-3" />
            <SelectValue placeholder="Baños" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Cualquiera</SelectItem>
            <SelectItem value="1">1+</SelectItem>
            <SelectItem value="2">2+</SelectItem>
            <SelectItem value="3">3+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Essential Amenities - Compact */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Amenidades</Label>
        <div className="grid grid-cols-2 gap-2">
          {amenities.map((amenity) => (
            <div key={amenity.id} className="flex items-center space-x-1">
              <Checkbox
                id={amenity.id}
                checked={(filters.amenities || []).includes(amenity.id)}
                onCheckedChange={(checked) =>
                  handleAmenityChange(amenity.id, checked as boolean)
                }
                disabled={isLoading}
                className="h-3 w-3"
              />
              <Label
                htmlFor={amenity.id}
                className="text-xs font-normal cursor-pointer"
              >
                {amenity.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 h-8 text-xs"
          onClick={resetFilters}
          disabled={isLoading || activeFiltersCount === 0}
        >
          <RotateCcw className="mr-1 h-3 w-3" />
          Limpiar
        </Button>
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="px-2 py-1 text-xs">
            {activeFiltersCount}
          </Badge>
        )}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="text-center py-1">
          <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
            Buscando...
          </div>
        </div>
      )}
    </div>
  );
}
