import { AggregateRoot } from '@/domain/shared/entities/AggregateRoot';
import { PropertyId } from "../value-objects/PropertyId";
import { PropertyTitle } from "../value-objects/PropertyTitle";
import { PropertyDescription } from "../value-objects/PropertyDescription";
import { Price } from "../value-objects/Price";
import { Address } from "../value-objects/Address";
import { PropertyType } from "../value-objects/PropertyType";
import { PropertyStatus } from "../value-objects/PropertyStatus";
import { PropertyFeatures } from "../value-objects/PropertyFeatures";
import { BusinessRuleViolationError } from '@/domain/shared/errors/DomainError';

export interface CreatePropertyData {
    title: string;
    description: string;
    price: number;
    currency?: string;
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode?: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        };
    };
    type: string;
    features: {
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
    };
    images?: string[];
    featured?: boolean;
}

export interface PropertyData {
    id: PropertyId;
    title: PropertyTitle;
    description: PropertyDescription;
    price: Price;
    address: Address;
    type: PropertyType;
    status: PropertyStatus;
    features: PropertyFeatures;
    images: string[];
    featured: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class Property extends AggregateRoot {
    private constructor(
        id: PropertyId,
        private title: PropertyTitle,
        private description: PropertyDescription,
        private price: Price,
        private address: Address,
        private type: PropertyType,
        private status: PropertyStatus,
        private features: PropertyFeatures,
        private images: string[],
        private featured: boolean,
        createdAt: Date,
        updatedAt: Date
    ) {
        super(id, createdAt, updatedAt);
    }

    static create(data: CreatePropertyData): Property {
        // Create value objects with validation
        const id = PropertyId.generate();
        const title = PropertyTitle.create(data.title);
        const description = PropertyDescription.create(data.description);
        const price = Price.create(data.price, data.currency);
        const address = Address.create(data.address);
        const type = PropertyType.create(data.type);
        const status = PropertyStatus.draft(); // New properties start as draft
        const features = PropertyFeatures.create(data.features);

        // Validate business rules
        Property.validateBusinessRules(type, features, price);

        const now = new Date();

        return new Property(
            id,
            title,
            description,
            price,
            address,
            type,
            status,
            features,
            data.images || [],
            data.featured || false,
            now,
            now
        );
    }

    static reconstitute(data: PropertyData): Property {
        return new Property(
            data.id,
            data.title,
            data.description,
            data.price,
            data.address,
            data.type,
            data.status,
            data.features,
            data.images,
            data.featured,
            data.createdAt,
            data.updatedAt
        );
    }

    private static validateBusinessRules(
        type: PropertyType,
        features: PropertyFeatures,
        price: Price
    ): void {
        // Business rule: Residential properties must have at least 1 bedroom and 1 bathroom
        if (type.isResidential() && type.requiresBedrooms()) {
            if (features.bedrooms === 0) {
                throw new BusinessRuleViolationError("Residential properties must have at least 1 bedroom", "PROPERTY_VALIDATION");
            }
            if (features.bathrooms === 0) {
                throw new BusinessRuleViolationError("Residential properties must have at least 1 bathroom", "PROPERTY_VALIDATION");
            }
        }

        // Business rule: Price must be reasonable for property type
        if (type.isLand() && price.amount < 1000) {
            throw new BusinessRuleViolationError("Land properties must have a minimum price of $1,000", "PROPERTY_VALIDATION");
        }

        if (type.isResidential() && price.amount < 10000) {
            throw new BusinessRuleViolationError("Residential properties must have a minimum price of $10,000", "PROPERTY_VALIDATION");
        }

        // Business rule: Large properties should have multiple bathrooms
        if (features.area > 200 && features.bathrooms < 2) {
            // This is a warning, not an error - could be logged or handled differently
            // Note: Large properties (>200 sqm) typically have multiple bathrooms
        }
    }

    // Getters
    getId(): PropertyId {
        return this.id as PropertyId;
    }

    getTitle(): PropertyTitle {
        return this.title;
    }

    getDescription(): PropertyDescription {
        return this.description;
    }

    getPrice(): Price {
        return this.price;
    }

    getAddress(): Address {
        return this.address;
    }

    getType(): PropertyType {
        return this.type;
    }

    getStatus(): PropertyStatus {
        return this.status;
    }

    getFeatures(): PropertyFeatures {
        return this.features;
    }

    getImages(): string[] {
        return [...this.images];
    }

    isFeatured(): boolean {
        return this.featured;
    }

    // Business methods
    updateTitle(newTitle: string): void {
        if (!this.status.canBeEdited()) {
            throw new BusinessRuleViolationError(`Cannot update title when property status is ${this.status.getDisplayName()}`, "PROPERTY_VALIDATION");
        }

        this.title = PropertyTitle.create(newTitle);
        this.touch();
    }

    updateDescription(newDescription: string): void {
        if (!this.status.canBeEdited()) {
            throw new BusinessRuleViolationError(`Cannot update description when property status is ${this.status.getDisplayName()}`, "PROPERTY_VALIDATION");
        }

        this.description = PropertyDescription.create(newDescription);
        this.touch();
    }

    updatePrice(newPrice: number, currency?: string): void {
        if (!this.status.canBeEdited()) {
            throw new BusinessRuleViolationError(`Cannot update price when property status is ${this.status.getDisplayName()}`, "PROPERTY_VALIDATION");
        }

        const price = Price.create(newPrice, currency || this.price.currency.code);

        // Business rule: Significant price changes on published properties require approval
        if (this.status.isPublished() && this.price.isSignificantlyDifferent(price, 0.15)) {
            throw new BusinessRuleViolationError("Significant price changes on published properties require approval", "PROPERTY_VALIDATION");
        }

        this.price = price;
        this.touch();
    }

    updateAddress(newAddress: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode?: string;
        coordinates?: { latitude: number; longitude: number };
    }): void {
        if (!this.status.canBeEdited()) {
            throw new BusinessRuleViolationError(`Cannot update address when property status is ${this.status.getDisplayName()}`, "PROPERTY_VALIDATION");
        }

        this.address = Address.create(newAddress);
        this.touch();
    }

    updateFeatures(newFeatures: {
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
    }): void {
        if (!this.status.canBeEdited()) {
            throw new BusinessRuleViolationError(`Cannot update features when property status is ${this.status.getDisplayName()}`, "PROPERTY_VALIDATION");
        }

        const features = PropertyFeatures.create(newFeatures);

        // Validate business rules with new features
        Property.validateBusinessRules(this.type, features, this.price);

        this.features = features;
        this.touch();
    }

    addImage(imageUrl: string): void {
        if (!imageUrl || imageUrl.trim().length === 0) {
            throw new BusinessRuleViolationError("Image URL cannot be empty", "PROPERTY_VALIDATION");
        }

        if (this.images.includes(imageUrl)) {
            return; // Already exists
        }

        if (this.images.length >= 20) {
            throw new BusinessRuleViolationError("Cannot add more than 20 images to a property", "PROPERTY_VALIDATION");
        }

        this.images.push(imageUrl);
        this.touch();
    }

    removeImage(imageUrl: string): void {
        const index = this.images.indexOf(imageUrl);
        if (index === -1) {
            return; // Image not found
        }

        this.images.splice(index, 1);
        this.touch();
    }

    reorderImages(newOrder: string[]): void {
        // Validate that all images in newOrder exist in current images
        const currentImageSet = new Set(this.images);
        const newOrderSet = new Set(newOrder);

        if (currentImageSet.size !== newOrderSet.size) {
            throw new BusinessRuleViolationError("New image order must contain all current images", "PROPERTY_VALIDATION");
        }

        for (const image of newOrder) {
            if (!currentImageSet.has(image)) {
                throw new BusinessRuleViolationError(`Image ${image} not found in current images`, "PROPERTY_VALIDATION");
            }
        }

        this.images = [...newOrder];
        this.touch();
    }

    setFeatured(featured: boolean): void {
        this.featured = featured;
        this.touch();
    }

    // Status transitions
    publish(): void {
        if (!this.canBePublished()) {
            throw new BusinessRuleViolationError("Property cannot be published in its current state", "PROPERTY_VALIDATION");
        }

        this.status = this.status.transitionTo(PropertyStatus.published());
        this.touch();
    }

    withdraw(): void {
        if (!this.status.canBeWithdrawn()) {
            throw new BusinessRuleViolationError(`Cannot withdraw property with status ${this.status.getDisplayName()}`, "PROPERTY_VALIDATION");
        }

        this.status = this.status.transitionTo(PropertyStatus.withdrawn());
        this.touch();
    }

    markAsSold(): void {
        if (!this.status.isPublished()) {
            throw new BusinessRuleViolationError("Only published properties can be marked as sold", "PROPERTY_VALIDATION");
        }

        this.status = this.status.transitionTo(PropertyStatus.sold());
        this.touch();
    }

    markAsRented(): void {
        if (!this.status.isPublished()) {
            throw new BusinessRuleViolationError("Only published properties can be marked as rented", "PROPERTY_VALIDATION");
        }

        this.status = this.status.transitionTo(PropertyStatus.rented());
        this.touch();
    }

    archive(): void {
        if (!this.status.canBeArchived()) {
            throw new BusinessRuleViolationError(`Cannot archive property with status ${this.status.getDisplayName()}`, "PROPERTY_VALIDATION");
        }

        this.status = this.status.transitionTo(PropertyStatus.archived());
        this.touch();
    }

    // Query methods
    canBePublished(): boolean {
        return this.status.canBePublished() &&
            this.isComplete() &&
            this.hasRequiredImages();
    }

    isComplete(): boolean {
        return this.title.isValid() &&
            this.description.isValid() &&
            this.price.isValid() &&
            this.address.isValid() &&
            this.features.isValid();
    }

    hasRequiredImages(): boolean {
        return this.images.length > 0;
    }

    isAvailable(): boolean {
        return this.status.isAvailable();
    }

    isActive(): boolean {
        return this.status.isActive();
    }

    getPricePerSquareMeter(): number {
        return this.features.getPricePerSquareMeter(this.price.amount);
    }

    getPricePerSquareFoot(): number {
        return this.features.getPricePerSquareFoot(this.price.amount);
    }

    isLuxury(): boolean {
        return this.features.isLuxury() || this.price.amount > 1_000_000;
    }

    isFamilyFriendly(): boolean {
        return this.features.isFamilyFriendly();
    }

    getAge(): number | null {
        return this.features.getAge();
    }

    // Search and filtering helpers
    matchesSearchCriteria(criteria: {
        minPrice?: number;
        maxPrice?: number;
        minBedrooms?: number;
        maxBedrooms?: number;
        minBathrooms?: number;
        maxBathrooms?: number;
        minArea?: number;
        maxArea?: number;
        propertyTypes?: string[];
        amenities?: string[];
        location?: string;
    }): boolean {
        // Price range
        if (criteria.minPrice && this.price.amount < criteria.minPrice) return false;
        if (criteria.maxPrice && this.price.amount > criteria.maxPrice) return false;

        // Bedrooms range
        if (criteria.minBedrooms && this.features.bedrooms < criteria.minBedrooms) return false;
        if (criteria.maxBedrooms && this.features.bedrooms > criteria.maxBedrooms) return false;

        // Bathrooms range
        if (criteria.minBathrooms && this.features.bathrooms < criteria.minBathrooms) return false;
        if (criteria.maxBathrooms && this.features.bathrooms > criteria.maxBathrooms) return false;

        // Area range
        if (criteria.minArea && this.features.area < criteria.minArea) return false;
        if (criteria.maxArea && this.features.area > criteria.maxArea) return false;

        // Property types
        if (criteria.propertyTypes && criteria.propertyTypes.length > 0) {
            if (!criteria.propertyTypes.includes(this.type.value)) return false;
        }

        // Amenities
        if (criteria.amenities && criteria.amenities.length > 0) {
            const hasAllAmenities = criteria.amenities.every(amenity =>
                this.features.hasAmenity(amenity)
            );
            if (!hasAllAmenities) return false;
        }

        // Location (simple text search)
        if (criteria.location) {
            const locationText = this.address.getFullAddress().toLowerCase();
            const searchLocation = criteria.location.toLowerCase();
            if (!locationText.includes(searchLocation)) return false;
        }

        return true;
    }

    protected touch(): void {
        this.updatedAt = new Date();
    }
}