import { z } from 'zod';
import {
    PaginationSchema,
    SortSchema,
    SearchQuerySchema,
    OptionalTagsSchema,
    BooleanFlagSchema
} from '@/domain/shared/schemas';

// Land Type Schema
const LandTypeSchema = z.enum(['residential', 'commercial', 'agricultural', 'industrial', 'recreational', 'mixed-use']);

const SearchLandsInputSchema = z.object({
    query: SearchQuerySchema,
    location: z.string().max(200, 'Location cannot exceed 200 characters').optional(),
    landTypes: z.array(LandTypeSchema).optional(),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    minArea: z.number().min(0).optional(),
    maxArea: z.number().min(0).optional(),
    features: OptionalTagsSchema,
    status: z.enum(['draft', 'published', 'sold', 'archived']).optional(),
    coordinates: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        radiusKm: z.number().min(0.1).max(1000),
    }).optional(),
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
    sortBy: z.enum(['price', 'area', 'createdAt', 'updatedAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type SearchLandsInputData = z.infer<typeof SearchLandsInputSchema>;

/**
 * Input DTO for searching lands with various filters
 */
export class SearchLandsInput {
    private constructor(
        public readonly query?: string,
        public readonly location?: string,
        public readonly landTypes?: string[],
        public readonly minPrice?: number,
        public readonly maxPrice?: number,
        public readonly minArea?: number,
        public readonly maxArea?: number,
        public readonly features?: string[],
        public readonly status?: string,
        public readonly coordinates?: {
            latitude: number;
            longitude: number;
            radiusKm: number;
        },
        public readonly limit: number = 20,
        public readonly offset: number = 0,
        public readonly sortBy: string = 'createdAt',
        public readonly sortOrder: string = 'desc'
    ) { }

    /**
     * Creates and validates SearchLandsInput from raw data
     */
    static create(data: SearchLandsInputData): SearchLandsInput {
        const validated = SearchLandsInputSchema.parse(data);

        return new SearchLandsInput(
            validated.query,
            validated.location,
            validated.landTypes,
            validated.minPrice,
            validated.maxPrice,
            validated.minArea,
            validated.maxArea,
            validated.features,
            validated.status,
            validated.coordinates,
            validated.limit,
            validated.offset,
            validated.sortBy,
            validated.sortOrder
        );
    }
    /**
        * Converts to repository search criteria
        */
    toRepositoryCriteria(): any {
        return {
            location: this.location,
            landType: this.landTypes?.[0], // Repository expects single type
            minPrice: this.minPrice,
            maxPrice: this.maxPrice,
            minArea: this.minArea,
            maxArea: this.maxArea,
            status: this.status,
            features: this.features,
            limit: this.limit,
            offset: this.offset,
            sortBy: this.sortBy,
            sortOrder: this.sortOrder,
        };
    }

    /**
     * Validates the input data
     */
    static validate(data: any): SearchLandsInputData {
        return SearchLandsInputSchema.parse(data);
    }
}