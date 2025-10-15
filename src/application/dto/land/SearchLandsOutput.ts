import { Land } from '@/domain/land/entities/Land';

/**
 * Output DTO for land search results
 */
export class SearchLandsOutput {
    constructor(
        public readonly lands: LandSummary[],
        public readonly total: number,
        public readonly offset: number,
        public readonly limit: number,
        public readonly appliedFilters: string[],
        public readonly availableFilters: AvailableFilters,
        public readonly statistics: SearchStatistics
    ) { }

    /**
     * Creates SearchLandsOutput from search results
     */
    static create(
        lands: Land[],
        total: number,
        offset: number,
        limit: number,
        appliedFilters: string[],
        availableFilters: AvailableFilters,
        statistics: SearchStatistics
    ): SearchLandsOutput {
        const landSummaries = lands.map(land => LandSummary.from(land));

        return new SearchLandsOutput(
            landSummaries,
            total,
            offset,
            limit,
            appliedFilters,
            availableFilters,
            statistics
        );
    }

    /**
     * Converts to JSON representation
     */
    toJSON(): object {
        return {
            lands: this.lands.map(land => land.toJSON()),
            total: this.total,
            offset: this.offset,
            limit: this.limit,
            hasMore: this.offset + this.limit < this.total,
            appliedFilters: this.appliedFilters,
            availableFilters: this.availableFilters,
            statistics: this.statistics,
        };
    }
}

/**
 * Land summary for search results
 */
export class LandSummary {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly area: number,
        public readonly price: number,
        public readonly currency: string,
        public readonly location: string,
        public readonly type: string,
        public readonly status: string,
        public readonly features: string[],
        public readonly mainImage?: string,
        public readonly pricePerSquareMeter?: number
    ) { }

    static from(land: Land): LandSummary {
        const price = land.getPrice();
        const images = land.getImages().getUrls();

        return new LandSummary(
            land.getLandId().value,
            land.getTitle().value,
            land.getArea().getValue(),
            price.amount,
            price.currency.code,
            land.getLocation().address,
            land.getType().value,
            land.getStatus().value,
            land.getFeatures().features,
            images.length > 0 ? images[0] : undefined,
            land.getPricePerSquareMeter()
        );
    }

    /**
     * Frontend compatibility methods
     */
    getId(): { value: string } {
        return { value: this.id };
    }

    getTitle(): { value: string } {
        return { value: this.title };
    }

    getPrice(): { value: number; currency: string } {
        return { value: this.price, currency: this.currency };
    }

    getStatus(): { value: string } {
        return { value: this.status };
    }

    getType(): { value: string } {
        return { value: this.type };
    }

    getArea(): { value: number } {
        return { value: this.area };
    }

    getLocation(): { value: string } {
        return { value: this.location };
    }

    toJSON(): object {
        return {
            id: this.id,
            title: this.title,
            area: this.area,
            price: this.price,
            currency: this.currency,
            location: this.location,
            type: this.type,
            status: this.status,
            features: this.features,
            mainImage: this.mainImage,
            pricePerSquareMeter: this.pricePerSquareMeter,
        };
    }
}

export interface AvailableFilters {
    landTypes: string[];
    locations: string[];
    features: string[];
    priceRanges: {
        min: number;
        max: number;
    };
    areaRanges: {
        min: number;
        max: number;
    };
}

export interface SearchStatistics {
    averagePrice: number;
    medianPrice: number;
    averagePricePerSqm: number;
    totalListings: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
}