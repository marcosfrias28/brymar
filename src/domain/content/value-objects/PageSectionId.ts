import { DomainError } from '@/domain/shared/errors/DomainError';

export class PageSectionId {
    private constructor(private readonly _value: string) {
        if (!_value || _value.trim().length === 0) {
            throw new DomainError("PageSection ID cannot be empty");
        }
    }

    static create(value: string): PageSectionId {
        return new PageSectionId(value);
    }

    static generate(): PageSectionId {
        return new PageSectionId(crypto.randomUUID());
    }

    static fromNumber(id: number): PageSectionId {
        if (id <= 0) {
            throw new DomainError("PageSection ID must be a positive number");
        }
        return new PageSectionId(id.toString());
    }

    get value(): string {
        return this._value;
    }

    toNumber(): number {
        const num = parseInt(this._value, 10);
        if (isNaN(num)) {
            throw new DomainError("PageSection ID is not a valid number");
        }
        return num;
    }

    equals(other: PageSectionId): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return this._value;
    }
}