import { Land } from '@/domain/land/entities/Land';
import {
    LandId,
    LandDescription,
    LandArea,
    LandType,
    LandStatus,
    LandLocation,
    LandFeatures,
    LandImages
} from '@/domain/land/value-objects';
import { Price, LandPrice } from '@/domain/shared/value-objects/Price';
import { Title } from '@/domain/shared/value-objects/Title';
import { LandTitle } from '@/domain/land/value-objects/LandTitle';
import { InfrastructureError } from '@/domain/shared/errors/DomainError';

export interface DatabaseLandRow {
    id: number;
    name: string;
    description: string;
    area: number;
    price: number;
    location: string;
    type: string;
    images: any; // JSON field
    createdAt: Date;
    updatedAt?: Date | null;
}

export interface DomainLandData {
    id: LandId;
    title: Title;
    description: LandDescription;
    area: LandArea;
    price: Price;
    location: LandLocation;
    type: LandType;
    status: LandStatus;
    features: LandFeatures;
    images: LandImages;
    createdAt: Date;
    updatedAt: Date;
}

export class LandMapper {
    /**
     * Maps a domain Land entity to database row format
     */
    static toDatabase(land: Land): Omit<DatabaseLandRow, 'id'> & { id: string } {
        try {
            return {
                id: land.getLandId().value,
                name: land.getTitle().value,
                description: land.getDescription().value,
                area: land.getArea().getValue(),
                price: land.getPrice().amount,
                location: land.getLocation().getFormattedAddress(),
                type: land.getType().value,
                images: land.getImages().toJSON(),
                createdAt: land.getCreatedAt(),
                updatedAt: land.getUpdatedAt(),
            };
        } catch (error: any) {
            throw new InfrastructureError(`Failed to map land to database format: ${error.message}`);
        }
    }

    /**
     * Maps a database row to domain Land entity
     */
    static toDomain(row: DatabaseLandRow): Land {
        try {
            const domainData: DomainLandData = {
                id: LandId.create(row.id.toString()),
                title: LandTitle.create(row.name),
                description: LandDescription.create(row.description),
                area: LandArea.create(row.area),
                price: LandPrice.create(row.price, "USD"), // Default currency
                location: this.parseLocation(row.location),
                type: LandType.create(row.type),
                status: LandStatus.create("draft"), // Default status since not in DB
                features: LandFeatures.create([]), // Default empty features since not in DB
                images: LandImages.fromJSON(row.images || []),
                createdAt: row.createdAt,
                updatedAt: row.updatedAt || row.createdAt,
            };

            return Land.reconstitute(domainData);
        } catch (error: any) {
            throw new InfrastructureError(`Failed to map database row to land domain: ${error.message}`);
        }
    }

    /**
     * Maps multiple database rows to domain Land entities
     */
    static toDomainList(rows: DatabaseLandRow[]): Land[] {
        return rows.map(row => this.toDomain(row));
    }

    /**
     * Validates that a database row has all required fields
     */
    static validateDatabaseRow(row: any): row is DatabaseLandRow {
        const requiredFields = ['id', 'name', 'description', 'area', 'price', 'location', 'type', 'images', 'createdAt'];

        for (const field of requiredFields) {
            if (row[field] === undefined || row[field] === null) {
                return false;
            }
        }

        // Validate data types
        if (typeof row.id !== 'number') return false;
        if (typeof row.name !== 'string') return false;
        if (typeof row.description !== 'string') return false;
        if (typeof row.area !== 'number') return false;
        if (typeof row.price !== 'number') return false;
        if (typeof row.location !== 'string') return false;
        if (typeof row.type !== 'string') return false;
        if (!(row.createdAt instanceof Date)) return false;

        return true;
    }

    /**
     * Extracts search-friendly data from a Land entity
     */
    static toSearchData(land: Land): {
        id: string;
        title: string;
        description: string;
        location: string;
        type: string;
        status: string;
        area: number;
        price: number;
        pricePerSquareMeter: number;
        features: string[];
        images: string[];
        createdAt: Date;
        updatedAt: Date;
    } {
        return {
            id: land.getLandId().value,
            title: land.getTitle().value,
            description: land.getDescription().value,
            location: land.getLocation().getFormattedAddress(),
            type: land.getType().value,
            status: land.getStatus().value,
            area: land.getArea().getValue(),
            price: land.getPrice().amount,
            pricePerSquareMeter: land.getPricePerSquareMeter(),
            features: land.getFeatures().features,
            images: land.getImages().getUrls(),
            createdAt: land.getCreatedAt(),
            updatedAt: land.getUpdatedAt(),
        };
    }

    /**
     * Creates a partial database update object from a Land entity
     * Excludes id and createdAt which should not be updated
     */
    static toUpdateData(land: Land): Partial<DatabaseLandRow> {
        return {
            name: land.getTitle().value,
            description: land.getDescription().value,
            area: land.getArea().getValue(),
            price: land.getPrice().amount,
            location: land.getLocation().getFormattedAddress(),
            type: land.getType().value,
            images: land.getImages().toJSON(),
            updatedAt: land.getUpdatedAt(),
        };
    }

    /**
     * Maps form data to database format for draft saving
     */
    static formDataToDatabase(formData: Record<string, any>): Partial<DatabaseLandRow> {
        const mapped: Partial<DatabaseLandRow> = {};

        if (formData.name) mapped.name = formData.name;
        if (formData.description) mapped.description = formData.description;
        if (formData.area) mapped.area = Number(formData.area);
        if (formData.price) mapped.price = Number(formData.price);
        if (formData.location) mapped.location = formData.location;
        if (formData.type) mapped.type = formData.type;

        if (formData.images) mapped.images = Array.isArray(formData.images) ? formData.images : [];

        return mapped;
    }

    /**
     * Parse location from database - handle both JSON and string formats
     */
    private static parseLocation(locationData: string): LandLocation {
        try {
            // Try to parse as JSON first (new format with coordinates)
            const locationObj = JSON.parse(locationData);

            if (locationObj && typeof locationObj === 'object') {
                return LandLocation.createWithDetails(
                    locationObj.address || locationObj.street || 'Unknown Address',
                    locationObj.city,
                    locationObj.state || locationObj.province,
                    locationObj.country,
                    locationObj.coordinates
                );
            } else {
                throw new Error('Not JSON format');
            }
        } catch (error) {
            // Fallback to string parsing (legacy format)
            return LandLocation.create(locationData);
        }
    }

    /**
     * Extracts basic land information for search indexing
     */
    static toSearchIndex(land: Land): {
        id: string;
        searchText: string;
        location: string;
        type: string;
        status: string;
        priceRange: string;
        areaRange: string;
        features: string[];
    } {
        const price = land.getPrice().amount;
        const area = land.getArea().getValue();

        // Define price ranges
        let priceRange = "low";
        if (price > 100000) priceRange = "medium";
        if (price > 500000) priceRange = "high";
        if (price > 1000000) priceRange = "luxury";

        // Define area ranges
        let areaRange = "small";
        if (area > 1000) areaRange = "medium";
        if (area > 5000) areaRange = "large";
        if (area > 10000) areaRange = "extra-large";

        return {
            id: land.getLandId().value,
            searchText: `${land.getTitle().value} ${land.getDescription().value} ${land.getLocation().value}`.toLowerCase(),
            location: land.getLocation().getFormattedAddress(),
            type: land.getType().value,
            status: land.getStatus().value,
            priceRange,
            areaRange,
            features: land.getFeatures().features,
        };
    }
}