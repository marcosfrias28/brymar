"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { SearchPropertiesUseCase } from "@/application/use-cases/property/SearchPropertiesUseCase";
import { SearchPropertiesInput } from "@/application/dto/property/SearchPropertiesInput";
import { Property } from "@/domain/property/entities/Property";

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
    properties: Property[];
    loading: boolean;
    error: string | null;
    searchProperties: (filters: PropertyFilters) => Promise<void>;
    refetch: () => Promise<void>;
    totalCount: number;
}

export function useProperties(initialFilters?: PropertyFilters): UsePropertiesReturn {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);

    // Create use case instance (would be injected from container in real implementation)
    const searchPropertiesUseCase = useMemo(
        () => new SearchPropertiesUseCase(/* dependencies */),
        []
    );

    const searchProperties = useCallback(
        async (filters: PropertyFilters) => {
            try {
                setLoading(true);
                setError(null);

                const input = SearchPropertiesInput.create(filters);
                const result = await searchPropertiesUseCase.execute(input);

                setProperties(result.properties);
                setTotalCount(result.totalCount);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Search failed");
                setProperties([]);
                setTotalCount(0);
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
    };
}