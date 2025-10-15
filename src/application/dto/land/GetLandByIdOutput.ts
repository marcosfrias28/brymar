import { Land } from "@/domain/land/entities/Land";

export class GetLandByIdOutput {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly description: string,
        public readonly area: number,
        public readonly price: number,
        public readonly currency: string,
        public readonly location: string,
        public readonly type: string,
        public readonly features: string[],
        public readonly images: string[],
        public readonly isActive: boolean,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) { }

    static fromLand(land: Land): GetLandByIdOutput {
        return new GetLandByIdOutput(
            land.getId().value,
            land.getTitle().value,
            land.getDescription().value,
            land.getArea().value,
            land.getPrice().amount,
            land.getPrice().currency.code,
            land.getLocation().getFormattedAddress(),
            land.getType().value,
            land.getFeatures().features || [],
            land.getImages().getUrls(),
            land.getStatus().isPublished(),
            land.getCreatedAt(),
            land.getUpdatedAt()
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

    getName(): { value: string } {
        return { value: this.name };
    }

    getPrice(): { value: number; currency: string } {
        return { value: this.price, currency: this.currency };
    }

    getArea(): { value: number } {
        return { value: this.area };
    }

    getType(): { value: string } {
        return { value: this.type };
    }

    getLocation(): { value: string } {
        return { value: this.location };
    }
}