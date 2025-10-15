import { z } from 'zod';

/**
 * Utility validation schemas for common data types and patterns
 */

// Boolean flag schema
export const BooleanFlagSchema = z.boolean().default(false);

// Image input schema
export const ImageInputSchema = z.object({
    file: z.any(), // File or Buffer
    filename: z.string().min(1),
    mimeType: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/),
});

// Optional tags schema
export const OptionalTagsSchema = z.array(z.string().min(1).max(50))
    .max(20, 'Cannot have more than 20 tags')
    .optional();

// Tags schema (required)
export const TagsSchema = z.array(z.string().min(1).max(50))
    .max(20, 'Cannot have more than 20 tags');

// ID schema
export const IdSchema = z.string().min(1, 'ID is required');

// Optional year schema
export const OptionalYearSchema = z.number()
    .min(1800)
    .max(new Date().getFullYear() + 5)
    .optional();

// Year schema (required)
export const YearSchema = z.number()
    .min(1800)
    .max(new Date().getFullYear() + 5);

// URL schema
export const UrlSchema = z.string().url('Invalid URL format');

// Optional URL schema
export const OptionalUrlSchema = z.string().url('Invalid URL format').optional();

// File upload schema
export const FileUploadSchema = z.object({
    file: z.any(),
    filename: z.string().min(1),
    mimeType: z.string(),
    size: z.number().min(0).max(10 * 1024 * 1024), // 10MB max
});

// Percentage schema
export const PercentageSchema = z.number().min(0).max(100);

// Rating schema (1-5 stars)
export const RatingSchema = z.number().min(1).max(5);

// Optional rating schema
export const OptionalRatingSchema = z.number().min(1).max(5).optional();

// Status schema (generic)
export const StatusSchema = z.enum(['active', 'inactive', 'pending', 'archived']);

// Priority schema
export const PrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

// Visibility schema
export const VisibilitySchema = z.enum(['public', 'private', 'restricted']);

// Language schema
export const LanguageSchema = z.enum(['es', 'en']);

// Theme schema
export const ThemeSchema = z.enum(['light', 'dark', 'system']);

// Notification type schema
export const NotificationTypeSchema = z.enum(['email', 'push', 'sms', 'in-app']);