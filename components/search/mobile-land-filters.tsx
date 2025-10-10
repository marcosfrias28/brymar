"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Maximize,
  DollarSign,
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
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MobileLandFiltersProps {
  filters: Record<string, any>;
  onFilterChange: (filterName: string, value: any) => void;
  isLoading?: boolean;
  className?: string;
}

export function MobileLandFilters({
  filters,
  onFilterChange,
  isLoading = false,
  className,
}: MobileLandFiltersProps) {
  // Local state for sliders
  const [localPriceRange, setLocalPriceRange] = useState([
    filters.minPrice || 10000,
    filters.maxPrice || 1000000,
  ]);
  const [localAreaRange, setLocalAreaRange] = useState([
    filters.minArea || 100,
    filters.maxArea || 10000,
  ]);

  // Land types (essential ones for mobile)
  const landTypes = [
    { value: "residencial", label: "Residencial" },
    { value: "comercial", label: "Comercial" },
    { value: "agricola", label: "Agrícola" },
    { value: "turistico", label: "Turístico" },
  ];

  // Update local ranges when filters change from URL
  useEffect(() => {
    setLocalPriceRange([
      filters.minPrice || 10000,
      filters.maxPrice || 1000000,
    ]);
    setLocalAreaRange([filters.minArea || 100, filters.maxArea || 10000]);
  }, [filters.minPrice, filters.maxPrice, filters.minArea, filters.maxArea]);

  // Handle slider changes
  const handlePriceRangeChange = (values: number[]) => {
    setLocalPriceRange(values);
    onFilterChange("minPrice", values[0]);
    onFilterChange("maxPrice", values[1]);
  };

  const handleAreaRangeChange = (values: number[]) => {
    setLocalAreaRange(values);
    onFilterChange("minArea", values[0]);
    onFilterChange("maxArea", values[1]);
  };

  const resetFilters = () => {
    Object.keys(filters).forEach((key) => {
      onFilterChange(key, undefined);
    });
    setLocalPriceRange([10000, 1000000]);
    setLocalAreaRange([100, 10000]);
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

      {/* Second Row - Land Type */}
      <div className="grid grid-cols-1 gap-2">
        {/* Land Type */}
        <Select
          value={filters.landType || ""}
          onValueChange={(value) =>
            onFilterChange("landType", value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Tipo de terreno" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {landTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
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
          min={5000}
          max={2000000}
          step={5000}
          value={localPriceRange}
          onValueChange={handlePriceRangeChange}
          className="py-2"
          disabled={isLoading}
        />
      </div>

      {/* Area Range - Compact */}
      <div className="space-y-2">
        <Label className="text-xs font-medium flex items-center gap-1">
          <Maximize className="h-3 w-3" />
          {localAreaRange[0]} - {localAreaRange[1]} m²
        </Label>
        <Slider
          min={50}
          max={50000}
          step={50}
          value={localAreaRange}
          onValueChange={handleAreaRangeChange}
          className="py-2"
          disabled={isLoading}
        />
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
            Buscando terrenos...
          </div>
        </div>
      )}
    </div>
  );
}
