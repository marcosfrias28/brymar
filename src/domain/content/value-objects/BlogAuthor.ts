import { DomainError } from '@/domain/shared/errors/DomainError';

export class BlogAuthor {
    private static readonly MIN_LENGTH = 2;
    private static readonly MAX_LENGTH = 100;

    private constructor(private readonly value: string) {
        this.validate(value);
    }

    static create(author: string): BlogAuthor {
        return new BlogAuthor(author);
    }

    private validate(author: string): void {
        if (!author || author.trim().length === 0) {
            throw new DomainError("Blog author cannot be empty");
        }

        const trimmedAuthor = author.trim();

        if (trimmedAuthor.length < BlogAuthor.MIN_LENGTH) {
            throw new DomainError(`Blog author must be at least ${BlogAuthor.MIN_LENGTH} characters long`);
        }

        if (trimmedAuthor.length > BlogAuthor.MAX_LENGTH) {
            throw new DomainError(`Blog author cannot exceed ${BlogAuthor.MAX_LENGTH} characters`);
        }

        // Business rule: Author name should contain only letters, spaces, and common punctuation
        const validNamePattern = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\.\-']+$/;
        if (!validNamePattern.test(trimmedAuthor)) {
            throw new DomainError("Blog author contains invalid characters");
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

    getInitials(): string {
        const names = this.value.trim().split(/\s+/);
        return names
            .map(name => name.charAt(0).toUpperCase())
            .join('')
            .substring(0, 3); // Maximum 3 initials
    }

    getFirstName(): string {
        const names = this.value.trim().split(/\s+/);
        return names[0] || '';
    }

    getLastName(): string {
        const names = this.value.trim().split(/\s+/);
        return names.length > 1 ? names[names.length - 1] : '';
    }

    getDisplayName(): string {
        return this.value.trim();
    }

    equals(other: BlogAuthor): boolean {
        return this.value.trim().toLowerCase() === other.value.trim().toLowerCase();
    }

    toString(): string {
        return this.value.trim();
    }
}