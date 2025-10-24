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

interface RealTimeLandFiltersProps {
	filters: LandSearchFilters | SearchLandsFilters;
	onFilterChange: (filterName: string, value: any) => void;
	isLoading?: boolean;
	className?: string;
}

export function RealTimeLandFilters({
	filters,
	onFilterChange,
	isLoading = false,
	className,
}: RealTimeLandFiltersProps) {
	// Local state for sliders to prevent too many URL updates
	const [localPriceRange, setLocalPriceRange] = useState([
		filters.minPrice || 10000,
		filters.maxPrice || 1000000,
	]);
	const [localAreaRange, setLocalAreaRange] = useState([
		filters.minArea || 100,
		filters.maxArea || 10000,
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
			filters.minPrice || 10000,
			filters.maxPrice || 1000000,
		]);
		setLocalAreaRange([filters.minArea || 100, filters.maxArea || 10000]);
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
		setLocalPriceRange([10000, 1000000]);
		setLocalAreaRange([100, 10000]);
	};

	const activeFiltersCount = Object.keys(filters).length;

	return (
		<Card className={cn("", className)}>
			<CardHeader className="pb-4">
				<CardTitle className="flex items-center gap-2 text-xl">
					<Filter className="h-5 w-5" />
					Filtros de Terrenos
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

				{/* Land Type */}
				<div className="space-y-2">
					<Label className="text-sm font-medium">Tipo de Terreno</Label>
					<Select
						value={(filters as any).landType || ""}
						onValueChange={(value) =>
							onFilterChange("landType", value === "all" ? undefined : value)
						}
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
					<Label className="text-sm font-medium flex items-center gap-2">
						<ArrowUpDown className="h-4 w-4" />
						Ordenar por
					</Label>
					<Select
						value={(filters as any).sortBy || "newest"}
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
							min={5000}
							max={2000000}
							step={5000}
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
								const value = parseInt(e.target.value, 10) || 0;
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
								const value = parseInt(e.target.value, 10) || 0;
								const newRange = [localPriceRange[0], value];
								setLocalPriceRange(newRange);
								onFilterChange("maxPrice", value);
							}}
							disabled={isLoading}
						/>
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
							min={50}
							max={50000}
							step={50}
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
								const value = parseInt(e.target.value, 10) || 0;
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
								const value = parseInt(e.target.value, 10) || 0;
								const newRange = [localAreaRange[0], value];
								setLocalAreaRange(newRange);
								onFilterChange("maxArea", value);
							}}
							disabled={isLoading}
						/>
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
						Guarda esta búsqueda y te notificaremos cuando nuevos terrenos
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
							Buscando terrenos...
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
