import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

export class BlogContent {
    private static readonly MIN_LENGTH = 50;
    private static readonly MAX_LENGTH = 10000;

    private constructor(private readonly _value: string) {
        this.validate(_value);
    }

    static create(content: string): BlogContent {
        return new BlogContent(content);
    }

    private validate(content: string): void {
        if (!content || content.trim().length === 0) {
            throw new ValueObjectValidationError("Blog content cannot be empty");
        }

        const trimmedContent = content.trim();

        if (trimmedContent.length < BlogContent.MIN_LENGTH) {
            throw new ValueObjectValidationError(`Blog content must be at least ${BlogContent.MIN_LENGTH} characters long`);
        }

        if (trimmedContent.length > BlogContent.MAX_LENGTH) {
            throw new ValueObjectValidationError(`Blog content cannot exceed ${BlogContent.MAX_LENGTH} characters`);
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

    getWordCount(): number {
        return this._value.trim().split(/\s+/).length;
    }

    getExcerpt(maxLength: number = 150): string {
        const content = this._value.trim();
        if (content.length <= maxLength) {
            return content;
        }

        const truncated = content.substring(0, maxLength);
        const lastSpaceIndex = truncated.lastIndexOf(' ');

        if (lastSpaceIndex > 0) {
            return truncated.substring(0, lastSpaceIndex) + '...';
        }

        return truncated + '...';
    }

    equals(other: BlogContent): boolean {
        return this._value.trim() === other._value.trim();
    }

    toString(): string {
        return this._value.trim();
    }
}