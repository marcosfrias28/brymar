export interface PropertyBasicInfo {
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    location?: string;
    price?: number;
    currency?: string;
}

export interface LandBasicInfo {
    landType?: string;
    area?: number;
    location?: string;
    price?: number;
    zoning?: string;
    utilities?: string[];
}

export interface BlogBasicInfo {
    category?: string;
    topic?: string;
    targetAudience?: string;
    keywords?: string[];
}

export interface IAIService {
    // Property AI generation methods
    generatePropertyTitle(info: PropertyBasicInfo, language?: string): Promise<string>;
    generatePropertyDescription(info: PropertyBasicInfo, language?: string): Promise<string>;
    generatePropertyTags(info: PropertyBasicInfo, language?: string): Promise<string[]>;
    generateMarketInsights(info: PropertyBasicInfo, language?: string): Promise<string>;

    // Land AI generation methods
    generateLandTitle(info: LandBasicInfo, language?: string): Promise<string>;
    generateLandDescription(info: LandBasicInfo, language?: string): Promise<string>;
    generateLandTags(info: LandBasicInfo, language?: string): Promise<string[]>;

    // Blog AI generation methods
    generateBlogTitle(info: BlogBasicInfo, language?: string): Promise<string>;
    generateBlogDescription(info: BlogBasicInfo, language?: string): Promise<string>;
    generateBlogTags(info: BlogBasicInfo, language?: string): Promise<string[]>;

    // Health check
    isAvailable(): Promise<boolean>;
}