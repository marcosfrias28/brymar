import { Property } from '@/domain/property/entities/Property';

/**
 * Output DTO for property update result
 */
export class UpdatePropertyOutput {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly description: string,
        public readonly price: number,
        public readonly currency: string,
        public readonly address: {
            street: string;
            city: string;
            state: string;
            country: string;
            postalCode?: string;
            coordinates?: {
                latitude: number;
                longitude: number;
            };
        },
        public readonly type: string,
        public readonly status: string,
        public readonly features: {
            bedrooms: number;
            bathrooms: number;
            area: number;
            amenities?: string[];
            features?: string[];
            parking?: {
                spaces: number;
                type: string;
            };
            yearBuilt?: number;
            lotSize?: number;
        },
        public readonly images: string[],
        public readonly featured: boolean,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public readonly changes: string[]
    ) { }

    /**
     * Creates UpdatePropertyOutput from a Property entity
     */
    static from(property: Property, changes: string[] = []): UpdatePropertyOutput {
        const address = property.getAddress();
        const features = property.getFeatures();
        const price = property.getPrice();

        return new UpdatePropertyOutput(
            property.getId().value,
            property.getTitle().value,
            property.getDescription().value,
            price.amount,
            price.currency.code,
            {
                street: address.street,
                city: address.city,
                state: address.state,
                country: address.country,
                postalCode: address.postalCode,
                coordinates: address.coordinates ? {
                    latitude: address.coordinates.latitude,
                    longitude: address.coordinates.longitude,
                } : undefined,
            },
            property.getType().value,
            property.getStatus().value,
            {
                bedrooms: features.bedrooms,
                bathrooms: features.bathrooms,
                area: features.area,
                amenities: features.amenities,
                features: features.features,
                parking: features.parking ? {
                    spaces: features.parking.spaces,
                    type: features.parking.type,
                } : undefined,
                yearBuilt: features.yearBuilt,
                lotSize: features.lotSize,
            },
            property.getImages(),
            property.isFeatured(),
            property.getCreatedAt(),
            property.getUpdatedAt(),
            changes
        );
    }

    /**
     * Frontend compatibility methods
     */
    getId(): { value: string } {
        return { value: this.id };
    }

    getTitle(): { value: string } {
        return { value: this.title };
    }

    getPrice(): { value: number; currency: string } {
        return { value: this.price, currency: this.currency };
    }

    getStatus(): { value: string } {
        return { value: this.status };
    }

    getType(): { value: string } {
        return { value: this.type };
    }

    /**
     * Converts to JSON representation
     */
    toJSON(): object {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            price: this.price,
            currency: this.currency,
            address: this.address,
            type: this.type,
            status: this.status,
            features: this.features,
            images: this.images,
            featured: this.featured,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            changes: this.changes,
        };
    }
}