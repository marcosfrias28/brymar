"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { SearchPropertiesUseCase } from "@/application/use-cases/property/SearchPropertiesUseCase";
import { GetPropertyByIdUseCase } from "@/application/use-cases/property/GetPropertyByIdUseCase";
import { SearchPropertiesInput } from "@/application/dto/property/SearchPropertiesInput";
import { GetPropertyByIdInput } from "@/application/dto/property/GetPropertyByIdInput";
import { GetPropertyByIdOutput } from "@/application/dto/property/GetPropertyByIdOutput";
import { PropertySearchResult } from "@/application/dto/property/SearchPropertiesOutput";
import { container } from "@/infrastructure/container/Container";
import { initializeContainer } from "@/infrastructure/container/ServiceRegistration";

// Re-export types for external use
export type { PropertySearchResult } from "@/application/dto/property/SearchPropertiesOutput";
export type { GetPropertyByIdOutput } from "@/application/dto/property/GetPropertyByIdOutput";

export interface PropertyFilters {
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    location?: string;
    status?: "sale" | "rent";
}

export interface UsePropertiesReturn {
    properties: PropertySearchResult[];
    loading: boolean;
    error: string | null;
    searchProperties: (filters: PropertyFilters) => Promise<void>;
    refetch: () => Promise<void>;
    totalCount: number;
    hasMore: boolean;
    page: number;
    totalPages: number;
}

export interface UsePropertyReturn {
    property: GetPropertyByIdOutput | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useProperties(initialFilters?: PropertyFilters): UsePropertiesReturn {
    const [properties, setProperties] = useState<PropertySearchResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // Get use case instance from container
    const searchPropertiesUseCase = useMemo(() => {
        try {
            // Ensure container is initialized
            initializeContainer();
            return container.get<SearchPropertiesUseCase>("SearchPropertiesUseCase");
        } catch (error) {
            // Fallback if container doesn't have the use case registered
            // In a real implementation, this would be properly injected
            throw new Error(`SearchPropertiesUseCase not properly configured: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }, []);

    const searchProperties = useCallback(
        async (filters: PropertyFilters) => {
            try {
                setLoading(true);
                setError(null);

                const input = SearchPropertiesInput.create({
                    minPrice: filters.minPrice,
                    maxPrice: filters.maxPrice,
                    minBedrooms: filters.bedrooms,
                    minBathrooms: filters.bathrooms,
                    location: filters.location,
                    statuses: filters.status === 'sale' ? ['published'] : filters.status === 'rent' ? ['rented'] : ['published'],
                    propertyTypes: filters.type ? [filters.type as any] : undefined,
                    limit: 20,
                    offset: 0,
                    sortBy: 'createdAt',
                    sortOrder: 'desc'
                });
                const result = await searchPropertiesUseCase.execute(input);

                setProperties(result.properties);
                setTotalCount(result.total);
                setHasMore(result.hasMore);
                setPage(result.page);
                setTotalPages(result.totalPages);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Search failed";
                setError(errorMessage);
                setProperties([]);
                setTotalCount(0);
                setHasMore(false);
                setPage(1);
                setTotalPages(0);
            } finally {
                setLoading(false);
            }
        },
        [searchPropertiesUseCase]
    );

    const refetch = useCallback(async () => {
        if (initialFilters) {
            await searchProperties(initialFilters);
        }
    }, [initialFilters, searchProperties]);

    useEffect(() => {
        if (initialFilters) {
            searchProperties(initialFilters);
        } else {
            // Load all properties if no filters provided
            searchProperties({});
        }
    }, [initialFilters, searchProperties]);

    return {
        properties,
        loading,
        error,
        searchProperties,
        refetch,
        totalCount,
        hasMore,
        page,
        totalPages,
    };
}

export function useProperty(id: string | number): UsePropertyReturn {
    const [property, setProperty] = useState<GetPropertyByIdOutput | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get use case instance from container
    const getPropertyByIdUseCase = useMemo(() => {
        try {
            // Ensure container is initialized
            initializeContainer();
            return container.get<GetPropertyByIdUseCase>("GetPropertyByIdUseCase");
        } catch (error) {
            // Fallback if container doesn't have the use case registered
            throw new Error(`GetPropertyByIdUseCase not properly configured: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }, []);

    const fetchProperty = useCallback(
        async (propertyId: string | number) => {
            try {
                setLoading(true);
                setError(null);

                // Convert id to string if it's a number
                const stringId = typeof propertyId === 'number' ? propertyId.toString() : propertyId;

                if (!stringId || stringId.trim() === '') {
                    throw new Error("Property ID is required");
                }

                const input = GetPropertyByIdInput.fromId(stringId);
                const result = await getPropertyByIdUseCase.execute(input);

                setProperty(result);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Failed to fetch property";
                setError(errorMessage);
                setProperty(null);
            } finally {
                setLoading(false);
            }
        },
        [getPropertyByIdUseCase]
    );

    const refetch = useCallback(async () => {
        if (id) {
            await fetchProperty(id);
        }
    }, [id, fetchProperty]);

    useEffect(() => {
        if (id) {
            fetchProperty(id);
        } else {
            setLoading(false);
            setProperty(null);
            setError("Property ID is required");
        }
    }, [id, fetchProperty]);

    return {
        property,
        loading,
        error,
        refetch,
    };
}