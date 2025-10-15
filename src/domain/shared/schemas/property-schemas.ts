import { z } from 'zod';

/**
 * Property-specific validation schemas for consistent property data validation
 */

// Property type schema - matches PropertyTypeEnum
export const PropertyTypeSchema = z.enum([
    'house',
    'apartment',
    'condo',
    'townhouse',
    'villa',
    'studio',
    'penthouse',
    'duplex',
    'land',
    'commercial',
    'office',
    'warehouse'
]);

// Property status schema - matches PropertyStatusEnum
export const PropertyStatusSchema = z.enum([
    'draft',
    'pending_review',
    'published',
    'sold',
    'rented',
    'withdrawn',
    'expired',
    'archived'
]);

// Property features schema - matches PropertyFeatures value object
export const PropertyFeaturesSchema = z.object({
    bedrooms: z.number()
        .min(0, 'Bedrooms cannot be negative')
        .max(20, 'Bedrooms cannot exceed 20'),
    bathrooms: z.number()
        .min(0, 'Bathrooms cannot be negative')
        .max(20, 'Bathrooms cannot exceed 20'),
    area: z.number()
        .min(1, 'Area must be at least 1 square meter')
        .max(10000, 'Area cannot exceed 10,000 square meters'),
    amenities: z.array(z.string().min(1, 'Amenity cannot be empty')).optional().default([]),
    features: z.array(z.string().min(1, 'Feature cannot be empty')).optional().default([]),
    parking: z.object({
        spaces: z.number()
            .min(0, 'Parking spaces cannot be negative')
            .max(20, 'Parking spaces cannot exceed 20'),
        type: z.enum(['garage', 'carport', 'street', 'covered']),
    }).optional(),
    yearBuilt: z.number()
        .min(1800, 'Year built cannot be before 1800')
        .max(new Date().getFullYear() + 2, 'Year built cannot be more than 2 years in the future')
        .optional(),
    lotSize: z.number()
        .min(0, 'Lot size cannot be negative')
        .max(100000, 'Lot size cannot exceed 100,000 square meters')
        .optional(),
});

// Address schema
export const AddressSchema = z.object({
    street: z.string()
        .min(1, 'Street is required')
        .max(200, 'Street cannot exceed 200 characters'),
    city: z.string()
        .min(1, 'City is required')
        .max(100, 'City cannot exceed 100 characters'),
    state: z.string()
        .min(1, 'State is required')
        .max(100, 'State cannot exceed 100 characters'),
    country: z.string()
        .min(1, 'Country is required')
        .max(100, 'Country cannot exceed 100 characters'),
    postalCode: z.string()
        .max(20, 'Postal code cannot exceed 20 characters')
        .optional(),
    coordinates: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
    }).optional(),
});

// Parking type schema
export const ParkingTypeSchema = z.enum(['garage', 'carport', 'street', 'covered']);

// Property condition schema
export const PropertyConditionSchema = z.enum([
    'excellent',
    'good',
    'fair',
    'poor',
    'needs_renovation'
]);

// Property listing type schema
export const PropertyListingTypeSchema = z.enum([
    'sale',
    'rent',
    'lease',
    'auction'
]);

// Property priority schema
export const PropertyPrioritySchema = z.enum([
    'low',
    'medium',
    'high',
    'urgent'
]);