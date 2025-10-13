import { Property } from "../entities/Property";
import { Price } from "../value-objects/Price";
import { PropertyType } from "../value-objects/PropertyType";
import { PropertyFeatures } from "../value-objects/PropertyFeatures";
import { Address } from "../value-objects/Address";
import { DomainError } from '@/domain/shared/errors/DomainError';

export interface PropertyValuationData {
    averagePricePerSqm: number;
    marketTrend: 'rising' | 'stable' | 'declining';
    comparableProperties: number;
    locationScore: number; // 1-10
}

export interface PropertyValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export class PropertyDomainService {

    /**
     * Validates property creation data according to business rules
     */
    static validatePropertyCreation(
        type: string,
        features: any,
        price: number
    ): void {
        // Business rule: Residential properties must have at least 1 bedroom and 1 bathroom
        if ((type === 'house' || type === 'apartment' || type === 'condo' || type === 'townhouse' || type === 'villa')) {
            if (features.bedrooms === 0) {
                throw new DomainError("Residential properties must have at least 1 bedroom");
            }
            if (features.bathrooms === 0) {
                throw new DomainError("Residential properties must have at least 1 bathroom");
            }
        }

        // Business rule: Price must be reasonable for property type
        if (type === 'land' && price < 1000) {
            throw new DomainError("Land properties must have a minimum price of $1,000");
        }

        if ((type === 'house' || type === 'apartment' || type === 'condo' || type === 'townhouse' || type === 'villa') && price < 10000) {
            throw new DomainError("Residential properties must have a minimum price of $10,000");
        }

        if ((type === 'commercial' || type === 'office') && price < 50000) {
            throw new DomainError("Commercial properties must have a minimum price of $50,000");
        }

        // Business rule: Large properties should have multiple bathrooms
        if (features.area > 200 && features.bathrooms < 2) {
            // This is a warning, not an error - could be logged or handled differently
            console.warn("Large properties (>200 sqm) typically have multiple bathrooms");
        }
    }

    /**
     * Validates property update according to business rules
     */
    static validatePropertyUpdate(property: Property): void {
        // Validate that the property is still complete after updates
        if (!property.isComplete()) {
            throw new DomainError("Property updates resulted in incomplete property data");
        }

        // Validate business rules still hold
        const type = property.getType();
        const features = property.getFeatures();
        const price = property.getPrice();

        // Re-validate core business rules
        if (type.isResidential() && type.requiresBedrooms()) {
            if (features.bedrooms === 0) {
                throw new DomainError("Residential properties must have at least 1 bedroom");
            }
            if (features.bathrooms === 0) {
                throw new DomainError("Residential properties must have at least 1 bathroom");
            }
        }

        // Validate price reasonableness
        if (type.isLand() && price.amount < 1000) {
            throw new DomainError("Land properties must have a minimum price of $1,000");
        }

        if (type.isResidential() && price.amount < 10000) {
            throw new DomainError("Residential properties must have a minimum price of $10,000");
        }
    }

    /**
     * Validates property data according to business rules
     */
    validateProperty(property: Property): PropertyValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Basic completeness validation
        if (!property.isComplete()) {
            errors.push("Property is incomplete - missing required fields");
        }

        // Business rule validations
        const type = property.getType();
        const features = property.getFeatures();
        const price = property.getPrice();
        const address = property.getAddress();

        // Validate property type specific rules
        if (type.isResidential() && type.requiresBedrooms()) {
            if (features.bedrooms === 0) {
                errors.push("Residential properties must have at least 1 bedroom");
            }
            if (features.bathrooms === 0) {
                errors.push("Residential properties must have at least 1 bathroom");
            }
        }

        // Validate price reasonableness
        const priceValidation = this.validatePricing(price, type, features, address);
        errors.push(...priceValidation.errors);
        warnings.push(...priceValidation.warnings);

        // Validate features consistency
        const featuresValidation = this.validateFeatures(features, type);
        errors.push(...featuresValidation.errors);
        warnings.push(...featuresValidation.warnings);

        // Validate images
        if (property.getImages().length === 0) {
            warnings.push("Property should have at least one image");
        }

        if (property.getImages().length > 15) {
            warnings.push("Too many images may slow down property loading");
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }

    /**
     * Validates pricing according to business rules
     */
    private validatePricing(
        price: Price,
        type: PropertyType,
        features: PropertyFeatures,
        address: Address
    ): { errors: string[]; warnings: string[] } {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Minimum price validation by type
        if (type.isLand() && price.amount < 1000) {
            errors.push("Land properties must have a minimum price of $1,000");
        }

        if (type.isResidential() && price.amount < 10000) {
            errors.push("Residential properties must have a minimum price of $10,000");
        }

        if (type.isCommercial() && price.amount < 50000) {
            errors.push("Commercial properties must have a minimum price of $50,000");
        }

        // Price per square meter validation
        const pricePerSqm = features.getPricePerSquareMeter(price.amount);

        if (type.isResidential()) {
            if (pricePerSqm < 100) {
                warnings.push("Price per square meter seems unusually low for residential property");
            }
            if (pricePerSqm > 10000) {
                warnings.push("Price per square meter seems unusually high for residential property");
            }
        }

        if (type.isCommercial()) {
            if (pricePerSqm < 500) {
                warnings.push("Price per square meter seems unusually low for commercial property");
            }
            if (pricePerSqm > 20000) {
                warnings.push("Price per square meter seems unusually high for commercial property");
            }
        }

        // Luxury property validation
        if (features.isLuxury() && price.amount < 500000) {
            warnings.push("Property has luxury features but price may be too low");
        }

        return { errors, warnings };
    }

    /**
     * Validates features consistency
     */
    private validateFeatures(
        features: PropertyFeatures,
        type: PropertyType
    ): { errors: string[]; warnings: string[] } {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Bedroom to bathroom ratio validation
        if (type.isResidential() && features.bedrooms > 0) {
            const bedroomToBathroomRatio = features.bedrooms / features.bathrooms;

            if (bedroomToBathroomRatio > 4) {
                warnings.push("High bedroom to bathroom ratio - consider adding more bathrooms");
            }
        }

        // Area validation
        if (type.isResidential()) {
            if (features.area < 30) {
                warnings.push("Property area seems small for residential use");
            }
            if (features.area > 1000) {
                warnings.push("Property area seems very large - verify measurements");
            }
        }

        // Parking validation for residential properties
        if (type.isResidential() && features.bedrooms >= 2 && !features.hasParking()) {
            warnings.push("Multi-bedroom properties typically include parking");
        }

        // Year built validation
        const age = features.getAge();
        if (age !== null) {
            if (age > 100) {
                warnings.push("Very old property - may require additional inspections");
            }
            if (age < 0) {
                errors.push("Year built cannot be in the future");
            }
        }

        return { errors, warnings };
    }

    /**
     * Calculates estimated property value based on market data
     */
    calculateEstimatedValue(
        features: PropertyFeatures,
        address: Address,
        type: PropertyType,
        marketData: PropertyValuationData
    ): Price {
        let baseValue = features.area * marketData.averagePricePerSqm;

        // Adjust for property type
        const typeMultiplier = this.getTypeMultiplier(type);
        baseValue *= typeMultiplier;

        // Adjust for location score
        const locationMultiplier = 0.8 + (marketData.locationScore / 10) * 0.4; // 0.8 to 1.2
        baseValue *= locationMultiplier;

        // Adjust for market trend
        const trendMultiplier = this.getTrendMultiplier(marketData.marketTrend);
        baseValue *= trendMultiplier;

        // Adjust for features
        const featuresMultiplier = this.getFeaturesMultiplier(features);
        baseValue *= featuresMultiplier;

        // Adjust for age
        const age = features.getAge();
        if (age !== null) {
            const ageMultiplier = this.getAgeMultiplier(age);
            baseValue *= ageMultiplier;
        }

        return Price.create(Math.round(baseValue), "USD");
    }

    private getTypeMultiplier(type: PropertyType): number {
        if (type.isLand()) return 0.3;
        if (type.value === "studio") return 0.8;
        if (type.value === "apartment") return 0.9;
        if (type.value === "house") return 1.0;
        if (type.value === "villa") return 1.3;
        if (type.value === "penthouse") return 1.5;
        if (type.isCommercial()) return 1.2;
        return 1.0;
    }

    private getTrendMultiplier(trend: 'rising' | 'stable' | 'declining'): number {
        switch (trend) {
            case 'rising': return 1.1;
            case 'stable': return 1.0;
            case 'declining': return 0.9;
            default: return 1.0;
        }
    }

    private getFeaturesMultiplier(features: PropertyFeatures): number {
        let multiplier = 1.0;

        // Luxury features
        if (features.isLuxury()) {
            multiplier += 0.3;
        }

        // Parking
        if (features.hasParking()) {
            multiplier += 0.05 * features.getParkingSpaces();
        }

        // Premium amenities
        const premiumAmenities = ['pool', 'gym', 'spa', 'concierge', 'security'];
        const premiumCount = premiumAmenities.filter(amenity =>
            features.hasAmenity(amenity)
        ).length;
        multiplier += premiumCount * 0.05;

        return Math.min(multiplier, 2.0); // Cap at 2x
    }

    private getAgeMultiplier(age: number): number {
        if (age <= 2) return 1.1; // New construction premium
        if (age <= 10) return 1.0; // Modern property
        if (age <= 20) return 0.95; // Slightly older
        if (age <= 50) return 0.9; // Mature property
        return 0.8; // Older property
    }

    /**
     * Determines if a property is suitable for a specific use case
     */
    isSuitableFor(property: Property, useCase: 'family' | 'investment' | 'luxury' | 'starter'): boolean {
        const features = property.getFeatures();
        const type = property.getType();
        const price = property.getPrice();

        switch (useCase) {
            case 'family':
                return features.isFamilyFriendly() &&
                    type.isResidential() &&
                    features.area >= 80 &&
                    features.hasParking();

            case 'investment':
                return property.isAvailable() &&
                    type.isResidential() &&
                    price.amount < 500000 && // Reasonable investment price
                    features.area >= 50;

            case 'luxury':
                return features.isLuxury() ||
                    price.amount > 1000000 ||
                    type.value === 'villa' ||
                    type.value === 'penthouse';

            case 'starter':
                return type.isResidential() &&
                    price.amount < 300000 &&
                    features.bedrooms <= 2 &&
                    features.area >= 40;

            default:
                return false;
        }
    }

    /**
     * Compares two properties and returns a comparison result
     */
    compareProperties(property1: Property, property2: Property): {
        betterValue: Property | null;
        comparison: {
            pricePerSqm: { property1: number; property2: number; winner: Property | null };
            features: { property1: number; property2: number; winner: Property | null };
            location: { property1: string; property2: string };
        };
    } {
        const p1PricePerSqm = property1.getPricePerSquareMeter();
        const p2PricePerSqm = property2.getPricePerSquareMeter();

        // Calculate feature scores (simple scoring system)
        const p1FeatureScore = this.calculateFeatureScore(property1.getFeatures());
        const p2FeatureScore = this.calculateFeatureScore(property2.getFeatures());

        return {
            betterValue: this.determineBetterValue(property1, property2, p1FeatureScore, p2FeatureScore),
            comparison: {
                pricePerSqm: {
                    property1: p1PricePerSqm,
                    property2: p2PricePerSqm,
                    winner: p1PricePerSqm < p2PricePerSqm ? property1 : property2,
                },
                features: {
                    property1: p1FeatureScore,
                    property2: p2FeatureScore,
                    winner: p1FeatureScore > p2FeatureScore ? property1 : property2,
                },
                location: {
                    property1: property1.getAddress().getShortAddress(),
                    property2: property2.getAddress().getShortAddress(),
                },
            },
        };
    }

    private calculateFeatureScore(features: PropertyFeatures): number {
        let score = 0;

        // Base score from bedrooms and bathrooms
        score += features.bedrooms * 10;
        score += features.bathrooms * 8;

        // Area score (per 10 sqm)
        score += Math.floor(features.area / 10) * 2;

        // Parking score
        if (features.hasParking()) {
            score += features.getParkingSpaces() * 5;
        }

        // Amenities score
        score += features.amenities.length * 3;

        // Features score
        score += features.features.length * 2;

        // Luxury bonus
        if (features.isLuxury()) {
            score += 50;
        }

        return score;
    }

    private determineBetterValue(
        property1: Property,
        property2: Property,
        p1FeatureScore: number,
        p2FeatureScore: number
    ): Property | null {
        const p1ValueRatio = p1FeatureScore / property1.getPrice().amount * 1000000; // Normalize
        const p2ValueRatio = p2FeatureScore / property2.getPrice().amount * 1000000;

        if (Math.abs(p1ValueRatio - p2ValueRatio) < 0.1) {
            return null; // Too close to call
        }

        return p1ValueRatio > p2ValueRatio ? property1 : property2;
    }
}