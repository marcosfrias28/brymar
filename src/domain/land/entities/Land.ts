import { AggregateRoot } from '@/domain/shared/entities/AggregateRoot';
import { BusinessRuleViolationError, EntityValidationError } from '@/domain/shared/errors/DomainError';
import {
    LandId,
    LandTitle,
    LandDescription,
    LandArea,
    LandPrice,
    LandType,
    LandStatus,
    LandLocation,
    LandFeatures,
    LandImages
} from '@/domain/land/value-objects';

export interface CreateLandData {
    name: string;
    description: string;
    area: number;
    price: number;
    currency?: string;
    location: string;
    type: string;
    features?: string[];
    images?: string[];
}

export interface LandData {
    id: LandId;
    title: LandTitle;
    description: LandDescription;
    area: LandArea;
    price: LandPrice;
    location: LandLocation;
    type: LandType;
    status: LandStatus;
    features: LandFeatures;
    images: LandImages;
    createdAt: Date;
    updatedAt: Date;
}

export class Land extends AggregateRoot {
    private readonly landId: LandId;

    private constructor(
        id: LandId,
        private title: LandTitle,
        private description: LandDescription,
        private area: LandArea,
        private price: LandPrice,
        private location: LandLocation,
        private type: LandType,
        private status: LandStatus,
        private features: LandFeatures,
        private images: LandImages,
        createdAt: Date,
        updatedAt: Date
    ) {
        super(id.value, createdAt, updatedAt);
        this.landId = id;
    }

    static create(data: CreateLandData): Land {
        // Domain validation and business rules
        const id = LandId.generate();
        const title = LandTitle.create(data.name);
        const description = LandDescription.create(data.description);
        const area = LandArea.create(data.area);
        const price = LandPrice.create(data.price, data.currency || "USD");
        const location = LandLocation.create(data.location);
        const type = LandType.create(data.type);
        const status = LandStatus.draft();
        const features = LandFeatures.create(data.features || []);
        const images = LandImages.create(data.images || []);

        const now = new Date();

        return new Land(
            id,
            title,
            description,
            area,
            price,
            location,
            type,
            status,
            features,
            images,
            now,
            now
        );
    }

    static reconstitute(data: LandData): Land {
        return new Land(
            data.id,
            data.title,
            data.description,
            data.area,
            data.price,
            data.location,
            data.type,
            data.status,
            data.features,
            data.images,
            data.createdAt,
            data.updatedAt
        );
    }

    // Business methods
    updatePrice(newPrice: LandPrice): void {
        // Business rule: Significant price changes on published lands require validation
        if (this.status.isPublished() && this.price.isSignificantlyDifferent(newPrice)) {
            throw new BusinessRuleViolationError("Significant price changes on published lands require approval", 'PUBLISHED_LAND_PRICE_CHANGE');
        }

        this.price = newPrice;
        this.touchEntity();
    }

    updateArea(newArea: LandArea): void {
        // Business rule: Area changes affect price per square meter calculations
        if (this.status.isPublished() && !this.area.equals(newArea)) {
            throw new BusinessRuleViolationError("Area changes on published lands require approval", 'PUBLISHED_LAND_AREA_CHANGE');
        }

        this.area = newArea;
        this.touchEntity();
    }

    updateTitle(newTitle: LandTitle): void {
        this.title = newTitle;
        this.touchEntity();
    }

    updateDescription(newDescription: LandDescription): void {
        this.description = newDescription;
        this.touchEntity();
    }

    updateLocation(newLocation: LandLocation): void {
        this.location = newLocation;
        this.touchEntity();
    }

    updateType(newType: LandType): void {
        // Business rule: Type changes may affect zoning and pricing rules
        if (this.status.isPublished() && !this.type.equals(newType)) {
            throw new BusinessRuleViolationError("Land type changes on published lands require approval", 'PUBLISHED_LAND_TYPE_CHANGE');
        }

        this.type = newType;
        this.touchEntity();
    }

    addFeature(feature: string): void {
        this.features = this.features.addFeature(feature);
        this.touchEntity();
    }

    removeFeature(feature: string): void {
        this.features = this.features.removeFeature(feature);
        this.touchEntity();
    }

    addImage(imageUrl: string): void {
        this.images = this.images.addImage(imageUrl);
        this.touchEntity();
    }

    removeImage(imageUrl: string): void {
        this.images = this.images.removeImage(imageUrl);
        this.touchEntity();
    }

    publish(): void {
        // Business rule: Land must be complete to publish
        if (!this.isComplete()) {
            throw new BusinessRuleViolationError("Land must be complete before publishing", 'INCOMPLETE_LAND_PUBLISH');
        }

        this.status = LandStatus.published();
        this.touchEntity();
    }

    unpublish(): void {
        this.status = LandStatus.draft();
        this.touchEntity();
    }

    archive(): void {
        this.status = LandStatus.archived();
        this.touchEntity();
    }

    // Query methods
    isComplete(): boolean {
        return (
            this.title.isValid() &&
            this.description.isValid() &&
            this.area.isValid() &&
            this.price.isValid() &&
            this.location.isValid() &&
            this.type.isValid()
        );
    }

    isNew(): boolean {
        return this.getCreatedAt().getTime() === this.getUpdatedAt().getTime();
    }

    getPricePerSquareMeter(): number {
        return this.price.getPricePerUnit(this.area.getValue());
    }

    getAreaInHectares(): number {
        return this.area.toHectares();
    }

    getAreaInTareas(): number {
        return this.area.toTareas();
    }

    // Getters
    getLandId(): LandId {
        return this.landId;
    }

    getTitle(): LandTitle {
        return this.title;
    }

    getDescription(): LandDescription {
        return this.description;
    }

    getArea(): LandArea {
        return this.area;
    }

    getPrice(): LandPrice {
        return this.price;
    }

    getLocation(): LandLocation {
        return this.location;
    }

    getType(): LandType {
        return this.type;
    }

    getStatus(): LandStatus {
        return this.status;
    }

    getFeatures(): LandFeatures {
        return this.features;
    }

    getImages(): LandImages {
        return this.images;
    }

    private touchEntity(): void {
        this.touch();
    }
}