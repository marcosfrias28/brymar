import { DomainError } from '@/domain/shared/errors/DomainError';

export class SectionTitle {
    private static readonly MIN_LENGTH = 1;
    private static readonly MAX_LENGTH = 200;

    private constructor(private readonly value: string) {
        this.validate(value);
    }

    static create(title: string): SectionTitle {
        return new SectionTitle(title);
    }

    private validate(title: string): void {
        if (!title || title.trim().length === 0) {
            throw new DomainError("Section title cannot be empty");
        }

        const trimmedTitle = title.trim();

        if (trimmedTitle.length < SectionTitle.MIN_LENGTH) {
            throw new DomainError(`Section title must be at least ${SectionTitle.MIN_LENGTH} character long`);
        }

        if (trimmedTitle.length > SectionTitle.MAX_LENGTH) {
            throw new DomainError(`Section title cannot exceed ${SectionTitle.MAX_LENGTH} characters`);
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

    equals(other: SectionTitle): boolean {
        return this.value.trim() === other.value.trim();
    }

    toString(): string {
        return this.value.trim();
    }
}