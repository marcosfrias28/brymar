"use client";

import { useState, useEffect, useCallback } from "react";

import { SearchLandsUseCase } from "@/application/use-cases/land/SearchLandsUseCase";
import { GetLandByIdUseCase } from "@/application/use-cases/land/GetLandByIdUseCase";
import { CreateLandUseCase } from "@/application/use-cases/land/CreateLandUseCase";
import { UpdateLandUseCase } from "@/application/use-cases/land/UpdateLandUseCase";
import { SearchLandsInput } from "@/application/dto/land/SearchLandsInput";
import { GetLandByIdInput } from "@/application/dto/land/GetLandByIdInput";
import { CreateLandInput } from "@/application/dto/land/CreateLandInput";
import { UpdateLandInput } from "@/application/dto/land/UpdateLandInput";
import { LandSummary } from "@/application/dto/land/SearchLandsOutput";
import { GetLandByIdOutput } from "@/application/dto/land/GetLandByIdOutput";
import { CreateLandOutput } from "@/application/dto/land/CreateLandOutput";
import { UpdateLandOutput } from "@/application/dto/land/UpdateLandOutput";
import { container } from "@/infrastructure/container/Container";
import { initializeContainer } from "@/infrastructure/container/ServiceRegistration";

// Initialize container if not already done
if (!container.has('SearchLandsUseCase')) {
    initializeContainer();
}

export interface UseLandsReturn {
    lands: LandSummary[];
    loading: boolean;
    error: string | null;
    total: number;
    totalPages: number;
    currentPage: number;
    searchLands: (filters?: SearchLandsFilters, page?: number) => Promise<void>;
    createLand: (landData: CreateLandData) => Promise<CreateLandOutput>;
    refetch: () => Promise<void>;
}

export interface SearchLandsFilters {
    query?: string;
    location?: string;
    landType?: string;
    landTypes?: string[];
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    features?: string[];
    status?: 'draft' | 'published' | 'sold' | 'archived';
    sortBy?: 'price' | 'area' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
}

export interface CreateLandData {
    name: string;
    description: string;
    area: number;
    price: number;
    currency?: string;
    location: string;
    type: 'residential' | 'commercial' | 'agricultural' | 'industrial' | 'recreational' | 'mixed-use';
    features?: string[];
    images?: { file: File; filename: string; mimeType: string; }[];
}

export function useLands(initialFilters?: SearchLandsFilters): UseLandsReturn {
    const [lands, setLands] = useState<LandSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentFilters, setCurrentFilters] = useState<SearchLandsFilters>(initialFilters || {});

    const searchLands = useCallback(async (filters: SearchLandsFilters = {}, page: number = 1) => {
        try {
            setLoading(true);
            setError(null);

            const searchLandsUseCase = container.get<SearchLandsUseCase>('SearchLandsUseCase');
            const limit = 12;
            const offset = (page - 1) * limit;

            const input = SearchLandsInput.create({
                query: filters.query,
                location: filters.location,
                landTypes: filters.landType ? [filters.landType as 'residential' | 'commercial' | 'agricultural' | 'industrial' | 'recreational' | 'mixed-use'] : filters.landTypes as ('residential' | 'commercial' | 'agricultural' | 'industrial' | 'recreational' | 'mixed-use')[] | undefined,
                minPrice: filters.minPrice,
                maxPrice: filters.maxPrice,
                minArea: filters.minArea,
                maxArea: filters.maxArea,
                features: filters.features,
                status: filters.status,
                limit,
                offset,
                sortBy: filters.sortBy || 'createdAt',
                sortOrder: filters.sortOrder || 'desc'
            });

            const result = await searchLandsUseCase.execute(input);

            setLands(result.lands);
            setTotal(result.total);
            setTotalPages(Math.ceil(result.total / limit));
            setCurrentPage(page);
            setCurrentFilters(filters);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to search lands");
            setLands([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const createLand = useCallback(async (landData: CreateLandData): Promise<CreateLandOutput> => {
        try {
            setError(null);

            const createLandUseCase = container.get<CreateLandUseCase>('CreateLandUseCase');
            const input = CreateLandInput.create({
                ...landData,
                currency: landData.currency || 'USD'
            });
            const result = await createLandUseCase.execute(input);

            // Refetch lands to include the new one
            await refetch();

            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create land");
            throw err;
        }
    }, []);

    const refetch = useCallback(async () => {
        await searchLands(currentFilters, currentPage);
    }, [searchLands, currentFilters, currentPage]);

    useEffect(() => {
        searchLands(initialFilters);
    }, []);

    return {
        lands,
        loading,
        error,
        total,
        totalPages,
        currentPage,
        searchLands,
        createLand,
        refetch,
    };
}

export interface UseLandReturn {
    land: GetLandByIdOutput | null;
    loading: boolean;
    error: string | null;
    updateLand: (landData: UpdateLandData) => Promise<UpdateLandOutput>;
    refetch: () => Promise<void>;
}

export interface UpdateLandData {
    id: string;
    name?: string;
    description?: string;
    area?: number;
    price?: number;
    currency?: string;
    location?: string;
    type?: 'residential' | 'commercial' | 'agricultural' | 'industrial' | 'recreational' | 'mixed-use';
    features?: string[];
    imagesToAdd?: string[];
    imagesToRemove?: string[];
    imageOrder?: string[];
}

export function useLand(landId?: string): UseLandReturn {
    const [land, setLand] = useState<GetLandByIdOutput | null>(null);
    const [loading, setLoading] = useState(!!landId);
    const [error, setError] = useState<string | null>(null);

    const fetchLand = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setError(null);

            const getLandByIdUseCase = container.get<GetLandByIdUseCase>('GetLandByIdUseCase');
            const input = GetLandByIdInput.fromId(id);
            const result = await getLandByIdUseCase.execute(input);

            setLand(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch land");
            setLand(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateLand = useCallback(async (landData: UpdateLandData): Promise<UpdateLandOutput> => {
        try {
            setError(null);

            const updateLandUseCase = container.get<UpdateLandUseCase>('UpdateLandUseCase');
            const input = UpdateLandInput.create(landData);
            const result = await updateLandUseCase.execute(input);

            // Refetch the updated land
            if (landId) {
                await fetchLand(landId);
            }

            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update land");
            throw err;
        }
    }, [landId, fetchLand]);

    const refetch = useCallback(async () => {
        if (landId) {
            await fetchLand(landId);
        }
    }, [landId, fetchLand]);

    useEffect(() => {
        if (landId) {
            fetchLand(landId);
        }
    }, [landId, fetchLand]);

    return {
        land,
        loading,
        error,
        updateLand,
        refetch,
    };
}