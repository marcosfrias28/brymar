import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

export class BlogPostId {
    private constructor(private readonly _value: string) {
        if (!_value || _value.trim().length === 0) {
            throw new ValueObjectValidationError("BlogPost ID cannot be empty");
        }
    }

    static create(value: string): BlogPostId {
        return new BlogPostId(value);
    }

    static generate(): BlogPostId {
        return new BlogPostId(crypto.randomUUID());
    }

    static fromNumber(id: number): BlogPostId {
        if (id <= 0) {
            throw new ValueObjectValidationError("BlogPost ID must be a positive number");
        }
        return new BlogPostId(id.toString());
    }

    get value(): string {
        return this._value;
    }

    toNumber(): number {
        const num = parseInt(this._value, 10);
        if (isNaN(num)) {
            throw new ValueObjectValidationError("BlogPost ID is not a valid number");
        }
        return num;
    }

    equals(other: BlogPostId): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return this._value;
    }
}