"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Building2, TreePine, Map, Grid, List, Filter, SlidersHorizontal, Search, Heart, Share2, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { searchPropertiesAction } from "@/lib/actions/property-actions";
import { searchLandsAction } from "@/lib/actions/land-actions";
import { useModernSearch } from "@/hooks/use-modern-search";
import { ModernSearchInterface } from "./modern-search-interface";
import { EnhancedSearchResults } from "./enhanced-search-results";
import { SearchMapView } from "./search-map-view";
import Logo from "../ui/logo";
import { AuthButtons } from "../auth/auth-buttons";
import { Input } from "@/components/ui/input";

type EnhancedSearchPageProps = {
  initialFilters?: any;
  initialSearchType?: "properties" | "lands";
  initialResults?: any[];
  initialTotal?: number;
};

export function EnhancedSearchPage({
  initialFilters,
  initialSearchType,
  initialResults,
  initialTotal,
}: EnhancedSearchPageProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Modern search hook with enhanced functionality
  const {
    // State
    filters,
    searchType,
    isLoading,
    error,
    results,
    total,
    page,
    limit,
    sortBy,
    view,
    
    // Computed values
    hasActiveFilters,
    activeFiltersCount,
    sortedResults,
    
    // Actions
    updateFilter,
    updateMultipleFilters,
    resetFilters,
    setSearchType,
    setView,
    setSortBy,
    setPage,
    nextPage,
    prevPage,
    retrySearch,
  } = useModernSearch({
    initialFilters,
    initialSearchType,
    initialResults,
    initialTotal,
    onSearch: async (filters, searchType) => {
      const formData = new FormData();
      
      // Add all filters to form data
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            value.forEach((item) => formData.append(key, item));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Add pagination
      formData.append("page", page.toString());
      formData.append("limit", limit.toString());
      formData.append("sortBy", sortBy);

      // Perform search based on type
      if (searchType === "properties") {
        const result = await searchPropertiesAction(undefined as any, formData);
        return {
          data: result.success ? result.data?.properties || [] : [],
          total: result.success ? result.data?.total || 0 : 0,
        };
      } else {
        const result = await searchLandsAction(undefined as any, formData);
        return {
          data: result.success ? result.data?.lands || [] : [],
          total: result.success ? result.data?.total || 0 : 0,
        };
      }
    },
    debounceMs: 500,
    persistToUrl: true,
  });

  // Handle search type change
  const handleSearchTypeChange = useCallback((newType: "properties" | "lands") => {
    setSearchType(newType);
    
    toast({
      title: `Búsqueda cambiada a ${newType === 'properties' ? 'propiedades' : 'terrenos'}`,
      duration: 1500,
    });
  }, [setSearchType, toast]);

  // Handle view mode change
  const handleViewChange = useCallback((newView: "grid" | "list" | "map") => {
    setView(newView);
    
    toast({
      title: `Vista cambiada a ${newView === 'grid' ? 'cuadrícula' : newView === 'list' ? 'lista' : 'mapa'}`,
      duration: 1500,
    });
  }, [setView, toast]);

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback((id: string) => {
    // This would typically call an API to toggle favorite status
    toast({
      title: "Favorito actualizado",
      duration: 2000,
    });
  }, [toast]);

  // Handle share
  const handleShare = useCallback((item: any) => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Enlace copiado al portapapeles",
        duration: 2000,
      });
    }
  }, [toast]);

  // Handle contact
  const handleContact = useCallback((item: any) => {
    // This would typically open a contact form or make a phone call
    toast({
      title: "Información de contacto",
      description: "Mostrando opciones de contacto",
      duration: 3000,
    });
  }, [toast]);

  // Quick stats for the header
  const quickStats = useMemo(() => [
    {
      label: "Propiedades activas",
      value: searchType === "properties" ? total : "-",
      icon: Building2,
      color: "text-blue-600"
    },
    {
      label: "Terrenos activos", 
      value: searchType === "lands" ? total : "-",
      icon: TreePine,
      color: "text-green-600"
    },
    {
      label: "Filtros activos",
      value: activeFiltersCount.toString(),
      icon: Filter,
      color: "text-purple-600"
    }
  ], [searchType, total, activeFiltersCount]);

  const uiFilters = {
    searchQuery: filters.query,
    location: filters.location,
    propertyType: filters.propertyType ? [filters.propertyType] : [],
    status: filters.status ? [filters.status] : [],
    priceRange: [filters.minPrice ?? 0, filters.maxPrice ?? 10000000] as [number, number],
    areaRange: [filters.minArea ?? 0, filters.maxArea ?? 10000] as [number, number],
    bedrooms: filters.bedrooms ? parseInt(filters.bedrooms) : undefined,
    bathrooms: filters.bathrooms ? parseInt(filters.bathrooms) : undefined,
    amenities: filters.amenities,
    sortBy,
  } as const;

  const mapToHookFilters = (f: any) => ({
    query: f.searchQuery,
    location: f.location,
    propertyType: Array.isArray(f.propertyType) ? f.propertyType[0] : f.propertyType,
    status: Array.isArray(f.status) ? f.status[0] : f.status,
    minPrice: Array.isArray(f.priceRange) ? f.priceRange[0] : undefined,
    maxPrice: Array.isArray(f.priceRange) ? f.priceRange[1] : undefined,
    minArea: Array.isArray(f.areaRange) ? f.areaRange[0] : undefined,
    maxArea: Array.isArray(f.areaRange) ? f.areaRange[1] : undefined,
    bedrooms: f.bedrooms ? String(f.bedrooms) : undefined,
    bathrooms: f.bathrooms ? String(f.bathrooms) : undefined,
    amenities: f.amenities,
    sortBy: f.sortBy,
  });

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      {/* Header with logo and auth */}
      <div className="flex flex-shrink-0 justify-between border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Logo />
        <div className="flex w-full max-w-xl items-center gap-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchType === "lands" ? "Buscar terrenos..." : "Buscar propiedades..."}
              className="pl-9"
            />
          </div>
        </div>
        <AuthButtons />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with filters - Desktop */}
        <div className="hidden w-[500px] flex-shrink-0 border-r bg-background lg:block">
          <ScrollArea className="h-full">
            <div className="p-6">
              {/* Quick stats */}
              <div className="mb-6 flex flex-nowrap gap-3">
                {quickStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={index} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                          <p className="text-xl font-bold">{stat.value}</p>
                        </div>
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </Card>
                  );
                })}
              </div>

              <Separator className="mb-6" />

              {/* Modern search interface */}
              <ModernSearchInterface
                searchType={searchType}
                onSearchTypeChange={handleSearchTypeChange}
                filters={uiFilters as any}
                onFilterChange={(f) => updateMultipleFilters(mapToHookFilters(f))}
                isLoading={isLoading}
                totalResults={total}
                onSearch={retrySearch}
              />
            </div>
          </ScrollArea>
        </div>

        {/* Main results area */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={view} onValueChange={(value) => handleViewChange(value as any)}>
            {/* View mode tabs */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-4">
                  <h1 className="text-xl font-bold">
                    {searchType === "properties" ? "Propiedades" : "Terrenos"} disponibles
                  </h1>
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="hidden sm:inline-flex">
                      <Filter className="mr-1 h-3 w-3" />
                      {activeFiltersCount} filtros activos
                    </Badge>
                  )}
                </div>

                <TabsList className="grid h-9 w-48 grid-cols-3">
                  <TabsTrigger value="grid" className="flex items-center gap-1 text-xs">
                    <Grid className="h-3 w-3" />
                    Cuadrícula
                  </TabsTrigger>
                  <TabsTrigger value="list" className="flex items-center gap-1 text-xs">
                    <List className="h-3 w-3" />
                    Lista
                  </TabsTrigger>
                  <TabsTrigger value="map" className="flex items-center gap-1 text-xs">
                    <Map className="h-3 w-3" />
                    Mapa
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* Results content */}
            <div className="h-[calc(100%-65px)]">
              <TabsContent value="grid" className="mt-0 h-full">
                <ScrollArea className="h-full">
                  <div className="p-6">
                    <EnhancedSearchResults
                      items={sortedResults}
                      searchType={searchType}
                      isLoading={isLoading}
                      error={error || undefined}
                      total={total}
                      page={page}
                      limit={limit}
                      view="grid"
                      sortBy={sortBy}
                      onPageChange={setPage}
                      onViewChange={handleViewChange}
                      onSortChange={setSortBy}
                      onRetry={retrySearch}
                      onFavoriteToggle={handleFavoriteToggle}
                      onShare={handleShare}
                      onContact={handleContact}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="list" className="mt-0 h-full">
                <ScrollArea className="h-full">
                  <div className="p-6">
                    <EnhancedSearchResults
                      items={sortedResults}
                      searchType={searchType}
                      isLoading={isLoading}
                      error={error || undefined}
                      total={total}
                      page={page}
                      limit={limit}
                      view="list"
                      sortBy={sortBy}
                      onPageChange={setPage}
                      onViewChange={handleViewChange}
                      onSortChange={setSortBy}
                      onRetry={retrySearch}
                      onFavoriteToggle={handleFavoriteToggle}
                      onShare={handleShare}
                      onContact={handleContact}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="map" className="mt-0 h-full">
                <SearchMapView
                  className="h-full"
                  currentView="map"
                  onViewChange={(v) => handleViewChange(v === "map" ? "map" : "grid")}
                  properties={sortedResults}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Mobile filter button */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 lg:hidden">
        <Button
          size="lg"
          className="rounded-full shadow-lg"
          onClick={() => {
            // This would open a mobile filter sheet
            toast({
              title: "Filtros móviles",
              description: "Los filtros móviles estarán disponibles pronto",
              duration: 2000,
            });
          }}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Accessibility live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isLoading 
          ? `Buscando ${searchType === 'properties' ? 'propiedades' : 'terrenos'}...`
          : `${total} ${searchType === 'properties' ? 'propiedades' : 'terrenos'} encontradas`
        }
      </div>
    </div>
  );
}
