import { DomainError } from '@/domain/shared/errors/DomainError';

export type ContentStatusType = "draft" | "published";

export class ContentStatus {
    private static readonly VALID_STATUSES: ContentStatusType[] = ["draft", "published"];

    private static readonly STATUS_LABELS: Record<ContentStatusType, string> = {
        draft: "Borrador",
        published: "Publicado"
    };

    private constructor(private readonly value: ContentStatusType) {
        this.validate(value);
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
            throw new DomainError("Content status cannot be empty");
        }

        if (!ContentStatus.VALID_STATUSES.includes(status as ContentStatusType)) {
            throw new DomainError(
                `Invalid content status: ${status}. Valid statuses are: ${ContentStatus.VALID_STATUSES.join(", ")}`
            );
        }
    }

    get value(): ContentStatusType {
        return this.value;
    }

    getLabel(): string {
        return ContentStatus.STATUS_LABELS[this.value];
    }

    isValid(): boolean {
        return ContentStatus.VALID_STATUSES.includes(this.value);
    }

    isDraft(): boolean {
        return this.value === "draft";
    }

    isPublished(): boolean {
        return this.value === "published";
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
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}