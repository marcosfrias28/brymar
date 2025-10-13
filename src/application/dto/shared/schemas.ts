import { z } from 'zod';

/**
 * Shared Zod schemas for reuse across DTOs
 */

// Address Schema
export const AddressSchema = z.object({
    street: z.string().min(1, 'Street is required').max(200, 'Street cannot exceed 200 characters'),
    city: z.string().min(1, 'City is required').max(100, 'City cannot exceed 100 characters'),
    state: z.string().min(1, 'State is required').max(100, 'State cannot exceed 100 characters'),
    country: z.string().min(1, 'Country is required').max(100, 'Country cannot exceed 100 characters'),
    postalCode: z.string().max(20, 'Postal code cannot exceed 20 characters').optional(),
    coordinates: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
    }).optional(),
});

// Property Features Schema
export const PropertyFeaturesSchema = z.object({
    bedrooms: z.number().min(0).max(20),
    bathrooms: z.number().min(0).max(20),
    area: z.number().min(1, 'Area must be at least 1 square meter').max(100000, 'Area cannot exceed 100,000 square meters'),
    amenities: z.array(z.string()).optional(),
    features: z.array(z.string()).optional(),
    parking: z.object({
        spaces: z.number().min(0).max(50),
        type: z.enum(['garage', 'carport', 'street', 'covered']),
    }).optional(),
    yearBuilt: z.number().min(1800).max(new Date().getFullYear() + 5).optional(),
    lotSize: z.number().min(0).optional(),
});

// Image Input Schema
export const ImageInputSchema = z.object({
    file: z.any(), // File or Buffer
    filename: z.string().min(1),
    mimeType: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/),
});

// Property Type Schema
export const PropertyTypeSchema = z.enum(['house', 'apartment', 'condo', 'townhouse', 'villa', 'land', 'commercial', 'office']);

// Property Status Schema
export const PropertyStatusSchema = z.enum(['draft', 'published', 'sold', 'rented', 'withdrawn', 'archived']);

// Currency Schema
export const CurrencySchema = z.string().length(3, 'Currency must be 3 characters').default('USD');

// Price Schema
export const PriceSchema = z.object({
    amount: z.number().min(0, 'Price cannot be negative').max(100000000, 'Price cannot exceed $100,000,000'),
    currency: CurrencySchema,
});

// Simple Price Schema (just amount)
export const SimplePriceSchema = z.number().min(1000, 'Price must be at least $1,000').max(100000000, 'Price cannot exceed $100,000,000');

// Pagination Schema
export const PaginationSchema = z.object({
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
});

// Sort Schema
export const SortSchema = z.object({
    sortBy: z.enum(['price', 'area', 'bedrooms', 'bathrooms', 'createdAt', 'updatedAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ID Schema
export const IdSchema = z.string().min(1, 'ID is required');

// User Role Schema
export const UserRoleSchema = z.enum(['admin', 'agent', 'user']).default('user');

// User Preferences Schema
export const UserPreferencesSchema = z.object({
    notifications: z.object({
        email: z.boolean().default(true),
        push: z.boolean().default(true),
        marketing: z.boolean().default(false),
    }).optional(),
    privacy: z.object({
        profileVisible: z.boolean().default(true),
        showEmail: z.boolean().default(false),
        showPhone: z.boolean().default(false),
    }).optional(),
    display: z.object({
        theme: z.enum(['light', 'dark', 'system']).default('light'),
        language: z.enum(['es', 'en']).default('es'),
        currency: z.enum(['USD', 'EUR', 'COP']).default('USD'),
    }).optional(),
});

// Contact Information Schema
export const ContactInfoSchema = z.object({
    email: z.string().email('Invalid email format').optional(),
    phone: z.string().max(20, 'Phone cannot exceed 20 characters').optional(),
    website: z.string().url('Invalid website URL').optional(),
});

// Date Range Schema
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

// Search Query Schema
export const SearchQuerySchema = z.string().max(200, 'Search query cannot exceed 200 characters').optional();

// Boolean Flag Schema
export const BooleanFlagSchema = z.boolean().default(false);

// Text Field Schemas
export const ShortTextSchema = z.string().min(1).max(100);
export const MediumTextSchema = z.string().min(1).max(500);
export const LongTextSchema = z.string().min(1).max(2000);

// Optional Text Field Schemas
export const OptionalShortTextSchema = z.string().max(100).optional();
export const OptionalMediumTextSchema = z.string().max(500).optional();
export const OptionalLongTextSchema = z.string().max(2000).optional();

// Coordinate Schema
export const CoordinateSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
});

// Location Search Schema
export const LocationSearchSchema = z.object({
    coordinates: CoordinateSchema,
    radiusKm: z.number().min(0.1).max(1000),
});

// File Upload Schema
export const FileUploadSchema = z.object({
    file: z.any(),
    filename: z.string().min(1),
    mimeType: z.string(),
    size: z.number().min(0).max(10 * 1024 * 1024), // 10MB max
});

// URL Schema
export const UrlSchema = z.string().url('Invalid URL format');

// Optional URL Schema
export const OptionalUrlSchema = z.string().url('Invalid URL format').optional();

// Email Schema
export const EmailSchema = z.string().email('Invalid email format');

// Phone Schema
export const PhoneSchema = z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format');

// Optional Phone Schema
export const OptionalPhoneSchema = z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format').optional();

// Year Schema
export const YearSchema = z.number().min(1800).max(new Date().getFullYear() + 5);

// Optional Year Schema
export const OptionalYearSchema = z.number().min(1800).max(new Date().getFullYear() + 5).optional();

// Percentage Schema
export const PercentageSchema = z.number().min(0).max(100);

// Rating Schema (1-5 stars)
export const RatingSchema = z.number().min(1).max(5);

// Optional Rating Schema
export const OptionalRatingSchema = z.number().min(1).max(5).optional();

// Tags Schema
export const TagsSchema = z.array(z.string().min(1).max(50)).max(20, 'Cannot have more than 20 tags');

// Optional Tags Schema
export const OptionalTagsSchema = z.array(z.string().min(1).max(50)).max(20, 'Cannot have more than 20 tags').optional();

// Status Schema (generic)
export const StatusSchema = z.enum(['active', 'inactive', 'pending', 'archived']);

// Priority Schema
export const PrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

// Visibility Schema
export const VisibilitySchema = z.enum(['public', 'private', 'restricted']);

// Language Schema
export const LanguageSchema = z.enum(['es', 'en']);

// Theme Schema
export const ThemeSchema = z.enum(['light', 'dark', 'system']);

// Notification Type Schema
export const NotificationTypeSchema = z.enum(['email', 'push', 'sms', 'in-app']);

// Export type definitions for TypeScript
export type AddressInput = z.infer<typeof AddressSchema>;
export type PropertyFeaturesInput = z.infer<typeof PropertyFeaturesSchema>;
export type ImageInput = z.infer<typeof ImageInputSchema>;
export type PropertyType = z.infer<typeof PropertyTypeSchema>;
export type PropertyStatus = z.infer<typeof PropertyStatusSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
export type SortInput = z.infer<typeof SortSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type ContactInfo = z.infer<typeof ContactInfoSchema>;
export type DateRange = z.infer<typeof DateRangeSchema>;
export type CoordinateInput = z.infer<typeof CoordinateSchema>;
export type LocationSearch = z.infer<typeof LocationSearchSchema>;
export type FileUpload = z.infer<typeof FileUploadSchema>;