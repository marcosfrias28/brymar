/**
 * Shared types used across the application
 */

export type Address = {
	street: string;
	city: string;
	state: string;
	country: string;
	postalCode?: string;
	coordinates?: {
		latitude: number;
		longitude: number;
	};
};

export interface AddressInput extends Omit<Address, "coordinates"> {
	coordinates?: {
		latitude: number;
		longitude: number;
	};
}

export type PaginationParams = {
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
};

export type SearchResult<T> = {
	items: T[];
	total: number;
	hasMore: boolean;
	page: number;
	totalPages: number;
};

export type ActionResult<T = any> = {
	success: boolean;
	data?: T;
	error?: string;
	errors?: Record<string, string[]>;
};

export type ImageInput = {
	file?: File;
	filename: string;
	mimeType: string;
	url?: string;
};

export type Image = {
	id: string;
	url: string;
	filename: string;
	mimeType: string;
	size?: number;
	alt?: string;
};

export type Currency = "USD" | "EUR" | "GBP" | "CAD" | "AUD";

export type SortOrder = "asc" | "desc";

export type Coordinates = {
	latitude: number;
	longitude: number;
};

export type BaseEntity = {
	id: string;
	createdAt: Date;
	updatedAt: Date;
};

export type TimestampedEntity = {
	createdAt: Date;
	updatedAt: Date;
};

export type SEOMetadata = {
	title?: string;
	description?: string;
	keywords?: string[];
	canonicalUrl?: string;
	ogImage?: string;
};

export type FormDataInput = {
	[key: string]: string | File | string[] | File[] | undefined;
};

export type ValidationError = {
	field: string;
	message: string;
	code?: string;
};

export type ValidationResult = {
	isValid: boolean;
	errors: ValidationError[];
};

export type Language = "en" | "es" | "fr" | "de" | "it" | "pt";

export type ContentType =
	| "title"
	| "description"
	| "tags"
	| "market_insights"
	| "content"
	| "excerpt";

export type AIGenerationContext = {
	wizardType: "property" | "land" | "blog";
	contentType: ContentType;
	baseData: Record<string, any>;
	language?: Language;
	previousData?: Record<string, any>;
};
