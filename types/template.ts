export interface PropertyTemplate {
    id: string;
    name: string;
    description: string;
    category: 'residential' | 'commercial' | 'land' | 'luxury';
    propertyType: string;
    defaultData: Partial<PropertyFormData>;
    characteristics: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface PropertyFormData {
    title: string;
    description: string;
    price: number;
    surface: number;
    propertyType: string;
    bedrooms?: number;
    bathrooms?: number;
    characteristics: string[];
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    address?: {
        street: string;
        city: string;
        province: string;
        country: string;
    };
    images: Array<{
        url: string;
        filename: string;
        size: number;
    }>;
    status: 'draft' | 'published';
    language: 'es' | 'en';
}

export interface BulkImportData {
    properties: Array<Partial<PropertyFormData>>;
    template?: PropertyTemplate;
    validationResults: {
        valid: number;
        invalid: number;
        errors: Array<{
            row: number;
            field: string;
            message: string;
        }>;
    };
}

export interface PropertyComparison {
    id: string;
    properties: Array<{
        id: string;
        title: string;
        price: number;
        surface: number;
        location: string;
        characteristics: string[];
        images: string[];
    }>;
    similarities: string[];
    differences: string[];
    marketPosition: 'below' | 'average' | 'above';
}

export interface SocialMediaPreview {
    platform: 'facebook' | 'instagram' | 'twitter' | 'whatsapp';
    title: string;
    description: string;
    image: string;
    url: string;
    hashtags: string[];
}

export interface SEOSuggestions {
    title: {
        current: string;
        suggested: string;
        score: number;
        improvements: string[];
    };
    description: {
        current: string;
        suggested: string;
        score: number;
        improvements: string[];
    };
    keywords: {
        primary: string[];
        secondary: string[];
        missing: string[];
    };
    structuredData: {
        implemented: boolean;
        suggestions: string[];
    };
    performance: {
        score: number;
        issues: string[];
        recommendations: string[];
    };
}