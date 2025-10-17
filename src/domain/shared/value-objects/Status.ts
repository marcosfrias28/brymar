import { ValueObject } from './ValueObject';
import { BusinessRuleViolationError } from '../errors/DomainError';

export abstract class Status<T extends string> extends ValueObject<T> {
    protected constructor(value: T, private readonly entityType: string) {
        super(value);
    }

    protected static createStatus<T extends string>(
        status: string,
        validStatuses: readonly T[],
        entityType: string
    ): T {
        if (!status || status.trim().length === 0) {
            throw new BusinessRuleViolationError(`${entityType} status cannot be empty`, "VALIDATION_ERROR");
        }

        const normalizedStatus = status.toLowerCase().trim() as T;

        if (!validStatuses.includes(normalizedStatus)) {
            throw new BusinessRuleViolationError(
                `Invalid ${entityType.toLowerCase()} status: ${status}. Valid statuses are: ${validStatuses.join(', ')}`,
                "VALIDATION_ERROR"
            );
        }

        return normalizedStatus;
    }

    abstract getDisplayName(): string;
    abstract getColor(): string;
    abstract canTransitionTo(newStatus: Status<T>): boolean;

    getEntityType(): string {
        return this.entityType;
    }

    isValid(): boolean {
        return true; // Override in subclasses if needed
    }
}

// Property Status
export type PropertyStatusValue = "draft" | "pending_review" | "published" | "sold" | "rented" | "withdrawn" | "expired" | "archived";

export class PropertyStatus extends Status<PropertyStatusValue> {
    private static readonly VALID_STATUSES: readonly PropertyStatusValue[] = [
        "draft", "pending_review", "published", "sold", "rented", "withdrawn", "expired", "archived"
    ] as const;

    private static readonly DISPLAY_NAMES: Record<PropertyStatusValue, string> = {
        draft: "Draft",
        pending_review: "Pending Review",
        published: "Published",
        sold: "Sold",
        rented: "Rented",
        withdrawn: "Withdrawn",
        expired: "Expired",
        archived: "Archived"
    };

    private static readonly COLORS: Record<PropertyStatusValue, string> = {
        draft: "gray",
        pending_review: "yellow",
        published: "green",
        sold: "blue",
        rented: "purple",
        withdrawn: "orange",
        expired: "red",
        archived: "gray"
    };

    private constructor(value: PropertyStatusValue) {
        super(value, 'Property');
    }

    static create(status: string): PropertyStatus {
        const validStatus = super.createStatus(status, PropertyStatus.VALID_STATUSES, 'Property');
        return new PropertyStatus(validStatus);
    }

    static draft(): PropertyStatus { return new PropertyStatus("draft"); }
    static pendingReview(): PropertyStatus { return new PropertyStatus("pending_review"); }
    static published(): PropertyStatus { return new PropertyStatus("published"); }
    static sold(): PropertyStatus { return new PropertyStatus("sold"); }
    static rented(): PropertyStatus { return new PropertyStatus("rented"); }
    static withdrawn(): PropertyStatus { return new PropertyStatus("withdrawn"); }
    static expired(): PropertyStatus { return new PropertyStatus("expired"); }
    static archived(): PropertyStatus { return new PropertyStatus("archived"); }

    getDisplayName(): string {
        return PropertyStatus.DISPLAY_NAMES[this.value];
    }

    getColor(): string {
        return PropertyStatus.COLORS[this.value];
    }

    canTransitionTo(newStatus: PropertyStatus): boolean {
        const allowedTransitions: Record<PropertyStatusValue, PropertyStatusValue[]> = {
            draft: ["pending_review", "published", "archived"],
            pending_review: ["draft", "published", "withdrawn"],
            published: ["draft", "sold", "rented", "withdrawn", "expired"],
            sold: ["archived"],
            rented: ["published", "archived"],
            withdrawn: ["draft", "published", "archived"],
            expired: ["draft", "published", "archived"],
            archived: []
        };

        return allowedTransitions[this.value]?.includes(newStatus.value) ?? false;
    }

    isDraft(): boolean { return this.value === "draft"; }
    isPendingReview(): boolean { return this.value === "pending_review"; }
    isPublished(): boolean { return this.value === "published"; }
    isSold(): boolean { return this.value === "sold"; }
    isRented(): boolean { return this.value === "rented"; }
    isWithdrawn(): boolean { return this.value === "withdrawn"; }
    isExpired(): boolean { return this.value === "expired"; }
    isArchived(): boolean { return this.value === "archived"; }
    isActive(): boolean { return this.value === "published"; }
    isAvailable(): boolean { return this.value === "published"; }
    canBePublished(): boolean {
        return this.value === "draft" || this.value === "pending_review" || this.value === "withdrawn" || this.value === "expired";
    }
    canBeEdited(): boolean {
        return this.value !== "sold" && this.value !== "archived";
    }
    canBeWithdrawn(): boolean {
        return this.value === "published" || this.value === "pending_review";
    }
    canBeArchived(): boolean {
        return this.value !== "archived";
    }
}

// Land Status
export type LandStatusValue = "draft" | "published" | "sold" | "reserved" | "archived";

export class LandStatus extends Status<LandStatusValue> {
    private static readonly VALID_STATUSES: readonly LandStatusValue[] = [
        "draft", "published", "sold", "reserved", "archived"
    ] as const;

    private static readonly DISPLAY_NAMES: Record<LandStatusValue, string> = {
        draft: "Draft",
        published: "Published",
        sold: "Sold",
        reserved: "Reserved",
        archived: "Archived"
    };

    private static readonly COLORS: Record<LandStatusValue, string> = {
        draft: "#6B7280",
        published: "#10B981",
        sold: "#EF4444",
        reserved: "#F59E0B",
        archived: "#8B5CF6"
    };

    private constructor(value: LandStatusValue) {
        super(value, 'Land');
    }

    static create(status: string): LandStatus {
        const validStatus = super.createStatus(status, LandStatus.VALID_STATUSES, 'Land');
        return new LandStatus(validStatus);
    }

    static draft(): LandStatus { return new LandStatus("draft"); }
    static published(): LandStatus { return new LandStatus("published"); }
    static sold(): LandStatus { return new LandStatus("sold"); }
    static reserved(): LandStatus { return new LandStatus("reserved"); }
    static archived(): LandStatus { return new LandStatus("archived"); }

    getDisplayName(): string {
        return LandStatus.DISPLAY_NAMES[this.value];
    }

    getColor(): string {
        return LandStatus.COLORS[this.value];
    }

    canTransitionTo(newStatus: LandStatus): boolean {
        const allowedTransitions: Record<LandStatusValue, LandStatusValue[]> = {
            draft: ["published", "archived"],
            published: ["draft", "sold", "reserved", "archived"],
            sold: ["archived"],
            reserved: ["published", "sold", "archived"],
            archived: ["draft"]
        };

        return allowedTransitions[this.value]?.includes(newStatus.value) ?? false;
    }

    isDraft(): boolean { return this.value === "draft"; }
    isPublished(): boolean { return this.value === "published"; }
    isSold(): boolean { return this.value === "sold"; }
    isReserved(): boolean { return this.value === "reserved"; }
    isArchived(): boolean { return this.value === "archived"; }
    isAvailableForSale(): boolean { return this.value === "published"; }
}

// Content Status
export type ContentStatusValue = "draft" | "published";

// Export all value types for re-export in individual files



export class ContentStatus extends Status<ContentStatusValue> {
    private static readonly VALID_STATUSES: readonly ContentStatusValue[] = [
        "draft", "published"
    ] as const;

    private static readonly DISPLAY_NAMES: Record<ContentStatusValue, string> = {
        draft: "Borrador",
        published: "Publicado"
    };

    private static readonly COLORS: Record<ContentStatusValue, string> = {
        draft: "#6B7280",
        published: "#10B981"
    };

    private constructor(value: ContentStatusValue) {
        super(value, 'Content');
    }

    static create(status: string): ContentStatus {
        const validStatus = super.createStatus(status, ContentStatus.VALID_STATUSES, 'Content');
        return new ContentStatus(validStatus);
    }

    static draft(): ContentStatus { return new ContentStatus("draft"); }
    static published(): ContentStatus { return new ContentStatus("published"); }

    getDisplayName(): string {
        return ContentStatus.DISPLAY_NAMES[this.value];
    }

    getColor(): string {
        return ContentStatus.COLORS[this.value];
    }

    canTransitionTo(newStatus: ContentStatus): boolean {
        // Content can always transition between draft and published
        return true;
    }

    isDraft(): boolean { return this.value === "draft"; }
    isPublished(): boolean { return this.value === "published"; }
}