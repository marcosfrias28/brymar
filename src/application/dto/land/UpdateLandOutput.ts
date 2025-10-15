import { Land } from '@/domain/land/entities/Land';

/**
 * Output DTO for land update result
 */
export class UpdateLandOutput {
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
        public readonly changes: string[],
        public readonly updatedAt: Date
    ) { }

    /**
     * Creates UpdateLandOutput from a Land entity and changes list
     */
    static from(land: Land, changes: string[]): UpdateLandOutput {
        const price = land.getPrice();

        return new UpdateLandOutput(
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
            changes,
            land.getUpdatedAt()
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

    getArea(): { value: number } {
        return { value: this.area };
    }

    getLocation(): { value: string } {
        return { value: this.location };
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
            changes: this.changes,
            updatedAt: this.updatedAt.toISOString(),
        };
    }
}