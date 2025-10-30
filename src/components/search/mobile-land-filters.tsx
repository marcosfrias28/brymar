"use client";

import {
	ArrowUpDown,
	DollarSign,
	MapPin,
	Maximize,
	RotateCcw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";

type MobileLandFiltersProps = {
	filters: Record<string, any>;
	onFilterChange: (filterName: string, value: any) => void;
	isLoading?: boolean;
	className?: string;
};

export function MobileLandFilters({
	filters,
	onFilterChange,
	isLoading = false,
	className,
}: MobileLandFiltersProps) {
	// Local state for sliders
	const [localPriceRange, setLocalPriceRange] = useState([
		filters.minPrice || 10_000,
		filters.maxPrice || 1_000_000,
	]);
	const [localAreaRange, setLocalAreaRange] = useState([
		filters.minArea || 100,
		filters.maxArea || 10_000,
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
			filters.minPrice || 10_000,
			filters.maxPrice || 1_000_000,
		]);
		setLocalAreaRange([filters.minArea || 100, filters.maxArea || 10_000]);
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
		setLocalPriceRange([10_000, 1_000_000]);
		setLocalAreaRange([100, 10_000]);
	};

	const activeFiltersCount = Object.keys(filters).length;

	return (
		<div className={cn("space-y-3", className)}>
			{/* Quick Filters Row */}
			<div className="grid grid-cols-2 gap-2">
				{/* Location */}
				<div className="relative">
					<MapPin className="absolute top-2 left-2 h-3 w-3 text-muted-foreground" />
					<Input
						className="h-8 pl-7 text-xs"
						onChange={(e) => onFilterChange("location", e.target.value)}
						placeholder="Ubicación..."
						value={filters.location || ""}
					/>
				</div>

				{/* Sort By */}
				<Select
					onValueChange={(value) =>
						onFilterChange("sortBy", value === "newest" ? undefined : value)
					}
					value={filters.sortBy || "newest"}
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
					onValueChange={(value) =>
						onFilterChange("landType", value === "all" ? undefined : value)
					}
					value={filters.landType || ""}
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
				<Label className="flex items-center gap-1 font-medium text-xs">
					<DollarSign className="h-3 w-3" />$
					{localPriceRange[0].toLocaleString()} - $
					{localPriceRange[1].toLocaleString()}
				</Label>
				<Slider
					className="py-2"
					disabled={isLoading}
					max={2_000_000}
					min={5000}
					onValueChange={handlePriceRangeChange}
					step={5000}
					value={localPriceRange}
				/>
			</div>

			{/* Area Range - Compact */}
			<div className="space-y-2">
				<Label className="flex items-center gap-1 font-medium text-xs">
					<Maximize className="h-3 w-3" />
					{localAreaRange[0]} - {localAreaRange[1]} m²
				</Label>
				<Slider
					className="py-2"
					disabled={isLoading}
					max={50_000}
					min={50}
					onValueChange={handleAreaRangeChange}
					step={50}
					value={localAreaRange}
				/>
			</div>

			{/* Action Buttons */}
			<div className="flex gap-2">
				<Button
					className="h-8 flex-1 text-xs"
					disabled={isLoading || activeFiltersCount === 0}
					onClick={resetFilters}
					size="sm"
					type="button"
					variant="outline"
				>
					<RotateCcw className="mr-1 h-3 w-3" />
					Limpiar
				</Button>
				{activeFiltersCount > 0 && (
					<Badge className="px-2 py-1 text-xs" variant="secondary">
						{activeFiltersCount}
					</Badge>
				)}
			</div>

			{/* Loading indicator */}
			{isLoading && (
				<div className="py-1 text-center">
					<div className="inline-flex items-center gap-1 text-muted-foreground text-xs">
						<div className="h-3 w-3 animate-spin rounded-full border-primary border-b" />
						Buscando terrenos...
					</div>
				</div>
			)}
		</div>
	);
}
