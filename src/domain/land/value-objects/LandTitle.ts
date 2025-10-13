import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

export class LandTitle extends ValueObject<string> {
    private static readonly MIN_LENGTH = 3;
    private static readonly MAX_LENGTH = 100;

    private constructor(value: string) {
        super(value);
    }

    static create(title: string): LandTitle {
        if (!title || title.trim().length === 0) {
            throw new ValueObjectValidationError("Land title cannot be empty");
        }

        const trimmedTitle = title.trim();

        if (trimmedTitle.length < this.MIN_LENGTH) {
            throw new ValueObjectValidationError(`Land title must be at least ${this.MIN_LENGTH} characters long`);
        }

        if (trimmedTitle.length > this.MAX_LENGTH) {
            throw new ValueObjectValidationError(`Land title cannot exceed ${this.MAX_LENGTH} characters`);
        }

        // Business rule: Title should not contain only special characters
        if (!/[a-zA-Z0-9]/.test(trimmedTitle)) {
            throw new ValueObjectValidationError("Land title must contain at least one alphanumeric character");
        }

        return new LandTitle(trimmedTitle);
    }

    get value(): string {
        return this._value;
    }

    isValid(): boolean {
        return (
            this._value.length >= LandTitle.MIN_LENGTH &&
            this._value.length <= LandTitle.MAX_LENGTH &&
            /[a-zA-Z0-9]/.test(this._value)
        );
    }

    toSlug(): string {
        return this._value
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
}