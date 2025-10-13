import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

export class LandDescription extends ValueObject<string> {
    private static readonly MIN_LENGTH = 10;
    private static readonly MAX_LENGTH = 2000;

    private constructor(value: string) {
        super(value);
    }

    static create(description: string): LandDescription {
        if (!description || description.trim().length === 0) {
            throw new ValueObjectValidationError("Land description cannot be empty");
        }

        const trimmedDescription = description.trim();

        if (trimmedDescription.length < this.MIN_LENGTH) {
            throw new ValueObjectValidationError(`Land description must be at least ${this.MIN_LENGTH} characters long`);
        }

        if (trimmedDescription.length > this.MAX_LENGTH) {
            throw new ValueObjectValidationError(`Land description cannot exceed ${this.MAX_LENGTH} characters`);
        }

        return new LandDescription(trimmedDescription);
    }

    get value(): string {
        return this._value;
    }

    isValid(): boolean {
        return (
            this._value.length >= LandDescription.MIN_LENGTH &&
            this._value.length <= LandDescription.MAX_LENGTH
        );
    }

    getWordCount(): number {
        return this._value.split(/\s+/).filter(word => word.length > 0).length;
    }

    getExcerpt(maxLength: number = 150): string {
        if (this._value.length <= maxLength) {
            return this._value;
        }

        const truncated = this._value.substring(0, maxLength);
        const lastSpaceIndex = truncated.lastIndexOf(' ');

        if (lastSpaceIndex > 0) {
            return truncated.substring(0, lastSpaceIndex) + '...';
        }

        return truncated + '...';
    }
}