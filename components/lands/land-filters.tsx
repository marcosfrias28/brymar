"use client"

import { useLangStore } from "@/utils/store/lang-store"
import { translations } from "@/lib/translations"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface LandFiltersProps {
  filters: {
    type: string
    minPrice: string
    maxPrice: string
    minSurface: string
    maxSurface: string
    location: string
  }
  setFilters: (filters: any) => void
}

export function LandFilters({ filters, setFilters }: LandFiltersProps) {
  const { language } = useLangStore()
  const t = translations[language]

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      type: "all",
      minPrice: "",
      maxPrice: "",
      minSurface: "",
      maxSurface: "",
      location: "",
    })
  }

  return (
    <Card className="border-black-coral">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 smartphone:grid-cols-2 tablet:grid-cols-3 laptop:grid-cols-6 gap-4">
          {/* Land Type */}
          <div className="space-y-2">
            <Label className="text-arsenic">Tipo de Terreno</Label>
            <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
              <SelectTrigger className="border-black-coral">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="commercial">Comercial</SelectItem>
                <SelectItem value="residential">Residencial</SelectItem>
                <SelectItem value="agricultural">Agrícola</SelectItem>
                <SelectItem value="beachfront">Frente al Mar</SelectItem>
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
              className="border-black-coral"
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
              className="border-black-coral"
            />
          </div>

          {/* Min Surface */}
          <div className="space-y-2">
            <Label className="text-arsenic">Superficie Mín. (m²)</Label>
            <Input
              type="number"
              placeholder="0"
              value={filters.minSurface}
              onChange={(e) => handleFilterChange("minSurface", e.target.value)}
              className="border-black-coral"
            />
          </div>

          {/* Max Surface */}
          <div className="space-y-2">
            <Label className="text-arsenic">Superficie Máx. (m²)</Label>
            <Input
              type="number"
              placeholder="Sin límite"
              value={filters.maxSurface}
              onChange={(e) => handleFilterChange("maxSurface", e.target.value)}
              className="border-black-coral"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="text-arsenic">{t.location}</Label>
            <Input
              placeholder="Ciudad o zona"
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="border-black-coral"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            onClick={clearFilters}
            className="border-black-coral text-black-coral hover:bg-black-coral hover:text-white bg-transparent"
          >
            Limpiar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
