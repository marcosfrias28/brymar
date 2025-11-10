"use client";

import { LayoutGrid, List, MapPin, SortAsc } from "lucide-react";
import { useState } from "react";
import { LandCard } from "@/components/lands/land-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InlineErrorState } from "@/components/ui/error-states";
import { LoadingSpinner } from "@/components/ui/loading-states";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Land } from "@/lib/types";
import { cn } from "@/lib/utils";

type LandResultsProps = {
	lands: Land[];
	total: number;
	isLoading?: boolean;
	error?: string;
	onRetry?: () => void;
	onViewChange?: (view: "results" | "map") => void;
	currentView?: "results" | "map";
	onSortChange?: (sortBy: string) => void;
	sortBy?: string;
	view?: "grid" | "list" | "map";
	onViewModeChange?: (view: "grid" | "list" | "map") => void;
	className?: string;
};

export function LandResults({
	lands,
	total,
	isLoading = false,
	error,
	onRetry,
	onViewChange,
	currentView = "results",
	onSortChange,
	sortBy: externalSortBy = "newest",
	view: externalView = "grid",
	onViewModeChange,
	className,
}: LandResultsProps) {
	// Use external state if provided, otherwise fall back to local state
	const [localView, setLocalView] = useState<"grid" | "list">("grid");
	const [localSortBy, setLocalSortBy] = useState("newest");

	const view = onViewModeChange ? externalView : localView;
	const sortBy = onSortChange ? externalSortBy : localSortBy;

	const sortOptions = [
		{ value: "newest", label: "Más recientes" },
		{ value: "price-low", label: "Precio: menor a mayor" },
		{ value: "price-high", label: "Precio: mayor a menor" },
		{ value: "area-large", label: "Área: mayor a menor" },
		{ value: "area-small", label: "Área: menor a mayor" },
	];

	if (error) {
		return (
			<Card className={className}>
				<CardContent className="p-6">
					<InlineErrorState message={error} onRetry={onRetry} />
				</CardContent>
			</Card>
		);
	}

	return (
		<div className={cn("flex h-full flex-col", className)}>
			{/* Results Header - Fixed */}
			<div className="flex-shrink-0 border-b bg-background">
				<div className="p-4">
					<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
						<div className="flex items-center gap-2">
							<h2 className="font-semibold text-lg">
								{total} terrenos encontrados
							</h2>
							{total > 0 && (
								<Badge variant="secondary">
									{lands.length} de {total}
								</Badge>
							)}
						</div>

						<div className="flex items-center gap-2">
							{/* Sort Options */}
							<Select
								onValueChange={(value) => {
									if (onSortChange) {
										onSortChange(value);
									} else {
										setLocalSortBy(value);
									}
								}}
								value={sortBy}
							>
								<SelectTrigger className="w-48">
									<SortAsc className="mr-2 h-4 w-4" />
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{sortOptions.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							{/* View Toggle */}
							<div className="flex rounded-lg border">
								<Button
									className={cn(
										"rounded-r-none",
										view === "grid" && "bg-muted"
									)}
									onClick={() => {
										if (onViewModeChange) {
											onViewModeChange("grid");
										} else {
											setLocalView("grid");
										}
									}}
									size="sm"
									variant="ghost"
								>
									<LayoutGrid className="h-4 w-4" />
								</Button>
								<Button
									className={cn(
										"rounded-none border-x",
										view === "list" && "bg-muted"
									)}
									onClick={() => {
										if (onViewModeChange) {
											onViewModeChange("list");
										} else {
											setLocalView("list");
										}
									}}
									size="sm"
									variant="ghost"
								>
									<List className="h-4 w-4" />
								</Button>
								<Button
									className={cn(
										"rounded-l-none",
										(currentView === "map" || view === "map") && "bg-muted"
									)}
									onClick={() => {
										if (onViewModeChange) {
											onViewModeChange("map");
										} else {
											onViewChange?.("map");
										}
									}}
									size="sm"
									variant="ghost"
								>
									<MapPin className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Results Content - Scrollable */}
			<div className="flex-1 overflow-y-auto">
				{isLoading ? (
					<div className="flex h-full items-center justify-center">
						<div className="flex flex-col items-center justify-center space-y-4">
							<LoadingSpinner />
							<p className="text-muted-foreground">Buscando terrenos...</p>
						</div>
					</div>
				) : lands.length > 0 ? (
					<div className="p-4">
						<div
							className={cn(
								"grid gap-4",
								view === "grid"
									? "grid-cols-1 lg:grid-cols-3 xl:grid-cols-2"
									: "grid-cols-1"
							)}
						>
							{lands.map((land) => (
								<LandCard
									key={land.id}
									land={land}
									variant={view === "list" ? "horizontal" : "vertical"}
								/>
							))}
						</div>
					</div>
				) : (
					<div className="flex h-full items-center justify-center">
						<div className="space-y-4 p-8 text-center">
							<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
								<MapPin className="h-8 w-8 text-muted-foreground" />
							</div>
							<div>
								<h3 className="font-semibold text-lg">
									No se encontraron terrenos
								</h3>
								<p className="mt-1 text-muted-foreground">
									Intenta ajustar tus filtros de búsqueda para encontrar más
									resultados.
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
