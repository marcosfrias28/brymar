import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

interface LandLocationData {
    address: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    city?: string;
    province?: string;
    country?: string;
}

export class LandLocation extends ValueObject<LandLocationData> {
    private static readonly MIN_ADDRESS_LENGTH = 5;
    private static readonly MAX_ADDRESS_LENGTH = 200;

    private constructor(data: LandLocationData) {
        super(data);
    }

    static create(address: string, coordinates?: { latitude: number; longitude: number }): LandLocation {
        if (!address || address.trim().length === 0) {
            throw new ValueObjectValidationError("Land location address cannot be empty");
        }

        const trimmedAddress = address.trim();

        if (trimmedAddress.length < this.MIN_ADDRESS_LENGTH) {
            throw new ValueObjectValidationError(`Land location address must be at least ${this.MIN_ADDRESS_LENGTH} characters long`);
        }

        if (trimmedAddress.length > this.MAX_ADDRESS_LENGTH) {
            throw new ValueObjectValidationError(`Land location address cannot exceed ${this.MAX_ADDRESS_LENGTH} characters`);
        }

        // Validate coordinates if provided
        if (coordinates) {
            this.validateCoordinates(coordinates.latitude, coordinates.longitude);
        }

        return new LandLocation({
            address: trimmedAddress,
            coordinates,
            country: "Dominican Republic" // Default for this real estate platform
        });
    }

    static createWithDetails(
        address: string,
        city?: string,
        province?: string,
        country?: string,
        coordinates?: { latitude: number; longitude: number }
    ): LandLocation {
        if (!address || address.trim().length === 0) {
            throw new ValueObjectValidationError("Land location address cannot be empty");
        }

        const trimmedAddress = address.trim();

        if (trimmedAddress.length < this.MIN_ADDRESS_LENGTH) {
            throw new ValueObjectValidationError(`Land location address must be at least ${this.MIN_ADDRESS_LENGTH} characters long`);
        }

        if (trimmedAddress.length > this.MAX_ADDRESS_LENGTH) {
            throw new ValueObjectValidationError(`Land location address cannot exceed ${this.MAX_ADDRESS_LENGTH} characters`);
        }

        // Validate coordinates if provided
        if (coordinates) {
            this.validateCoordinates(coordinates.latitude, coordinates.longitude);
        }

        return new LandLocation({
            address: trimmedAddress,
            coordinates,
            city: city?.trim(),
            province: province?.trim(),
            country: country?.trim() || "Dominican Republic"
        });
    }

    private static validateCoordinates(latitude: number, longitude: number): void {
        if (typeof latitude !== 'number' || isNaN(latitude)) {
            throw new ValueObjectValidationError("Latitude must be a valid number");
        }

        if (typeof longitude !== 'number' || isNaN(longitude)) {
            throw new ValueObjectValidationError("Longitude must be a valid number");
        }

        if (latitude < -90 || latitude > 90) {
            throw new ValueObjectValidationError("Latitude must be between -90 and 90 degrees");
        }

        if (longitude < -180 || longitude > 180) {
            throw new ValueObjectValidationError("Longitude must be between -180 and 180 degrees");
        }

        // Business rule: For Dominican Republic, validate approximate bounds
        // DR is roughly between 17.5°N to 19.9°N and 68.3°W to 71.9°W
        if (latitude < 17.0 || latitude > 20.0) {
            // Note: Latitude appears to be outside Dominican Republic bounds
        }

        if (longitude < -72.0 || longitude > -68.0) {
            // Note: Longitude appears to be outside Dominican Republic bounds
        }
    }

    get address(): string {
        return this._value.address;
    }

    get coordinates(): { latitude: number; longitude: number } | undefined {
        return this._value.coordinates;
    }

    get city(): string | undefined {
        return this._value.city;
    }

    get province(): string | undefined {
        return this._value.province;
    }

    get country(): string | undefined {
        return this._value.country;
    }

    isValid(): boolean {
        return (
            this._value.address.length >= LandLocation.MIN_ADDRESS_LENGTH &&
            this._value.address.length <= LandLocation.MAX_ADDRESS_LENGTH
        );
    }

    hasCoordinates(): boolean {
        return this._value.coordinates !== undefined;
    }

    getFormattedAddress(): string {
        const parts = [this._value.address];

        if (this._value.city) {
            parts.push(this._value.city);
        }

        if (this._value.province) {
            parts.push(this._value.province);
        }

        if (this._value.country) {
            parts.push(this._value.country);
        }

        return parts.join(", ");
    }

    getShortAddress(): string {
        const parts = [];

        if (this._value.city) {
            parts.push(this._value.city);
        }

        if (this._value.province) {
            parts.push(this._value.province);
        }

        return parts.length > 0 ? parts.join(", ") : this._value.address;
    }

    // Calculate distance to another location (Haversine formula)
    distanceTo(other: LandLocation): number | null {
        if (!this.hasCoordinates() || !other.hasCoordinates()) {
            return null;
        }

        const coords1 = this._value.coordinates!;
        const coords2 = other._value.coordinates!;

        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(coords2.latitude - coords1.latitude);
        const dLon = this.toRadians(coords2.longitude - coords1.longitude);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(coords1.latitude)) * Math.cos(this.toRadians(coords2.latitude)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in kilometers
    }

    private toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    // Check if location is in a specific city
    isInCity(cityName: string): boolean {
        if (!this._value.city) {
            return this._value.address.toLowerCase().includes(cityName.toLowerCase());
        }
        return this._value.city.toLowerCase().includes(cityName.toLowerCase());
    }

    // Check if location is in a specific province
    isInProvince(provinceName: string): boolean {
        if (!this._value.province) {
            return this._value.address.toLowerCase().includes(provinceName.toLowerCase());
        }
        return this._value.province.toLowerCase().includes(provinceName.toLowerCase());
    }

    // Get Google Maps URL
    getGoogleMapsUrl(): string {
        if (this.hasCoordinates()) {
            const coords = this._value.coordinates!;
            return `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;
        }
        return `https://www.google.com/maps/search/${encodeURIComponent(this.getFormattedAddress())}`;
    }

    // Convert to JSON for storage
    toJSON(): LandLocationData {
        return { ...this._value };
    }

    static fromJSON(data: LandLocationData): LandLocation {
        return new LandLocation(data);
    }
}