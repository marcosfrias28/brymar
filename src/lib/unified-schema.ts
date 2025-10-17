/**
 * Unified Schema System
 * 
 * This file creates a unified approach where Drizzle schemas are the single source of truth,
 * with Zod validations derived directly from them, eliminating duplication between
 * domain models, DTOs, and validation schemas.
 */

import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import {
    users,
    properties,
    lands,
    blogPosts,
    categories,
    userFavorites,
    pageSections,
    contactInfo,
    wizardDrafts,
    wizardMedia,
    propertyDrafts,
    aiGenerations,
    propertyImages,
    propertyVideos,
    propertyCharacteristics,
    propertyDraftCharacteristics,
    wizardAnalytics,
    landDrafts,
    blogDrafts,
    type User,
    type Property,
    type Land,
    type BlogPost,
    type Category,
    type UserFavorite,
    type PageSection,
    type ContactInfo,
    type WizardDraft,
    type WizardMedia,
    type PropertyDraft,
    type AIGeneration,
    type PropertyImage,
    type PropertyVideo,
    type PropertyCharacteristic,
    type PropertyDraftCharacteristic,
    type WizardAnalytic,
    type LandDraft,
    type BlogDraft,
} from './db/schema';

// ============================================================================
// CORE VALIDATION SCHEMAS - Derived from Drizzle schemas
// ============================================================================

// User schemas
export const UserSelectSchema = createSelectSchema(users);
export const UserInsertSchema = createInsertSchema(users);

// Property schemas
export const PropertySelectSchema = createSelectSchema(properties);
export const PropertyInsertSchema = createInsertSchema(properties, {
    // Custom refinements for business rules
    price: z.number().min(1000, "El precio debe ser al menos $1,000").max(10000000, "El precio no puede exceder $10,000,000"),
    title: z.string().min(3, "El título debe tener al menos 3 caracteres").max(100, "El título no puede exceder 100 caracteres"),
    description: z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(1000, "La descripción no puede exceder 1000 caracteres"),
    bedrooms: z.number().min(1, "Debe tener al menos 1 habitación").max(10, "No puede tener más de 10 habitaciones"),
    bathrooms: z.number().min(1, "Debe tener al menos 1 baño").max(10, "No puede tener más de 10 baños"),
    area: z.number().min(20, "El área debe ser al menos 20 m²").max(10000, "El área no puede exceder 10,000 m²"),
    location: z.string().min(3, "La ubicación debe tener al menos 3 caracteres").max(100, "La ubicación no puede exceder 100 caracteres"),
    type: z.string().min(3, "El tipo debe tener al menos 3 caracteres").max(50, "El tipo no puede exceder 50 caracteres"),
    status: z.enum(["draft", "published", "sold", "rented", "withdrawn", "archived"]),
});

// Land schemas
export const LandSelectSchema = createSelectSchema(lands);
export const LandInsertSchema = createInsertSchema(lands, {
    // Custom refinements for business rules
    price: z.number().min(1000, "El precio debe ser al menos $1,000").max(50000000, "El precio no puede exceder $50,000,000"),
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(100, "El nombre no puede exceder 100 caracteres"),
    description: z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(1000, "La descripción no puede exceder 1000 caracteres"),
    area: z.number().min(100, "El área debe ser al menos 100 m²").max(1000000, "El área no puede exceder 1,000,000 m²"),
    location: z.string().min(3, "La ubicación debe tener al menos 3 caracteres").max(100, "La ubicación no puede exceder 100 caracteres"),
    type: z.string().min(3, "El tipo debe tener al menos 3 caracteres").max(50, "El tipo no puede exceder 50 caracteres"),
    status: z.enum(["draft", "published", "sold", "withdrawn", "archived"]),
});

// Blog schemas
export const BlogPostSelectSchema = createSelectSchema(blogPosts);
export const BlogPostInsertSchema = createInsertSchema(blogPosts, {
    // Custom refinements for business rules
    title: z.string().min(5, "El título debe tener al menos 5 caracteres").max(200, "El título no puede exceder 200 caracteres"),
    content: z.string().min(50, "El contenido debe tener al menos 50 caracteres").max(10000, "El contenido no puede exceder 10,000 caracteres"),
    author: z.string().min(2, "El autor debe tener al menos 2 caracteres").max(100, "El autor no puede exceder 100 caracteres"),
    category: z.enum(["property-news", "market-analysis", "investment-tips", "legal-advice", "home-improvement", "general"]),
    status: z.enum(["draft", "published", "archived"]),
    readingTime: z.number().min(1, "El tiempo de lectura debe ser al menos 1 minuto").max(60, "El tiempo de lectura no puede exceder 60 minutos"),
});

// Category schemas
export const CategorySelectSchema = createSelectSchema(categories);
export const CategoryInsertSchema = createInsertSchema(categories, {
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "El nombre no puede exceder 50 caracteres"),
    slug: z.string().min(2, "El slug debe tener al menos 2 caracteres").max(50, "El slug no puede exceder 50 caracteres").regex(/^[a-z0-9-]+$/, "El slug solo puede contener letras minúsculas, números y guiones"),
    title: z.string().min(2, "El título debe tener al menos 2 caracteres").max(100, "El título no puede exceder 100 caracteres"),
    description: z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(500, "La descripción no puede exceder 500 caracteres"),
    status: z.enum(["active", "inactive"]),
});

// Wizard schemas
export const WizardDraftSelectSchema = createSelectSchema(wizardDrafts);
export const WizardDraftInsertSchema = createInsertSchema(wizardDrafts, {
    wizardType: z.enum(["property", "land", "blog"]),
    completionPercentage: z.number().min(0).max(100),
});

export const WizardMediaSelectSchema = createSelectSchema(wizardMedia);
export const WizardMediaInsertSchema = createInsertSchema(wizardMedia, {
    mediaType: z.enum(["image", "video"]),
    wizardType: z.enum(["property", "land", "blog"]),
    size: z.number().min(1, "El tamaño del archivo debe ser mayor a 0"),
    contentType: z.string().min(1, "El tipo de contenido es requerido"),
});

// User Favorites schemas
export const UserFavoriteSelectSchema = createSelectSchema(userFavorites);
export const UserFavoriteInsertSchema = createInsertSchema(userFavorites, {
    itemType: z.enum(["property", "land"]),
});

// Page Sections schemas
export const PageSectionSelectSchema = createSelectSchema(pageSections);
export const PageSectionInsertSchema = createInsertSchema(pageSections, {
    page: z.string().min(1, "La página es requerida"),
    section: z.string().min(1, "La sección es requerida"),
});

// Contact Info schemas
export const ContactInfoSelectSchema = createSelectSchema(contactInfo);
export const ContactInfoInsertSchema = createInsertSchema(contactInfo, {
    type: z.enum(["phone", "email", "address", "social"]),
    label: z.string().min(1, "La etiqueta es requerida"),
    value: z.string().min(1, "El valor es requerido"),
});

// ============================================================================
// FORM VALIDATION SCHEMAS - For client-side forms
// ============================================================================

// Property form schemas
export const PropertyFormSchema = PropertyInsertSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).extend({
    // Override for form-specific validations
    images: z.array(z.string().url("URL de imagen inválida")).optional().default([]),
    featured: z.boolean().optional().default(false),
});

export const PropertyUpdateFormSchema = PropertyFormSchema.extend({
    id: z.number().min(1, "ID de propiedad requerido"),
});

// Land form schemas
export const LandFormSchema = LandInsertSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).extend({
    images: z.array(z.string().url("URL de imagen inválida")).optional().default([]),
    features: z.array(z.string()).optional().default([]),
});

export const LandUpdateFormSchema = LandFormSchema.extend({
    id: z.number().min(1, "ID de terreno requerido"),
});

// Blog form schemas
export const BlogFormSchema = BlogPostInsertSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).extend({
    image: z.string().url("URL de imagen inválida").optional(),
});

export const BlogUpdateFormSchema = BlogFormSchema.extend({
    id: z.number().min(1, "ID de blog requerido"),
});

// ============================================================================
// SEARCH AND FILTER SCHEMAS
// ============================================================================

export const PropertySearchSchema = z.object({
    query: z.string().optional(),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    minBedrooms: z.number().min(0).optional(),
    maxBedrooms: z.number().min(0).optional(),
    minBathrooms: z.number().min(0).optional(),
    maxBathrooms: z.number().min(0).optional(),
    minArea: z.number().min(0).optional(),
    maxArea: z.number().min(0).optional(),
    type: z.string().optional(),
    status: z.enum(["draft", "published", "sold", "rented", "withdrawn", "archived"]).optional(),
    location: z.string().optional(),
    featured: z.boolean().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(12),
});

export const LandSearchSchema = z.object({
    query: z.string().optional(),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    minArea: z.number().min(0).optional(),
    maxArea: z.number().min(0).optional(),
    type: z.string().optional(),
    status: z.enum(["draft", "published", "sold", "withdrawn", "archived"]).optional(),
    location: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(12),
});

export const BlogSearchSchema = z.object({
    query: z.string().optional(),
    category: z.enum(["property-news", "market-analysis", "investment-tips", "legal-advice", "home-improvement", "general"]).optional(),
    status: z.enum(["draft", "published", "archived"]).optional(),
    author: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(12),
});

// ============================================================================
// WIZARD SPECIFIC SCHEMAS
// ============================================================================

export const WizardStepDataSchema = z.object({
    stepId: z.string(),
    data: z.record(z.string(), z.any()),
    isValid: z.boolean(),
    isComplete: z.boolean(),
});

export const WizardProgressSchema = z.object({
    currentStep: z.string(),
    completedSteps: z.array(z.string()),
    totalSteps: z.number(),
    completionPercentage: z.number().min(0).max(100),
});

// ============================================================================
// UNIFIED TYPES - Export Drizzle types as the single source of truth
// ============================================================================

// Re-export Drizzle types as the canonical types
export type {
    User,
    Property,
    Land,
    BlogPost,
    Category,
    UserFavorite,
    PageSection,
    ContactInfo,
    WizardDraft,
    WizardMedia,
    PropertyDraft,
    AIGeneration,
    PropertyImage,
    PropertyVideo,
    PropertyCharacteristic,
    PropertyDraftCharacteristic,
    WizardAnalytic,
    LandDraft,
    BlogDraft,
} from './db/schema';

// Form data types derived from schemas
export type PropertyFormData = z.infer<typeof PropertyFormSchema>;
export type PropertyUpdateFormData = z.infer<typeof PropertyUpdateFormSchema>;
export type LandFormData = z.infer<typeof LandFormSchema>;
export type LandUpdateFormData = z.infer<typeof LandUpdateFormSchema>;
export type BlogFormData = z.infer<typeof BlogFormSchema>;
export type BlogUpdateFormData = z.infer<typeof BlogUpdateFormSchema>;

// Search types
export type PropertySearchParams = z.infer<typeof PropertySearchSchema>;
export type LandSearchParams = z.infer<typeof LandSearchSchema>;
export type BlogSearchParams = z.infer<typeof BlogSearchSchema>;

// Wizard types
export type WizardStepData = z.infer<typeof WizardStepDataSchema>;
export type WizardProgress = z.infer<typeof WizardProgressSchema>;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validates data against a schema and returns typed result
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    errors?: z.ZodError;
} {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, errors: result.error };
}

/**
 * Creates a validation function for a specific schema
 */
export function createValidator<T>(schema: z.ZodSchema<T>) {
    return (data: unknown) => validateData(schema, data);
}

/**
 * Extracts validation errors in a user-friendly format
 */
export function extractValidationErrors(error: z.ZodError): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    for (const issue of error.issues) {
        const path = issue.path.join('.');
        if (!errors[path]) {
            errors[path] = [];
        }
        errors[path].push(issue.message);
    }

    return errors;
}

/**
 * Formats validation errors for display
 */
export function formatValidationError(error: z.ZodError): string {
    return error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
}