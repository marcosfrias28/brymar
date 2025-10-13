import { Property } from "../entities/Property";
import { PropertyId } from "../value-objects/PropertyId";
import { PropertyStatus } from "../value-objects/PropertyStatus";
import { PropertyType } from "../value-objects/PropertyType";
import { Repository } from '@/domain/shared/interfaces/Repository';

export interface PropertySearchCriteria {
    minPrice?: number;
    maxPrice?: number;
    minBedrooms?: number;
    maxBedrooms?: number;
    minBathrooms?: number;
    maxBathrooms?: number;
    minArea?: number;
    maxArea?: number;
    propertyTypes?: string[];
    statuses?: string[];
    amenities?: string[];
    location?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: 'price' | 'area' | 'bedrooms' | 'bathrooms' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
}

export interface PropertySearchResult {
    properties: Property[];
    total: number;
    hasMore: boolean;
}

export interface IPropertyRepository extends Repository<Property, PropertyId> {
    /**
     * Find property by ID
     */
    findById(id: PropertyId): Promise<Property | null>;

    /**
     * Save property (create or update)
     */
    save(property: Property): Promise<void>;

    /**
     * Delete property by ID
     */
    delete(id: PropertyId): Promise<void>;

    /**
     * Find properties by status
     */
    findByStatus(status: PropertyStatus): Promise<Property[]>;

    /**
     * Find properties by type
     */
    findByType(type: PropertyType): Promise<Property[]>;

    /**
     * Find featured properties
     */
    findFeatured(limit?: number): Promise<Property[]>;

    /**
     * Search properties with criteria
     */
    search(criteria: PropertySearchCriteria): Promise<PropertySearchResult>;

    /**
     * Find properties within a price range
     */
    findByPriceRange(minPrice: number, maxPrice: number): Promise<Property[]>;

    /**
     * Find properties by location (city, state, or address search)
     */
    findByLocation(location: string): Promise<Property[]>;

    /**
     * Find properties near coordinates
     */
    findNearLocation(
        latitude: number,
        longitude: number,
        radiusKm: number
    ): Promise<Property[]>;

    /**
     * Find similar properties (same type, similar price range, same area)
     */
    findSimilar(property: Property, limit?: number): Promise<Property[]>;

    /**
     * Get property statistics
     */
    getStatistics(): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byType: Record<string, number>;
        averagePrice: number;
        averagePricePerSqm: number;
    }>;

    /**
     * Find properties that need attention (expired, pending review, etc.)
     */
    findRequiringAttention(): Promise<Property[]>;

    /**
     * Find recently updated properties
     */
    findRecentlyUpdated(limit?: number): Promise<Property[]>;

    /**
     * Find properties by user/owner (if applicable)
     */
    findByOwner(ownerId: string): Promise<Property[]>;

    /**
     * Check if property exists
     */
    exists(id: PropertyId): Promise<boolean>;

    /**
     * Count properties matching criteria
     */
    count(criteria?: Partial<PropertySearchCriteria>): Promise<number>;

    /**
     * Find properties with missing images
     */
    findWithoutImages(): Promise<Property[]>;

    /**
     * Find properties with incomplete data
     */
    findIncomplete(): Promise<Property[]>;

    /**
     * Bulk update properties (for admin operations)
     */
    bulkUpdate(
        criteria: Partial<PropertySearchCriteria>,
        updates: Partial<{
            status: PropertyStatus;
            featured: boolean;
        }>
    ): Promise<number>;

    /**
     * Get price statistics for a specific area/location
     */
    getPriceStatistics(location?: string): Promise<{
        averagePrice: number;
        medianPrice: number;
        minPrice: number;
        maxPrice: number;
        averagePricePerSqm: number;
        totalProperties: number;
    }>;
}