"use client";

import { Building2, TreePine } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useActionState, useOptimistic, useTransition } from "react";
import {
	FiltersSkeleton,
	MobileFiltersSkeleton,
} from "@/components/ui/filters-skeleton";
import {
	MobileSearchSkeleton,
	SearchSkeleton,
} from "@/components/ui/search-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { searchLandsAction } from "@/lib/actions/land-actions";
import { searchPropertiesAction } from "@/lib/actions/property-actions";
import type { SearchLandsFilters } from "@/lib/types";
import { AuthButtons } from "../auth/auth-buttons";
import Logo from "../ui/logo";
import { LandResults } from "./land-results";
import { MobileLandFilters } from "./mobile-land-filters";
import { MobileSearchFilters } from "./mobile-search-filters";
import { PropertyResults } from "./property-results";
import { RealTimeLandFilters } from "./real-time-land-filters";
import { RealTimeSearchFilters } from "./real-time-search-filters";
import { SearchMapView } from "./search-map-view";

type BaseSearchFilters = {
	location?: string;
	minPrice?: number;
	maxPrice?: number;
	bedrooms?: string;
	bathrooms?: string;
	minArea?: number;
	maxArea?: number;
	amenities?: string[];
};

interface PropertySearchFilters extends BaseSearchFilters {
	query?: string;
	propertyType?: string;
	propertyTypes?: string[];
	features?: string[];
	status?:
		| "draft"
		| "published"
		| "sold"
		| "rented"
		| "withdrawn"
		| "expired"
		| "archived";
	sortBy?:
		| "price"
		| "area"
		| "bedrooms"
		| "bathrooms"
		| "createdAt"
		| "updatedAt";
	sortOrder?: "asc" | "desc";
}

type SearchFilters = PropertySearchFilters | SearchLandsFilters;

export function OptimizedSearchPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();
	const [view, setView] = React.useState<"results" | "map">("results");
	const [viewMode, setViewMode] = React.useState<"grid" | "list" | "map">(
		"grid"
	);
	const [sortBy, setSortBy] = React.useState("newest");

	// Get search type from URL
	const searchType =
		(searchParams?.get("type") as "properties" | "lands") || "properties";

	// Extract current filters from URL with React 19 optimizations
	const currentFilters = React.useMemo(() => {
		const baseFilters: BaseSearchFilters = {};

		// Extract all search parameters efficiently
		if (searchParams) {
			for (const [key, value] of searchParams.entries()) {
				if (key !== "type" && value) {
					if (key === "amenities") {
						baseFilters[key] = value.split(",");
					} else if (
						["minPrice", "maxPrice", "minArea", "maxArea"].includes(key)
					) {
						const numValue = Number.parseInt(value, 10);
						if (!Number.isNaN(numValue)) {
							(baseFilters as any)[key] = numValue;
						}
					} else {
						(baseFilters as any)[key] = value;
					}
				}
			}
		}

		// Return type-specific filters based on search type
		if (searchType === "properties") {
			return {
				...baseFilters,
				propertyType: searchParams?.get("propertyType") || undefined,
				status: searchParams?.get("status") as PropertySearchFilters["status"],
			} as PropertySearchFilters;
		}
		return {
			...baseFilters,
			landType:
				searchParams?.get("landType") ||
				searchParams?.get("propertyType") ||
				undefined,
			status: searchParams?.get("status") as SearchLandsFilters["status"],
		} as SearchLandsFilters;
	}, [searchParams, searchType]);

	// Modern React 19 Actions with useActionState
	const [propertyState, propertyAction, propertyPending] = useActionState(
		async (prevState: any, formData: FormData) => {
			try {
				const result = await searchPropertiesAction(prevState, formData);
				return result.success && result.data
					? {
							properties: result.data.properties || [],
							total: 0,
							error: undefined,
						}
					: {
							properties: [],
							total: 0,
							error: result.message || "Error en la bÃºsqueda",
						};
			} catch (_error) {
				return {
					properties: [],
					total: 0,
					error: "Error inesperado en la bÃºsqueda",
				};
			}
		},
		{ properties: [], total: 0, error: undefined }
	);

	const [landState, landAction, landPending] = useActionState(
		async (prevState: any, formData: FormData) => {
			try {
				const result = await searchLandsAction(prevState, formData);
				return result.success && result.data
					? { lands: result.data.lands || [], total: 0, error: undefined }
					: {
							lands: [],
							total: 0,
							error: result.message || "Error en la bÃºsqueda",
						};
			} catch (_error) {
				return {
					lands: [],
					total: 0,
					error: "Error inesperado en la bÃºsqueda",
				};
			}
		},
		{ lands: [], total: 0, error: undefined }
	);

	// Optimistic updates for immediate UI feedback
	const [optimisticFilters, setOptimisticFilters] = useOptimistic(
		currentFilters,
		(
			state: PropertySearchFilters | SearchLandsFilters,
			newFilters: Partial<PropertySearchFilters | SearchLandsFilters>
		) => ({
			...state,
			...newFilters,
		})
	);

	// Handle filter changes with optimistic updates and transitions
	const handleFilterChange = React.useCallback(
		(filterName: string, value: any) => {
			const newFilters = { ...currentFilters } as any;

			// Remove filter if value is empty/default
			if (
				value === undefined ||
				value === null ||
				value === "" ||
				(Array.isArray(value) && value.length === 0) ||
				(filterName.includes("Price") && value === 0) ||
				(filterName.includes("Area") && value === 0)
			) {
				delete newFilters[filterName];
			} else {
				// Handle type-specific mappings
				if (filterName === "propertyType" && searchType === "lands") {
					newFilters.landType = value;
				} else if (filterName === "landType" && searchType === "properties") {
					newFilters.propertyType = value;
				} else {
					newFilters[filterName] = value;
				}
			}

			// Update URL and trigger search in transition with optimistic update
			startTransition(() => {
				// Optimistic update for immediate UI feedback
				setOptimisticFilters(newFilters);

				const params = new URLSearchParams();
				params.set("type", searchType);

				Object.entries(newFilters).forEach(([key, val]) => {
					if (val !== undefined && val !== null && val !== "") {
						// Map landType back to propertyType for URL consistency
						const urlKey = key === "landType" ? "propertyType" : key;

						if (Array.isArray(val) && val.length > 0) {
							params.set(urlKey, val.join(","));
						} else if (!Array.isArray(val)) {
							params.set(urlKey, val.toString());
						}
					}
				});

				const newURL = `/search?${params.toString()}`;
				router.replace(newURL, { scroll: false });

				// Create FormData and trigger search action
				const formData = new FormData();
				Object.entries(newFilters).forEach(([key, val]) => {
					if (val !== undefined && val !== null && val !== "") {
						if (Array.isArray(val)) {
							val.forEach((item) => formData.append(key, item));
						} else {
							formData.append(key, val.toString());
						}
					}
				});

				// Trigger appropriate action
				if (searchType === "properties") {
					propertyAction(formData);
				} else {
					landAction(formData);
				}
			});
		},
		[
			currentFilters,
			searchType,
			router,
			propertyAction,
			landAction,
			setOptimisticFilters,
		]
	);

	// Handle search type change
	const handleSearchTypeChange = React.useCallback(
		(newType: "properties" | "lands") => {
			startTransition(() => {
				router.replace(`/search?type=${newType}`, { scroll: false });
			});
		},
		[router]
	);

	// Handle sort change
	const handleSortChange = React.useCallback(
		(newSortBy: string) => {
			setSortBy(newSortBy);
			// Trigger search with new sort
			handleFilterChange("sortBy", newSortBy);
		},
		[handleFilterChange]
	);

	// Handle view mode change
	const handleViewModeChange = React.useCallback(
		(newViewMode: "grid" | "list" | "map") => {
			setViewMode(newViewMode);
			if (newViewMode === "map") {
				setView("map");
			} else {
				setView("results");
			}
		},
		[]
	);

	// Get current results and loading state
	const currentResults =
		searchType === "properties" ? propertyState : landState;
	const isLoading = isPending || propertyPending || landPending;

	// Handle retry with modern pattern
	const handleRetry = React.useCallback(() => {
		const formData = new FormData();
		Object.entries(currentFilters).forEach(([key, value]) => {
			if (value !== undefined && value !== null && value !== "") {
				if (Array.isArray(value)) {
					value.forEach((item) => formData.append(key, item));
				} else {
					formData.append(key, value.toString());
				}
			}
		});

		startTransition(() => {
			if (searchType === "properties") {
				propertyAction(formData);
			} else {
				landAction(formData);
			}
		});
	}, [currentFilters, searchType, propertyAction, landAction]);

	// Auto-trigger search on mount and search type change
	React.useEffect(() => {
		const formData = new FormData();
		Object.entries(currentFilters).forEach(([key, value]) => {
			if (value !== undefined && value !== null && value !== "") {
				if (Array.isArray(value)) {
					value.forEach((item) => formData.append(key, item));
				} else {
					formData.append(key, value.toString());
				}
			}
		});

		startTransition(() => {
			if (searchType === "properties") {
				propertyAction(formData);
			} else {
				landAction(formData);
			}
		});
	}, [searchType, currentFilters, landAction, propertyAction]); // Only trigger on search type change

	// Check if we should show skeleton (loading and no results yet)
	const shouldShowSkeleton =
		isLoading &&
		(searchType === "properties"
			? !(currentResults as any).properties?.length
			: !(currentResults as any).lands?.length);

	// Sort results based on sortBy
	const sortedResults = React.useMemo(() => {
		if (searchType === "properties" && (currentResults as any).properties) {
			const sorted = [...(currentResults as any).properties];

			switch (sortBy) {
				case "price-low":
					return sorted.sort((a, b) => a.price.amount - b.price.amount);
				case "price-high":
					return sorted.sort((a, b) => b.price.amount - a.price.amount);
				case "area-large":
					return sorted.sort((a, b) => b.features.area - a.features.area);
				case "area-small":
					return sorted.sort((a, b) => a.features.area - b.features.area);
				default:
					return sorted.sort(
						(a, b) =>
							new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					);
			}
		}
		if (searchType === "lands" && (currentResults as any).lands) {
			const sorted = [...(currentResults as any).lands];

			switch (sortBy) {
				case "price-low":
					return sorted.sort((a, b) => a.price - b.price);
				case "price-high":
					return sorted.sort((a, b) => b.price - a.price);
				case "area-large":
					return sorted.sort((a, b) => b.area - a.area);
				case "area-small":
					return sorted.sort((a, b) => a.area - b.area);
				default:
					return sorted.sort(
						(a, b) =>
							new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					);
			}
		}

		return searchType === "properties"
			? (currentResults as any).properties || []
			: (currentResults as any).lands || [];
	}, [currentResults, sortBy, searchType]);

	// Helper to get current results for map view
	const _mapResults =
		searchType === "properties"
			? (currentResults as any).properties || []
			: (currentResults as any).lands || [];

	return (
		<div className="flex h-dvh flex-col overflow-hidden bg-background">
			{/* Header Section - Compact for mobile, hidden on small screens */}
			<div className="flex flex-shrink-0 justify-between border-b bg-background/95 px-10 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<Logo />
				<AuthButtons />
			</div>

			{/* Mobile Layout - Stacked vertically */}
			<div className="flex flex-1 flex-col overflow-hidden md:hidden">
				{/* Mobile Header with Tabs */}
				<div className="flex-shrink-0 border-b bg-background">
					<div className="p-2">
						<h1 className="mb-2 font-bold text-lg">BÃºsqueda Inmobiliaria</h1>
						<Tabs
							className="w-full"
							onValueChange={(value) =>
								handleSearchTypeChange(value as "properties" | "lands")
							}
							value={searchType}
						>
							<TabsList className="grid h-8 w-full grid-cols-2">
								<TabsTrigger className="text-xs" value="properties">
									<Building2 className="mr-1 h-3 w-3" />
									Propiedades
								</TabsTrigger>
								<TabsTrigger className="text-xs" value="lands">
									<TreePine className="mr-1 h-3 w-3" />
									Terrenos
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>
				</div>

				{/* Mobile Filters - Compact with Suspense */}
				<div className="max-h-48 flex-shrink-0 overflow-y-auto border-b bg-background">
					<div className="p-2">
						<Tabs
							className="w-full"
							onValueChange={(value) =>
								handleSearchTypeChange(value as "properties" | "lands")
							}
							value={searchType}
						>
							<TabsContent className="mt-0" value="properties">
								{shouldShowSkeleton ? (
									<MobileFiltersSkeleton />
								) : (
									<MobileSearchFilters
										filters={optimisticFilters as PropertySearchFilters}
										isLoading={isLoading}
										onFilterChange={handleFilterChange}
									/>
								)}
							</TabsContent>
							<TabsContent className="mt-0" value="lands">
								{shouldShowSkeleton ? (
									<MobileFiltersSkeleton />
								) : (
									<MobileLandFilters
										filters={optimisticFilters as SearchLandsFilters}
										isLoading={isLoading}
										onFilterChange={handleFilterChange}
									/>
								)}
							</TabsContent>
						</Tabs>
					</div>
				</div>

				{/* Mobile Results with conditional skeleton */}
				<div className="flex-1 overflow-hidden">
					{view === "results" ? (
						shouldShowSkeleton ? (
							<MobileSearchSkeleton />
						) : searchType === "properties" ? (
							<PropertyResults
								currentView={view}
								error={currentResults.error}
								isLoading={isLoading}
								onRetry={handleRetry}
								onSortChange={handleSortChange}
								onViewChange={setView}
								onViewModeChange={handleViewModeChange}
								properties={sortedResults as any}
								sortBy={sortBy}
								total={currentResults.total || 0}
								view={viewMode}
							/>
						) : (
							<LandResults
								currentView={view}
								error={currentResults.error}
								isLoading={isLoading}
								lands={sortedResults as any}
								onRetry={handleRetry}
								onViewChange={setView}
								total={currentResults.total || 0}
							/>
						)
					) : (
						<SearchMapView
							className="h-full"
							currentView={view}
							onViewChange={setView}
							properties={
								searchType === "properties"
									? (currentResults as any).properties || []
									: (currentResults as any).lands || []
							}
						/>
					)}
				</div>
			</div>

			{/* Desktop Layout - Side by side */}
			<div className="hidden flex-1 overflow-hidden md:flex">
				{/* Left Sidebar - Responsive width to fit all filters */}
				<div className="w-full flex-shrink-0 border-r bg-background md:w-2/5 xl:w-1/3">
					<div className="flex h-full flex-col">
						{/* Tabs - Fixed at top of sidebar */}
						<div className="flex-shrink-0 border-b p-2">
							<Tabs
								className="w-full"
								onValueChange={(value) =>
									handleSearchTypeChange(value as "properties" | "lands")
								}
								value={searchType}
							>
								<TabsList className="grid h-9 w-full grid-cols-2">
									<TabsTrigger
										className="flex items-center gap-1 text-sm"
										value="properties"
									>
										<Building2 className="h-4 w-4" />
										Propiedades
									</TabsTrigger>
									<TabsTrigger
										className="flex items-center gap-1 text-sm"
										value="lands"
									>
										<TreePine className="h-4 w-4" />
										Terrenos
									</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>

						{/* Filters - Optimized for desktop with Suspense */}
						<div className="flex-1 overflow-y-auto">
							<div className="p-2">
								<Tabs
									className="w-full"
									onValueChange={(value) =>
										handleSearchTypeChange(value as "properties" | "lands")
									}
									value={searchType}
								>
									<TabsContent className="mt-0" value="properties">
										{shouldShowSkeleton ? (
											<FiltersSkeleton />
										) : (
											<RealTimeSearchFilters
												filters={optimisticFilters as PropertySearchFilters}
												isLoading={isLoading}
												onFilterChange={handleFilterChange}
											/>
										)}
									</TabsContent>
									<TabsContent className="mt-0" value="lands">
										{shouldShowSkeleton ? (
											<FiltersSkeleton />
										) : (
											<RealTimeLandFilters
												filters={optimisticFilters as SearchLandsFilters}
												isLoading={isLoading}
												onFilterChange={handleFilterChange}
											/>
										)}
									</TabsContent>
								</Tabs>
							</div>
						</div>
					</div>
				</div>

				{/* Right Content - Results and Map with conditional skeleton */}
				<div className="flex-1 overflow-hidden">
					{view === "results" ? (
						shouldShowSkeleton ? (
							<SearchSkeleton />
						) : searchType === "properties" ? (
							<PropertyResults
								currentView={view}
								error={currentResults.error}
								isLoading={isLoading}
								onRetry={handleRetry}
								onSortChange={handleSortChange}
								onViewChange={setView}
								onViewModeChange={handleViewModeChange}
								properties={sortedResults as any}
								sortBy={sortBy}
								total={currentResults.total || 0}
								view={viewMode}
							/>
						) : (
							<LandResults
								currentView={view}
								error={currentResults.error}
								isLoading={isLoading}
								lands={sortedResults as any}
								onRetry={handleRetry}
								onViewChange={setView}
								total={currentResults.total || 0}
							/>
						)
					) : (
						<SearchMapView
							className="h-full"
							currentView={view}
							onViewChange={setView}
							properties={
								searchType === "properties"
									? (currentResults as any).properties || []
									: (currentResults as any).lands || []
							}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
