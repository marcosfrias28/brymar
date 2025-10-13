import { DomainError } from '@/domain/shared/errors/DomainError';

export class BlogContent {
    private static readonly MIN_LENGTH = 50;
    private static readonly MAX_LENGTH = 10000;

    private constructor(private readonly value: string) {
        this.validate(value);
    }

    static create(content: string): BlogContent {
        return new BlogContent(content);
    }

    private validate(content: string): void {
        if (!content || content.trim().length === 0) {
            throw new DomainError("Blog content cannot be empty");
        }

        const trimmedContent = content.trim();

        if (trimmedContent.length < BlogContent.MIN_LENGTH) {
            throw new DomainError(`Blog content must be at least ${BlogContent.MIN_LENGTH} characters long`);
        }

        if (trimmedContent.length > BlogContent.MAX_LENGTH) {
            throw new DomainError(`Blog content cannot exceed ${BlogContent.MAX_LENGTH} characters`);
        }
    }

    get value(): string {
        return this.value.trim();
    }

    isValid(): boolean {
        try {
            this.validate(this.value);
            return true;
        } catch {
            return false;
        }
    }

    getLength(): number {
        return this.value.trim().length;
    }

    getWordCount(): number {
        return this.value.trim().split(/\s+/).length;
    }

    getExcerpt(maxLength: number = 150): string {
        const content = this.value.trim();
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
        return this.value.trim() === other.value.trim();
    }

    toString(): string {
        return this.value.trim();
    }
}