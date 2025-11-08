// Property Wizard Types for New Framework

import type { WizardData } from "@/types/wizard-core";
import type { PropertyType } from "@/types/wizard";

// Usa il PropertyType centralizzato (enum) da src/types/wizard

export type Coordinates = {
	latitude: number;
	longitude: number;
};

export type Address = {
	street: string;
	city: string;
	province: string;
	postalCode?: string;
	country: string;
	formattedAddress: string;
};

export type PropertyCharacteristic = {
	id: string;
	name: string;
	category: "amenity" | "feature" | "location";
	selected: boolean;
};

export type ImageMetadata = {
	id: string;
	url: string;
	filename: string;
	size: number;
	contentType: string;
	width?: number;
	height?: number;
	displayOrder: number;
};

export type VideoMetadata = {
	id: string;
	url: string;
	filename: string;
	size: number;
	contentType: string;
	duration?: number;
	displayOrder: number;
};

// Property wizard data extending WizardData
export interface PropertyWizardData extends WizardData {
	// Step 1: General Information
	price: number;
	surface: number;
	propertyType: PropertyType;
	bedrooms?: number;
	bathrooms?: number;
	characteristics: PropertyCharacteristic[];

	// Step 2: Location
	coordinates?: Coordinates;
	address?: Address;

	// Step 3: Media
	images: ImageMetadata[];
	videos?: VideoMetadata[];

	// Meta
	language: "es" | "en";
	aiGenerated?: {
		title: boolean;
		description: boolean;
		tags: boolean;
	};
}

// AI Service Types
export type PropertyBasicInfo = {
	type: string;
	location: string;
	price: number;
	surface: number;
	characteristics: string[];
	bedrooms?: number;
	bathrooms?: number;
};

export type AIService = {
	generateDescription(propertyData: PropertyBasicInfo): Promise<string>;
	generateTitle(propertyData: PropertyBasicInfo): Promise<string>;
	generateTags(propertyData: PropertyBasicInfo): Promise<string[]>;
	generateMarketInsights(
		location: string,
		propertyType: string
	): Promise<string>;
};

// Upload Service Types
export type SignedUrlResponse = {
	uploadUrl: string;
	publicUrl: string;
	expiresAt: Date;
};

export type UploadResult = {
	url: string;
	filename: string;
	size: number;
	contentType: string;
};

export type ImageUploadService = {
	generateSignedUrl(
		filename: string,
		contentType: string
	): Promise<SignedUrlResponse>;
	uploadDirect(file: File, signedUrl: string): Promise<UploadResult>;
	processMetadata(uploadResult: UploadResult): ImageMetadata;
};

// Map Service Types
export type MapService = {
	initializeMap(containerId: string): any; // MapInstance type depends on map library
	setDominicanRepublicBounds(): void;
	addMarker(coordinates: Coordinates): any; // Marker type depends on map library
	reverseGeocode(coordinates: Coordinates): Promise<Address>;
	geocode(address: string): Promise<Coordinates>;
};

// Error Types
export class AIServiceError extends Error {
	constructor(
		message: string,
		public code:
			| "RATE_LIMIT"
			| "API_ERROR"
			| "INVALID_RESPONSE"
			| "NETWORK_ERROR",
		public retryable = false
	) {
		super(message);
		this.name = "AIServiceError";
	}
}

export type UploadError = {
	file: File;
	error: string;
	retryable: boolean;
};
