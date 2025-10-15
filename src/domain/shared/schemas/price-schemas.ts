import { z } from 'zod';

/**
 * Price validation schemas for consistent monetary value validation across the domain
 */

// Simple price schema - just a number for basic price validation
export const SimplePriceSchema = z.number()
    .min(1000, 'Price must be at least $1,000')
    .max(100_000_000, 'Price cannot exceed $100,000,000')
    .positive('Price must be a positive number');

// Complex price schema with currency
export const PriceSchema = z.object({
    amount: z.number()
        .min(0, 'Price cannot be negative')
        .max(100_000_000, 'Price cannot exceed $100,000,000'),
    currency: z.string()
        .length(3, 'Currency must be 3 characters')
        .default('USD')
});

// Currency schema
export const CurrencySchema = z.string()
    .length(3, 'Currency must be 3 characters')
    .default('USD');

// Optional price schema
export const OptionalPriceSchema = z.number()
    .min(0, 'Price cannot be negative')
    .max(100_000_000, 'Price cannot exceed $100,000,000')
    .optional();