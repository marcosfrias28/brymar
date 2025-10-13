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
  Bell,
  ArrowUpDown,
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RealTimeSearchFiltersProps {
  filters: Record<string, any>;
  onFilterChange: (filterName: string, value: any) => void;
  isLoading?: boolean;
  className?: string;
}

export function RealTimeSearchFilters({
  filters,
  onFilterChange,
  isLoading = false,
  className,
}: RealTimeSearchFiltersProps) {
  // Local state for sliders to prevent too many URL updates
  const [localPriceRange, setLocalPriceRange] = useState([
    filters.minPrice || 50000,
    filters.maxPrice || 2000000,
  ]);
  const [localAreaRange, setLocalAreaRange] = useState([
    filters.minArea || 50,
    filters.maxArea || 1000,
  ]);

  // Property types from schema
  const propertyTypes = [
    { value: "casa", label: "Casa" },
    { value: "apartamento", label: "Apartamento" },
    { value: "villa", label: "Villa" },
    { value: "penthouse", label: "Penthouse" },
    { value: "duplex", label: "Dúplex" },
    { value: "estudio", label: "Estudio" },
    { value: "comercial", label: "Comercial" },
    { value: "oficina", label: "Oficina" },
    { value: "local", label: "Local Comercial" },
  ];

  // Property status from schema
  const propertyStatus = [
    { value: "venta", label: "En Venta" },
    { value: "alquiler", label: "En Alquiler" },
    { value: "vendido", label: "Vendido" },
    { value: "alquilado", label: "Alquilado" },
    { value: "reservado", label: "Reservado" },
  ];

  // Common amenities and features
  const amenities = [
    { id: "piscina", label: "Piscina" },
    { id: "garaje", label: "Garaje" },
    { id: "jardin", label: "Jardín" },
    { id: "terraza", label: "Terraza" },
    { id: "balcon", label: "Balcón" },
    { id: "gimnasio", label: "Gimnasio" },
    { id: "seguridad", label: "Seguridad 24h" },
    { id: "ascensor", label: "Ascensor" },
    { id: "aire_acondicionado", label: "Aire Acondicionado" },
    { id: "calefaccion", label: "Calefacción" },
    { id: "chimenea", label: "Chimenea" },
    { id: "lavanderia", label: "Lavandería" },
  ];

  // Update local ranges when filters change from URL
  useEffect(() => {
    setLocalPriceRange([
      filters.minPrice || 50000,
      filters.maxPrice || 2000000,
    ]);
    setLocalAreaRange([filters.minArea || 50, filters.maxArea || 1000]);
  }, [filters.minPrice, filters.maxPrice, filters.minArea, filters.maxArea]);

  // Handle slider changes with debounce
  const handlePriceRangeChange = (values: number[]) => {
    setLocalPriceRange(values);
    // Update URL immediately for better UX
    onFilterChange("minPrice", values[0]);
    onFilterChange("maxPrice", values[1]);
  };

  const handleAreaRangeChange = (values: number[]) => {
    setLocalAreaRange(values);
    // Update URL immediately for better UX
    onFilterChange("minArea", values[0]);
    onFilterChange("maxArea", values[1]);
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
    // Clear all filters by setting them to undefined
    Object.keys(filters).forEach((key) => {
      onFilterChange(key, undefined);
    });
    setLocalPriceRange([50000, 2000000]);
    setLocalAreaRange([50, 1000]);
  };

  const activeFiltersCount = Object.keys(filters).length;

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Filter className="h-5 w-5" />
          Filtros de Búsqueda
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {activeFiltersCount} filtros
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Location Search */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium">
            Ubicación
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="location"
              placeholder="Ciudad, Zona, Dirección..."
              className="pl-10"
              value={filters.location || ""}
              onChange={(e) => onFilterChange("location", e.target.value)}
            />
          </div>
        </div>

        {/* Property Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tipo de Propiedad</Label>
          <Select
            value={filters.propertyType || ""}
            onValueChange={(value) =>
              onFilterChange(
                "propertyType",
                value === "all" ? undefined : value
              )
            }
          >
            <SelectTrigger>
              <Building2 className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {propertyTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Property Status */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Estado</Label>
          <Select
            value={filters.status || ""}
            onValueChange={(value) =>
              onFilterChange("status", value === "all" ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {propertyStatus.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            Ordenar por
          </Label>
          <Select
            value={filters.sortBy || "newest"}
            onValueChange={(value) =>
              onFilterChange("sortBy", value === "newest" ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar orden" />
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

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Rango de Precio
          </Label>
          <div className="px-2">
            <Slider
              min={10000}
              max={5000000}
              step={10000}
              value={localPriceRange}
              onValueChange={handlePriceRangeChange}
              className="py-4"
              disabled={isLoading}
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>${localPriceRange[0].toLocaleString()}</span>
              <span>${localPriceRange[1].toLocaleString()}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Precio mín"
              value={localPriceRange[0]}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                const newRange = [value, localPriceRange[1]];
                setLocalPriceRange(newRange);
                onFilterChange("minPrice", value);
              }}
              disabled={isLoading}
            />
            <Input
              type="number"
              placeholder="Precio máx"
              value={localPriceRange[1]}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                const newRange = [localPriceRange[0], value];
                setLocalPriceRange(newRange);
                onFilterChange("maxPrice", value);
              }}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Bedrooms and Bathrooms */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Bed className="h-4 w-4" />
              Habitaciones
            </Label>
            <Select
              value={filters.bedrooms || ""}
              onValueChange={(value) =>
                onFilterChange("bedrooms", value === "any" ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Cualquiera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Cualquiera</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
                <SelectItem value="5">5+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Bath className="h-4 w-4" />
              Baños
            </Label>
            <Select
              value={filters.bathrooms || ""}
              onValueChange={(value) =>
                onFilterChange("bathrooms", value === "any" ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Cualquiera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Cualquiera</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Area Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Maximize className="h-4 w-4" />
            Área (m²)
          </Label>
          <div className="px-2">
            <Slider
              min={20}
              max={2000}
              step={10}
              value={localAreaRange}
              onValueChange={handleAreaRangeChange}
              className="py-4"
              disabled={isLoading}
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>{localAreaRange[0]} m²</span>
              <span>{localAreaRange[1]} m²</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Área mín"
              value={localAreaRange[0]}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                const newRange = [value, localAreaRange[1]];
                setLocalAreaRange(newRange);
                onFilterChange("minArea", value);
              }}
              disabled={isLoading}
            />
            <Input
              type="number"
              placeholder="Área máx"
              value={localAreaRange[1]}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                const newRange = [localAreaRange[0], value];
                setLocalAreaRange(newRange);
                onFilterChange("maxArea", value);
              }}
              disabled={isLoading}
            />
          </div>
        </div>

        <Separator />

        {/* Amenities */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Amenidades</Label>
          <div className="grid grid-cols-2 gap-3">
            {amenities.map((amenity) => (
              <div key={amenity.id} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity.id}
                  checked={(filters.amenities || []).includes(amenity.id)}
                  onCheckedChange={(checked) =>
                    handleAmenityChange(amenity.id, checked as boolean)
                  }
                  disabled={isLoading}
                />
                <Label
                  htmlFor={amenity.id}
                  className="text-sm font-normal cursor-pointer"
                >
                  {amenity.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={resetFilters}
            disabled={isLoading || activeFiltersCount === 0}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Limpiar Filtros
          </Button>
        </div>

        <Separator />

        {/* Save Search Alert */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Alertas de Búsqueda</Label>
          <p className="text-sm text-muted-foreground">
            Guarda esta búsqueda y te notificaremos cuando nuevas propiedades
            coincidan.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={activeFiltersCount === 0}
          >
            <Bell className="mr-2 h-4 w-4" />
            Guardar Búsqueda
          </Button>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="text-center py-2">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Buscando...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
