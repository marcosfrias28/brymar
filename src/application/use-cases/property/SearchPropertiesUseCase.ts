import { Property } from '@/domain/property/entities/Property';
import { IPropertyRepository } from '@/domain/property/repositories/IPropertyRepository';
import { PropertyDomainService } from '@/domain/property/services/PropertyDomainService';
import { SearchPropertiesInput } from '../../dto/property/SearchPropertiesInput';
import { SearchPropertiesOutput } from '../../dto/property/SearchPropertiesOutput';
import { EntityValidationError } from '@/domain/shared/errors/DomainError';

/**
 * Use case for searching properties with various filters
 */
export class SearchPropertiesUseCase {
    constructor(
        private readonly propertyRepository: IPropertyRepository
    ) { }

    /**
     * Executes the property search use case
     */
    async execute(input: SearchPropertiesInput): Promise<SearchPropertiesOutput> {
        try {
            // 1. Validate search input
            this.validateSearchInput(input);

            // 2. Build search criteria for repository
            const searchCriteria = input.toRepositoryCriteria();

            // 3. Execute search with coordinates if provided
            let searchResult;
            if (input.coordinates) {
                // Use coordinate-based search
                const nearbyProperties = await this.propertyRepository.findNearLocation(
                    input.coordinates.latitude,
                    input.coordinates.longitude,
                    input.coordinates.radiusKm
                );

                // Apply additional filters to nearby properties
                const filteredProperties = this.applyInMemoryFilters(nearbyProperties, input);

                // Apply pagination
                const paginatedProperties = this.applyPagination(filteredProperties, input.offset, input.limit);

                searchResult = {
                    properties: paginatedProperties,
                    total: filteredProperties.length,
                    hasMore: input.offset + input.limit < filteredProperties.length,
                };
            } else {
                // Use regular repository search
                searchResult = await this.propertyRepository.search(searchCriteria);
            }

            // 4. Apply text-based query filter if provided
            if (input.query && input.query.trim().length > 0) {
                searchResult.properties = this.applyTextSearch(searchResult.properties, input.query);
                searchResult.total = searchResult.properties.length;
                searchResult.hasMore = false; // Recalculate pagination after text filter
            }

            // 5. Get additional filter data and statistics
            const [availableFilters, statistics] = await Promise.all([
                this.getAvailableFilters(input),
                this.getSearchStatistics(searchResult.properties)
            ]);

            // 6. Build applied filters list
            const appliedFilters = this.buildAppliedFiltersList(input);

            // 7. Return search results
            return SearchPropertiesOutput.create(
                searchResult.properties,
                searchResult.total,
                input.offset,
                input.limit,
                appliedFilters,
                availableFilters,
                statistics
            );

        } catch (error) {
            if (error instanceof EntityValidationError) {
                throw error;
            }

            // Handle repository errors
            if (error instanceof Error && error.message.includes('database')) {
                throw new Error(`Search failed: ${error.message}`);
            }

            // Re-throw unknown errors
            throw new Error(`Property search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Validates search input parameters
     */
    private validateSearchInput(input: SearchPropertiesInput): void {
        // Validate price range
        if (input.minPrice !== undefined && input.maxPrice !== undefined) {
            if (input.minPrice > input.maxPrice) {
                throw new EntityValidationError('Minimum price cannot be greater than maximum price');
            }
        }

        // Validate bedroom range
        if (input.minBedrooms !== undefined && input.maxBedrooms !== undefined) {
            if (input.minBedrooms > input.maxBedrooms) {
                throw new EntityValidationError('Minimum bedrooms cannot be greater than maximum bedrooms');
            }
        }

        // Validate bathroom range
        if (input.minBathrooms !== undefined && input.maxBathrooms !== undefined) {
            if (input.minBathrooms > input.maxBathrooms) {
                throw new EntityValidationError('Minimum bathrooms cannot be greater than maximum bathrooms');
            }
        }

        // Validate area range
        if (input.minArea !== undefined && input.maxArea !== undefined) {
            if (input.minArea > input.maxArea) {
                throw new EntityValidationError('Minimum area cannot be greater than maximum area');
            }
        }

        // Validate year range
        if (input.yearBuiltMin !== undefined && input.yearBuiltMax !== undefined) {
            if (input.yearBuiltMin > input.yearBuiltMax) {
                throw new EntityValidationError('Minimum year built cannot be greater than maximum year built');
            }
        }

        // Validate coordinates
        if (input.coordinates) {
            const { latitude, longitude, radiusKm } = input.coordinates;

            if (latitude < -90 || latitude > 90) {
                throw new EntityValidationError('Latitude must be between -90 and 90');
            }

            if (longitude < -180 || longitude > 180) {
                throw new EntityValidationError('Longitude must be between -180 and 180');
            }

            if (radiusKm <= 0 || radiusKm > 1000) {
                throw new EntityValidationError('Radius must be between 0.1 and 1000 kilometers');
            }
        }

        // Validate pagination
        if (input.limit > 100) {
            throw new EntityValidationError('Limit cannot exceed 100 properties per page');
        }

        if (input.offset < 0) {
            throw new EntityValidationError('Offset cannot be negative');
        }
    }

    /**
     * Applies in-memory filters to properties (used for coordinate-based search)
     */
    private applyInMemoryFilters(properties: Property[], input: SearchPropertiesInput): Property[] {
        return properties.filter(property => {
            // Apply domain-level filtering using the property's built-in method
            const criteria = {
                minPrice: input.minPrice,
                maxPrice: input.maxPrice,
                minBedrooms: input.minBedrooms,
                maxBedrooms: input.maxBedrooms,
                minBathrooms: input.minBathrooms,
                maxBathrooms: input.maxBathrooms,
                minArea: input.minArea,
                maxArea: input.maxArea,
                propertyTypes: input.propertyTypes,
                amenities: input.amenities,
                location: input.location,
            };

            return property.matchesSearchCriteria(criteria);
        });
    }

    /**
     * Applies text-based search to properties
     */
    private applyTextSearch(properties: Property[], query: string): Property[] {
        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);

        return properties.filter(property => {
            const searchableText = [
                property.getTitle().value,
                property.getDescription().value,
                property.getAddress().getFullAddress(),
                property.getType().value,
                ...property.getFeatures().amenities || [],
                ...property.getFeatures().features || [],
            ].join(' ').toLowerCase();

            return searchTerms.every(term => searchableText.includes(term));
        });
    }

    /**
     * Applies pagination to property array
     */
    private applyPagination(properties: Property[], offset: number, limit: number): Property[] {
        return properties.slice(offset, offset + limit);
    }

    /**
     * Gets available filter options based on current search
     */
    private async getAvailableFilters(input: SearchPropertiesInput): Promise<any> {
        try {
            // Get all properties to analyze available filters
            // In a real implementation, this might be optimized with specific queries
            const allProperties = await this.propertyRepository.search({
                limit: 1000, // Get a large sample
                offset: 0,
            });

            const propertyTypes = new Set<string>();
            const cities = new Set<string>();
            const states = new Set<string>();
            const amenities = new Set<string>();
            let minPrice = Infinity;
            let maxPrice = 0;
            let minArea = Infinity;
            let maxArea = 0;

            allProperties.properties.forEach(property => {
                propertyTypes.add(property.getType().value);
                cities.add(property.getAddress().city);
                states.add(property.getAddress().state);

                const features = property.getFeatures();
                if (features.amenities) {
                    features.amenities.forEach(amenity => amenities.add(amenity));
                }

                const price = property.getPrice().amount;
                minPrice = Math.min(minPrice, price);
                maxPrice = Math.max(maxPrice, price);

                minArea = Math.min(minArea, features.area);
                maxArea = Math.max(maxArea, features.area);
            });

            return {
                propertyTypes: Array.from(propertyTypes).sort(),
                cities: Array.from(cities).sort(),
                states: Array.from(states).sort(),
                amenities: Array.from(amenities).sort(),
                priceRanges: {
                    min: minPrice === Infinity ? 0 : minPrice,
                    max: maxPrice,
                },
                areaRanges: {
                    min: minArea === Infinity ? 0 : minArea,
                    max: maxArea,
                },
            };
        } catch (error) {
            console.error('Failed to get available filters:', error);
            return {
                propertyTypes: [],
                cities: [],
                states: [],
                amenities: [],
                priceRanges: { min: 0, max: 0 },
                areaRanges: { min: 0, max: 0 },
            };
        }
    }

    /**
     * Calculates search result statistics
     */
    private async getSearchStatistics(properties: Property[]): Promise<any> {
        if (properties.length === 0) {
            return {
                averagePrice: 0,
                medianPrice: 0,
                averagePricePerSqm: 0,
                totalListings: 0,
                byType: {},
                byStatus: {},
            };
        }

        const prices = properties.map(p => p.getPrice().amount).sort((a, b) => a - b);
        const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        const medianPrice = prices[Math.floor(prices.length / 2)];

        const pricePerSqm = properties.map(p => p.getPricePerSquareMeter()).filter(p => p > 0);
        const averagePricePerSqm = pricePerSqm.length > 0
            ? pricePerSqm.reduce((sum, price) => sum + price, 0) / pricePerSqm.length
            : 0;

        const byType: Record<string, number> = {};
        const byStatus: Record<string, number> = {};

        properties.forEach(property => {
            const type = property.getType().value;
            const status = property.getStatus().value;

            byType[type] = (byType[type] || 0) + 1;
            byStatus[status] = (byStatus[status] || 0) + 1;
        });

        return {
            averagePrice: Math.round(averagePrice),
            medianPrice: Math.round(medianPrice),
            averagePricePerSqm: Math.round(averagePricePerSqm),
            totalListings: properties.length,
            byType,
            byStatus,
        };
    }

    /**
     * Builds list of applied filters for display
     */
    private buildAppliedFiltersList(input: SearchPropertiesInput): string[] {
        const applied: string[] = [];

        if (input.minPrice !== undefined || input.maxPrice !== undefined) {
            const min = input.minPrice ? `$${input.minPrice.toLocaleString()}` : 'Any';
            const max = input.maxPrice ? `$${input.maxPrice.toLocaleString()}` : 'Any';
            applied.push(`Price: ${min} - ${max}`);
        }

        if (input.minBedrooms !== undefined || input.maxBedrooms !== undefined) {
            const min = input.minBedrooms ?? 'Any';
            const max = input.maxBedrooms ?? 'Any';
            applied.push(`Bedrooms: ${min} - ${max}`);
        }

        if (input.minBathrooms !== undefined || input.maxBathrooms !== undefined) {
            const min = input.minBathrooms ?? 'Any';
            const max = input.maxBathrooms ?? 'Any';
            applied.push(`Bathrooms: ${min} - ${max}`);
        }

        if (input.propertyTypes && input.propertyTypes.length > 0) {
            applied.push(`Types: ${input.propertyTypes.join(', ')}`);
        }

        if (input.location) {
            applied.push(`Location: ${input.location}`);
        }

        if (input.amenities && input.amenities.length > 0) {
            applied.push(`Amenities: ${input.amenities.join(', ')}`);
        }

        if (input.featured !== undefined) {
            applied.push(`Featured: ${input.featured ? 'Yes' : 'No'}`);
        }

        if (input.coordinates) {
            applied.push(`Near: ${input.coordinates.latitude}, ${input.coordinates.longitude} (${input.coordinates.radiusKm}km)`);
        }

        if (input.query) {
            applied.push(`Search: "${input.query}"`);
        }

        return applied;
    }
}