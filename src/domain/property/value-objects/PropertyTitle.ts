import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { BusinessRuleViolationError } from '@/domain/shared/errors/DomainError';

export class PropertyTitle extends ValueObject<string> {
    private static readonly MIN_LENGTH = 3;
    private static readonly MAX_LENGTH = 100;

    private constructor(value: string) {
        super(value);
    }

    static create(title: string): PropertyTitle {
        if (!title || title.trim().length === 0) {
            throw new BusinessRuleViolationError("Property title cannot be empty", "PROPERTY_VALIDATION");
        }

        const trimmedTitle = title.trim();

        if (trimmedTitle.length < this.MIN_LENGTH) {
            throw new BusinessRuleViolationError(`Property title must be at least ${this.MIN_LENGTH} characters long`, "PROPERTY_VALIDATION");
        }

        if (trimmedTitle.length > this.MAX_LENGTH) {
            throw new BusinessRuleViolationError(`Property title cannot exceed ${this.MAX_LENGTH} characters`, "PROPERTY_VALIDATION");
        }

        // Check for inappropriate content (basic validation)
        if (this.containsInappropriateContent(trimmedTitle)) {
            throw new BusinessRuleViolationError("Property title contains inappropriate content", "PROPERTY_VALIDATION");
        }

        return new PropertyTitle(trimmedTitle);
    }

    private static containsInappropriateContent(title: string): boolean {
        const inappropriateWords = ["spam", "scam", "fake"];
        const lowerTitle = title.toLowerCase();
        return inappropriateWords.some(word => lowerTitle.includes(word));
    }

    isValid(): boolean {
        return this.value.length >= PropertyTitle.MIN_LENGTH &&
            this.value.length <= PropertyTitle.MAX_LENGTH;
    }

    getDisplayValue(): string {
        return this.value;
    }

    getSlug(): string {
        return this.value
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
}