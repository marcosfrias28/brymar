import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { BusinessRuleViolationError } from '@/domain/shared/errors/DomainError';

interface PropertyFeaturesData {
    bedrooms: number;
    bathrooms: number;
    area: number; // in square meters
    amenities: string[];
    features: string[];
    parking?: {
        spaces: number;
        type: 'garage' | 'carport' | 'street' | 'covered';
    };
    yearBuilt?: number;
    lotSize?: number; // in square meters
}

export class PropertyFeatures extends ValueObject<PropertyFeaturesData> {
    private static readonly MIN_AREA = 1;
    private static readonly MAX_AREA = 10000; // 10,000 sqm
    private static readonly MIN_YEAR = 1800;
    private static readonly MAX_YEAR = new Date().getFullYear() + 2; // Allow 2 years in future for new construction

    private constructor(data: PropertyFeaturesData) {
        super(data);
    }

    static create(data: {
        bedrooms: number;
        bathrooms: number;
        area: number;
        amenities?: string[];
        features?: string[];
        parking?: {
            spaces: number;
            type: 'garage' | 'carport' | 'street' | 'covered';
        };
        yearBuilt?: number;
        lotSize?: number;
    }): PropertyFeatures {
        // Validate bedrooms
        if (data.bedrooms < 0) {
            throw new BusinessRuleViolationError("Bedrooms cannot be negative", "PROPERTY_VALIDATION");
        }
        if (data.bedrooms > 20) {
            throw new BusinessRuleViolationError("Bedrooms cannot exceed 20", "PROPERTY_VALIDATION");
        }

        // Validate bathrooms
        if (data.bathrooms < 0) {
            throw new BusinessRuleViolationError("Bathrooms cannot be negative", "PROPERTY_VALIDATION");
        }
        if (data.bathrooms > 20) {
            throw new BusinessRuleViolationError("Bathrooms cannot exceed 20", "PROPERTY_VALIDATION");
        }

        // Validate area
        if (data.area < this.MIN_AREA) {
            throw new BusinessRuleViolationError(`Area must be at least ${this.MIN_AREA} square meters`, "PROPERTY_VALIDATION");
        }
        if (data.area > this.MAX_AREA) {
            throw new BusinessRuleViolationError(`Area cannot exceed ${this.MAX_AREA} square meters`, "PROPERTY_VALIDATION");
        }

        // Validate year built if provided
        if (data.yearBuilt !== undefined) {
            if (data.yearBuilt < this.MIN_YEAR || data.yearBuilt > this.MAX_YEAR) {
                throw new BusinessRuleViolationError(`Year built must be between ${this.MIN_YEAR} and ${this.MAX_YEAR}`, "PROPERTY_VALIDATION");
            }
        }

        // Validate lot size if provided
        if (data.lotSize !== undefined) {
            if (data.lotSize < 0) {
                throw new BusinessRuleViolationError("Lot size cannot be negative", "PROPERTY_VALIDATION");
            }
            if (data.lotSize > 100000) { // 10 hectares
                throw new BusinessRuleViolationError("Lot size cannot exceed 100,000 square meters", "PROPERTY_VALIDATION");
            }
        }

        // Validate parking if provided
        if (data.parking) {
            if (data.parking.spaces < 0) {
                throw new BusinessRuleViolationError("Parking spaces cannot be negative", "PROPERTY_VALIDATION");
            }
            if (data.parking.spaces > 20) {
                throw new BusinessRuleViolationError("Parking spaces cannot exceed 20", "PROPERTY_VALIDATION");
            }
        }

        // Clean and validate amenities and features
        const cleanAmenities = (data.amenities || [])
            .map(amenity => amenity.trim())
            .filter(amenity => amenity.length > 0);

        const cleanFeatures = (data.features || [])
            .map(feature => feature.trim())
            .filter(feature => feature.length > 0);

        return new PropertyFeatures({
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            area: data.area,
            amenities: cleanAmenities,
            features: cleanFeatures,
            parking: data.parking,
            yearBuilt: data.yearBuilt,
            lotSize: data.lotSize,
        });
    }

    static fromJSON(json: any): PropertyFeatures {
        return PropertyFeatures.create({
            bedrooms: json.bedrooms || 0,
            bathrooms: json.bathrooms || 0,
            area: json.area || 0,
            amenities: json.amenities || [],
            features: json.features || [],
            parking: json.parking,
            yearBuilt: json.yearBuilt,
            lotSize: json.lotSize,
        });
    }

    get bedrooms(): number {
        return this.value.bedrooms;
    }

    get bathrooms(): number {
        return this.value.bathrooms;
    }

    get area(): number {
        return this.value.area;
    }

    get amenities(): string[] {
        return [...this.value.amenities];
    }

    get features(): string[] {
        return [...this.value.features];
    }

    get parking(): { spaces: number; type: string } | undefined {
        return this.value.parking ? { ...this.value.parking } : undefined;
    }

    get yearBuilt(): number | undefined {
        return this.value.yearBuilt;
    }

    get lotSize(): number | undefined {
        return this.value.lotSize;
    }

    hasAmenity(amenity: string): boolean {
        return this.value.amenities.some(a =>
            a.toLowerCase().includes(amenity.toLowerCase())
        );
    }

    hasFeature(feature: string): boolean {
        return this.value.features.some(f =>
            f.toLowerCase().includes(feature.toLowerCase())
        );
    }

    hasParking(): boolean {
        return this.value.parking !== undefined && this.value.parking.spaces > 0;
    }

    getParkingSpaces(): number {
        return this.value.parking?.spaces || 0;
    }

    getAge(): number | null {
        if (!this.value.yearBuilt) return null;
        return new Date().getFullYear() - this.value.yearBuilt;
    }

    isNewConstruction(): boolean {
        const age = this.getAge();
        return age !== null && age <= 2;
    }

    getAreaInSquareFeet(): number {
        // Convert square meters to square feet
        return Math.round(this.value.area * 10.764);
    }

    getLotSizeInSquareFeet(): number | undefined {
        if (!this.value.lotSize) return undefined;
        return Math.round(this.value.lotSize * 10.764);
    }

    // Calculate price per square meter
    getPricePerSquareMeter(totalPrice: number): number {
        return Math.round(totalPrice / this.value.area);
    }

    // Calculate price per square foot
    getPricePerSquareFoot(totalPrice: number): number {
        const areaInSqFt = this.getAreaInSquareFeet();
        return Math.round(totalPrice / areaInSqFt);
    }

    // Check if property is suitable for families
    isFamilyFriendly(): boolean {
        return this.value.bedrooms >= 2 && this.value.bathrooms >= 1;
    }

    // Check if property is luxury based on features
    isLuxury(): boolean {
        const luxuryAmenities = [
            'pool', 'spa', 'wine cellar', 'home theater', 'elevator',
            'smart home', 'concierge', 'valet', 'gym', 'sauna'
        ];

        const luxuryFeatures = [
            'marble', 'granite', 'hardwood', 'crown molding',
            'high ceilings', 'gourmet kitchen', 'master suite'
        ];

        const hasLuxuryAmenities = luxuryAmenities.some(amenity => this.hasAmenity(amenity));
        const hasLuxuryFeatures = luxuryFeatures.some(feature => this.hasFeature(feature));
        const isLargeProperty = this.value.area > 300; // 300+ sqm
        const hasMultipleBathrooms = this.value.bathrooms >= 3;

        return (hasLuxuryAmenities || hasLuxuryFeatures) &&
            (isLargeProperty || hasMultipleBathrooms);
    }

    addAmenity(amenity: string): PropertyFeatures {
        if (!amenity || amenity.trim().length === 0) {
            throw new BusinessRuleViolationError("Amenity cannot be empty", "PROPERTY_VALIDATION");
        }

        const trimmedAmenity = amenity.trim();
        if (this.hasAmenity(trimmedAmenity)) {
            return this; // Already exists
        }

        return PropertyFeatures.create({
            ...this.value,
            amenities: [...this.value.amenities, trimmedAmenity],
        });
    }

    removeAmenity(amenity: string): PropertyFeatures {
        return PropertyFeatures.create({
            ...this.value,
            amenities: this.value.amenities.filter(a =>
                !a.toLowerCase().includes(amenity.toLowerCase())
            ),
        });
    }

    addFeature(feature: string): PropertyFeatures {
        if (!feature || feature.trim().length === 0) {
            throw new BusinessRuleViolationError("Feature cannot be empty", "PROPERTY_VALIDATION");
        }

        const trimmedFeature = feature.trim();
        if (this.hasFeature(trimmedFeature)) {
            return this; // Already exists
        }

        return PropertyFeatures.create({
            ...this.value,
            features: [...this.value.features, trimmedFeature],
        });
    }

    removeFeature(feature: string): PropertyFeatures {
        return PropertyFeatures.create({
            ...this.value,
            features: this.value.features.filter(f =>
                !f.toLowerCase().includes(feature.toLowerCase())
            ),
        });
    }

    toJSON(): PropertyFeaturesData {
        return { ...this.value };
    }

    isValid(): boolean {
        return this.value.area >= PropertyFeatures.MIN_AREA &&
            this.value.area <= PropertyFeatures.MAX_AREA &&
            this.value.bedrooms >= 0 &&
            this.value.bathrooms >= 0;
    }
}