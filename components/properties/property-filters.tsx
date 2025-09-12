"use client"


import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface PropertyFilters {
  type: string
  minPrice: string
  maxPrice: string
  bedrooms: string
  location: string
}

interface PropertyFiltersProps {
  filters: PropertyFilters
  setFilters: (filters: PropertyFilters | ((prev: PropertyFilters) => PropertyFilters)) => void
}

export function PropertyFilters({ filters, setFilters }: PropertyFiltersProps) {



  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      type: "all",
      minPrice: "",
      maxPrice: "",
      bedrooms: "all",
      location: "",
    })
  }

  return (
    <Card className="border-blackCoral">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 smartphone:grid-cols-2 tablet:grid-cols-3 laptop:grid-cols-5 gap-4">
          {/* Property Type */}
          <div className="space-y-2">
            <Label className="text-arsenic">Tipo de Propiedad</Label>
            <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
              <SelectTrigger className="border-blackCoral">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="sale">En Venta</SelectItem>
              <SelectItem value="rent">En Alquiler</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Min Price */}
          <div className="space-y-2">
            <Label className="text-arsenic">Precio Mínimo</Label>
            <Input
              type="number"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
              className="border-blackCoral"
            />
          </div>

          {/* Max Price */}
          <div className="space-y-2">
            <Label className="text-arsenic">Precio Máximo</Label>
            <Input
              type="number"
              placeholder="Sin límite"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              className="border-blackCoral"
            />
          </div>

          {/* Bedrooms */}
          <div className="space-y-2">
            <Label className="text-arsenic">Habitaciones</Label>
            <Select value={filters.bedrooms} onValueChange={(value) => handleFilterChange("bedrooms", value)}>
              <SelectTrigger className="border-blackCoral">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="text-arsenic">Ubicación</Label>
            <Input
              placeholder="Ciudad o zona"
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="border-blackCoral"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            onClick={clearFilters}
            className="border-blackCoral text-blackCoral hover:bg-blackCoral hover:text-white bg-transparent"
          >
            Limpiar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
