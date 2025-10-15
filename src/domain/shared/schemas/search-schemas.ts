import { z } from 'zod';

/**
 * Search and pagination validation schemas for consistent search functionality
 */

// Search query schema
export const SearchQuerySchema = z.string()
    .max(200, 'Search query cannot exceed 200 characters')
    .optional();

// Pagination schema
export const PaginationSchema = z.object({
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
});

// Sort schema
export const SortSchema = z.object({
    sortBy: z.enum([
        'price',
        'area',
        'bedrooms',
        'bathrooms',
        'createdAt',
        'updatedAt'
    ]).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Location search schema
export const LocationSearchSchema = z.object({
    coordinates: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
    }),
    radiusKm: z.number().min(0.1).max(1000),
});

// Date range schema
export const DateRangeSchema = z.object({
    startDate: z.date().optional(),
    endDate: z.date().optional(),
}).refine(
    (data) => !data.startDate || !data.endDate || data.startDate <= data.endDate,
    {
        message: "Start date must be before or equal to end date",
        path: ["endDate"],
    }
);