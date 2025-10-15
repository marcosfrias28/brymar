/**
 * Shared domain schemas - Barrel exports for all validation schemas
 * 
 * This file provides a centralized export point for all shared validation schemas
 * used across the domain layer. These schemas ensure consistent validation
 * and type safety throughout the application.
 */

// Text validation schemas
export {
    ShortTextSchema,
    LongTextSchema,
    OptionalShortTextSchema,
    OptionalLongTextSchema,
    MediumTextSchema,
    OptionalMediumTextSchema
} from './text-schemas';

// Price validation schemas
export {
    SimplePriceSchema,
    PriceSchema,
    CurrencySchema,
    OptionalPriceSchema
} from './price-schemas';

// Property-specific schemas
export {
    PropertyTypeSchema,
    PropertyStatusSchema,
    PropertyFeaturesSchema,
    AddressSchema,
    ParkingTypeSchema,
    PropertyConditionSchema,
    PropertyListingTypeSchema,
    PropertyPrioritySchema
} from './property-schemas';

// User-specific schemas
export {
    UserRoleSchema,
    UserPreferencesSchema,
    EmailSchema,
    PhoneSchema,
    OptionalPhoneSchema,
    ContactInfoSchema,
    UserStatusSchema,
    ProfileVisibilitySchema,
    NotificationPreferencesSchema,
    PrivacyPreferencesSchema
} from './user-schemas';

// Search and pagination schemas
export {
    SearchQuerySchema,
    PaginationSchema,
    SortSchema,
    LocationSearchSchema,
    DateRangeSchema
} from './search-schemas';

// Utility schemas
export {
    BooleanFlagSchema,
    ImageInputSchema,
    OptionalTagsSchema,
    TagsSchema,
    IdSchema,
    OptionalYearSchema,
    YearSchema,
    UrlSchema,
    OptionalUrlSchema,
    FileUploadSchema,
    PercentageSchema,
    RatingSchema,
    OptionalRatingSchema,
    StatusSchema,
    PrioritySchema,
    VisibilitySchema,
    LanguageSchema,
    ThemeSchema,
    NotificationTypeSchema
} from './utility-schemas';

// Legacy schemas for backward compatibility (will be deprecated)
import { z } from 'zod';

export const PasswordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number');

export const ImageSchema = z.object({
    url: z.string().url('Invalid image URL'),
    alt: z.string().optional(),
    caption: z.string().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional()
});

export const MediaSchema = z.object({
    type: z.enum(['image', 'video', 'document']),
    url: z.string().url('Invalid media URL'),
    filename: z.string().min(1, 'Filename is required'),
    size: z.number().positive('File size must be positive'),
    mimeType: z.string().min(1, 'MIME type is required')
});