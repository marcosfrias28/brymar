// AI Property Wizard Type Definitions

// Property type union
export const PropertyType = {
	HOUSE: "house",
	APARTMENT: "apartment",
	LAND: "land",
	COMMERCIAL: "commercial",
	VILLA: "villa",
} as const;

export type PropertyType = (typeof PropertyType)[keyof typeof PropertyType];

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

export type PropertyFormData = {
	// Step 1: General Information
	title: string;
	description: string;
	price: number;
	surface: number;
	propertyType: PropertyType;
	bedrooms?: number;
	bathrooms?: number;
	characteristics: PropertyCharacteristic[];

	// Step 2: Location
	coordinates: Coordinates;
	address: Address;

	// Step 3: Media
	images: ImageMetadata[];
	videos?: VideoMetadata[];

	// Step 4: Meta
	status: "draft" | "published";
	language: "es" | "en";
	aiGenerated?: {
		title: boolean;
		description: boolean;
		tags: boolean;
	};
};

export type WizardState = {
	currentStep: number;
	formData: Partial<PropertyFormData>;
	isValid: Record<number, boolean>;
	isDirty: boolean;
	isLoading: boolean;
	errors: Record<string, string>;
};

// Step Component Props
export type BaseStepProps = {
	data: Partial<PropertyFormData>;
	onUpdate: (data: Partial<PropertyFormData>) => void;
	onNext?: () => void;
	onPrevious?: () => void;
	isLoading?: boolean;
};

export interface GeneralInfoStepProps extends BaseStepProps {
	onNext: () => void;
}

export interface LocationStepProps extends BaseStepProps {
	onNext: () => void;
	onPrevious: () => void;
}

export interface MediaUploadStepProps extends BaseStepProps {
	onNext: () => void;
	onPrevious: () => void;
}

export type PreviewStepProps = {
	data: PropertyFormData;
	onPublish: () => Promise<void>;
	onSaveDraft: () => Promise<void>;
	onEdit: (step: number) => void;
	isLoading?: boolean;
	isMobile?: boolean;
};

// Wizard Container Props
export type PropertyWizardProps = {
	initialData?: Partial<PropertyFormData>;
	draftId?: string;
	onComplete: (data: PropertyFormData) => Promise<void>;
	onSaveDraft: (data: Partial<PropertyFormData>) => Promise<string>;
};

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

// Map Types
export type MapInstance = {
	setView: (center: [number, number], zoom: number) => void;
	remove: () => void;
};

export type MapMarker = {
	setLatLng: (coords: [number, number]) => void;
	remove: () => void;
};

// Map Service Types
export type MapService = {
	initializeMap(containerId: string): MapInstance;
	setDominicanRepublicBounds(): void;
	addMarker(coordinates: Coordinates): MapMarker;
	reverseGeocode(coordinates: Coordinates): Promise<Address>;
	geocode(address: string): Promise<Coordinates>;
};

// Error Types
export class AIServiceError extends Error {
	code: "RATE_LIMIT" | "API_ERROR" | "INVALID_RESPONSE" | "NETWORK_ERROR";
	retryable: boolean;
	constructor(
		message: string,
		code: "RATE_LIMIT" | "API_ERROR" | "INVALID_RESPONSE" | "NETWORK_ERROR",
		retryable = false
	) {
		super(message);
		// biome-ignore lint/security/noSecrets: Class name, not a secret
		this.name = "AIServiceError";
		this.code = code;
		this.retryable = retryable;
	}
}

export type UploadError = {
	file: File;
	error: string;
	retryable: boolean;
};
