/**
 * Shared types used across the application
 */

export interface Address {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

export interface AddressInput extends Omit<Address, "coordinates"> {
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface SearchResult<T> {
    items: T[];
    total: number;
    hasMore: boolean;
    page: number;
    totalPages: number;
}

export interface ActionResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    errors?: Record<string, string[]>;
}

export interface ImageInput {
    file?: File;
    filename: string;
    mimeType: string;
    url?: string;
}

export interface Image {
    id: string;
    url: string;
    filename: string;
    mimeType: string;
    size?: number;
    alt?: string;
}

export type Currency = "USD" | "EUR" | "GBP" | "CAD" | "AUD";

export type SortOrder = "asc" | "desc";

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TimestampedEntity {
    createdAt: Date;
    updatedAt: Date;
}

export interface SEOMetadata {
    title?: string;
    description?: string;
    keywords?: string[];
    canonicalUrl?: string;
    ogImage?: string;
}

export interface FormDataInput {
    [key: string]: string | File | string[] | File[] | undefined;
}

export interface ValidationError {
    field: string;
    message: string;
    code?: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

export type Language = "en" | "es" | "fr" | "de" | "it" | "pt";

export type ContentType = "title" | "description" | "tags" | "market_insights" | "content" | "excerpt";

export interface AIGenerationContext {
    wizardType: "property" | "land" | "blog";
    contentType: ContentType;
    baseData: Record<string, any>;
    language?: Language;
    previousData?: Record<string, any>;
}