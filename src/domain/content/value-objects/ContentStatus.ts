import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

export type ContentStatusType = "draft" | "published";

export class ContentStatus {
    private static readonly VALID_STATUSES: ContentStatusType[] = ["draft", "published"];

    private static readonly STATUS_LABELS: Record<ContentStatusType, string> = {
        draft: "Borrador",
        published: "Publicado"
    };

    private constructor(private readonly _value: ContentStatusType) {
        this.validate(_value);
    }

    static create(status: string): ContentStatus {
        return new ContentStatus(status as ContentStatusType);
    }

    static draft(): ContentStatus {
        return new ContentStatus("draft");
    }

    static published(): ContentStatus {
        return new ContentStatus("published");
    }

    private validate(status: string): void {
        if (!status || status.trim().length === 0) {
            throw new ValueObjectValidationError("Content status cannot be empty");
        }

        if (!ContentStatus.VALID_STATUSES.includes(status as ContentStatusType)) {
            throw new ValueObjectValidationError(
                `Invalid content status: ${status}. Valid statuses are: ${ContentStatus.VALID_STATUSES.join(", ")}`
            );
        }
    }

    get value(): ContentStatusType {
        return this._value;
    }

    getLabel(): string {
        return ContentStatus.STATUS_LABELS[this._value];
    }

    isValid(): boolean {
        return ContentStatus.VALID_STATUSES.includes(this._value);
    }

    isDraft(): boolean {
        return this._value === "draft";
    }

    isPublished(): boolean {
        return this._value === "published";
    }

    canTransitionTo(newStatus: ContentStatus): boolean {
        // Business rule: Can always transition from draft to published
        if (this.isDraft() && newStatus.isPublished()) {
            return true;
        }

        // Business rule: Can always transition from published to draft
        if (this.isPublished() && newStatus.isDraft()) {
            return true;
        }

        // Same status is allowed
        return this.equals(newStatus);
    }

    static getAllStatuses(): ContentStatusType[] {
        return [...ContentStatus.VALID_STATUSES];
    }

    static getStatusLabel(status: ContentStatusType): string {
        return ContentStatus.STATUS_LABELS[status];
    }

    equals(other: ContentStatus): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return this._value;
    }
}