import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { BusinessRuleViolationError } from '@/domain/shared/errors/DomainError';

export enum PropertyStatusEnum {
    DRAFT = "draft",
    PENDING_REVIEW = "pending_review",
    PUBLISHED = "published",
    SOLD = "sold",
    RENTED = "rented",
    WITHDRAWN = "withdrawn",
    EXPIRED = "expired",
    ARCHIVED = "archived",
}

export class PropertyStatus extends ValueObject<PropertyStatusEnum> {
    private constructor(value: PropertyStatusEnum) {
        super(value);
    }

    static create(status: string): PropertyStatus {
        if (!status || status.trim().length === 0) {
            throw new BusinessRuleViolationError("Property status cannot be empty", "PROPERTY_VALIDATION");
        }

        const normalizedStatus = status.toLowerCase().trim();

        // Check if the status is valid
        const validStatuses = Object.values(PropertyStatusEnum);
        const matchedStatus = validStatuses.find(validStatus => validStatus === normalizedStatus);

        if (!matchedStatus) {
            throw new BusinessRuleViolationError(`Invalid property status: ${status}. Valid statuses are: ${validStatuses.join(', ')}`, "PROPERTY_VALIDATION");
        }

        return new PropertyStatus(matchedStatus);
    }

    static draft(): PropertyStatus {
        return new PropertyStatus(PropertyStatusEnum.DRAFT);
    }

    static pendingReview(): PropertyStatus {
        return new PropertyStatus(PropertyStatusEnum.PENDING_REVIEW);
    }

    static published(): PropertyStatus {
        return new PropertyStatus(PropertyStatusEnum.PUBLISHED);
    }

    static sold(): PropertyStatus {
        return new PropertyStatus(PropertyStatusEnum.SOLD);
    }

    static rented(): PropertyStatus {
        return new PropertyStatus(PropertyStatusEnum.RENTED);
    }

    static withdrawn(): PropertyStatus {
        return new PropertyStatus(PropertyStatusEnum.WITHDRAWN);
    }

    static expired(): PropertyStatus {
        return new PropertyStatus(PropertyStatusEnum.EXPIRED);
    }

    static archived(): PropertyStatus {
        return new PropertyStatus(PropertyStatusEnum.ARCHIVED);
    }

    isDraft(): boolean {
        return this.value === PropertyStatusEnum.DRAFT;
    }

    isPendingReview(): boolean {
        return this.value === PropertyStatusEnum.PENDING_REVIEW;
    }

    isPublished(): boolean {
        return this.value === PropertyStatusEnum.PUBLISHED;
    }

    isSold(): boolean {
        return this.value === PropertyStatusEnum.SOLD;
    }

    isRented(): boolean {
        return this.value === PropertyStatusEnum.RENTED;
    }

    isWithdrawn(): boolean {
        return this.value === PropertyStatusEnum.WITHDRAWN;
    }

    isExpired(): boolean {
        return this.value === PropertyStatusEnum.EXPIRED;
    }

    isArchived(): boolean {
        return this.value === PropertyStatusEnum.ARCHIVED;
    }

    isActive(): boolean {
        return this.value === PropertyStatusEnum.PUBLISHED;
    }

    isAvailable(): boolean {
        return this.value === PropertyStatusEnum.PUBLISHED;
    }

    isUnavailable(): boolean {
        return this.isSold() || this.isRented() || this.isWithdrawn() || this.isExpired() || this.isArchived();
    }

    canBeEdited(): boolean {
        return this.isDraft() || this.isPendingReview() || this.isPublished();
    }

    canBePublished(): boolean {
        return this.isDraft() || this.isPendingReview();
    }

    canBeWithdrawn(): boolean {
        return this.isPublished() || this.isPendingReview();
    }

    canBeArchived(): boolean {
        return this.isSold() || this.isRented() || this.isWithdrawn() || this.isExpired();
    }

    getDisplayName(): string {
        const displayNames: Record<PropertyStatusEnum, string> = {
            [PropertyStatusEnum.DRAFT]: "Draft",
            [PropertyStatusEnum.PENDING_REVIEW]: "Pending Review",
            [PropertyStatusEnum.PUBLISHED]: "Published",
            [PropertyStatusEnum.SOLD]: "Sold",
            [PropertyStatusEnum.RENTED]: "Rented",
            [PropertyStatusEnum.WITHDRAWN]: "Withdrawn",
            [PropertyStatusEnum.EXPIRED]: "Expired",
            [PropertyStatusEnum.ARCHIVED]: "Archived",
        };

        return displayNames[this.value];
    }

    getColor(): string {
        const colors: Record<PropertyStatusEnum, string> = {
            [PropertyStatusEnum.DRAFT]: "gray",
            [PropertyStatusEnum.PENDING_REVIEW]: "yellow",
            [PropertyStatusEnum.PUBLISHED]: "green",
            [PropertyStatusEnum.SOLD]: "blue",
            [PropertyStatusEnum.RENTED]: "purple",
            [PropertyStatusEnum.WITHDRAWN]: "orange",
            [PropertyStatusEnum.EXPIRED]: "red",
            [PropertyStatusEnum.ARCHIVED]: "gray",
        };

        return colors[this.value];
    }

    // Transition methods with business rules
    transitionTo(newStatus: PropertyStatus): PropertyStatus {
        if (!this.canTransitionTo(newStatus)) {
            throw new BusinessRuleViolationError(`Cannot transition from ${this.getDisplayName()} to ${newStatus.getDisplayName()}`, "PROPERTY_VALIDATION");
        }
        return newStatus;
    }

    private canTransitionTo(newStatus: PropertyStatus): boolean {
        const allowedTransitions: Record<PropertyStatusEnum, PropertyStatusEnum[]> = {
            [PropertyStatusEnum.DRAFT]: [
                PropertyStatusEnum.PENDING_REVIEW,
                PropertyStatusEnum.PUBLISHED,
                PropertyStatusEnum.ARCHIVED,
            ],
            [PropertyStatusEnum.PENDING_REVIEW]: [
                PropertyStatusEnum.DRAFT,
                PropertyStatusEnum.PUBLISHED,
                PropertyStatusEnum.WITHDRAWN,
            ],
            [PropertyStatusEnum.PUBLISHED]: [
                PropertyStatusEnum.DRAFT,
                PropertyStatusEnum.SOLD,
                PropertyStatusEnum.RENTED,
                PropertyStatusEnum.WITHDRAWN,
                PropertyStatusEnum.EXPIRED,
            ],
            [PropertyStatusEnum.SOLD]: [
                PropertyStatusEnum.ARCHIVED,
            ],
            [PropertyStatusEnum.RENTED]: [
                PropertyStatusEnum.PUBLISHED,
                PropertyStatusEnum.ARCHIVED,
            ],
            [PropertyStatusEnum.WITHDRAWN]: [
                PropertyStatusEnum.DRAFT,
                PropertyStatusEnum.PUBLISHED,
                PropertyStatusEnum.ARCHIVED,
            ],
            [PropertyStatusEnum.EXPIRED]: [
                PropertyStatusEnum.DRAFT,
                PropertyStatusEnum.PUBLISHED,
                PropertyStatusEnum.ARCHIVED,
            ],
            [PropertyStatusEnum.ARCHIVED]: [],
        };

        return allowedTransitions[this.value]?.includes(newStatus.value) ?? false;
    }

    static getAllStatuses(): PropertyStatus[] {
        return Object.values(PropertyStatusEnum).map(status => new PropertyStatus(status));
    }

    static getActiveStatuses(): PropertyStatus[] {
        return [
            PropertyStatus.published(),
        ];
    }

    static getInactiveStatuses(): PropertyStatus[] {
        return [
            PropertyStatus.draft(),
            PropertyStatus.pendingReview(),
            PropertyStatus.sold(),
            PropertyStatus.rented(),
            PropertyStatus.withdrawn(),
            PropertyStatus.expired(),
            PropertyStatus.archived(),
        ];
    }
}