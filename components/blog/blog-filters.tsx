"use client"


import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface BlogFilters {
  status: string
  category: string
  author: string
  dateFrom: string
  dateTo: string
}

interface BlogFiltersProps {
  filters: BlogFilters
  setFilters: (filters: BlogFilters | ((prev: BlogFilters) => BlogFilters)) => void
}

export function BlogFilters({ filters, setFilters }: BlogFiltersProps) {



  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev: BlogFilters) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      status: "all",
      category: "all",
      author: "",
      dateFrom: "",
      dateTo: "",
    })
  }

  return (
    <Card className="border-blackCoral">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 smartphone:grid-cols-2 tablet:grid-cols-3 laptop:grid-cols-5 gap-4">
          {/* Status */}
          <div className="space-y-2">
            <Label className="text-arsenic">Estado</Label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger className="border-blackCoral">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="published">Publicados</SelectItem>
                <SelectItem value="draft">Borradores</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-arsenic">Categoría</Label>
            <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
              <SelectTrigger className="border-blackCoral">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="inversiones">Inversiones</SelectItem>
                <SelectItem value="mercado">Mercado</SelectItem>
                <SelectItem value="consejos">Consejos</SelectItem>
                <SelectItem value="desarrollos">Desarrollos</SelectItem>
                <SelectItem value="noticias">Noticias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Author */}
          <div className="space-y-2">
            <Label className="text-arsenic">Autor</Label>
            <Input
              placeholder="Buscar autor"
              value={filters.author}
              onChange={(e) => handleFilterChange("author", e.target.value)}
              className="border-blackCoral"
            />
          </div>

          {/* Date From */}
          <div className="space-y-2">
            <Label className="text-arsenic">Desde</Label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="border-blackCoral"
            />
          </div>

          {/* Date To */}
          <div className="space-y-2">
            <Label className="text-arsenic">Hasta</Label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
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
