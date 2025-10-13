import { DomainError } from '@/domain/shared/errors/DomainError';

export class BlogTitle {
    private static readonly MIN_LENGTH = 3;
    private static readonly MAX_LENGTH = 200;

    private constructor(private readonly value: string) {
        this.validate(value);
    }

    static create(title: string): BlogTitle {
        return new BlogTitle(title);
    }

    private validate(title: string): void {
        if (!title || title.trim().length === 0) {
            throw new DomainError("Blog title cannot be empty");
        }

        const trimmedTitle = title.trim();

        if (trimmedTitle.length < BlogTitle.MIN_LENGTH) {
            throw new DomainError(`Blog title must be at least ${BlogTitle.MIN_LENGTH} characters long`);
        }

        if (trimmedTitle.length > BlogTitle.MAX_LENGTH) {
            throw new DomainError(`Blog title cannot exceed ${BlogTitle.MAX_LENGTH} characters`);
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

    equals(other: BlogTitle): boolean {
        return this.value.trim() === other.value.trim();
    }

    toString(): string {
        return this.value.trim();
    }
}