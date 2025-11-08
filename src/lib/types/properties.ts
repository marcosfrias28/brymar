/**
 * Property-related types consolidating all property DTOs
 */

import type {
	ActionResult,
	Address,
	AddressInput,
	BaseEntity,
	Currency,
	Image,
	ImageInput,
	Video,
	VideoInput,
	Document,
	DocumentInput,
	Geometry,
	SearchResult,
} from "./shared";

export type PropertyType =
	| "house"
	| "apartment"
	| "condo"
	| "townhouse"
	| "villa"
	| "studio"
	| "penthouse"
	| "duplex"
	| "land"
	| "commercial"
	| "office"
	| "warehouse";

export type PropertyStatus =
	| "draft"
	| "published"
	| "sold"
	| "rented"
	| "archived";

export type PropertyFeatures = {
	bedrooms: number;
	bathrooms: number;
	area: number; // in square feet or meters
	yearBuilt?: number;
	lotSize?: number;
	amenities: string[];
	features: string[];
	parking?: {
		spaces: number;
		type: "garage" | "carport" | "street" | "covered";
	};
};

export type PropertyFeaturesInput = {
	bedrooms: number;
	bathrooms: number;
	area: number;
	yearBuilt?: number;
	lotSize?: number;
	amenities: string[];
	features: string[];
	parking?: {
		spaces: number;
		type: "garage" | "carport" | "street" | "covered";
	};
};

export interface Property extends BaseEntity {
	title: string;
	description: string;
	price: number;
	currency: Currency;
	address: Address;
	type: PropertyType;
	features: PropertyFeatures;
	images: Image[];
	videos?: Video[];
	documents?: Document[];
	tags?: string[];
	geometry?: Geometry;
	statusHistory?: Array<{
		status: PropertyStatus;
		at: Date;
		by?: string;
		note?: string;
	}>;
	status: PropertyStatus;
	featured: boolean;
	userId: string;
	publishedAt?: Date;
}

export type CreatePropertyInput = {
	title: string;
	description: string;
	price: number;
	currency: Currency;
	address: AddressInput;
	type: PropertyType;
	features: PropertyFeaturesInput;
	images?: ImageInput[];
	videos?: VideoInput[];
	documents?: DocumentInput[];
	tags?: string[];
	geometry?: Geometry;
	featured?: boolean;
};

export interface UpdatePropertyInput extends Partial<CreatePropertyInput> {
	id: string;
}

export type PropertySearchFilters = {
	minPrice?: number;
	maxPrice?: number;
	propertyTypes?: PropertyType[];
	location?: string;
	bedrooms?: number;
	bathrooms?: number;
	minArea?: number;
	maxArea?: number;
	amenities?: string[];
	features?: string[];
	tags?: string[];
	status?: PropertyStatus[];
	featured?: boolean;
	userId?: string;
	// Pagination and sorting
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
};

export interface PropertySearchResult extends SearchResult<Property> {
	filters: {
		applied: string[];
		available: {
			propertyTypes: PropertyType[];
			priceRanges: { min: number; max: number; label: string }[];
			locations: string[];
			amenities: string[];
			features: string[];
		};
	};
}

export type PublishPropertyInput = {
	id: string;
	publishedAt?: Date;
};

// Property inquiry types
export interface PropertyInquiry extends BaseEntity {
	propertyId: string;
	userId?: string;
	name: string;
	email: string;
	phone?: string;
	message: string;
	status: "new" | "contacted" | "closed";
}

export type CreatePropertyInquiryInput = {
	propertyId: string;
	name: string;
	email: string;
	phone?: string;
	message: string;
};

// Property view tracking
export type PropertyView = {
	id: number;
	propertyId: string;
	userId?: string;
	ipAddress?: string;
	userAgent?: string;
	createdAt: Date;
};

// Action result types
export type CreatePropertyResult = ActionResult<Property>;
export type UpdatePropertyResult = ActionResult<Property>;
export type GetPropertyResult = ActionResult<Property>;
export type SearchPropertiesResult = ActionResult<PropertySearchResult>;
export type PublishPropertyResult = ActionResult<Property>;
export type DeletePropertyResult = ActionResult<void>;
export type CreatePropertyInquiryResult = ActionResult<PropertyInquiry>;
