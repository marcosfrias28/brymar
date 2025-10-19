"use client";

import React, { useTransition, useOptimistic, useActionState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, TreePine } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RealTimeSearchFilters } from "./real-time-search-filters";
import { RealTimeLandFilters } from "./real-time-land-filters";
import { MobileSearchFilters } from "./mobile-search-filters";
import { MobileLandFilters } from "./mobile-land-filters";
import { PropertyResults } from "./property-results";
import { LandResults } from "./land-results";
import { SearchMapView } from "./search-map-view";
import { searchPropertiesAction } from "@/presentation/server-actions/property-actions";
import { searchLandsAction } from "@/presentation/server-actions/land-actions";
import {
  SearchSkeleton,
  MobileSearchSkeleton,
} from "@/components/ui/search-skeleton";
import {
  FiltersSkeleton,
  MobileFiltersSkeleton,
} from "@/components/ui/filters-skeleton";
import { SearchLandsFilters } from "@/presentation/hooks/use-lands";
import Logo from "../ui/logo";
import { AuthButtons } from "../auth/auth-buttons";

interface BaseSearchFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: string;
  bathrooms?: string;
  minArea?: number;
  maxArea?: number;
  amenities?: string[];
}

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
    (searchParams.get("type") as "properties" | "lands") || "properties";

  // Extract current filters from URL with React 19 optimizations
  const currentFilters = React.useMemo(() => {
    const baseFilters: BaseSearchFilters = {};

    // Extract all search parameters efficiently
    for (const [key, value] of searchParams.entries()) {
      if (key !== "type" && value) {
        if (key === "amenities") {
          baseFilters[key] = value.split(",");
        } else if (
          ["minPrice", "maxPrice", "minArea", "maxArea"].includes(key)
        ) {
          const numValue = parseInt(value);
          if (!isNaN(numValue)) {
            (baseFilters as any)[key] = numValue;
          }
        } else {
          (baseFilters as any)[key] = value;
        }
      }
    }

    // Return type-specific filters based on search type
    if (searchType === "properties") {
      return {
        ...baseFilters,
        propertyType: searchParams.get("propertyType") || undefined,
        status: searchParams.get("status") as PropertySearchFilters["status"],
      } as PropertySearchFilters;
    } else {
      return {
        ...baseFilters,
        landType:
          searchParams.get("landType") ||
          searchParams.get("propertyType") ||
          undefined,
        status: searchParams.get("status") as SearchLandsFilters["status"],
      } as SearchLandsFilters;
    }
  }, [searchParams, searchType]);

  // Modern React 19 Actions with useActionState
  const [propertyState, propertyAction, propertyPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      try {
        const result = await searchPropertiesAction(formData);
        return result.success
          ? { ...result.data, error: null }
          : { properties: [], total: 0, error: result.error };
      } catch (error) {
        return {
          properties: [],
          total: 0,
          error: "Error inesperado en la búsqueda",
        };
      }
    },
    { properties: [], total: 0, error: null }
  );

  const [landState, landAction, landPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      try {
        const result = await searchLandsAction(formData);
        return result.success
          ? { ...result.data, error: null }
          : { lands: [], total: 0, error: result.error };
      } catch (error) {
        return {
          lands: [],
          total: 0,
          error: "Error inesperado en la búsqueda",
        };
      }
    },
    { lands: [], total: 0, error: null }
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
          newFilters["landType"] = value;
        } else if (filterName === "landType" && searchType === "properties") {
          newFilters["propertyType"] = value;
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
  }, [searchType]); // Only trigger on search type change

  // Check if we should show skeleton (loading and no results yet)
  const shouldShowSkeleton =
    isLoading &&
    (searchType === "properties"
      ? !currentResults.properties?.length
      : !currentResults.lands?.length);

  // Sort results based on sortBy
  const sortedResults = React.useMemo(() => {
    if (searchType === "properties" && currentResults.properties) {
      const sorted = [...currentResults.properties];

      switch (sortBy) {
        case "price-low":
          return sorted.sort((a, b) => a.price.amount - b.price.amount);
        case "price-high":
          return sorted.sort((a, b) => b.price.amount - a.price.amount);
        case "area-large":
          return sorted.sort((a, b) => b.features.area - a.features.area);
        case "area-small":
          return sorted.sort((a, b) => a.features.area - b.features.area);
        case "newest":
        default:
          return sorted.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    } else if (searchType === "lands" && currentResults.lands) {
      const sorted = [...currentResults.lands];

      switch (sortBy) {
        case "price-low":
          return sorted.sort((a, b) => a.price - b.price);
        case "price-high":
          return sorted.sort((a, b) => b.price - a.price);
        case "area-large":
          return sorted.sort((a, b) => b.area - a.area);
        case "area-small":
          return sorted.sort((a, b) => a.area - b.area);
        case "newest":
        default:
          return sorted.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    }

    return searchType === "properties"
      ? currentResults.properties || []
      : currentResults.lands || [];
  }, [currentResults, sortBy, searchType]);

  return (
    <div className="h-dvh bg-background flex flex-col overflow-hidden">
      {/* Header Section - Compact for mobile, hidden on small screens */}
      <div className="flex justify-between px-10 flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Logo />
        <AuthButtons />
      </div>

      {/* Mobile Layout - Stacked vertically */}
      <div className="flex-1 flex flex-col md:hidden overflow-hidden">
        {/* Mobile Header with Tabs */}
        <div className="flex-shrink-0 border-b bg-background">
          <div className="p-2">
            <h1 className="text-lg font-bold mb-2">Búsqueda Inmobiliaria</h1>
            <Tabs
              value={searchType}
              onValueChange={(value) =>
                handleSearchTypeChange(value as "properties" | "lands")
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 h-8">
                <TabsTrigger value="properties" className="text-xs">
                  <Building2 className="h-3 w-3 mr-1" />
                  Propiedades
                </TabsTrigger>
                <TabsTrigger value="lands" className="text-xs">
                  <TreePine className="h-3 w-3 mr-1" />
                  Terrenos
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Mobile Filters - Compact with Suspense */}
        <div className="flex-shrink-0 border-b bg-background max-h-48 overflow-y-auto">
          <div className="p-2">
            <Tabs
              value={searchType}
              onValueChange={(value) =>
                handleSearchTypeChange(value as "properties" | "lands")
              }
              className="w-full"
            >
              <TabsContent value="properties" className="mt-0">
                {shouldShowSkeleton ? (
                  <MobileFiltersSkeleton />
                ) : (
                  <MobileSearchFilters
                    filters={optimisticFilters as PropertySearchFilters}
                    onFilterChange={handleFilterChange}
                    isLoading={isLoading}
                  />
                )}
              </TabsContent>
              <TabsContent value="lands" className="mt-0">
                {shouldShowSkeleton ? (
                  <MobileFiltersSkeleton />
                ) : (
                  <MobileLandFilters
                    filters={optimisticFilters as SearchLandsFilters}
                    onFilterChange={handleFilterChange}
                    isLoading={isLoading}
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
                properties={sortedResults as any}
                total={currentResults.total || 0}
                isLoading={isLoading}
                error={currentResults.error}
                onRetry={handleRetry}
                onViewChange={setView}
                currentView={view}
                onSortChange={handleSortChange}
                sortBy={sortBy}
                view={viewMode}
                onViewModeChange={handleViewModeChange}
              />
            ) : (
              <LandResults
                lands={sortedResults as any}
                total={currentResults.total || 0}
                isLoading={isLoading}
                error={currentResults.error}
                onRetry={handleRetry}
                onViewChange={setView}
                currentView={view}
              />
            )
          ) : (
            <SearchMapView
              properties={
                searchType === "properties"
                  ? currentResults.properties || []
                  : currentResults.lands || []
              }
              className="h-full"
              onViewChange={setView}
              currentView={view}
            />
          )}
        </div>
      </div>

      {/* Desktop Layout - Side by side */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Left Sidebar - Responsive width to fit all filters */}
        <div className="w-full md:w-2/5 xl:w-1/3 flex-shrink-0 border-r bg-background">
          <div className="h-full flex flex-col">
            {/* Tabs - Fixed at top of sidebar */}
            <div className="flex-shrink-0 p-2 border-b">
              <Tabs
                value={searchType}
                onValueChange={(value) =>
                  handleSearchTypeChange(value as "properties" | "lands")
                }
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 h-9">
                  <TabsTrigger
                    value="properties"
                    className="flex items-center gap-1 text-sm"
                  >
                    <Building2 className="h-4 w-4" />
                    Propiedades
                  </TabsTrigger>
                  <TabsTrigger
                    value="lands"
                    className="flex items-center gap-1 text-sm"
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
                  value={searchType}
                  onValueChange={(value) =>
                    handleSearchTypeChange(value as "properties" | "lands")
                  }
                  className="w-full"
                >
                  <TabsContent value="properties" className="mt-0">
                    {shouldShowSkeleton ? (
                      <FiltersSkeleton />
                    ) : (
                      <RealTimeSearchFilters
                        filters={optimisticFilters as PropertySearchFilters}
                        onFilterChange={handleFilterChange}
                        isLoading={isLoading}
                      />
                    )}
                  </TabsContent>
                  <TabsContent value="lands" className="mt-0">
                    {shouldShowSkeleton ? (
                      <FiltersSkeleton />
                    ) : (
                      <RealTimeLandFilters
                        filters={optimisticFilters as SearchLandsFilters}
                        onFilterChange={handleFilterChange}
                        isLoading={isLoading}
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
                properties={sortedResults as any}
                total={currentResults.total || 0}
                isLoading={isLoading}
                error={currentResults.error}
                onRetry={handleRetry}
                onViewChange={setView}
                currentView={view}
                onSortChange={handleSortChange}
                sortBy={sortBy}
                view={viewMode}
                onViewModeChange={handleViewModeChange}
              />
            ) : (
              <LandResults
                lands={sortedResults as any}
                total={currentResults.total || 0}
                isLoading={isLoading}
                error={currentResults.error}
                onRetry={handleRetry}
                onViewChange={setView}
                currentView={view}
              />
            )
          ) : (
            <SearchMapView
              properties={
                searchType === "properties"
                  ? currentResults.properties || []
                  : currentResults.lands || []
              }
              className="h-full"
              onViewChange={setView}
              currentView={view}
            />
          )}
        </div>
      </div>
    </div>
  );
}
