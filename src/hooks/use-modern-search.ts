"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export interface SearchFilters {
  query?: string;
  location?: string;
  propertyType?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: string;
  bathrooms?: string;
  amenities?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface SearchState {
  filters: SearchFilters;
  searchType: "properties" | "lands";
  isLoading: boolean;
  error: string | null;
  results: any[];
  total: number;
  page: number;
  limit: number;
  sortBy: string;
  view: "grid" | "list" | "map";
  lastSearch: string | null;
}

interface UseModernSearchProps {
  initialFilters?: SearchFilters;
  initialSearchType?: "properties" | "lands";
  onSearch?: (filters: SearchFilters, searchType: "properties" | "lands") => Promise<any>;
  debounceMs?: number;
  persistToUrl?: boolean;
  initialResults?: any[];
  initialTotal?: number;
}

export function useModernSearch({
  initialFilters = {},
  initialSearchType = "properties",
  onSearch,
  debounceMs = 300,
  persistToUrl = true,
  initialResults = [],
  initialTotal = 0
}: UseModernSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [state, setState] = useState<SearchState>({
    filters: initialFilters,
    searchType: initialSearchType,
    isLoading: false,
    error: null,
    results: initialResults,
    total: initialTotal,
    page: 1,
    limit: 20,
    sortBy: "newest",
    view: "grid",
    lastSearch: null
  });

  // Parse filters from URL on mount
  useEffect(() => {
    if (!persistToUrl || !searchParams) return;

    const urlFilters: SearchFilters = {};
    
    // Parse basic filters
    if (searchParams.get("query")) urlFilters.query = searchParams.get("query")!;
    if (searchParams.get("location")) urlFilters.location = searchParams.get("location")!;
    if (searchParams.get("propertyType")) urlFilters.propertyType = searchParams.get("propertyType")!;
    if (searchParams.get("status")) urlFilters.status = searchParams.get("status")!;
    
    // Parse numeric filters
    if (searchParams.get("minPrice")) urlFilters.minPrice = parseInt(searchParams.get("minPrice")!);
    if (searchParams.get("maxPrice")) urlFilters.maxPrice = parseInt(searchParams.get("maxPrice")!);
    if (searchParams.get("minArea")) urlFilters.minArea = parseInt(searchParams.get("minArea")!);
    if (searchParams.get("maxArea")) urlFilters.maxArea = parseInt(searchParams.get("maxArea")!);
    
    // Parse array filters
    if (searchParams.get("amenities")) {
      urlFilters.amenities = searchParams.get("amenities")!.split(",");
    }
    
    // Parse page and limit
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sortBy = searchParams.get("sortBy") || "newest";
    const searchType = (searchParams.get("type") as "properties" | "lands") || "properties";
    
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...urlFilters },
      page,
      limit,
      sortBy,
      searchType
    }));
  }, [searchParams, persistToUrl]);

  // Update URL when filters change
  const updateUrl = useCallback((filters: SearchFilters, searchType: "properties" | "lands", page: number, sortBy: string) => {
    if (!persistToUrl) return;

    const params = new URLSearchParams();
    params.set("type", searchType);
    params.set("page", page.toString());
    params.set("limit", state.limit.toString());
    params.set("sortBy", sortBy);

    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      
      if (Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(","));
      } else if (!Array.isArray(value)) {
        params.set(key, value.toString());
      }
    });

    const newUrl = `/search?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [router, persistToUrl, state.limit]);

  // Debounced search function
  const performSearch = useCallback(async (filters: SearchFilters, searchType: "properties" | "lands", page: number, sortBy: string) => {
    if (!onSearch) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const searchKey = JSON.stringify({ filters, searchType, page, sortBy });
      
      // Prevent duplicate searches
      if (state.lastSearch === searchKey) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const result = await onSearch(filters, searchType);
      
      setState(prev => ({
        ...prev,
        results: result.data || [],
        total: result.total || 0,
        isLoading: false,
        error: null,
        lastSearch: searchKey
      }));

      updateUrl(filters, searchType, page, sortBy);

      // Announce search results for accessibility
      if (typeof document !== "undefined") {
        const announcement = document.createElement("div");
        announcement.setAttribute("aria-live", "polite");
        announcement.setAttribute("aria-atomic", "true");
        announcement.className = "sr-only";
        announcement.textContent = `${result.total || 0} resultados encontrados`;
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 1000);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error en la búsqueda";
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        results: [],
        total: 0
      }));

      toast({
        title: "Error en la búsqueda",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [onSearch, updateUrl, state.lastSearch, toast]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(state.filters, state.searchType, state.page, state.sortBy);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [state.filters, state.searchType, state.page, state.sortBy, performSearch, debounceMs]);

  // Filter change handlers
  const updateFilter = useCallback((filterName: keyof SearchFilters, value: any) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterName]: value
      },
      page: 1 // Reset to first page when filters change
    }));
  }, []);

  const updateMultipleFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...newFilters
      },
      page: 1
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {},
      page: 1
    }));
    
    toast({
      title: "Filtros restablecidos",
      description: "Todos los filtros han sido limpiados",
      duration: 2000,
    });
  }, [toast]);

  // Search type and view handlers
  const setSearchType = useCallback((type: "properties" | "lands") => {
    setState(prev => ({ ...prev, searchType: type, page: 1 }));
  }, []);

  const setView = useCallback((view: "grid" | "list" | "map") => {
    setState(prev => ({ ...prev, view }));
  }, []);

  const setSortBy = useCallback((sortBy: string) => {
    setState(prev => ({ ...prev, sortBy, page: 1 }));
  }, []);

  // Pagination handlers
  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, page: Math.max(1, page) }));
  }, []);

  const nextPage = useCallback(() => {
    setState(prev => ({ ...prev, page: prev.page + 1 }));
  }, []);

  const prevPage = useCallback(() => {
    setState(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }));
  }, []);

  // Retry search
  const retrySearch = useCallback(() => {
    performSearch(state.filters, state.searchType, state.page, state.sortBy);
  }, [performSearch, state.filters, state.searchType, state.page, state.sortBy]);

  // Utility functions
  const hasActiveFilters = useMemo(() => {
    return Object.entries(state.filters).some(([key, value]) => {
      if (key === "page" || key === "limit" || key === "sortBy" || key === "sortOrder") return false;
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== "";
    });
  }, [state.filters]);

  const activeFiltersCount = useMemo(() => {
    return Object.entries(state.filters).reduce((count, [key, value]) => {
      if (key === "page" || key === "limit" || key === "sortBy" || key === "sortOrder") return count;
      if (Array.isArray(value)) return count + (value.length > 0 ? 1 : 0);
      return count + (value ? 1 : 0);
    }, 0);
  }, [state.filters]);

  // Sort results client-side
  const sortedResults = useMemo(() => {
    if (!state.results || state.results.length === 0) return [];

    const sorted = [...state.results];
    
    switch (state.sortBy) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "area-large":
        return sorted.sort((a, b) => (b.area || b.features?.area || 0) - (a.area || a.features?.area || 0));
      case "area-small":
        return sorted.sort((a, b) => (a.area || a.features?.area || 0) - (b.area || b.features?.area || 0));
      case "newest":
      default:
        return sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  }, [state.results, state.sortBy]);

  return {
    // State
    ...state,
    
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
    performSearch,
  };
}