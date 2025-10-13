"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, TreePine } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageTitle } from '@/components/ui/page-title';
import { RealTimeSearchFilters } from "./real-time-search-filters";
import { RealTimeLandFilters } from "./real-time-land-filters";
import { MobileSearchFilters } from "./mobile-search-filters";
import { MobileLandFilters } from "./mobile-land-filters";
import { PropertyResults } from "./property-results";
import { LandResults } from "./land-results";
import { SearchMapView } from "./search-map-view";
import { searchPropertiesAction } from '@/app/actions/property-actions';
import { searchLandsAction } from '@/app/actions/land-actions';
import Logo from "../ui/logo";
import { AuthButtons } from "../auth/auth-buttons";

interface SearchState {
  properties: any[];
  lands: any[];
  total: number;
  isLoading: boolean;
  error?: string;
}

export function OptimizedSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get search type from URL or default to properties
  const searchType =
    (searchParams.get("type") as "properties" | "lands") || "properties";
  const [view, setView] = useState<"results" | "map">("results");
  const [searchState, setSearchState] = useState<SearchState>({
    properties: [],
    lands: [],
    total: 0,
    isLoading: false,
  });

  // Memoize current filters to prevent unnecessary re-renders
  const currentFilters = useMemo(() => {
    const filters: Record<string, any> = {};

    // Common filters
    const location = searchParams.get("location");
    const propertyType = searchParams.get("propertyType");
    const status = searchParams.get("status");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const bedrooms = searchParams.get("bedrooms");
    const bathrooms = searchParams.get("bathrooms");
    const minArea = searchParams.get("minArea");
    const maxArea = searchParams.get("maxArea");
    const amenities = searchParams.get("amenities");
    const sortBy = searchParams.get("sortBy");

    if (location) filters.location = location;
    if (propertyType) filters.propertyType = propertyType;
    if (status) filters.status = status;
    if (minPrice) filters.minPrice = parseInt(minPrice);
    if (maxPrice) filters.maxPrice = parseInt(maxPrice);
    if (bedrooms) filters.bedrooms = bedrooms;
    if (bathrooms) filters.bathrooms = bathrooms;
    if (minArea) filters.minArea = parseInt(minArea);
    if (maxArea) filters.maxArea = parseInt(maxArea);
    if (amenities) filters.amenities = amenities.split(",");
    if (sortBy) filters.sortBy = sortBy;

    return filters;
  }, [searchParams]);

  // Debounce timer ref
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Stable search function
  const performSearch = useCallback(async (filters: Record<string, any>) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(async () => {
      // Always perform search, even with empty filters to show all properties

      setSearchState((prev) => ({
        ...prev,
        isLoading: true,
        error: undefined,
      }));

      try {
        // Create FormData from filters
        const formData = new FormData();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            if (Array.isArray(value)) {
              value.forEach((item) => formData.append(key, item));
            } else {
              formData.append(key, value.toString());
            }
          }
        });

        // Use different actions based on search type
        const result =
          searchType === "properties"
            ? await searchPropertiesAction(formData)
            : await searchLandsAction(formData);

        if (result.success && result.data) {
          if (searchType === "properties") {
            const propertyData = result.data as {
              properties: any[];
              total: number;
              totalPages: number;
              currentPage: number;
            };
            setSearchState({
              properties: propertyData.properties || [],
              lands: [],
              total: propertyData.total || 0,
              isLoading: false,
            });
          } else {
            const landData = result.data as {
              lands: any[];
              total: number;
              totalPages: number;
              currentPage: number;
            };
            setSearchState({
              properties: [],
              lands: landData.lands || [],
              total: landData.total || 0,
              isLoading: false,
            });
          }
        } else {
          setSearchState({
            properties: [],
            lands: [],
            total: 0,
            isLoading: false,
            error: result.error || "Error en la búsqueda",
          });
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchState({
          properties: [],
          lands: [],
          total: 0,
          isLoading: false,
          error: "Error inesperado en la búsqueda",
        });
      }
    }, 300); // 300ms debounce
  }, []);

  // Update URL with new filter values
  const updateURL = useCallback(
    (newFilters: Record<string, any>) => {
      const params = new URLSearchParams();

      // Always include search type
      params.set("type", searchType);

      // Add all non-empty filter values
      Object.entries(newFilters).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          value !== 0
        ) {
          if (Array.isArray(value) && value.length > 0) {
            params.set(key, value.join(","));
          } else if (!Array.isArray(value)) {
            params.set(key, value.toString());
          }
        }
      });

      // Update URL without page reload
      const newURL = `${window.location.pathname}?${params.toString()}`;
      router.replace(newURL, { scroll: false });
    },
    [router, searchType]
  );

  // Handle filter changes
  const handleFilterChange = useCallback(
    (filterName: string, value: any) => {
      const newFilters = { ...currentFilters, [filterName]: value };

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
      }

      updateURL(newFilters);
    },
    [currentFilters, updateURL]
  );

  // Handle search type change
  const handleSearchTypeChange = useCallback(
    (newType: "properties" | "lands") => {
      // Clear all filters when changing search type
      router.replace(`/search?type=${newType}`, { scroll: false });
    },
    [router]
  );

  // Trigger search when filters change
  useEffect(() => {
    performSearch(currentFilters);
  }, [currentFilters, performSearch]);

  // Handle retry
  const handleRetry = useCallback(() => {
    performSearch(currentFilters);
  }, [currentFilters, performSearch]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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

        {/* Mobile Filters - Compact */}
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
                <MobileSearchFilters
                  filters={currentFilters}
                  onFilterChange={handleFilterChange}
                  isLoading={searchState.isLoading}
                />
              </TabsContent>
              <TabsContent value="lands" className="mt-0">
                <MobileLandFilters
                  filters={currentFilters}
                  onFilterChange={handleFilterChange}
                  isLoading={searchState.isLoading}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Mobile Results */}
        <div className="flex-1 overflow-hidden">
          {view === "results" ? (
            searchType === "properties" ? (
              <PropertyResults
                properties={searchState.properties}
                total={searchState.total}
                isLoading={searchState.isLoading}
                error={searchState.error}
                onRetry={handleRetry}
                onViewChange={setView}
                currentView={view}
              />
            ) : (
              <LandResults
                lands={searchState.lands}
                total={searchState.total}
                isLoading={searchState.isLoading}
                error={searchState.error}
                onRetry={handleRetry}
                onViewChange={setView}
                currentView={view}
              />
            )
          ) : (
            <SearchMapView
              properties={
                searchType === "properties"
                  ? searchState.properties
                  : searchState.lands
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

            {/* Filters - Optimized for desktop */}
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
                    <RealTimeSearchFilters
                      filters={currentFilters}
                      onFilterChange={handleFilterChange}
                      isLoading={searchState.isLoading}
                    />
                  </TabsContent>
                  <TabsContent value="lands" className="mt-0">
                    <RealTimeLandFilters
                      filters={currentFilters}
                      onFilterChange={handleFilterChange}
                      isLoading={searchState.isLoading}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Results and Map */}
        <div className="flex-1 overflow-hidden">
          {view === "results" ? (
            searchType === "properties" ? (
              <PropertyResults
                properties={searchState.properties}
                total={searchState.total}
                isLoading={searchState.isLoading}
                error={searchState.error}
                onRetry={handleRetry}
                onViewChange={setView}
                currentView={view}
              />
            ) : (
              <LandResults
                lands={searchState.lands}
                total={searchState.total}
                isLoading={searchState.isLoading}
                error={searchState.error}
                onRetry={handleRetry}
                onViewChange={setView}
                currentView={view}
              />
            )
          ) : (
            <SearchMapView
              properties={
                searchType === "properties"
                  ? searchState.properties
                  : searchState.lands
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
