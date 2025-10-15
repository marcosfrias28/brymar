import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

export class BlogTitle {
    private static readonly MIN_LENGTH = 3;
    private static readonly MAX_LENGTH = 200;

    private constructor(private readonly _value: string) {
        this.validate(_value);
    }

    static create(title: string): BlogTitle {
        return new BlogTitle(title);
    }

    private validate(title: string): void {
        if (!title || title.trim().length === 0) {
            throw new ValueObjectValidationError("Blog title cannot be empty");
        }

        const trimmedTitle = title.trim();

        if (trimmedTitle.length < BlogTitle.MIN_LENGTH) {
            throw new ValueObjectValidationError(`Blog title must be at least ${BlogTitle.MIN_LENGTH} characters long`);
        }

        if (trimmedTitle.length > BlogTitle.MAX_LENGTH) {
            throw new ValueObjectValidationError(`Blog title cannot exceed ${BlogTitle.MAX_LENGTH} characters`);
        }
    }

    get value(): string {
        return this._value.trim();
    }

    isValid(): boolean {
        try {
            this.validate(this._value);
            return true;
        } catch {
            return false;
        }
    }

    getLength(): number {
        return this._value.trim().length;
    }

    equals(other: BlogTitle): boolean {
        return this._value.trim() === other._value.trim();
    }

    toString(): string {
        return this._value.trim();
    }
}