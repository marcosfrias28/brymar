import { Property } from '@/domain/property/entities/Property';

/**
 * Individual property result in search
 */
export class PropertySearchResult {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly description: string,
        public readonly price: number,
        public readonly currency: string,
        public readonly address: {
            street: string;
            city: string;
            state: string;
            country: string;
            postalCode?: string;
            coordinates?: {
                latitude: number;
                longitude: number;
            };
        },
        public readonly type: string,
        public readonly status: string,
        public readonly features: {
            bedrooms: number;
            bathrooms: number;
            area: number;
            amenities?: string[];
            features?: string[];
            parking?: {
                spaces: number;
                type: string;
            };
            yearBuilt?: number;
            lotSize?: number;
        },
        public readonly images: string[],
        public readonly featured: boolean,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public readonly pricePerSqm: number,
        public readonly pricePerSqft: number,
        public readonly isLuxury: boolean,
        public readonly isFamilyFriendly: boolean,
        public readonly age?: number
    ) { }

    /**
     * Creates PropertySearchResult from a Property entity
     */
    static from(property: Property): PropertySearchResult {
        const address = property.getAddress();
        const features = property.getFeatures();
        const price = property.getPrice();

        return new PropertySearchResult(
            property.getId().value,
            property.getTitle().value,
            property.getDescription().value,
            price.amount,
            price.currency.code,
            {
                street: address.street,
                city: address.city,
                state: address.state,
                country: address.country,
                postalCode: address.postalCode,
                coordinates: address.coordinates ? {
                    latitude: address.coordinates.latitude,
                    longitude: address.coordinates.longitude,
                } : undefined,
            },
            property.getType().value,
            property.getStatus().value,
            {
                bedrooms: features.bedrooms,
                bathrooms: features.bathrooms,
                area: features.area,
                amenities: features.amenities,
                features: features.features,
                parking: features.parking ? {
                    spaces: features.parking.spaces,
                    type: features.parking.type,
                } : undefined,
                yearBuilt: features.yearBuilt,
                lotSize: features.lotSize,
            },
            property.getImages(),
            property.isFeatured(),
            property.getCreatedAt(),
            property.getUpdatedAt(),
            property.getPricePerSquareMeter(),
            property.getPricePerSquareFoot(),
            property.isLuxury(),
            property.isFamilyFriendly(),
            property.getAge()
        );
    }

    /**
     * Converts to JSON representation
     */
    toJSON(): object {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            price: this.price,
            currency: this.currency,
            address: this.address,
            type: this.type,
            status: this.status,
            features: this.features,
            images: this.images,
            featured: this.featured,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            pricePerSqm: this.pricePerSqm,
            pricePerSqft: this.pricePerSqft,
            isLuxury: this.isLuxury,
            isFamilyFriendly: this.isFamilyFriendly,
            age: this.age,
        };
    }
}

/**
 * Output DTO for property search results
 */
export class SearchPropertiesOutput {
    constructor(
        public readonly properties: PropertySearchResult[],
        public readonly total: number,
        public readonly hasMore: boolean,
        public readonly page: number,
        public readonly pageSize: number,
        public readonly totalPages: number,
        public readonly filters: {
            applied: string[];
            available: {
                propertyTypes: string[];
                cities: string[];
                states: string[];
                amenities: string[];
                priceRanges: {
                    min: number;
                    max: number;
                };
                areaRanges: {
                    min: number;
                    max: number;
                };
            };
        },
        public readonly statistics?: {
            averagePrice: number;
            medianPrice: number;
            averagePricePerSqm: number;
            totalListings: number;
            byType: Record<string, number>;
            byStatus: Record<string, number>;
        }
    ) { }

    /**
     * Creates SearchPropertiesOutput from repository result
     */
    static create(
        properties: Property[],
        total: number,
        offset: number,
        limit: number,
        appliedFilters: string[] = [],
        availableFilters?: any,
        statistics?: any
    ): SearchPropertiesOutput {
        const propertyResults = properties.map(property => PropertySearchResult.from(property));
        const page = Math.floor(offset / limit) + 1;
        const totalPages = Math.ceil(total / limit);
        const hasMore = offset + limit < total;

        return new SearchPropertiesOutput(
            propertyResults,
            total,
            hasMore,
            page,
            limit,
            totalPages,
            {
                applied: appliedFilters,
                available: availableFilters || {
                    propertyTypes: [],
                    cities: [],
                    states: [],
                    amenities: [],
                    priceRanges: { min: 0, max: 0 },
                    areaRanges: { min: 0, max: 0 },
                },
            },
            statistics
        );
    }

    /**
     * Converts to JSON representation
     */
    toJSON(): object {
        return {
            properties: this.properties.map(p => p.toJSON()),
            total: this.total,
            hasMore: this.hasMore,
            page: this.page,
            pageSize: this.pageSize,
            totalPages: this.totalPages,
            filters: this.filters,
            statistics: this.statistics,
        };
    }

    /**
     * Gets property IDs for easy access
     */
    getPropertyIds(): string[] {
        return this.properties.map(p => p.id);
    }

    /**
     * Gets featured properties
     */
    getFeaturedProperties(): PropertySearchResult[] {
        return this.properties.filter(p => p.featured);
    }

    /**
     * Gets properties by type
     */
    getPropertiesByType(type: string): PropertySearchResult[] {
        return this.properties.filter(p => p.type === type);
    }

    /**
     * Gets properties in price range
     */
    getPropertiesInPriceRange(minPrice: number, maxPrice: number): PropertySearchResult[] {
        return this.properties.filter(p => p.price >= minPrice && p.price <= maxPrice);
    }

    /**
     * Gets luxury properties
     */
    getLuxuryProperties(): PropertySearchResult[] {
        return this.properties.filter(p => p.isLuxury);
    }

    /**
     * Gets family-friendly properties
     */
    getFamilyFriendlyProperties(): PropertySearchResult[] {
        return this.properties.filter(p => p.isFamilyFriendly);
    }
}