"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
	Search,
	MapPin,
	Filter,
	X,
	Home,
	TreePine,
	DollarSign,
	Bed,
	Bath,
	Maximize,
	SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/components/ui/use-toast";

interface SearchFilters {
	searchQuery?: string;
	location?: string;
	propertyType?: string[];
	status?: string[];
	priceRange?: [number, number];
	areaRange?: [number, number];
	bedrooms?: number;
	bathrooms?: number;
	amenities?: string[];
	sortBy?: string;
}

interface ModernSearchInterfaceProps {
	searchType: "properties" | "lands";
	onSearchTypeChange: (type: "properties" | "lands") => void;
	filters: SearchFilters;
	onFilterChange: (filters: SearchFilters) => void;
	isLoading?: boolean;
	totalResults?: number;
	onSearch?: () => void;
	className?: string;
}

export function ModernSearchInterface({
	searchType,
	onSearchTypeChange,
	filters,
	onFilterChange,
	isLoading = false,
	totalResults = 0,
	onSearch,
	className,
}: ModernSearchInterfaceProps) {
	const { toast } = useToast();
	const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

	// Property types with icons and descriptions
	const propertyTypes = useMemo(
		() => [
			{
				value: "casa",
				label: "Casa",
				description: "Vivienda unifamiliar",
				icon: Home,
			},
			{
				value: "apartamento",
				label: "Apartamento",
				description: "Vivienda en edificio",
				icon: Home,
			},
			{
				value: "terreno",
				label: "Terreno",
				description: "Lote sin construir",
				icon: TreePine,
			},
			{
				value: "local",
				label: "Local Comercial",
				description: "Espacio comercial",
				icon: Home,
			},
			{
				value: "oficina",
				label: "Oficina",
				description: "Espacio de trabajo",
				icon: Home,
			},
		],
		[]
	);

	// Status options
	const statusOptions = useMemo(
		() => [
			{ value: "disponible", label: "Disponible", color: "bg-green-100 text-green-800" },
			{ value: "vendido", label: "Vendido", color: "bg-red-100 text-red-800" },
			{ value: "reservado", label: "Reservado", color: "bg-yellow-100 text-yellow-800" },
			{ value: "construccion", label: "En Construcción", color: "bg-blue-100 text-blue-800" },
		],
		[]
	);

	// Amenities organized by category
	const amenitiesByCategory = useMemo(
		() => ({
			"General": [
				{ value: "parking", label: "Estacionamiento" },
				{ value: "security", label: "Seguridad 24/7" },
				{ value: "elevator", label: "Ascensor" },
				{ value: "gym", label: "Gimnasio" },
			],
			"Exterior": [
				{ value: "pool", label: "Piscina" },
				{ value: "garden", label: "Jardín" },
				{ value: "terrace", label: "Terraza" },
				{ value: "balcony", label: "Balcón" },
			],
			"Servicios": [
				{ value: "wifi", label: "WiFi" },
				{ value: "cable", label: "TV Cable" },
				{ value: "ac", label: "Aire Acondicionado" },
				{ value: "laundry", label: "Lavandería" },
			],
		}),
		[]
	);

	// Calculate active filters count
	const activeFiltersCount = useMemo(() => {
		let count = 0;
		if (filters.searchQuery) count++;
		if (filters.location) count++;
		if (filters.propertyType?.length) count += filters.propertyType.length;
		if (filters.status?.length) count += filters.status.length;
		if (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000000)) count++;
		if (filters.areaRange && (filters.areaRange[0] > 0 || filters.areaRange[1] < 10000)) count++;
		if (filters.bedrooms) count++;
		if (filters.bathrooms) count++;
		if (filters.amenities?.length) count += filters.amenities.length;
		return count;
	}, [filters]);

	// Filter handlers
	const handleFilterChange = useCallback(
		(key: keyof SearchFilters, value: any) => {
			onFilterChange({
				...filters,
				[key]: value,
			});
		},
		[filters, onFilterChange]
	);

	const handleArrayFilterChange = useCallback(
		(key: "propertyType" | "status" | "amenities", value: string) => {
			const current = filters[key] || [];
			const updated = current.includes(value)
				? current.filter((item) => item !== value)
				: [...current, value];
			handleFilterChange(key, updated);
		},
		[filters, handleFilterChange]
	);

	const resetFilters = useCallback(() => {
		onFilterChange({});
		toast({
			title: "Filtros limpiados",
			description: "Todos los filtros han sido restablecidos",
		});
	}, [onFilterChange, toast]);

	const handleQuickSearch = useCallback(() => {
		if (onSearch) {
			onSearch();
		}
	}, [onSearch]);

	// Individual filter components
	const SearchInput = () => (
		<div className="space-y-2">
			<Label htmlFor="search-query">Búsqueda</Label>
			<div className="relative">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					id="search-query"
					placeholder="Buscar por palabras clave..."
					value={filters.searchQuery || ""}
					onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
					className="pl-9"
					aria-describedby="search-query-description"
				/>
			</div>
			<p id="search-query-description" className="sr-only">
				Ingrese palabras clave para buscar propiedades
			</p>
		</div>
	);

	const LocationInput = () => (
		<div className="space-y-2">
			<Label htmlFor="location">Ubicación</Label>
			<div className="relative">
				<MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					id="location"
					placeholder="Ciudad, sector, dirección..."
					value={filters.location || ""}
					onChange={(e) => handleFilterChange("location", e.target.value)}
					className="pl-9"
					aria-describedby="location-description"
				/>
			</div>
			<p id="location-description" className="sr-only">
				Ingrese la ubicación deseada
			</p>
		</div>
	);

	const PropertyTypeSelector = () => (
		<div className="space-y-2">
			<Label>Tipo de Propiedad</Label>
			<div className="grid grid-cols-2 gap-2">
				{propertyTypes.map((type) => {
					const Icon = type.icon;
					const isSelected = filters.propertyType?.includes(type.value);
					return (
						<button
							key={type.value}
							onClick={() => handleArrayFilterChange("propertyType", type.value)}
							className={cn(
								"flex flex-col items-center gap-2 rounded-lg border p-3 transition-all",
								"hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring",
								isSelected
									? "border-primary bg-primary text-primary-foreground"
									: "border-border bg-background"
							)}
							aria-pressed={isSelected}
							aria-label={`Seleccionar ${type.label}`}
						>
							<Icon className="h-5 w-5" />
							<div className="text-center">
								<div className="text-sm font-medium">{type.label}</div>
								<div className="text-xs text-muted-foreground">{type.description}</div>
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);

	const StatusSelector = () => (
		<div className="space-y-2">
			<Label>Estado</Label>
			<div className="flex flex-wrap gap-2">
				{statusOptions.map((status) => {
					const isSelected = filters.status?.includes(status.value);
					return (
						<button
							key={status.value}
							onClick={() => handleArrayFilterChange("status", status.value)}
							className={cn(
								"inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium transition-all",
								"hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring",
								isSelected
									? "border-2 border-primary"
									: "border border-transparent",
								status.color
							)}
							aria-pressed={isSelected}
							aria-label={`Filtrar por ${status.label}`}
						>
							{status.label}
						</button>
					);
				})}
			</div>
		</div>
	);

	const PriceRangeSlider = () => {
		const [priceRange, setPriceRange] = useState<[number, number]>(
			filters.priceRange || [0, 10000000]
		);

		useEffect(() => {
			if (filters.priceRange) {
				setPriceRange(filters.priceRange);
			}
		}, [filters.priceRange]);

		const formatPrice = (value: number) => {
			return new Intl.NumberFormat("es-DO", {
				style: "currency",
				currency: "DOP",
				minimumFractionDigits: 0,
				maximumFractionDigits: 0,
			}).format(value);
		};

		return (
			<div className="space-y-4">
				<Label htmlFor="price-range">Rango de Precio</Label>
				<div className="space-y-2">
					<Slider
						id="price-range"
						min={0}
						max={10000000}
						step={50000}
						value={priceRange}
                        onValueChange={(value) => setPriceRange(value as [number, number])}
						onValueCommit={(value) => handleFilterChange("priceRange", value)}
						className="w-full"
						aria-label="Rango de precio"
					/>
					<div className="flex justify-between text-sm text-muted-foreground">
						<span>{formatPrice(priceRange[0])}</span>
						<span>{formatPrice(priceRange[1])}</span>
					</div>
				</div>
			</div>
		);
	};

	const AreaRangeSlider = () => {
		const [areaRange, setAreaRange] = useState<[number, number]>(
			filters.areaRange || [0, 10000]
		);

		useEffect(() => {
			if (filters.areaRange) {
				setAreaRange(filters.areaRange);
			}
		}, [filters.areaRange]);

		return (
			<div className="space-y-4">
				<Label htmlFor="area-range">Área (m²)</Label>
				<div className="space-y-2">
					<Slider
						id="area-range"
						min={0}
						max={10000}
						step={50}
						value={areaRange}
                        onValueChange={(value) => setAreaRange(value as [number, number])}
						onValueCommit={(value) => handleFilterChange("areaRange", value)}
						className="w-full"
						aria-label="Rango de área"
					/>
					<div className="flex justify-between text-sm text-muted-foreground">
						<span>{areaRange[0]} m²</span>
						<span>{areaRange[1]} m²</span>
					</div>
				</div>
			</div>
		);
	};

	const RoomSelector = () => (
		<div className="grid grid-cols-2 gap-4">
			<div className="space-y-2">
				<Label htmlFor="bedrooms">Habitaciones</Label>
				<Select
					value={filters.bedrooms?.toString() || "any"}
					onValueChange={(value) => handleFilterChange("bedrooms", value === "any" ? undefined : parseInt(value))}
				>
					<SelectTrigger id="bedrooms">
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
				<Label htmlFor="bathrooms">Baños</Label>
				<Select
					value={filters.bathrooms?.toString() || ""}
					onValueChange={(value) => handleFilterChange("bathrooms", value ? parseInt(value) : undefined)}
				>
					<SelectTrigger id="bathrooms">
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
	);

	const AmenitiesSelector = () => (
		<div className="space-y-4">
			<Label>Comodidades</Label>
			{Object.entries(amenitiesByCategory).map(([category, amenities]) => (
				<div key={category} className="space-y-3">
					<h4 className="font-medium text-sm text-muted-foreground">{category}</h4>
					<div className="grid grid-cols-2 gap-2">
						{amenities.map((amenity) => {
							const isSelected = filters.amenities?.includes(amenity.value);
							return (
								<div key={amenity.value} className="flex items-center space-x-2">
									<Checkbox
										id={amenity.value}
										checked={isSelected}
										onCheckedChange={() => handleArrayFilterChange("amenities", amenity.value)}
									/>
									<Label
										htmlFor={amenity.value}
										className="text-sm font-normal cursor-pointer"
									>
										{amenity.label}
									</Label>
								</div>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);

	const SortSelector = () => (
		<div className="space-y-2">
			<Label htmlFor="sort-by">Ordenar por</Label>
			<Select
				value={filters.sortBy || "relevance"}
				onValueChange={(value) => handleFilterChange("sortBy", value)}
			>
				<SelectTrigger id="sort-by">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="relevance">Relevancia</SelectItem>
					<SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
					<SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
					<SelectItem value="area-asc">Área: Menor a Mayor</SelectItem>
					<SelectItem value="area-desc">Área: Mayor a Menor</SelectItem>
					<SelectItem value="newest">Más Recientes</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);

	// Filter sections component
	const FilterSections = () => (
		<div className="space-y-6">
			{/* Basic Filters */}
			<div className="space-y-4">
				<h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
					Búsqueda Básica
				</h3>
				<SearchInput />
				<LocationInput />
				<PropertyTypeSelector />
				<StatusSelector />
			</div>

			<Separator />

			{/* Price and Area */}
			<div className="space-y-4">
				<h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
					Precio y Área
				</h3>
				<PriceRangeSlider />
				<AreaRangeSlider />
			</div>

			<Separator />

			{/* Rooms */}
			<div className="space-y-4">
				<h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
					Características
				</h3>
				<RoomSelector />
			</div>

			<Separator />

			{/* Amenities */}
			<AmenitiesSelector />

			<Separator />

			{/* Sort */}
			<SortSelector />
		</div>
	);

	// Mobile filter content
	const MobileFilterContent = () => (
		<div className="flex h-full flex-col">
			<SheetHeader className="border-b px-4 py-4">
				<div className="flex items-center justify-between">
					<SheetTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5" />
						Filtros de Búsqueda
						{activeFiltersCount > 0 && (
							<Badge className="ml-2" variant="secondary">
								{activeFiltersCount}
							</Badge>
						)}
					</SheetTitle>
					<Button
						aria-label="Cerrar filtros"
						onClick={() => setIsMobileFiltersOpen(false)}
						size="icon"
						variant="ghost"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			</SheetHeader>

			<ScrollArea className="flex-1 px-4 py-4">
				<FilterSections />
			</ScrollArea>

			<div className="space-y-2 border-t p-4">
				<Button
					className="w-full"
					disabled={isLoading}
					onClick={() => {
						handleQuickSearch();
						setIsMobileFiltersOpen(false);
					}}
				>
					{isLoading ? "Buscando..." : `Ver ${totalResults} resultados`}
				</Button>
				<Button
					className="w-full"
					disabled={isLoading || activeFiltersCount === 0}
					onClick={() => {
						resetFilters();
						setIsMobileFiltersOpen(false);
					}}
					variant="outline"
				>
					Limpiar filtros
				</Button>
			</div>
		</div>
	);

	return (
		<div className={cn("w-full", className)}>
			{/* Search Type Tabs */}
            <Tabs
                className="mb-4"
                onValueChange={(v) => onSearchTypeChange(v as any)}
                value={searchType}
            >
				<TabsList className="grid h-12 w-full grid-cols-2">
					<TabsTrigger className="flex items-center gap-2" value="properties">
						<Home className="h-4 w-4" />
						Propiedades
					</TabsTrigger>
					<TabsTrigger className="flex items-center gap-2" value="lands">
						<TreePine className="h-4 w-4" />
						Terrenos
					</TabsTrigger>
				</TabsList>
			</Tabs>

			{/* Desktop Layout */}
			<div className="hidden lg:block">
				<Card className="border-0 shadow-lg">
					<CardHeader className="border-b">
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<SlidersHorizontal className="h-5 w-5" />
								Filtros de Búsqueda
								{activeFiltersCount > 0 && (
									<Badge className="ml-2" variant="secondary">
										{activeFiltersCount} activos
									</Badge>
								)}
							</CardTitle>
							<div className="flex items-center gap-2">
								<Button
									disabled={isLoading || activeFiltersCount === 0}
									onClick={resetFilters}
									size="sm"
									variant="outline"
								>
									Limpiar
								</Button>
								<Button
									disabled={isLoading}
									onClick={handleQuickSearch}
									size="sm"
								>
									{isLoading ? "Buscando..." : `Buscar (${totalResults})`}
								</Button>
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-6">
						<FilterSections />
					</CardContent>
				</Card>
			</div>

			{/* Mobile Layout */}
			<div className="lg:hidden">
				<div className="mb-4 flex items-center gap-2">
					<Sheet
						onOpenChange={setIsMobileFiltersOpen}
						open={isMobileFiltersOpen}
					>
						<SheetTrigger asChild>
							<Button className="flex-1" variant="outline">
								<Filter className="mr-2 h-4 w-4" />
								Filtros
								{activeFiltersCount > 0 && (
									<Badge className="ml-2" variant="secondary">
										{activeFiltersCount}
									</Badge>
								)}
							</Button>
						</SheetTrigger>
						<SheetContent className="h-[90vh] p-0" side="bottom">
							<MobileFilterContent />
						</SheetContent>
					</Sheet>

					<Button
						className="flex-1"
						disabled={isLoading}
						onClick={handleQuickSearch}
					>
						{isLoading ? "Buscando..." : `Buscar (${totalResults})`}
					</Button>
				</div>

				{/* Quick filters on mobile */}
				<Card className="mb-4">
					<CardContent className="p-4">
						<div className="space-y-3">
							<SearchInput />
							<LocationInput />
							<PropertyTypeSelector />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Accessibility announcements */}
			<div aria-atomic="true" aria-live="polite" className="sr-only">
				{isLoading
					? "Buscando propiedades..."
					: `${totalResults} resultados encontrados`}
			</div>
		</div>
	);
}
