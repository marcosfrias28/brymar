import { eq, desc, asc, count, and, ilike, or, gte, lte, sql } from "drizzle-orm";
import type { Database } from '@/lib/db/drizzle';
import { lands } from '@/lib/db/schema';
import { Land } from '@/domain/land/entities/Land';
import {
    ILandRepository,
    LandSearchCriteria
} from '@/domain/land/repositories/ILandRepository';
import {
    LandId,
    LandType,
    LandStatus
} from '@/domain/land/value-objects';
import { InfrastructureError } from '@/domain/shared/errors/DomainError';
import { LandMapper } from "../mappers/LandMapper";

export class DrizzleLandRepository /* implements ILandRepository */ {
    constructor(private readonly _database: Database) { }

    async save(land: Land): Promise<void> {
        try {
            const landData = this.mapToDatabase(land);

            if (land.isNew()) {
                await this._database.insert(lands).values(landData);
            } else {
                await this._database
                    .update(lands)
                    .set(landData)
                    .where(eq(lands.id, parseInt(landData.id)));
            }
        } catch (error) {
            throw new InfrastructureError(`Failed to save land: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findById(id: LandId): Promise<Land | null> {
        try {
            const result = await this._database
                .select()
                .from(lands)
                .where(eq(lands.id, parseInt(id.value)))
                .limit(1);

            if (result.length === 0) {
                return null;
            }

            return this.mapToDomain(result[0]);
        } catch (error) {
            throw new InfrastructureError(`Failed to find land by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findByStatus(status: LandStatus): Promise<Land[]> {
        try {
            // Note: lands table doesn't have status column, return all lands for now
            const results = await this._database
                .select()
                .from(lands)
                .orderBy(desc(lands.createdAt));

            return results.map(row => this.mapToDomain(row));
        } catch (error) {
            throw new InfrastructureError(`Failed to find lands by status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findByType(type: LandType): Promise<Land[]> {
        try {
            const results = await this._database
                .select()
                .from(lands)
                .where(eq(lands.type, type.value));

            return results.map(row => this.mapToDomain(row));
        } catch (error) {
            throw new InfrastructureError(`Failed to find lands by type: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async search(
        filters: LandSearchCriteria,
        page: number,
        limit: number,
        sortBy?: string
    ): Promise<any> {
        try {
            const offset = (page - 1) * limit;
            const whereConditions = this.buildWhereConditions(filters);

            // Build the base query
            const baseQuery = this._database.select().from(lands);

            // Apply where conditions if any
            const queryWithWhere = whereConditions.length > 0
                ? baseQuery.where(
                    whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions)
                )
                : baseQuery;

            // Apply sorting
            const finalQuery = this.applySorting(queryWithWhere, sortBy);

            // Execute query with pagination
            const landsResult = await finalQuery
                .limit(limit)
                .offset(offset);

            // Get total count
            const totalBaseQuery = this._database.select({ count: count() }).from(lands);
            const totalQueryWithWhere = whereConditions.length > 0
                ? totalBaseQuery.where(
                    whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions)
                )
                : totalBaseQuery;

            const totalResult = await totalQueryWithWhere;
            const total = totalResult[0].count;

            return {
                lands: landsResult.map((row: any) => this.mapToDomain(row)),
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
            };
        } catch (error) {
            throw new InfrastructureError(`Failed to search lands: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findPublished(page: number, limit: number): Promise<any> {
        try {
            const offset = (page - 1) * limit;

            // Note: lands table doesn't have status column, return all lands for now
            const landsResult = await this._database
                .select()
                .from(lands)
                .orderBy(desc(lands.createdAt))
                .limit(limit)
                .offset(offset);

            const totalResult = await this._database
                .select({ count: count() })
                .from(lands);

            const total = totalResult[0].count;

            return {
                lands: landsResult.map((row: any) => this.mapToDomain(row)),
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
            };
        } catch (error) {
            throw new InfrastructureError(`Failed to find published lands: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findByLocation(location: string): Promise<Land[]> {
        try {
            const results = await this._database
                .select()
                .from(lands)
                .where(
                    or(
                        ilike(lands.location, `%${location}%`),
                        ilike(lands.name, `%${location}%`),
                        ilike(lands.description, `%${location}%`)
                    )
                );

            return results.map(row => this.mapToDomain(row));
        } catch (error) {
            throw new InfrastructureError(`Failed to find lands by location: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findByPriceRange(minPrice: number, maxPrice: number): Promise<Land[]> {
        try {
            const results = await this._database
                .select()
                .from(lands)
                .where(
                    and(
                        gte(lands.price, minPrice),
                        lte(lands.price, maxPrice)
                    )
                );

            return results.map(row => this.mapToDomain(row));
        } catch (error) {
            throw new InfrastructureError(`Failed to find lands by price range: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findByAreaRange(minArea: number, maxArea: number): Promise<Land[]> {
        try {
            const results = await this._database
                .select()
                .from(lands)
                .where(
                    and(
                        gte(lands.area, minArea),
                        lte(lands.area, maxArea)
                    )
                );

            return results.map(row => this.mapToDomain(row));
        } catch (error) {
            throw new InfrastructureError(`Failed to find lands by area range: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findSimilar(land: Land, limit: number): Promise<Land[]> {
        try {
            const landPrice = land.getPrice().amount;
            const landArea = land.getArea().getValue();
            const landType = land.getType().value;
            // Get location for potential future use
            land.getLocation().value;

            // Find similar lands based on type, price range (±20%), and area range (±30%)
            const priceMin = landPrice * 0.8;
            const priceMax = landPrice * 1.2;
            const areaMin = landArea * 0.7;
            const areaMax = landArea * 1.3;

            const results = await this._database
                .select()
                .from(lands)
                .where(
                    and(
                        eq(lands.type, landType),
                        gte(lands.price, priceMin),
                        lte(lands.price, priceMax),
                        gte(lands.area, areaMin),
                        lte(lands.area, areaMax),
                        // Exclude the same land
                        sql`${lands.id} != ${parseInt(land.getLandId().value)}`
                    )
                )
                .orderBy(
                    // Order by similarity (closest price and area)
                    sql`ABS(${lands.price} - ${landPrice}) + ABS(${lands.area} - ${landArea})`
                )
                .limit(limit);

            return results.map(row => this.mapToDomain(row));
        } catch (error) {
            throw new InfrastructureError(`Failed to find similar lands: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async delete(id: LandId): Promise<void> {
        try {
            const result = await this._database
                .delete(lands)
                .where(eq(lands.id, parseInt(id.value)))
                .returning();

            if (result.length === 0) {
                throw new InfrastructureError("Land not found");
            }
        } catch (error) {
            throw new InfrastructureError(`Failed to delete land: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async exists(id: LandId): Promise<boolean> {
        try {
            const result = await this._database
                .select({ id: lands.id })
                .from(lands)
                .where(eq(lands.id, parseInt(id.value)))
                .limit(1);

            return result.length > 0;
        } catch (error) {
            throw new InfrastructureError(`Failed to check land existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async count(): Promise<number> {
        try {
            const result = await this._database
                .select({ count: count() })
                .from(lands);

            return result[0].count;
        } catch (error) {
            throw new InfrastructureError(`Failed to count lands: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async countByStatus(status: LandStatus): Promise<number> {
        try {
            // Note: lands table doesn't have status column, return total count
            const result = await this._database
                .select({ count: count() })
                .from(lands);

            return result[0].count;
        } catch (error) {
            throw new InfrastructureError(`Failed to count lands by status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async countByType(type: LandType): Promise<number> {
        try {
            const result = await this._database
                .select({ count: count() })
                .from(lands)
                .where(eq(lands.type, type.value));

            return result[0].count;
        } catch (error) {
            throw new InfrastructureError(`Failed to count lands by type: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private buildWhereConditions(filters: LandSearchCriteria): any[] {
        const whereConditions = [];

        // Location search
        if (filters.location && filters.location.trim()) {
            whereConditions.push(
                or(
                    ilike(lands.location, `%${filters.location}%`),
                    ilike(lands.name, `%${filters.location}%`),
                    ilike(lands.description, `%${filters.location}%`)
                )
            );
        }

        // Land type filter
        if (filters.landType && filters.landType !== "all") {
            whereConditions.push(eq(lands.type, filters.landType));
        }

        // Status filter - Note: lands table doesn't have status column
        // Skip status filtering for now

        // Price range filter
        if (filters.minPrice && filters.minPrice > 0) {
            whereConditions.push(gte(lands.price, filters.minPrice));
        }
        if (filters.maxPrice && filters.maxPrice > 0) {
            whereConditions.push(lte(lands.price, filters.maxPrice));
        }

        // Area range filter
        if (filters.minArea && filters.minArea > 0) {
            whereConditions.push(gte(lands.area, filters.minArea));
        }
        if (filters.maxArea && filters.maxArea > 0) {
            whereConditions.push(lte(lands.area, filters.maxArea));
        }

        // Features filter - Note: lands table doesn't have features column
        // Skip features filtering for now

        return whereConditions;
    }

    private applySorting(query: any, sortBy?: string): any {
        switch (sortBy) {
            case "price-low":
                return query.orderBy(asc(lands.price));
            case "price-high":
                return query.orderBy(desc(lands.price));
            case "area-large":
                return query.orderBy(desc(lands.area));
            case "area-small":
                return query.orderBy(asc(lands.area));
            case "name":
                return query.orderBy(asc(lands.name));
            case "oldest":
                return query.orderBy(asc(lands.createdAt));
            case "newest":
            default:
                return query.orderBy(desc(lands.createdAt));
        }
    }

    private mapToDatabase(land: Land): any {
        return LandMapper.toDatabase(land);
    }

    private mapToDomain(row: any): Land {
        return LandMapper.toDomain(row);
    }
}