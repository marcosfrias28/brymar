import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

export type LandStatusValue = "draft" | "published" | "sold" | "reserved" | "archived";

export class LandStatus extends ValueObject<LandStatusValue> {
    private static readonly VALID_STATUSES: LandStatusValue[] = [
        "draft",
        "published",
        "sold",
        "reserved",
        "archived"
    ];

    private static readonly STATUS_DESCRIPTIONS: Record<LandStatusValue, string> = {
        draft: "Draft - Not visible to public",
        published: "Published - Available for sale",
        sold: "Sold - No longer available",
        reserved: "Reserved - Temporarily unavailable",
        archived: "Archived - Removed from listings"
    };

    private constructor(value: LandStatusValue) {
        super(value);
    }

    static create(status: string): LandStatus {
        if (!status || status.trim().length === 0) {
            throw new ValueObjectValidationError("Land status cannot be empty");
        }

        const normalizedStatus = status.toLowerCase().trim() as LandStatusValue;

        if (!this.VALID_STATUSES.includes(normalizedStatus)) {
            throw new ValueObjectValidationError(
                `Invalid land status: ${status}. Valid statuses are: ${this.VALID_STATUSES.join(", ")}`
            );
        }

        return new LandStatus(normalizedStatus);
    }

    static draft(): LandStatus {
        return new LandStatus("draft");
    }

    static published(): LandStatus {
        return new LandStatus("published");
    }

    static sold(): LandStatus {
        return new LandStatus("sold");
    }

    static reserved(): LandStatus {
        return new LandStatus("reserved");
    }

    static archived(): LandStatus {
        return new LandStatus("archived");
    }

    get value(): LandStatusValue {
        return this._value;
    }

    getDescription(): string {
        return LandStatus.STATUS_DESCRIPTIONS[this._value];
    }

    isValid(): boolean {
        return LandStatus.VALID_STATUSES.includes(this._value);
    }

    isDraft(): boolean {
        return this._value === "draft";
    }

    isPublished(): boolean {
        return this._value === "published";
    }

    isSold(): boolean {
        return this._value === "sold";
    }

    isReserved(): boolean {
        return this._value === "reserved";
    }

    isArchived(): boolean {
        return this._value === "archived";
    }

    // Business rules for status transitions
    canTransitionTo(newStatus: LandStatus): boolean {
        const currentStatus = this._value;
        const targetStatus = newStatus._value;

        // Define allowed transitions
        const allowedTransitions: Record<LandStatusValue, LandStatusValue[]> = {
            draft: ["published", "archived"],
            published: ["draft", "sold", "reserved", "archived"],
            sold: ["archived"], // Sold lands can only be archived
            reserved: ["published", "sold", "archived"],
            archived: ["draft"] // Archived lands can be restored to draft
        };

        return allowedTransitions[currentStatus]?.includes(targetStatus) ?? false;
    }

    // Check if land is available for viewing/purchase
    isAvailableForSale(): boolean {
        return this._value === "published";
    }

    // Check if land is visible to public
    isPubliclyVisible(): boolean {
        return this._value === "published" || this._value === "reserved" || this._value === "sold";
    }

    // Check if land can be edited
    isEditable(): boolean {
        return this._value === "draft" || this._value === "published";
    }

    // Check if land can be deleted
    isDeletable(): boolean {
        return this._value === "draft" || this._value === "archived";
    }

    // Get CSS class for status display
    getDisplayClass(): string {
        switch (this._value) {
            case "draft":
                return "status-draft";
            case "published":
                return "status-published";
            case "sold":
                return "status-sold";
            case "reserved":
                return "status-reserved";
            case "archived":
                return "status-archived";
            default:
                return "status-unknown";
        }
    }

    // Get color for status display
    getDisplayColor(): string {
        switch (this._value) {
            case "draft":
                return "#6B7280"; // Gray
            case "published":
                return "#10B981"; // Green
            case "sold":
                return "#EF4444"; // Red
            case "reserved":
                return "#F59E0B"; // Yellow
            case "archived":
                return "#8B5CF6"; // Purple
            default:
                return "#6B7280";
        }
    }

    static getAllStatuses(): LandStatusValue[] {
        return [...this.VALID_STATUSES];
    }

    static getStatusDescriptions(): Record<LandStatusValue, string> {
        return { ...this.STATUS_DESCRIPTIONS };
    }
}