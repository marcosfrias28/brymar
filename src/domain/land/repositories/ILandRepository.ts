import { Land } from "../entities/Land";
import { LandId } from "../value-objects/LandId";
import { LandStatus } from "../value-objects/LandStatus";
import { LandType } from "../value-objects/LandType";

export interface LandSearchFilters {
    location?: string;
    landType?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    status?: string;
    features?: string[];
}

export interface LandSearchResult {
    lands: Land[];
    total: number;
    totalPages: number;
    currentPage: number;
}

export interface ILandRepository {
    /**
     * Save a land (create or update)
     */
    save(land: Land): Promise<void>;

    /**
     * Find a land by its ID
     */
    findById(id: LandId): Promise<Land | null>;

    /**
     * Find lands by status
     */
    findByStatus(status: LandStatus): Promise<Land[]>;

    /**
     * Find lands by type
     */
    findByType(type: LandType): Promise<Land[]>;

    /**
     * Search lands with filters and pagination
     */
    search(
        filters: LandSearchFilters,
        page: number,
        limit: number,
        sortBy?: string
    ): Promise<LandSearchResult>;

    /**
     * Find published lands (for public display)
     */
    findPublished(page: number, limit: number): Promise<LandSearchResult>;

    /**
     * Find lands by location (city, province, or address)
     */
    findByLocation(location: string): Promise<Land[]>;

    /**
     * Find lands within a price range
     */
    findByPriceRange(minPrice: number, maxPrice: number): Promise<Land[]>;

    /**
     * Find lands within an area range
     */
    findByAreaRange(minArea: number, maxArea: number): Promise<Land[]>;

    /**
     * Find similar lands (for comparison)
     */
    findSimilar(land: Land, limit: number): Promise<Land[]>;

    /**
     * Delete a land by ID
     */
    delete(id: LandId): Promise<void>;

    /**
     * Check if a land exists
     */
    exists(id: LandId): Promise<boolean>;

    /**
     * Get total count of lands
     */
    count(): Promise<number>;

    /**
     * Get count by status
     */
    countByStatus(status: LandStatus): Promise<number>;

    /**
     * Get count by type
     */
    countByType(type: LandType): Promise<number>;
}