import { Property } from "../entities/Property";
import { PropertyId } from "../value-objects/PropertyId";
import { PropertyStatus } from "../value-objects/PropertyStatus";
import { PropertyType } from "../value-objects/PropertyType";
import {
    SearchableRepository,
    StatusFilterableRepository,
    LocationFilterableRepository,
    PriceFilterableRepository,
    SearchCriteria,
    SearchResult
} from '@/domain/shared/interfaces/BaseRepository';

export interface PropertySearchCriteria extends SearchCriteria {
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
    sortBy?: 'price' | 'area' | 'bedrooms' | 'bathrooms' | 'createdAt' | 'updatedAt';
}

export interface IPropertyRepository extends
    SearchableRepository<Property, PropertyId, PropertySearchCriteria>,
    StatusFilterableRepository<Property, PropertyId, PropertyStatus>,
    LocationFilterableRepository<Property, PropertyId>,
    PriceFilterableRepository<Property, PropertyId> {

    /**
     * Find properties by type
     */
    findByType(type: PropertyType): Promise<Property[]>;

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
     * Find properties by user/owner (if applicable)
     */
    findByOwner(ownerId: string): Promise<Property[]>;

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
}