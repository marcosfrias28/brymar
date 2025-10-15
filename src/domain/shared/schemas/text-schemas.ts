import { z } from 'zod';

/**
 * Text validation schemas for consistent text field validation across the domain
 */

// Short text schema - for titles, names, labels
export const ShortTextSchema = z.string()
    .min(1, 'This field is required')
    .max(100, 'Text cannot exceed 100 characters')
    .trim();

// Long text schema - for descriptions, content
export const LongTextSchema = z.string()
    .min(1, 'This field is required')
    .max(2000, 'Text cannot exceed 2000 characters')
    .trim();

// Optional short text schema
export const OptionalShortTextSchema = z.string()
    .max(100, 'Text cannot exceed 100 characters')
    .trim()
    .optional();

// Optional long text schema
export const OptionalLongTextSchema = z.string()
    .max(2000, 'Text cannot exceed 2000 characters')
    .trim()
    .optional();

// Medium text schema - for intermediate length content
export const MediumTextSchema = z.string()
    .min(1, 'This field is required')
    .max(500, 'Text cannot exceed 500 characters')
    .trim();

// Optional medium text schema
export const OptionalMediumTextSchema = z.string()
    .max(500, 'Text cannot exceed 500 characters')
    .trim()
    .optional();