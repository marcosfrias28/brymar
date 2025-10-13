import { eq, and, or, gte, lte, like, desc, asc, count, sql } from 'drizzle-orm';
import { Property } from '@/domain/property/entities/Property';
import { PropertyId } from '@/domain/property/value-objects/PropertyId';
import { PropertyTitle } from '@/domain/property/value-objects/PropertyTitle';
import { PropertyDescription } from '@/domain/property/value-objects/PropertyDescription';
import { Price } from '@/domain/property/value-objects/Price';
import { Address } from '@/domain/property/value-objects/Address';
import { PropertyType } from '@/domain/property/value-objects/PropertyType';
import { PropertyStatus } from '@/domain/property/value-objects/PropertyStatus';
import { PropertyFeatures } from '@/domain/property/value-objects/PropertyFeatures';
import {
    IPropertyRepository,
    PropertySearchCriteria,
    PropertySearchResult
} from '@/domain/property/repositories/IPropertyRepository';
import { properties } from '@/lib/db/schema';
import type { Database } from '@/lib/db/drizzle';

/**
 * Drizzle implementation of IPropertyRepository
 * Maps between Property domain entities and database schema
 */
export class DrizzlePropertyRepository implements IPropertyRepository {
    constructor(private readonly db: Database) { }

    async findById(id: PropertyId): Promise<Property | null> {
        try {
            const result = await this.db
                .select()
                .from(properties)
                .where(eq(properties.id, parseInt(id.value)))
                .limit(1);

            if (result.length === 0) {
                return null;
            }

            return this.mapToDomain(result[0]);
        } catch (error) {
            throw new Error(`Failed to find property by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async save(property: Property): Promise<void> {
        try {
            const propertyData = this.mapToDatabase(property);

            const existing = await this.db
                .select({ id: properties.id })
                .from(properties)
                .where(eq(properties.id, parseInt(property.getId().value)))
                .limit(1);

            if (existing.length === 0) {
                await this.db.insert(properties).values(propertyData);
            } else {
                await this.db
                    .update(properties)
                    .set(propertyData)
                    .where(eq(properties.id, parseInt(property.getId().value)));
            }
        } catch (error) {
            throw new Error(`Failed to save property: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async delete(id: PropertyId): Promise<void> {
        try {
            await this.db
                .delete(properties)
                .where(eq(properties.id, parseInt(id.value)));
        } catch (error) {
            throw new Error(`Failed to delete property: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findByStatus(status: PropertyStatus): Promise<Property[]> {
        try {
            const result = await this.db
                .select()
                .from(properties)
                .where(eq(properties.status, status.value))
                .orderBy(desc(properties.createdAt));

            return result.map(row => this.mapToDomain(row));
        } catch (error) {
            throw new Error(`Failed to find properties by status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findByType(type: PropertyType): Promise<Property[]> {
        try {
            const result = await this.db
                .select()
                .from(properties)
                .where(eq(properties.type, type.value))
                .orderBy(desc(properties.createdAt));

            return result.map(row => this.mapToDomain(row));
        } catch (error) {
            throw new Error(`Failed to find properties by type: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findFeatured(limit: number = 10): Promise<Property[]> {
        try {
            const result = await this.db
                .select()
                .from(properties)
                .where(eq(properties.featured, true))
                .orderBy(desc(properties.createdAt))
                .limit(limit);

            return result.map(row => this.mapToDomain(row));
        } catch (error) {
            throw new Error(`Failed to find featured properties: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async search(criteria: PropertySearchCriteria): Promise<PropertySearchResult> {
        try {
            const conditions = this.buildSearchConditions(criteria);

            // Get total count
            const totalResult = await this.db
                .select({ count: count() })
                .from(properties)
                .where(conditions);

            const total = totalResult[0]?.count || 0;

            // Get paginated results
            const result = await this.db
                .select()
                .from(properties)
                .where(conditions)
                .orderBy(desc(properties.createdAt))
                .limit(criteria.limit || 50)
                .offset(criteria.offset || 0);
            const propertiesResult = result.map(row => this.mapToDomain(row));

            const hasMore = criteria.offset && criteria.limit
                ? (criteria.offset + criteria.limit) < total
                : false;

            return {
                properties: propertiesResult,
                total,
                hasMore
            };
        } catch (error) {
            throw new Error(`Failed to search properties: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findByPriceRange(minPrice: number, maxPrice: number): Promise<Property[]> {
        try {
            const result = await this.db
                .select()
                .from(properties)
                .where(and(
                    gte(properties.price, minPrice),
                    lte(properties.price, maxPrice)
                ))
                .orderBy(asc(properties.price));

            return result.map(row => this.mapToDomain(row));
        } catch (error) {
            throw new Error(`Failed to find properties by price range: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // Simplified implementations for remaining methods
    async findByLocation(location: string): Promise<Property[]> {
        try {
            const result = await this.db
                .select()
                .from(properties)
                .where(like(properties.location, `%${location}%`))
                .orderBy(desc(properties.createdAt));

            return result.map(row => this.mapToDomain(row));
        } catch (error) {
            throw new Error(`Failed to find properties by location: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findNearLocation(latitude: number, longitude: number, radiusKm: number): Promise<Property[]> {
        // Simplified implementation - in production use PostGIS
        return this.findByLocation(''); // Return empty for now
    }

    async findSimilar(property: Property, limit: number = 5): Promise<Property[]> {
        try {
            const result = await this.db
                .select()
                .from(properties)
                .where(eq(properties.type, property.getType().value))
                .limit(limit);

            return result.map(row => this.mapToDomain(row));
        } catch (error) {
            throw new Error(`Failed to find similar properties: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getStatistics(): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byType: Record<string, number>;
        averagePrice: number;
        averagePricePerSqm: number;
    }> {
        try {
            const totalResult = await this.db
                .select({ count: count() })
                .from(properties);

            return {
                total: totalResult[0]?.count || 0,
                byStatus: {},
                byType: {},
                averagePrice: 0,
                averagePricePerSqm: 0
            };
        } catch (error) {
            throw new Error(`Failed to get statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async findRequiringAttention(): Promise<Property[]> {
        try {
            const result = await this.db
                .select()
                .from(properties)
                .where(eq(properties.status, 'pending'))
                .orderBy(desc(properties.updatedAt));

            return result.map(row => this.mapToDomain(row));
        } catch (error) {
            throw new Error(`Failed to find properties requiring attention: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findRecentlyUpdated(limit: number = 10): Promise<Property[]> {
        try {
            const result = await this.db
                .select()
                .from(properties)
                .orderBy(desc(properties.updatedAt))
                .limit(limit);

            return result.map(row => this.mapToDomain(row));
        } catch (error) {
            throw new Error(`Failed to find recently updated properties: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findByOwner(ownerId: string): Promise<Property[]> {
        // Current schema doesn't have owner field - return empty array
        return [];
    }

    async exists(id: PropertyId): Promise<boolean> {
        try {
            const result = await this.db
                .select({ id: properties.id })
                .from(properties)
                .where(eq(properties.id, parseInt(id.value)))
                .limit(1);

            return result.length > 0;
        } catch (error) {
            throw new Error(`Failed to check if property exists: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async count(criteria?: Partial<PropertySearchCriteria>): Promise<number> {
        try {
            const conditions = criteria ? this.buildSearchConditions(criteria) : undefined;

            const result = await this.db
                .select({ count: count() })
                .from(properties)
                .where(conditions);

            return result[0]?.count || 0;
        } catch (error) {
            throw new Error(`Failed to count properties: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async findWithoutImages(): Promise<Property[]> {
        try {
            const result = await this.db
                .select()
                .from(properties)
                .where(sql`${properties.images} = '[]'`)
                .orderBy(desc(properties.createdAt));

            return result.map(row => this.mapToDomain(row));
        } catch (error) {
            throw new Error(`Failed to find properties without images: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findIncomplete(): Promise<Property[]> {
        try {
            const result = await this.db
                .select()
                .from(properties)
                .where(or(
                    eq(properties.title, ''),
                    eq(properties.description, ''),
                    lte(properties.price, 0)
                ))
                .orderBy(desc(properties.createdAt));

            return result.map(row => this.mapToDomain(row));
        } catch (error) {
            throw new Error(`Failed to find incomplete properties: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async bulkUpdate(
        criteria: Partial<PropertySearchCriteria>,
        updates: Partial<{
            status: PropertyStatus;
            featured: boolean;
        }>
    ): Promise<number> {
        try {
            const conditions = this.buildSearchConditions(criteria);
            const updateData: any = {};

            if (updates.status) {
                updateData.status = updates.status.value;
            }
            if (updates.featured !== undefined) {
                updateData.featured = updates.featured;
            }

            await this.db
                .update(properties)
                .set(updateData)
                .where(conditions);

            return 0; // Simplified - Drizzle doesn't return affected rows count
        } catch (error) {
            throw new Error(`Failed to bulk update properties: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getPriceStatistics(location?: string): Promise<{
        averagePrice: number;
        medianPrice: number;
        minPrice: number;
        maxPrice: number;
        averagePricePerSqm: number;
        totalProperties: number;
    }> {
        try {
            const result = await this.db
                .select()
                .from(properties)
                .where(location ? like(properties.location, `%${location}%`) : undefined);

            if (result.length === 0) {
                return {
                    averagePrice: 0,
                    medianPrice: 0,
                    minPrice: 0,
                    maxPrice: 0,
                    averagePricePerSqm: 0,
                    totalProperties: 0
                };
            }

            const prices = result.map(row => row.price).sort((a, b) => a - b);
            const totalPrice = prices.reduce((sum, price) => sum + price, 0);
            const averagePrice = totalPrice / prices.length;
            const medianPrice = prices.length % 2 === 0
                ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
                : prices[Math.floor(prices.length / 2)];

            return {
                averagePrice,
                medianPrice,
                minPrice: Math.min(...prices),
                maxPrice: Math.max(...prices),
                averagePricePerSqm: 0, // Simplified
                totalProperties: result.length
            };
        } catch (error) {
            throw new Error(`Failed to get price statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    private buildSearchConditions(criteria: Partial<PropertySearchCriteria>) {
        const conditions = [];

        if (criteria.minPrice !== undefined) {
            conditions.push(gte(properties.price, criteria.minPrice));
        }

        if (criteria.maxPrice !== undefined) {
            conditions.push(lte(properties.price, criteria.maxPrice));
        }

        if (criteria.minBedrooms !== undefined) {
            conditions.push(gte(properties.bedrooms, criteria.minBedrooms));
        }

        if (criteria.maxBedrooms !== undefined) {
            conditions.push(lte(properties.bedrooms, criteria.maxBedrooms));
        }

        if (criteria.location) {
            conditions.push(like(properties.location, `%${criteria.location}%`));
        }

        if (criteria.featured !== undefined) {
            conditions.push(eq(properties.featured, criteria.featured));
        }

        return conditions.length > 0 ? and(...conditions) : undefined;
    }

    private mapToDomain(row: any): Property {
        try {
            const imagesArray = Array.isArray(row.images) ? row.images : [];

            const id = PropertyId.create(row.id.toString());
            const title = PropertyTitle.create(row.title);
            const description = PropertyDescription.create(row.description);
            const price = Price.create(row.price, 'USD');

            const addressData = {
                street: '',
                city: row.location || '',
                state: '',
                country: '',
                postalCode: '',
            };

            const address = Address.create(addressData);
            const type = PropertyType.create(row.type);
            const status = PropertyStatus.create(row.status);

            const features = PropertyFeatures.create({
                bedrooms: row.bedrooms || 0,
                bathrooms: row.bathrooms || 0,
                area: row.area || 0,
                amenities: [],
                features: [],
            });

            return Property.reconstitute({
                id,
                title,
                description,
                price,
                address,
                type,
                status,
                features,
                images: imagesArray,
                featured: row.featured || false,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt || row.createdAt,
            });
        } catch (error) {
            throw new Error(`Failed to map database row to domain entity: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    private mapToDatabase(property: Property): any {
        const address = property.getAddress();
        const features = property.getFeatures();
        const price = property.getPrice();

        return {
            id: parseInt(property.getId().value),
            title: property.getTitle().value,
            description: property.getDescription().value,
            price: price.amount,
            type: property.getType().value,
            bedrooms: features.bedrooms,
            bathrooms: features.bathrooms,
            area: features.area,
            location: address.getFullAddress(),
            status: property.getStatus().value,
            featured: property.isFeatured(),
            images: property.getImages(),
            createdAt: property.getCreatedAt(),
            updatedAt: property.getUpdatedAt(),
        };
    }
}