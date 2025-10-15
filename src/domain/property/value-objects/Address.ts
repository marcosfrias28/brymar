import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { BusinessRuleViolationError } from '@/domain/shared/errors/DomainError';

interface AddressData {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

export class Address extends ValueObject<AddressData> {
    private constructor(data: AddressData) {
        super(data);
    }

    static create(data: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode?: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        };
    }): Address {
        // Validate required fields
        if (!data.street || data.street.trim().length === 0) {
            throw new BusinessRuleViolationError("Street address is required", "PROPERTY_VALIDATION");
        }

        if (!data.city || data.city.trim().length === 0) {
            throw new BusinessRuleViolationError("City is required", "PROPERTY_VALIDATION");
        }

        if (!data.state || data.state.trim().length === 0) {
            throw new BusinessRuleViolationError("State is required", "PROPERTY_VALIDATION");
        }

        if (!data.country || data.country.trim().length === 0) {
            throw new BusinessRuleViolationError("Country is required", "PROPERTY_VALIDATION");
        }

        // Validate coordinates if provided
        if (data.coordinates) {
            const { latitude, longitude } = data.coordinates;

            if (latitude < -90 || latitude > 90) {
                throw new BusinessRuleViolationError("Latitude must be between -90 and 90 degrees", "PROPERTY_VALIDATION");
            }

            if (longitude < -180 || longitude > 180) {
                throw new BusinessRuleViolationError("Longitude must be between -180 and 180 degrees", "PROPERTY_VALIDATION");
            }
        }

        // Validate postal code format if provided
        if (data.postalCode && data.postalCode.trim().length > 0) {
            if (data.postalCode.trim().length < 3 || data.postalCode.trim().length > 10) {
                throw new BusinessRuleViolationError("Postal code must be between 3 and 10 characters", "PROPERTY_VALIDATION");
            }
        }

        return new Address({
            street: data.street.trim(),
            city: data.city.trim(),
            state: data.state.trim(),
            country: data.country.trim(),
            postalCode: data.postalCode?.trim(),
            coordinates: data.coordinates,
        });
    }

    static fromString(addressString: string): Address {
        // Simple parsing - in real implementation, you might use a geocoding service
        const parts = addressString.split(',').map(part => part.trim());

        if (parts.length < 3) {
            throw new BusinessRuleViolationError("Address string must contain at least street, city, and country", "PROPERTY_VALIDATION");
        }

        return Address.create({
            street: parts[0],
            city: parts[1],
            state: parts[2] || "",
            country: parts[3] || parts[2],
        });
    }

    static fromJSON(json: any): Address {
        if (typeof json === 'string') {
            return Address.fromString(json);
        }

        return Address.create({
            street: json.street,
            city: json.city,
            state: json.state,
            country: json.country,
            postalCode: json.postalCode,
            coordinates: json.coordinates,
        });
    }

    get street(): string {
        return this.value.street;
    }

    get city(): string {
        return this.value.city;
    }

    get state(): string {
        return this.value.state;
    }

    get country(): string {
        return this.value.country;
    }

    get postalCode(): string | undefined {
        return this.value.postalCode;
    }

    get coordinates(): { latitude: number; longitude: number } | undefined {
        return this.value.coordinates;
    }

    hasCoordinates(): boolean {
        return this.value.coordinates !== undefined;
    }

    getFullAddress(): string {
        const parts = [this.street, this.city, this.state, this.country];
        if (this.postalCode) {
            parts.splice(-1, 0, this.postalCode);
        }
        return parts.join(', ');
    }

    getShortAddress(): string {
        return `${this.city}, ${this.state}`;
    }

    isValid(): boolean {
        return this.street.length > 0 &&
            this.city.length > 0 &&
            this.state.length > 0 &&
            this.country.length > 0;
    }

    toJSON(): AddressData {
        return { ...this.value };
    }

    // Calculate distance to another address (if both have coordinates)
    distanceTo(other: Address): number | null {
        if (!this.hasCoordinates() || !other.hasCoordinates()) {
            return null;
        }

        const lat1 = this.coordinates!.latitude;
        const lon1 = this.coordinates!.longitude;
        const lat2 = other.coordinates!.latitude;
        const lon2 = other.coordinates!.longitude;

        // Haversine formula
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }
}