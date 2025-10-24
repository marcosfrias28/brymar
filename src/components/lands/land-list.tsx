"use client";

import { LayoutGrid, List, Plus, Search, Square } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useLands } from "@/hooks/use-lands";
import type { LandSearchFilters, LandType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
	interactiveClasses,
	secondaryColorClasses,
} from "@/lib/utils/secondary-colors";
import { LandCard } from "./land-card";
import { LandFilters } from "./land-filters";

interface LandListProps {
	initialFilters?: LandSearchFilters;
	showActions?: boolean;
	showFilters?: boolean;
	showSearch?: boolean;
	showAddButton?: boolean;
	showViewToggle?: boolean;
	className?: string;
}

export function LandList({
	initialFilters = {},
	showActions = true,
	showFilters = true,
	showSearch = true,
	showAddButton = true,
	showViewToggle = false,
	className,
}: LandListProps) {
	const router = useRouter();
	const [filters, setFilters] = useState<LandSearchFilters>(initialFilters);
	const [searchQuery, setSearchQuery] = useState("");
	const [viewMode, setViewMode] = useState<"grid" | "list">("list");

	// Combine search query with filters
	const searchFilters: LandSearchFilters = {
		...filters,
		...(searchQuery && { location: searchQuery }),
	};

	const { data: searchResult, isLoading, error } = useLands(searchFilters);

	const handleFilterChange = (
		filterName: keyof LandSearchFilters,
		value: any,
	) => {
		setFilters((prev) => ({
			...prev,
			[filterName]: value,
		}));
	};

	const handleTypeFilter = (type: "all" | LandType) => {
		if (type === "all") {
			handleFilterChange("landTypes", undefined);
		} else {
			handleFilterChange("landTypes", [type]);
		}
	};

	const handleEdit = (id: string) => {
		router.push(`/dashboard/lands/${id}/edit`);
	};

	const handleView = (id: string) => {
		router.push(`/dashboard/lands/${id}`);
	};

	const lands = searchResult?.items || [];
	const total = searchResult?.total || 0;

	if (error) {
		return (
			<Card className={className}>
				<CardContent className="p-8 text-center">
					<div className="text-red-500 mb-4">
						<Square className="h-12 w-12 mx-auto mb-4 opacity-50" />
					</div>
					<h3 className="text-lg font-semibold text-red-600 mb-2">
						Error al cargar terrenos
					</h3>
					<p className="text-gray-600 mb-4">
						{error instanceof Error
							? error.message
							: "Ocurrió un error inesperado"}
					</p>
					<Button variant="outline" onClick={() => window.location.reload()}>
						Reintentar
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className={className}>
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
				<div>
					<h2 className="text-2xl font-bold">Terrenos</h2>
					<p className="text-gray-600">
						{isLoading ? "Cargando..." : `${total} terrenos encontrados`}
					</p>
				</div>
				<div className="flex items-center gap-2">
					{showViewToggle && (
						<div className="flex border rounded-lg">
							<Button
								variant="ghost"
								size="sm"
								className={cn(
									"rounded-r-none",
									viewMode === "grid" && "bg-muted",
								)}
								onClick={() => setViewMode("grid")}
							>
								<LayoutGrid className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className={cn(
									"rounded-l-none",
									viewMode === "list" && "bg-muted",
								)}
								onClick={() => setViewMode("list")}
							>
								<List className="h-4 w-4" />
							</Button>
						</div>
					)}
					{showAddButton && (
						<Button asChild className={cn(interactiveClasses.button)}>
							<Link href="/dashboard/lands/new">
								<Plus className="h-4 w-4 mr-2" />
								Nuevo Terreno
							</Link>
						</Button>
					)}
				</div>
			</div>

			{/* Search */}
			{showSearch && (
				<div className="relative mb-4">
					<Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
					<Input
						placeholder="Buscar por ubicación..."
						className="pl-10"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			)}

			{/* Filters */}
			{showFilters && (
				<div className="mb-6">
					<LandFilters
						currentFilter={filters.landTypes?.[0] || "all"}
						onFilterChange={handleTypeFilter}
						totalCount={total}
					/>
				</div>
			)}

			{/* Loading State */}
			{isLoading && <LandListSkeleton />}

			{/* Empty State */}
			{!isLoading && lands.length === 0 && (
				<LandEmptyState
					hasFilters={searchQuery || Object.keys(filters).length > 0}
					showAddButton={showAddButton}
				/>
			)}

			{/* Land Cards */}
			{!isLoading && lands.length > 0 && (
				<div
					className={cn(
						"gap-4",
						viewMode === "grid"
							? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
							: "space-y-4",
					)}
				>
					{lands.map((land) => (
						<LandCard
							key={land.id}
							land={land}
							variant={viewMode === "grid" ? "vertical" : "horizontal"}
							showActions={showActions}
							onEdit={handleEdit}
							onView={handleView}
						/>
					))}
				</div>
			)}
		</div>
	);
}

// Loading skeleton component
function LandListSkeleton() {
	return (
		<div className="space-y-4">
			{Array.from({ length: 3 }).map((_, i) => (
				<Card key={i} className="border-gray-200 shadow-sm">
					<CardContent className="p-0">
						<div className="flex flex-col sm:flex-row">
							<div className="w-full sm:w-48 h-32 sm:h-auto flex-shrink-0">
								<Skeleton className="w-full h-full rounded-l-lg" />
							</div>
							<div className="flex-1 p-4 space-y-3">
								<div className="flex justify-between items-start gap-4">
									<div className="flex-1 space-y-2">
										<Skeleton className="h-4 w-3/4" />
										<Skeleton className="h-3 w-1/2" />
										<div className="flex gap-4">
											<Skeleton className="h-3 w-16" />
											<Skeleton className="h-3 w-16" />
										</div>
										<Skeleton className="h-3 w-24" />
									</div>
									<div className="space-y-2">
										<Skeleton className="h-5 w-20" />
										<Skeleton className="h-4 w-16" />
									</div>
								</div>
								<div className="flex gap-2">
									<Skeleton className="h-7 w-12" />
									<Skeleton className="h-7 w-14" />
									<Skeleton className="h-7 w-8" />
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

// Empty state component
function LandEmptyState({
	hasFilters,
	showAddButton,
}: {
	hasFilters: boolean;
	showAddButton: boolean;
}) {
	return (
		<Card className={cn("border-gray-200", secondaryColorClasses.accent)}>
			<CardContent className="p-8 text-center">
				<div className="text-gray-400 mb-4">
					<Square className="h-12 w-12 mx-auto mb-4 opacity-50" />
				</div>
				<h3 className="text-lg font-semibold text-gray-900 mb-2">
					No hay terrenos disponibles
				</h3>
				<p className="text-gray-600 mb-4">
					{hasFilters
						? "No se encontraron terrenos que coincidan con los filtros seleccionados."
						: "Aún no has agregado ningún terreno."}
				</p>
				{showAddButton && (
					<Button asChild className={cn(interactiveClasses.button)}>
						<Link href="/dashboard/lands/new">
							<Plus className="h-4 w-4 mr-2" />
							Agregar primer terreno
						</Link>
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
