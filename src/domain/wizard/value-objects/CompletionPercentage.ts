import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { DomainError } from '@/domain/shared/errors/DomainError';

export class CompletionPercentage extends ValueObject<number> {
    private constructor(value: number) {
        super(value);
    }

    static create(percentage: number): CompletionPercentage {
        if (typeof percentage !== "number" || isNaN(percentage)) {
            throw new DomainError("Completion percentage must be a valid number");
        }

        if (percentage < 0) {
            throw new DomainError("Completion percentage cannot be negative");
        }

        if (percentage > 100) {
            throw new DomainError("Completion percentage cannot exceed 100");
        }

        // Round to nearest integer
        const roundedPercentage = Math.round(percentage);

        return new CompletionPercentage(roundedPercentage);
    }

    static zero(): CompletionPercentage {
        return new CompletionPercentage(0);
    }

    static complete(): CompletionPercentage {
        return new CompletionPercentage(100);
    }

    get value(): number {
        return this._value;
    }

    isComplete(): boolean {
        return this._value === 100;
    }

    isStarted(): boolean {
        return this._value > 0;
    }

    isHalfway(): boolean {
        return this._value >= 50;
    }

    isNearlyComplete(): boolean {
        return this._value >= 90;
    }

    add(amount: number): CompletionPercentage {
        return CompletionPercentage.create(this._value + amount);
    }

    subtract(amount: number): CompletionPercentage {
        return CompletionPercentage.create(this._value - amount);
    }

    equals(other: CompletionPercentage): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return `${this._value}%`;
    }

    toJSON(): number {
        return this._value;
    }
}