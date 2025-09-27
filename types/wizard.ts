// AI Property Wizard Type Definitions

export enum PropertyType {
    HOUSE = "house",
    APARTMENT = "apartment",
    LAND = "land",
    COMMERCIAL = "commercial",
    VILLA = "villa",
}

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface Address {
    street: string;
    city: string;
    province: string;
    postalCode?: string;
    country: string;
    formattedAddress: string;
}

export interface PropertyCharacteristic {
    id: string;
    name: string;
    category: "amenity" | "feature" | "location";
    selected: boolean;
}

export interface ImageMetadata {
    id: string;
    url: string;
    filename: string;
    size: number;
    contentType: string;
    width?: number;
    height?: number;
    displayOrder: number;
}

export interface VideoMetadata {
    id: string;
    url: string;
    filename: string;
    size: number;
    contentType: string;
    duration?: number;
    displayOrder: number;
}

export interface PropertyFormData {
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
}

export interface WizardState {
    currentStep: number;
    formData: Partial<PropertyFormData>;
    isValid: Record<number, boolean>;
    isDirty: boolean;
    isLoading: boolean;
    errors: Record<string, string>;
}

// Step Component Props
export interface BaseStepProps {
    data: Partial<PropertyFormData>;
    onUpdate: (data: Partial<PropertyFormData>) => void;
    onNext?: () => void;
    onPrevious?: () => void;
    isLoading?: boolean;
}

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

export interface PreviewStepProps {
    data: PropertyFormData;
    onPublish: () => Promise<void>;
    onSaveDraft: () => Promise<void>;
    onEdit: (step: number) => void;
    isLoading?: boolean;
    isMobile?: boolean;
}

// Wizard Container Props
export interface PropertyWizardProps {
    initialData?: Partial<PropertyFormData>;
    draftId?: string;
    onComplete: (data: PropertyFormData) => Promise<void>;
    onSaveDraft: (data: Partial<PropertyFormData>) => Promise<string>;
}

// AI Service Types
export interface PropertyBasicInfo {
    type: string;
    location: string;
    price: number;
    surface: number;
    characteristics: string[];
    bedrooms?: number;
    bathrooms?: number;
}

export interface AIService {
    generateDescription(propertyData: PropertyBasicInfo): Promise<string>;
    generateTitle(propertyData: PropertyBasicInfo): Promise<string>;
    generateTags(propertyData: PropertyBasicInfo): Promise<string[]>;
    generateMarketInsights(location: string, propertyType: string): Promise<string>;
}

// Upload Service Types
export interface SignedUrlResponse {
    uploadUrl: string;
    publicUrl: string;
    expiresAt: Date;
}

export interface UploadResult {
    url: string;
    filename: string;
    size: number;
    contentType: string;
}

export interface ImageUploadService {
    generateSignedUrl(filename: string, contentType: string): Promise<SignedUrlResponse>;
    uploadDirect(file: File, signedUrl: string): Promise<UploadResult>;
    processMetadata(uploadResult: UploadResult): ImageMetadata;
}

// Map Service Types
export interface MapService {
    initializeMap(containerId: string): any; // MapInstance type depends on map library
    setDominicanRepublicBounds(): void;
    addMarker(coordinates: Coordinates): any; // Marker type depends on map library
    reverseGeocode(coordinates: Coordinates): Promise<Address>;
    geocode(address: string): Promise<Coordinates>;
}

// Error Types
export class AIServiceError extends Error {
    constructor(
        message: string,
        public code: "RATE_LIMIT" | "API_ERROR" | "INVALID_RESPONSE" | "NETWORK_ERROR",
        public retryable: boolean = false
    ) {
        super(message);
        this.name = "AIServiceError";
    }
}

export interface UploadError {
    file: File;
    error: string;
    retryable: boolean;
}