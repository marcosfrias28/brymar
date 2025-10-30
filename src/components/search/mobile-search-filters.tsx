"use client";

import {
	ArrowUpDown,
	Bath,
	Bed,
	DollarSign,
	MapPin,
	RotateCcw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

type MobileSearchFiltersProps = {
	filters: Record<string, any>;
	onFilterChange: (filterName: string, value: any) => void;
	isLoading?: boolean;
	className?: string;
};

export function MobileSearchFilters({
	filters,
	onFilterChange,
	isLoading = false,
	className,
}: MobileSearchFiltersProps) {
	// Local state for sliders
	const [localPriceRange, setLocalPriceRange] = useState([
		filters.minPrice || 50_000,
		filters.maxPrice || 2_000_000,
	]);

	// Property types (reduced for mobile)
	const propertyTypes = [
		{ value: "casa", label: "Casa" },
		{ value: "apartamento", label: "Apartamento" },
		{ value: "villa", label: "Villa" },
		{ value: "comercial", label: "Comercial" },
	];

	// Property status
	const _propertyStatus = [
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
			filters.minPrice || 50_000,
			filters.maxPrice || 2_000_000,
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
		setLocalPriceRange([50_000, 2_000_000]);
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

			{/* Second Row - Property Type and Status */}
			<div className="grid grid-cols-2 gap-2">
				{/* Property Type */}
				<Select
					onValueChange={(value) =>
						onFilterChange("propertyType", value === "all" ? undefined : value)
					}
					value={filters.propertyType || ""}
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
					onValueChange={(value) =>
						onFilterChange("status", value === "all" ? undefined : value)
					}
					value={filters.status || ""}
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
				<Label className="flex items-center gap-1 font-medium text-xs">
					<DollarSign className="h-3 w-3" />$
					{localPriceRange[0].toLocaleString()} - $
					{localPriceRange[1].toLocaleString()}
				</Label>
				<Slider
					className="py-2"
					disabled={isLoading}
					max={5_000_000}
					min={10_000}
					onValueChange={handlePriceRangeChange}
					step={10_000}
					value={localPriceRange}
				/>
			</div>

			{/* Bedrooms and Bathrooms */}
			<div className="grid grid-cols-2 gap-2">
				<Select
					onValueChange={(value) =>
						onFilterChange("bedrooms", value === "any" ? undefined : value)
					}
					value={filters.bedrooms || ""}
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
					onValueChange={(value) =>
						onFilterChange("bathrooms", value === "any" ? undefined : value)
					}
					value={filters.bathrooms || ""}
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
				<Label className="font-medium text-xs">Amenidades</Label>
				<div className="grid grid-cols-2 gap-2">
					{amenities.map((amenity) => (
						<div className="flex items-center space-x-1" key={amenity.id}>
							<Checkbox
								checked={(filters.amenities || []).includes(amenity.id)}
								className="h-3 w-3"
								disabled={isLoading}
								id={amenity.id}
								onCheckedChange={(checked) =>
									handleAmenityChange(amenity.id, checked as boolean)
								}
							/>
							<Label
								className="cursor-pointer font-normal text-xs"
								htmlFor={amenity.id}
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
		</div>
	);
}
