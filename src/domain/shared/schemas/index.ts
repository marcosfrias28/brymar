import { z } from 'zod';

// Common validation schemas
export const EmailSchema = z.string().email('Invalid email format');

export const PasswordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number');

export const PhoneSchema = z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format');

export const PriceSchema = z.number()
    .min(0, 'Price cannot be negative')
    .max(100_000_000, 'Price exceeds maximum allowed value');

export const CurrencySchema = z.enum(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK', 'NZD']);

export const AddressSchema = z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'Zip code is required'),
    country: z.string().min(1, 'Country is required'),
    coordinates: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180)
    }).optional()
});

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