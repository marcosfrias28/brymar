"use client";

import {
	ArrowUpDown,
	Bell,
	DollarSign,
	Filter,
	MapPin,
	Maximize,
	RotateCcw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import type { LandSearchFilters, SearchLandsFilters } from "@/lib/types";
import { cn } from "@/lib/utils";

type RealTimeLandFiltersProps = {
	filters: LandSearchFilters | SearchLandsFilters;
	onFilterChange: (filterName: string, value: any) => void;
	isLoading?: boolean;
	className?: string;
};

export function RealTimeLandFilters({
	filters,
	onFilterChange,
	isLoading = false,
	className,
}: RealTimeLandFiltersProps) {
	// Local state for sliders to prevent too many URL updates
	const [localPriceRange, setLocalPriceRange] = useState([
		filters.minPrice || 10_000,
		filters.maxPrice || 1_000_000,
	]);
	const [localAreaRange, setLocalAreaRange] = useState([
		filters.minArea || 100,
		filters.maxArea || 10_000,
	]);

	// Land types from schema
	const landTypes = [
		{ value: "residential", label: "Residencial" },
		{ value: "commercial", label: "Comercial" },
		{ value: "industrial", label: "Industrial" },
		{ value: "agricultural", label: "Agrícola" },
		{ value: "mixed", label: "Mixto" },
		{ value: "tourist", label: "Turístico" },
		{ value: "development", label: "Para Desarrollo" },
	];

	// Update local ranges when filters change from URL
	useEffect(() => {
		setLocalPriceRange([
			filters.minPrice || 10_000,
			filters.maxPrice || 1_000_000,
		]);
		setLocalAreaRange([filters.minArea || 100, filters.maxArea || 10_000]);
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

	const resetFilters = () => {
		// Clear all filters by setting them to undefined
		Object.keys(filters).forEach((key) => {
			onFilterChange(key, undefined);
		});
		setLocalPriceRange([10_000, 1_000_000]);
		setLocalAreaRange([100, 10_000]);
	};

	const activeFiltersCount = Object.keys(filters).length;

	return (
		<Card className={cn("", className)}>
			<CardHeader className="pb-4">
				<CardTitle className="flex items-center gap-2 text-xl">
					<Filter className="h-5 w-5" />
					Filtros de Terrenos
					{activeFiltersCount > 0 && (
						<Badge className="ml-auto" variant="secondary">
							{activeFiltersCount} filtros
						</Badge>
					)}
				</CardTitle>
			</CardHeader>

			<CardContent className="space-y-6">
				{/* Location Search */}
				<div className="space-y-2">
					<Label className="font-medium text-sm" htmlFor="location">
						Ubicación
					</Label>
					<div className="relative">
						<MapPin className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
						<Input
							className="pl-10"
							id="location"
							onChange={(e) => onFilterChange("location", e.target.value)}
							placeholder="Ciudad, Zona, Dirección..."
							value={filters.location || ""}
						/>
					</div>
				</div>

				{/* Land Type */}
				<div className="space-y-2">
					<Label className="font-medium text-sm">Tipo de Terreno</Label>
					<Select
						onValueChange={(value) =>
							onFilterChange("landType", value === "all" ? undefined : value)
						}
						value={(filters as any).landType || ""}
					>
						<SelectTrigger>
							<SelectValue placeholder="Seleccionar tipo" />
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

				{/* Sort By */}
				<div className="space-y-2">
					<Label className="flex items-center gap-2 font-medium text-sm">
						<ArrowUpDown className="h-4 w-4" />
						Ordenar por
					</Label>
					<Select
						onValueChange={(value) =>
							onFilterChange("sortBy", value === "newest" ? undefined : value)
						}
						value={(filters as any).sortBy || "newest"}
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
					<Label className="flex items-center gap-2 font-medium text-sm">
						<DollarSign className="h-4 w-4" />
						Rango de Precio
					</Label>
					<div className="px-2">
						<Slider
							className="py-4"
							disabled={isLoading}
							max={2_000_000}
							min={5000}
							onValueChange={handlePriceRangeChange}
							step={5000}
							value={localPriceRange}
						/>
						<div className="mt-1 flex justify-between text-muted-foreground text-sm">
							<span>${localPriceRange[0].toLocaleString()}</span>
							<span>${localPriceRange[1].toLocaleString()}</span>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-2">
						<Input
							disabled={isLoading}
							onChange={(e) => {
								const value = Number.parseInt(e.target.value, 10) || 0;
								const newRange = [value, localPriceRange[1]];
								setLocalPriceRange(newRange);
								onFilterChange("minPrice", value);
							}}
							placeholder="Precio mín"
							type="number"
							value={localPriceRange[0]}
						/>
						<Input
							disabled={isLoading}
							onChange={(e) => {
								const value = Number.parseInt(e.target.value, 10) || 0;
								const newRange = [localPriceRange[0], value];
								setLocalPriceRange(newRange);
								onFilterChange("maxPrice", value);
							}}
							placeholder="Precio máx"
							type="number"
							value={localPriceRange[1]}
						/>
					</div>
				</div>

				{/* Area Range */}
				<div className="space-y-3">
					<Label className="flex items-center gap-2 font-medium text-sm">
						<Maximize className="h-4 w-4" />
						Área (m²)
					</Label>
					<div className="px-2">
						<Slider
							className="py-4"
							disabled={isLoading}
							max={50_000}
							min={50}
							onValueChange={handleAreaRangeChange}
							step={50}
							value={localAreaRange}
						/>
						<div className="mt-1 flex justify-between text-muted-foreground text-sm">
							<span>{localAreaRange[0]} m²</span>
							<span>{localAreaRange[1]} m²</span>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-2">
						<Input
							disabled={isLoading}
							onChange={(e) => {
								const value = Number.parseInt(e.target.value, 10) || 0;
								const newRange = [value, localAreaRange[1]];
								setLocalAreaRange(newRange);
								onFilterChange("minArea", value);
							}}
							placeholder="Área mín"
							type="number"
							value={localAreaRange[0]}
						/>
						<Input
							disabled={isLoading}
							onChange={(e) => {
								const value = Number.parseInt(e.target.value, 10) || 0;
								const newRange = [localAreaRange[0], value];
								setLocalAreaRange(newRange);
								onFilterChange("maxArea", value);
							}}
							placeholder="Área máx"
							type="number"
							value={localAreaRange[1]}
						/>
					</div>
				</div>

				<Separator />

				{/* Action Buttons */}
				<div className="space-y-3">
					<Button
						className="w-full"
						disabled={isLoading || activeFiltersCount === 0}
						onClick={resetFilters}
						type="button"
						variant="outline"
					>
						<RotateCcw className="mr-2 h-4 w-4" />
						Limpiar Filtros
					</Button>
				</div>

				<Separator />

				{/* Save Search Alert */}
				<div className="space-y-3">
					<Label className="font-medium text-sm">Alertas de Búsqueda</Label>
					<p className="text-muted-foreground text-sm">
						Guarda esta búsqueda y te notificaremos cuando nuevos terrenos
						coincidan.
					</p>
					<Button
						className="w-full"
						disabled={activeFiltersCount === 0}
						type="button"
						variant="secondary"
					>
						<Bell className="mr-2 h-4 w-4" />
						Guardar Búsqueda
					</Button>
				</div>

				{/* Loading indicator */}
				{isLoading && (
					<div className="py-2 text-center">
						<div className="inline-flex items-center gap-2 text-muted-foreground text-sm">
							<div className="h-4 w-4 animate-spin rounded-full border-primary border-b-2" />
							Buscando terrenos...
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
