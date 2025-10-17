"use client";

import {
  Search,
  Building2,
  MapPin,
  Plus,
  RotateCcw,
  LayoutGrid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

interface SearchFiltersProps {
  translations?: any;
  onSubmit?: (formData: FormData) => void;
  formAction?: (formData: FormData) => void;
  isPending: boolean;
  onViewChange?: (view: "grid" | "list") => void;
  view?: "grid" | "list";
}

export function SearchFilters({
  translations: t,
  onSubmit,
  formAction,
  isPending,
  onViewChange,
  view,
}: SearchFiltersProps) {
  const [priceRange, setPriceRange] = useState([30, 1000000]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <form action={formAction || onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Buscar propiedades..."
            className="pl-10"
          />
        </div>
        <Select name="province">
          <SelectTrigger>
            <MapPin className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Todas las provincias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las provincias</SelectItem>
            {/* Add provinces as needed */}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Select name="state">
          <SelectTrigger>
            <Building2 className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Cualquier estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Cualquier estado</SelectItem>
            {/* Add states as needed */}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Búsqueda Avanzada
          </Button>
          <div className="flex gap-1 border rounded-lg">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={view === "grid" ? "bg-muted" : ""}
              onClick={() => onViewChange?.("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={view === "list" ? "bg-muted" : ""}
              onClick={() => onViewChange?.("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {showAdvanced && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Rango de Precio: ${priceRange[0].toLocaleString()} - $
              {priceRange[1].toLocaleString()}
            </label>
            <Slider
              min={30}
              max={1000000}
              step={1000}
              value={priceRange}
              onValueChange={setPriceRange}
              className="py-4"
            />
          </div>
          <input type="hidden" name="minPrice" value={priceRange[0]} />
          <input type="hidden" name="maxPrice" value={priceRange[1]} />
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="reset"
          variant="outline"
          className="flex-1"
          onClick={() => {
            setPriceRange([30, 1000000]);
            setShowAdvanced(false);
          }}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Limpiar
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          disabled={isPending}
        >
          {isPending ? "Buscando..." : "Buscar"}
        </Button>
      </div>
    </form>
  );
}
