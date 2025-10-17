import { ValueObject } from './ValueObject';
import { BusinessRuleViolationError } from '../errors/DomainError';

export class Title extends ValueObject<string> {
    private static readonly DEFAULT_MIN_LENGTH = 3;
    private static readonly DEFAULT_MAX_LENGTH = 100;

    private constructor(value: string, private readonly entityType: string) {
        super(value);
    }

    static create(
        title: string,
        entityType: string = 'Entity',
        minLength: number = Title.DEFAULT_MIN_LENGTH,
        maxLength: number = Title.DEFAULT_MAX_LENGTH
    ): Title {
        if (!title || title.trim().length === 0) {
            throw new BusinessRuleViolationError(`${entityType} title cannot be empty`, "VALIDATION_ERROR");
        }

        const trimmedTitle = title.trim();

        if (trimmedTitle.length < minLength) {
            throw new BusinessRuleViolationError(
                `${entityType} title must be at least ${minLength} characters long`,
                "VALIDATION_ERROR"
            );
        }

        if (trimmedTitle.length > maxLength) {
            throw new BusinessRuleViolationError(
                `${entityType} title cannot exceed ${maxLength} characters`,
                "VALIDATION_ERROR"
            );
        }

        // Check for inappropriate content (basic validation)
        if (Title.containsInappropriateContent(trimmedTitle)) {
            throw new BusinessRuleViolationError(
                `${entityType} title contains inappropriate content`,
                "VALIDATION_ERROR"
            );
        }

        // Business rule: Title should contain at least one alphanumeric character
        if (!/[a-zA-Z0-9]/.test(trimmedTitle)) {
            throw new BusinessRuleViolationError(
                `${entityType} title must contain at least one alphanumeric character`,
                "VALIDATION_ERROR"
            );
        }

        return new Title(trimmedTitle, entityType);
    }

    private static containsInappropriateContent(title: string): boolean {
        const inappropriateWords = ["spam", "scam", "fake"];
        const lowerTitle = title.toLowerCase();
        return inappropriateWords.some(word => lowerTitle.includes(word));
    }

    isValid(minLength: number = Title.DEFAULT_MIN_LENGTH, maxLength: number = Title.DEFAULT_MAX_LENGTH): boolean {
        return this.value.length >= minLength &&
            this.value.length <= maxLength &&
            /[a-zA-Z0-9]/.test(this.value);
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

    getLength(): number {
        return this.value.length;
    }

    getEntityType(): string {
        return this.entityType;
    }
}

// Specific title factory classes for type safety and different validation rules
export class PropertyTitle {
    static create(title: string): Title {
        return Title.create(title, 'Property', 3, 100);
    }
}

export class LandTitle {
    static create(title: string): Title {
        return Title.create(title, 'Land', 3, 100);
    }
}

export class BlogTitle {
    static create(title: string): Title {
        return Title.create(title, 'Blog', 3, 200);
    }
}