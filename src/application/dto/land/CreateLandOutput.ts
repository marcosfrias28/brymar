import { Land } from '@/domain/land/entities/Land';

/**
 * Output DTO for land creation result
 */
export class CreateLandOutput {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly description: string,
        public readonly area: number,
        public readonly price: number,
        public readonly currency: string,
        public readonly location: string,
        public readonly type: string,
        public readonly status: string,
        public readonly features: string[],
        public readonly images: string[],
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) { }

    /**
     * Creates CreateLandOutput from a Land entity
     */
    static from(land: Land): CreateLandOutput {
        const price = land.getPrice();

        return new CreateLandOutput(
            land.getLandId().value,
            land.getTitle().value,
            land.getDescription().value,
            land.getArea().getValue(),
            price.amount,
            price.currency.code,
            land.getLocation().address,
            land.getType().value,
            land.getStatus().value,
            land.getFeatures().features,
            land.getImages().getUrls(),
            land.getCreatedAt(),
            land.getUpdatedAt()
        );
    }

    /**
     * Converts to JSON representation
     */
    toJSON(): object {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            area: this.area,
            price: this.price,
            currency: this.currency,
            location: this.location,
            type: this.type,
            status: this.status,
            features: this.features,
            images: this.images,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        };
    }
}