import { Property } from "@/domain/property/entities/Property";

export class GetPropertyByIdOutput {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly description: string,
        public readonly price: number,
        public readonly propertyType: string,
        public readonly status: string,
        public readonly features: string[],
        public readonly images: string[],
        public readonly isActive: boolean,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) { }

    static fromProperty(property: Property): GetPropertyByIdOutput {
        return new GetPropertyByIdOutput(
            property.getId().value,
            property.getTitle().value,
            property.getDescription().value,
            property.getPrice().amount,
            property.getType().value,
            property.getStatus().value,
            property.getFeatures().amenities,
            property.getImages(),
            property.isActive(),
            property.getCreatedAt(),
            property.getUpdatedAt()
        );
    }

    static fromNull(): null {
        return null;
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

    getPrice(): { value: number } {
        return { value: this.price };
    }

    getStatus(): { value: string } {
        return { value: this.status };
    }

    getType(): { value: string } {
        return { value: this.propertyType };
    }
}