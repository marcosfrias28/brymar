import { z } from 'zod';
import {
    PropertyTypeSchema,
    PropertyStatusSchema,
    LocationSearchSchema,
    PaginationSchema,
    SortSchema,
    SearchQuerySchema,
    OptionalShortTextSchema,
    OptionalYearSchema
} from '@/domain/shared/schemas';

const SearchPropertiesInputSchema = z.object({
    // Price filters
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),

    // Property features filters
    minBedrooms: z.number().min(0).max(20).optional(),
    maxBedrooms: z.number().min(0).max(20).optional(),
    minBathrooms: z.number().min(0).max(20).optional(),
    maxBathrooms: z.number().min(0).max(20).optional(),
    minArea: z.number().min(0).optional(),
    maxArea: z.number().min(0).optional(),

    // Property type and status filters
    propertyTypes: z.array(PropertyTypeSchema).optional(),
    statuses: z.array(PropertyStatusSchema).optional(),

    // Location filters
    location: z.string().max(200).trim().optional(),
    city: OptionalShortTextSchema,
    state: OptionalShortTextSchema,
    country: OptionalShortTextSchema,

    // Coordinate-based search
    coordinates: LocationSearchSchema.optional(),

    // Feature filters
    amenities: z.array(z.string()).optional(),
    features: z.array(z.string()).optional(),

    // Other filters
    featured: z.boolean().optional(),
    yearBuiltMin: OptionalYearSchema,
    yearBuiltMax: OptionalYearSchema,

    // Search query
    query: SearchQuerySchema,
}).merge(PaginationSchema).merge(SortSchema);

export type SearchPropertiesInputData = z.infer<typeof SearchPropertiesInputSchema>;

/**
 * Input DTO for searching properties
 */
export class SearchPropertiesInput {
    private constructor(
        public readonly minPrice?: number,
        public readonly maxPrice?: number,
        public readonly minBedrooms?: number,
        public readonly maxBedrooms?: number,
        public readonly minBathrooms?: number,
        public readonly maxBathrooms?: number,
        public readonly minArea?: number,
        public readonly maxArea?: number,
        public readonly propertyTypes?: string[],
        public readonly statuses?: string[],
        public readonly location?: string,
        public readonly city?: string,
        public readonly state?: string,
        public readonly country?: string,
        public readonly coordinates?: {
            latitude: number;
            longitude: number;
            radiusKm: number;
        },
        public readonly amenities?: string[],
        public readonly features?: string[],
        public readonly featured?: boolean,
        public readonly yearBuiltMin?: number,
        public readonly yearBuiltMax?: number,
        public readonly limit: number = 20,
        public readonly offset: number = 0,
        public readonly sortBy: string = 'createdAt',
        public readonly sortOrder: string = 'desc',
        public readonly query?: string
    ) { }

    /**
     * Creates and validates SearchPropertiesInput from raw data
     */
    static create(data: SearchPropertiesInputData): SearchPropertiesInput {
        const validated = SearchPropertiesInputSchema.parse(data);

        return new SearchPropertiesInput(
            validated.minPrice,
            validated.maxPrice,
            validated.minBedrooms,
            validated.maxBedrooms,
            validated.minBathrooms,
            validated.maxBathrooms,
            validated.minArea,
            validated.maxArea,
            validated.propertyTypes,
            validated.statuses,
            validated.location,
            validated.city,
            validated.state,
            validated.country,
            validated.coordinates ? {
                latitude: validated.coordinates.coordinates.latitude,
                longitude: validated.coordinates.coordinates.longitude,
                radiusKm: validated.coordinates.radiusKm
            } : undefined,
            validated.amenities,
            validated.features,
            validated.featured,
            validated.yearBuiltMin,
            validated.yearBuiltMax,
            validated.limit,
            validated.offset,
            validated.sortBy,
            validated.sortOrder,
            validated.query
        );
    }

    /**
     * Creates SearchPropertiesInput from form data
     */
    static fromFormData(formData: FormData): SearchPropertiesInput {
        const data: Partial<SearchPropertiesInputData> = {};

        // Parse numeric filters
        if (formData.get('minPrice')) data.minPrice = parseFloat(formData.get('minPrice') as string);
        if (formData.get('maxPrice')) data.maxPrice = parseFloat(formData.get('maxPrice') as string);
        if (formData.get('minBedrooms')) data.minBedrooms = parseInt(formData.get('minBedrooms') as string);
        if (formData.get('maxBedrooms')) data.maxBedrooms = parseInt(formData.get('maxBedrooms') as string);
        if (formData.get('minBathrooms')) data.minBathrooms = parseInt(formData.get('minBathrooms') as string);
        if (formData.get('maxBathrooms')) data.maxBathrooms = parseInt(formData.get('maxBathrooms') as string);
        if (formData.get('minArea')) data.minArea = parseFloat(formData.get('minArea') as string);
        if (formData.get('maxArea')) data.maxArea = parseFloat(formData.get('maxArea') as string);

        // Handle single bedroom/bathroom parameters (from search page)
        if (formData.get('bedrooms')) {
            const bedrooms = parseInt(formData.get('bedrooms') as string);
            data.minBedrooms = bedrooms;
        }
        if (formData.get('bathrooms')) {
            const bathrooms = parseInt(formData.get('bathrooms') as string);
            data.minBathrooms = bathrooms;
        }

        // Parse string filters
        if (formData.get('location')) data.location = formData.get('location') as string;
        if (formData.get('city')) data.city = formData.get('city') as string;
        if (formData.get('state')) data.state = formData.get('state') as string;
        if (formData.get('country')) data.country = formData.get('country') as string;
        if (formData.get('query')) data.query = formData.get('query') as string;

        // Parse array filters
        if (formData.get('propertyTypes')) {
            data.propertyTypes = (formData.get('propertyTypes') as string).split(',').map(t => t.trim()).filter(t => t.length > 0) as any[];
        }
        // Handle single propertyType parameter (from search page)
        if (formData.get('propertyType')) {
            data.propertyTypes = [formData.get('propertyType') as any];
        }
        if (formData.get('statuses')) {
            data.statuses = (formData.get('statuses') as string).split(',').map(s => s.trim()).filter(s => s.length > 0) as any[];
        }
        if (formData.get('amenities')) {
            data.amenities = (formData.get('amenities') as string).split(',').map(a => a.trim()).filter(a => a.length > 0);
        }
        if (formData.get('features')) {
            data.features = (formData.get('features') as string).split(',').map(f => f.trim()).filter(f => f.length > 0);
        }

        // Parse boolean filters
        if (formData.get('featured')) data.featured = formData.get('featured') === 'true';

        // Parse year filters
        if (formData.get('yearBuiltMin')) data.yearBuiltMin = parseInt(formData.get('yearBuiltMin') as string);
        if (formData.get('yearBuiltMax')) data.yearBuiltMax = parseInt(formData.get('yearBuiltMax') as string);

        // Parse coordinates
        const lat = formData.get('lat') as string;
        const lng = formData.get('lng') as string;
        const radius = formData.get('radius') as string;
        if (lat && lng && radius) {
            data.coordinates = {
                coordinates: {
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lng),
                },
                radiusKm: parseFloat(radius),
            };
        }

        // Parse pagination and sorting
        if (formData.get('limit')) data.limit = parseInt(formData.get('limit') as string);
        if (formData.get('offset')) data.offset = parseInt(formData.get('offset') as string);
        if (formData.get('sortBy')) data.sortBy = formData.get('sortBy') as any;
        if (formData.get('sortOrder')) data.sortOrder = formData.get('sortOrder') as any;

        return SearchPropertiesInput.create(data as SearchPropertiesInputData);
    }

    /**
     * Creates SearchPropertiesInput from query parameters
     */
    static fromQueryParams(params: URLSearchParams): SearchPropertiesInput {
        const data: Partial<SearchPropertiesInputData> = {};

        // Parse numeric filters
        if (params.get('minPrice')) data.minPrice = parseFloat(params.get('minPrice')!);
        if (params.get('maxPrice')) data.maxPrice = parseFloat(params.get('maxPrice')!);
        if (params.get('minBedrooms')) data.minBedrooms = parseInt(params.get('minBedrooms')!);
        if (params.get('maxBedrooms')) data.maxBedrooms = parseInt(params.get('maxBedrooms')!);
        if (params.get('minBathrooms')) data.minBathrooms = parseInt(params.get('minBathrooms')!);
        if (params.get('maxBathrooms')) data.maxBathrooms = parseInt(params.get('maxBathrooms')!);
        if (params.get('minArea')) data.minArea = parseFloat(params.get('minArea')!);
        if (params.get('maxArea')) data.maxArea = parseFloat(params.get('maxArea')!);

        // Parse string filters
        if (params.get('location')) data.location = params.get('location')!;
        if (params.get('city')) data.city = params.get('city')!;
        if (params.get('state')) data.state = params.get('state')!;
        if (params.get('country')) data.country = params.get('country')!;
        if (params.get('query')) data.query = params.get('query')!;

        // Parse array filters
        if (params.get('propertyTypes')) {
            data.propertyTypes = params.get('propertyTypes')!.split(',').map(t => t.trim()).filter(t => t.length > 0) as any[];
        }
        if (params.get('statuses')) {
            data.statuses = params.get('statuses')!.split(',').map(s => s.trim()).filter(s => s.length > 0) as any[];
        }
        if (params.get('amenities')) {
            data.amenities = params.get('amenities')!.split(',').map(a => a.trim()).filter(a => a.length > 0);
        }
        if (params.get('features')) {
            data.features = params.get('features')!.split(',').map(f => f.trim()).filter(f => f.length > 0);
        }

        // Parse boolean filters
        if (params.get('featured')) data.featured = params.get('featured') === 'true';

        // Parse year filters
        if (params.get('yearBuiltMin')) data.yearBuiltMin = parseInt(params.get('yearBuiltMin')!);
        if (params.get('yearBuiltMax')) data.yearBuiltMax = parseInt(params.get('yearBuiltMax')!);

        // Parse coordinates
        const lat = params.get('lat');
        const lng = params.get('lng');
        const radius = params.get('radius');
        if (lat && lng && radius) {
            data.coordinates = {
                coordinates: {
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lng),
                },
                radiusKm: parseFloat(radius),
            };
        }

        // Parse pagination and sorting
        if (params.get('limit')) data.limit = parseInt(params.get('limit')!);
        if (params.get('offset')) data.offset = parseInt(params.get('offset')!);
        if (params.get('sortBy')) data.sortBy = params.get('sortBy')! as any;
        if (params.get('sortOrder')) data.sortOrder = params.get('sortOrder')! as any;

        return SearchPropertiesInput.create(data as SearchPropertiesInputData);
    }

    /**
     * Validates the input data
     */
    static validate(data: any): SearchPropertiesInputData {
        return SearchPropertiesInputSchema.parse(data);
    }

    /**
     * Converts to repository search criteria
     */
    toRepositoryCriteria() {
        return {
            minPrice: this.minPrice,
            maxPrice: this.maxPrice,
            minBedrooms: this.minBedrooms,
            maxBedrooms: this.maxBedrooms,
            minBathrooms: this.minBathrooms,
            maxBathrooms: this.maxBathrooms,
            minArea: this.minArea,
            maxArea: this.maxArea,
            propertyTypes: this.propertyTypes,
            statuses: this.statuses,
            location: this.location,
            amenities: this.amenities,
            featured: this.featured,
            limit: this.limit,
            offset: this.offset,
            sortBy: this.sortBy as 'price' | 'area' | 'bedrooms' | 'bathrooms' | 'createdAt' | 'updatedAt',
            sortOrder: this.sortOrder as 'asc' | 'desc',
        };
    }

    /**
     * Checks if this is an empty search (no filters applied)
     */
    isEmpty(): boolean {
        return !(
            this.minPrice !== undefined ||
            this.maxPrice !== undefined ||
            this.minBedrooms !== undefined ||
            this.maxBedrooms !== undefined ||
            this.minBathrooms !== undefined ||
            this.maxBathrooms !== undefined ||
            this.minArea !== undefined ||
            this.maxArea !== undefined ||
            this.propertyTypes?.length ||
            this.statuses?.length ||
            this.location ||
            this.city ||
            this.state ||
            this.country ||
            this.coordinates ||
            this.amenities?.length ||
            this.features?.length ||
            this.featured !== undefined ||
            this.yearBuiltMin !== undefined ||
            this.yearBuiltMax !== undefined ||
            this.query
        );
    }
}