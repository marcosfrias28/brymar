import { z } from 'zod';

/**
 * User-specific validation schemas for consistent user data validation
 * These schemas align with the domain value objects and provide validation
 * for user-related data across all bounded contexts.
 */

// User role schema - supports both current system and domain model
// Current system: ['admin', 'agent', 'user']
// Domain model: ['user', 'editor', 'admin', 'super_admin']
export const UserRoleSchema = z.enum(['user', 'editor', 'admin', 'super_admin', 'agent'])
    .default('user')
    .describe('User role with hierarchical permissions');

// User preferences schema - aligned with UserPreferences value object
export const UserPreferencesSchema = z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system').optional(),
    language: z.string().length(2, 'Language must be a 2-character code').default('en').optional(),
    timezone: z.string().default('UTC').optional(),
    notifications: z.object({
        email: z.boolean().default(true),
        push: z.boolean().default(true),
        marketing: z.boolean().default(false),
    }).optional(),
    privacy: z.object({
        profileVisibility: z.enum(['public', 'private', 'friends']).default('public'),
        showEmail: z.boolean().default(false),
        showPhone: z.boolean().default(false),
    }).optional(),
}).describe('User preferences for theme, notifications, and privacy settings');

// Email schema with comprehensive validation
export const EmailSchema = z.string()
    .email('Invalid email format')
    .max(255, 'Email cannot exceed 255 characters')
    .transform(email => email.toLowerCase().trim())
    .describe('Valid email address');

// Phone schema with international format support
export const PhoneSchema = z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
    .min(7, 'Phone number must be at least 7 digits')
    .max(17, 'Phone number cannot exceed 17 characters')
    .describe('Valid phone number in international format');

// Optional phone schema
export const OptionalPhoneSchema = z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
    .min(7, 'Phone number must be at least 7 digits')
    .max(17, 'Phone number cannot exceed 17 characters')
    .optional()
    .describe('Optional valid phone number in international format');

// Contact information schema
export const ContactInfoSchema = z.object({
    email: EmailSchema.optional(),
    phone: OptionalPhoneSchema,
    website: z.string().url('Invalid website URL').optional(),
}).describe('Contact information including email, phone, and website');

// User status schema for account states
export const UserStatusSchema = z.enum(['active', 'inactive', 'pending', 'suspended', 'deleted'])
    .default('pending')
    .describe('User account status');

// User profile visibility schema
export const ProfileVisibilitySchema = z.enum(['public', 'private', 'friends'])
    .default('public')
    .describe('User profile visibility setting');

// Notification preferences schema
export const NotificationPreferencesSchema = z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    marketing: z.boolean().default(false),
    security: z.boolean().default(true),
}).describe('User notification preferences');

// Privacy preferences schema
export const PrivacyPreferencesSchema = z.object({
    profileVisibility: ProfileVisibilitySchema,
    showEmail: z.boolean().default(false),
    showPhone: z.boolean().default(false),
    allowSearchEngineIndexing: z.boolean().default(true),
}).describe('User privacy preferences');