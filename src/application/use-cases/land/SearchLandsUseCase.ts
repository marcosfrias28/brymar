import { Land } from '@/domain/land/entities/Land';
import { ILandRepository } from '@/domain/land/repositories/ILandRepository';
import { LandDomainService } from '@/domain/land/services/LandDomainService';
import { SearchLandsInput } from '../../dto/land/SearchLandsInput';
import { SearchLandsOutput, AvailableFilters, SearchStatistics } from '../../dto/land/SearchLandsOutput';
import { EntityValidationError } from '@/domain/shared/errors/DomainError';

/**
 * Use case for searching lands with various filters
 */
export class SearchLandsUseCase {
    constructor(
        private readonly landRepository: ILandRepository
    ) { }

    /**
     * Executes the land search use case
     */
    async execute(input: SearchLandsInput): Promise<SearchLandsOutput> {
        try {
            // 1. Validate search input
            this.validateSearchInput(input);

            // 2. Build search criteria for repository
            const searchCriteria = input.toRepositoryCriteria();

            // 3. Execute search
            const searchResult = await this.landRepository.search(
                searchCriteria,
                Math.floor(input.offset / input.limit) + 1, // Convert offset to page
                input.limit,
                input.sortBy
            );

            // 4. Apply text-based query filter if provided
            if (input.query && input.query.trim().length > 0) {
                searchResult.lands = this.applyTextSearch(searchResult.lands, input.query);
                searchResult.total = searchResult.lands.length;
            }

            // 5. Get additional filter data and statistics
            const [availableFilters, statistics] = await Promise.all([
                this.getAvailableFilters(input),
                this.getSearchStatistics(searchResult.lands)
            ]);

            // 6. Build applied filters list
            const appliedFilters = this.buildAppliedFiltersList(input);

            // 7. Return search results
            return SearchLandsOutput.create(
                searchResult.lands,
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
            throw new Error(`Land search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
        * Validates search input parameters
        */
    private validateSearchInput(input: SearchLandsInput): void {
        // Validate price range
        if (input.minPrice !== undefined && input.maxPrice !== undefined) {
            if (input.minPrice > input.maxPrice) {
                throw new EntityValidationError('Minimum price cannot be greater than maximum price');
            }
        }

        // Validate area range
        if (input.minArea !== undefined && input.maxArea !== undefined) {
            if (input.minArea > input.maxArea) {
                throw new EntityValidationError('Minimum area cannot be greater than maximum area');
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
            throw new EntityValidationError('Limit cannot exceed 100 lands per page');
        }

        if (input.offset < 0) {
            throw new EntityValidationError('Offset cannot be negative');
        }
    }

    /**
     * Applies text-based search to lands
     */
    private applyTextSearch(lands: Land[], query: string): Land[] {
        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);

        return lands.filter(land => {
            const searchableText = [
                land.getTitle().value,
                land.getDescription().value,
                land.getLocation().address,
                land.getType().value,
                ...land.getFeatures().features,
            ].join(' ').toLowerCase();

            return searchTerms.every(term => searchableText.includes(term));
        });
    }

    /**
     * Gets available filter options based on current search
     */
    private async getAvailableFilters(input: SearchLandsInput): Promise<AvailableFilters> {
        try {
            // Get all lands to analyze available filters
            const allLands = await this.landRepository.search({}, 1, 1000);

            const landTypes = new Set<string>();
            const locations = new Set<string>();
            const features = new Set<string>();
            let minPrice = Infinity;
            let maxPrice = 0;
            let minArea = Infinity;
            let maxArea = 0;

            allLands.lands.forEach(land => {
                landTypes.add(land.getType().value);
                locations.add(land.getLocation().address);

                const landFeatures = land.getFeatures().features;
                landFeatures.forEach((feature: string) => features.add(feature));

                const price = land.getPrice().amount;
                minPrice = Math.min(minPrice, price);
                maxPrice = Math.max(maxPrice, price);

                const area = land.getArea().getValue();
                minArea = Math.min(minArea, area);
                maxArea = Math.max(maxArea, area);
            });

            return {
                landTypes: Array.from(landTypes).sort(),
                locations: Array.from(locations).sort(),
                features: Array.from(features).sort(),
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
                landTypes: [],
                locations: [],
                features: [],
                priceRanges: { min: 0, max: 0 },
                areaRanges: { min: 0, max: 0 },
            };
        }
    }

    /**
     * Calculates search result statistics
     */
    private async getSearchStatistics(lands: Land[]): Promise<SearchStatistics> {
        if (lands.length === 0) {
            return {
                averagePrice: 0,
                medianPrice: 0,
                averagePricePerSqm: 0,
                totalListings: 0,
                byType: {},
                byStatus: {},
            };
        }

        const prices = lands.map(l => l.getPrice().amount).sort((a, b) => a - b);
        const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        const medianPrice = prices[Math.floor(prices.length / 2)];

        const pricePerSqm = lands.map(l => l.getPricePerSquareMeter()).filter(p => p > 0);
        const averagePricePerSqm = pricePerSqm.length > 0
            ? pricePerSqm.reduce((sum, price) => sum + price, 0) / pricePerSqm.length
            : 0;

        const byType: Record<string, number> = {};
        const byStatus: Record<string, number> = {};

        lands.forEach(land => {
            const type = land.getType().value;
            const status = land.getStatus().value;

            byType[type] = (byType[type] || 0) + 1;
            byStatus[status] = (byStatus[status] || 0) + 1;
        });

        return {
            averagePrice: Math.round(averagePrice),
            medianPrice: Math.round(medianPrice),
            averagePricePerSqm: Math.round(averagePricePerSqm),
            totalListings: lands.length,
            byType,
            byStatus,
        };
    }

    /**
     * Builds list of applied filters for display
     */
    private buildAppliedFiltersList(input: SearchLandsInput): string[] {
        const applied: string[] = [];

        if (input.minPrice !== undefined || input.maxPrice !== undefined) {
            const min = input.minPrice ? `${input.minPrice.toLocaleString()}` : 'Any';
            const max = input.maxPrice ? `${input.maxPrice.toLocaleString()}` : 'Any';
            applied.push(`Price: ${min} - ${max}`);
        }

        if (input.minArea !== undefined || input.maxArea !== undefined) {
            const min = input.minArea ? `${input.minArea.toLocaleString()}` : 'Any';
            const max = input.maxArea ? `${input.maxArea.toLocaleString()}` : 'Any';
            applied.push(`Area: ${min} - ${max} sqm`);
        }

        if (input.landTypes && input.landTypes.length > 0) {
            applied.push(`Types: ${input.landTypes.join(', ')}`);
        }

        if (input.location) {
            applied.push(`Location: ${input.location}`);
        }

        if (input.features && input.features.length > 0) {
            applied.push(`Features: ${input.features.join(', ')}`);
        }

        if (input.status) {
            applied.push(`Status: ${input.status}`);
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