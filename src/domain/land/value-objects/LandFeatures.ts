import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

export class LandFeatures extends ValueObject<string[]> {
    private static readonly MAX_FEATURES = 20;
    private static readonly MAX_FEATURE_LENGTH = 50;

    // Predefined common land features
    private static readonly COMMON_FEATURES = [
        "Water Access",
        "Electricity Available",
        "Road Access",
        "Fenced",
        "Flat Terrain",
        "Sloped Terrain",
        "Ocean View",
        "Mountain View",
        "River Access",
        "Well Water",
        "Fruit Trees",
        "Cleared Land",
        "Wooded Area",
        "Corner Lot",
        "Gated Community",
        "Beach Access",
        "Golf Course View",
        "Investment Opportunity",
        "Development Ready",
        "Agricultural Use"
    ];

    private constructor(features: string[]) {
        super(features);
    }

    static create(features: string[] = []): LandFeatures {
        if (!Array.isArray(features)) {
            throw new ValueObjectValidationError("Land features must be an array");
        }

        if (features.length > this.MAX_FEATURES) {
            throw new ValueObjectValidationError(`Cannot have more than ${this.MAX_FEATURES} features`);
        }

        // Validate and clean features
        const validatedFeatures = features
            .map(feature => {
                if (typeof feature !== 'string') {
                    throw new ValueObjectValidationError("All features must be strings");
                }

                const trimmed = feature.trim();

                if (trimmed.length === 0) {
                    return null; // Will be filtered out
                }

                if (trimmed.length > this.MAX_FEATURE_LENGTH) {
                    throw new ValueObjectValidationError(`Feature "${trimmed}" exceeds maximum length of ${this.MAX_FEATURE_LENGTH} characters`);
                }

                return trimmed;
            })
            .filter((feature): feature is string => feature !== null);

        // Remove duplicates (case-insensitive)
        const uniqueFeatures = validatedFeatures.filter((feature, index, array) =>
            array.findIndex(f => f.toLowerCase() === feature.toLowerCase()) === index
        );

        return new LandFeatures(uniqueFeatures);
    }

    static empty(): LandFeatures {
        return new LandFeatures([]);
    }

    get features(): string[] {
        return [...this._value]; // Return a copy to maintain immutability
    }

    isEmpty(): boolean {
        return this._value.length === 0;
    }

    hasFeature(feature: string): boolean {
        return this._value.some(f => f.toLowerCase() === feature.toLowerCase());
    }

    addFeature(feature: string): LandFeatures {
        if (!feature || feature.trim().length === 0) {
            throw new ValueObjectValidationError("Feature cannot be empty");
        }

        const trimmedFeature = feature.trim();

        if (trimmedFeature.length > LandFeatures.MAX_FEATURE_LENGTH) {
            throw new ValueObjectValidationError(`Feature "${trimmedFeature}" exceeds maximum length of ${LandFeatures.MAX_FEATURE_LENGTH} characters`);
        }

        if (this.hasFeature(trimmedFeature)) {
            return this; // Feature already exists, return unchanged
        }

        if (this._value.length >= LandFeatures.MAX_FEATURES) {
            throw new ValueObjectValidationError(`Cannot add more features. Maximum is ${LandFeatures.MAX_FEATURES}`);
        }

        return new LandFeatures([...this._value, trimmedFeature]);
    }

    removeFeature(feature: string): LandFeatures {
        const newFeatures = this._value.filter(f => f.toLowerCase() !== feature.toLowerCase());
        return new LandFeatures(newFeatures);
    }

    getCount(): number {
        return this._value.length;
    }

    // Get features by category (utility method)
    getUtilityFeatures(): string[] {
        const utilityKeywords = ['water', 'electricity', 'electric', 'power', 'sewer', 'gas', 'internet', 'cable'];
        return this._value.filter(feature =>
            utilityKeywords.some(keyword => feature.toLowerCase().includes(keyword))
        );
    }

    getAccessFeatures(): string[] {
        const accessKeywords = ['road', 'access', 'highway', 'street', 'path', 'entrance'];
        return this._value.filter(feature =>
            accessKeywords.some(keyword => feature.toLowerCase().includes(keyword))
        );
    }

    getViewFeatures(): string[] {
        const viewKeywords = ['view', 'ocean', 'mountain', 'river', 'lake', 'golf', 'city'];
        return this._value.filter(feature =>
            viewKeywords.some(keyword => feature.toLowerCase().includes(keyword))
        );
    }

    getTerrainFeatures(): string[] {
        const terrainKeywords = ['flat', 'sloped', 'hill', 'terrain', 'elevation', 'topography'];
        return this._value.filter(feature =>
            terrainKeywords.some(keyword => feature.toLowerCase().includes(keyword))
        );
    }

    // Format features for display
    formatForDisplay(): string {
        if (this.isEmpty()) {
            return "No features listed";
        }

        if (this._value.length <= 3) {
            return this._value.join(", ");
        }

        return `${this._value.slice(0, 3).join(", ")} and ${this._value.length - 3} more`;
    }

    // Get features as comma-separated string
    toString(): string {
        return this._value.join(", ");
    }

    // Convert to JSON for storage
    toJSON(): string[] {
        return [...this._value];
    }

    static fromJSON(data: string[]): LandFeatures {
        return LandFeatures.create(data);
    }

    // Get common features for suggestions
    static getCommonFeatures(): string[] {
        return [...this.COMMON_FEATURES];
    }

    // Get suggested features based on land type
    static getSuggestedFeatures(landType: string): string[] {
        const suggestions: Record<string, string[]> = {
            commercial: [
                "Road Access",
                "Electricity Available",
                "Corner Lot",
                "High Traffic Area",
                "Parking Available",
                "Development Ready"
            ],
            residential: [
                "Electricity Available",
                "Water Access",
                "Road Access",
                "Flat Terrain",
                "Gated Community",
                "Ocean View"
            ],
            agricultural: [
                "Well Water",
                "Flat Terrain",
                "Cleared Land",
                "Fruit Trees",
                "Agricultural Use",
                "River Access"
            ],
            beachfront: [
                "Beach Access",
                "Ocean View",
                "Water Access",
                "Investment Opportunity",
                "Development Ready",
                "Road Access"
            ]
        };

        return suggestions[landType.toLowerCase()] || this.COMMON_FEATURES.slice(0, 6);
    }
}