import { eq, desc, asc, count, and, ilike, or, gte, lte, sql } from "drizzle-orm";
import type { Database } from '@/lib/db/drizzle';
import { lands } from '@/lib/db/schema';
import { Land } from '@/domain/land/entities/Land';
import { LandSearchCriteria } from '@/domain/land/repositories/ILandRepository';
import { InfrastructureError } from '@/domain/shared/errors/DomainError';
import { LandMapper } from "../mappers/LandMapper";

export interface AdvancedLandSearchCriteria extends LandSearchCriteria {
    // Geographic filters
    province?: string;
    city?: string;
    coordinates?: {
        lat: number;
        lng: number;
        radius: number; // in kilometers
    };

    // Advanced price filters
    pricePerSquareMeter?: {
        min?: number;
        max?: number;
    };

    // Land characteristics
    zoning?: string[];
    accessibility?: string[]; // road access, utilities, etc.
    topography?: string[]; // flat, hilly, mountainous
    soilType?: string[];
    waterAccess?: boolean;
    electricityAccess?: boolean;

    // Investment filters
    developmentPotential?: string[]; // residential, commercial, agricultural
    investmentType?: string[]; // short-term, long-term, development

    // Exclusion filters
    excludeIds?: string[];

    // Full-text search
    searchQuery?: string;
}

export interface LandSearchOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    includeInactive?: boolean;
    facets?: boolean; // Return facet counts for filtering
}

export interface LandSearchFacets {
    types: Record<string, number>;
    priceRanges: Record<string, number>;
    areaRanges: Record<string, number>;
    locations: Record<string, number>;
    features: Record<string, number>;
}

export interface AdvancedLandSearchResult {
    lands: Land[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    facets?: LandSearchFacets;
    searchTime?: number;
    suggestions?: string[];
}

export class LandSearchService {
    constructor(private readonly _db: Database) { }

    async advancedSearch(
        filters: AdvancedLandSearchCriteria,
        options: LandSearchOptions = {}
    ): Promise<AdvancedLandSearchResult> {
        const startTime = Date.now();

        try {
            const {
                page = 1,
                limit = 12,
                sortBy = "newest",
                sortOrder = "desc",
                includeInactive = false,
                facets = false
            } = options;

            const offset = (page - 1) * limit;
            const whereConditions = this.buildAdvancedWhereConditions(filters, includeInactive);

            // Build the base query
            const baseQuery = this._db.select().from(lands);

            // Apply where conditions
            const queryWithWhere = whereConditions.length > 0
                ? baseQuery.where(and(...whereConditions))
                : baseQuery;

            // Apply sorting
            const finalQuery = this.applySorting(queryWithWhere, sortBy, sortOrder);

            // Execute query with pagination
            const landsResult = await finalQuery
                .limit(limit)
                .offset(offset);

            // Get total count
            const totalResult = await this.getTotalCount(whereConditions);
            const total = totalResult[0].count;

            // Get facets if requested
            let searchFacets: LandSearchFacets | undefined;
            if (facets) {
                searchFacets = await this.getFacets(whereConditions);
            }

            // Generate search suggestions
            const suggestions = await this.generateSuggestions(filters);

            const searchTime = Date.now() - startTime;

            return {
                lands: LandMapper.toDomainList(landsResult),
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                hasNextPage: page < Math.ceil(total / limit),
                hasPreviousPage: page > 1,
                facets: searchFacets,
                searchTime,
                suggestions,
            };
        } catch (error: any) {
            throw new InfrastructureError(`Advanced land search failed: ${error.message}`);
        }
    }

    async searchByLocation(
        location: string,
        radius?: number,
        limit: number = 10
    ): Promise<Land[]> {
        try {
            const conditions = [
                or(
                    ilike(lands.location, `%${location}%`),
                    ilike(lands.name, `%${location}%`),
                    ilike(lands.description, `%${location}%`)
                )
            ];

            const results = await this._db
                .select()
                .from(lands)
                .where(and(...conditions))
                .orderBy(desc(lands.createdAt))
                .limit(limit);

            return LandMapper.toDomainList(results);
        } catch (error: any) {
            throw new InfrastructureError(`Location search failed: ${error.message}`);
        }
    }

    async searchSimilar(
        referenceLand: Land,
        limit: number = 5
    ): Promise<Land[]> {
        try {
            const landPrice = referenceLand.getPrice().amount;
            const landArea = referenceLand.getArea().getValue();
            const landType = referenceLand.getType().value;

            // Define similarity ranges
            const priceMin = landPrice * 0.7;
            const priceMax = landPrice * 1.3;
            const areaMin = landArea * 0.8;
            const areaMax = landArea * 1.2;

            const results = await this._db
                .select()
                .from(lands)
                .where(
                    and(
                        eq(lands.type, landType),
                        gte(lands.price, priceMin),
                        lte(lands.price, priceMax),
                        gte(lands.area, areaMin),
                        lte(lands.area, areaMax),
                        // Exclude the reference land
                        sql`${lands.id} != ${parseInt(referenceLand.getLandId().value)}`
                    )
                )
                .orderBy(
                    // Order by similarity score
                    sql`ABS(${lands.price} - ${landPrice}) + ABS(${lands.area} - ${landArea})`
                )
                .limit(limit);

            return LandMapper.toDomainList(results);
        } catch (error: any) {
            throw new InfrastructureError(`Similar lands search failed: ${error.message}`);
        }
    }

    async getPopularSearchTerms(limit: number = 10): Promise<string[]> {
        // This would typically be implemented with a search analytics table
        // For now, return common land-related terms
        return [
            "agricultural land",
            "residential lot",
            "commercial property",
            "investment land",
            "development land",
            "rural property",
            "urban lot",
            "beachfront land",
            "mountain property",
            "industrial land"
        ].slice(0, limit);
    }

    private buildAdvancedWhereConditions(
        filters: AdvancedLandSearchCriteria,
        _includeInactive: boolean
    ): any[] {
        const conditions = [];

        // Note: Status filter removed as lands table doesn't have status field

        // Basic filters
        if (filters.location && filters.location.trim()) {
            conditions.push(
                or(
                    ilike(lands.location, `%${filters.location}%`),
                    ilike(lands.name, `%${filters.location}%`),
                    ilike(lands.description, `%${filters.location}%`)
                )
            );
        }

        if (filters.landType && filters.landType !== "all") {
            conditions.push(eq(lands.type, filters.landType));
        }

        // Note: Status filter removed as lands table doesn't have status field

        // Price filters
        if (filters.minPrice && filters.minPrice > 0) {
            conditions.push(gte(lands.price, filters.minPrice));
        }
        if (filters.maxPrice && filters.maxPrice > 0) {
            conditions.push(lte(lands.price, filters.maxPrice));
        }

        // Area filters
        if (filters.minArea && filters.minArea > 0) {
            conditions.push(gte(lands.area, filters.minArea));
        }
        if (filters.maxArea && filters.maxArea > 0) {
            conditions.push(lte(lands.area, filters.maxArea));
        }

        // Price per square meter filters
        if (filters.pricePerSquareMeter?.min) {
            conditions.push(
                sql`(${lands.price} / ${lands.area}) >= ${filters.pricePerSquareMeter.min}`
            );
        }
        if (filters.pricePerSquareMeter?.max) {
            conditions.push(
                sql`(${lands.price} / ${lands.area}) <= ${filters.pricePerSquareMeter.max}`
            );
        }

        // Note: Features filter removed as lands table doesn't have features field

        // Exclusion filter
        if (filters.excludeIds && filters.excludeIds.length > 0) {
            const excludeIds = filters.excludeIds.map(id => parseInt(id)).filter(id => !isNaN(id));
            if (excludeIds.length > 0) {
                conditions.push(sql`${lands.id} NOT IN (${excludeIds.join(',')})`);
            }
        }

        // Full-text search
        if (filters.searchQuery && filters.searchQuery.trim()) {
            const searchTerm = filters.searchQuery.trim();
            conditions.push(
                or(
                    ilike(lands.name, `%${searchTerm}%`),
                    ilike(lands.description, `%${searchTerm}%`),
                    ilike(lands.location, `%${searchTerm}%`),
                    ilike(lands.type, `%${searchTerm}%`)
                )
            );
        }

        return conditions;
    }

    private applySorting(query: any, sortBy: string, sortOrder: 'asc' | 'desc'): any {
        const orderFn = sortOrder === 'asc' ? asc : desc;

        switch (sortBy) {
            case "price":
                return query.orderBy(orderFn(lands.price));
            case "area":
                return query.orderBy(orderFn(lands.area));
            case "name":
                return query.orderBy(orderFn(lands.name));
            case "location":
                return query.orderBy(orderFn(lands.location));
            case "type":
                return query.orderBy(orderFn(lands.type));
            case "pricePerSquareMeter":
                return query.orderBy(orderFn(sql`(${lands.price} / ${lands.area})`));
            case "oldest":
                return query.orderBy(asc(lands.createdAt));
            case "newest":
            default:
                return query.orderBy(desc(lands.createdAt));
        }
    }

    private async getTotalCount(whereConditions: any[]): Promise<{ count: number }[]> {
        const totalBaseQuery = this._db.select({ count: count() }).from(lands);
        const totalQueryWithWhere = whereConditions.length > 0
            ? totalBaseQuery.where(and(...whereConditions))
            : totalBaseQuery;

        return await totalQueryWithWhere;
    }

    private async getFacets(whereConditions: any[]): Promise<LandSearchFacets> {
        // This is a simplified implementation
        // In a real application, you might want to use more sophisticated faceting

        const baseQuery = this._db.select().from(lands);
        const queryWithWhere = whereConditions.length > 0
            ? baseQuery.where(and(...whereConditions))
            : baseQuery;

        const results = await queryWithWhere;

        const facets: LandSearchFacets = {
            types: {},
            priceRanges: {},
            areaRanges: {},
            locations: {},
            features: {}
        };

        results.forEach(land => {
            // Type facets
            facets.types[land.type] = (facets.types[land.type] || 0) + 1;

            // Price range facets
            const priceRange = this.getPriceRange(land.price);
            facets.priceRanges[priceRange] = (facets.priceRanges[priceRange] || 0) + 1;

            // Area range facets
            const areaRange = this.getAreaRange(land.area);
            facets.areaRanges[areaRange] = (facets.areaRanges[areaRange] || 0) + 1;

            // Location facets (simplified)
            const location = land.location.split(',')[0].trim(); // First part of location
            facets.locations[location] = (facets.locations[location] || 0) + 1;

            // Note: Features facets removed as lands table doesn't have features field
        });

        return facets;
    }

    private async generateSuggestions(filters: AdvancedLandSearchCriteria): Promise<string[]> {
        const suggestions: string[] = [];

        // Add location-based suggestions
        if (filters.location) {
            suggestions.push(`${filters.location} agricultural land`);
            suggestions.push(`${filters.location} residential lots`);
            suggestions.push(`${filters.location} investment property`);
        }

        // Add type-based suggestions
        if (filters.landType) {
            suggestions.push(`${filters.landType} near me`);
            suggestions.push(`${filters.landType} for sale`);
        }

        return suggestions.slice(0, 5);
    }

    private getPriceRange(price: number): string {
        if (price < 50000) return "under-50k";
        if (price < 100000) return "50k-100k";
        if (price < 250000) return "100k-250k";
        if (price < 500000) return "250k-500k";
        if (price < 1000000) return "500k-1m";
        return "over-1m";
    }

    private getAreaRange(area: number): string {
        if (area < 500) return "under-500sqm";
        if (area < 1000) return "500-1000sqm";
        if (area < 2500) return "1000-2500sqm";
        if (area < 5000) return "2500-5000sqm";
        if (area < 10000) return "5000-10000sqm";
        return "over-10000sqm";
    }
}