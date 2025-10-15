import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

export class SectionOrder {
    private static readonly MIN_ORDER = 0;
    private static readonly MAX_ORDER = 999;

    private constructor(private readonly _value: number) {
        this.validate(_value);
    }

    static create(order: number): SectionOrder {
        return new SectionOrder(order);
    }

    static first(): SectionOrder {
        return new SectionOrder(0);
    }

    static last(): SectionOrder {
        return new SectionOrder(SectionOrder.MAX_ORDER);
    }

    private validate(order: number): void {
        if (!Number.isInteger(order)) {
            throw new ValueObjectValidationError("Section order must be an integer");
        }

        if (order < SectionOrder.MIN_ORDER) {
            throw new ValueObjectValidationError(`Section order cannot be less than ${SectionOrder.MIN_ORDER}`);
        }

        if (order > SectionOrder.MAX_ORDER) {
            throw new ValueObjectValidationError(`Section order cannot exceed ${SectionOrder.MAX_ORDER}`);
        }
    }

    get value(): number {
        return this._value;
    }

    isValid(): boolean {
        try {
            this.validate(this._value);
            return true;
        } catch {
            return false;
        }
    }

    isFirst(): boolean {
        return this._value === SectionOrder.MIN_ORDER;
    }

    isLast(): boolean {
        return this._value === SectionOrder.MAX_ORDER;
    }

    increment(): SectionOrder {
        const newOrder = Math.min(this._value + 1, SectionOrder.MAX_ORDER);
        return new SectionOrder(newOrder);
    }

    decrement(): SectionOrder {
        const newOrder = Math.max(this._value - 1, SectionOrder.MIN_ORDER);
        return new SectionOrder(newOrder);
    }

    add(amount: number): SectionOrder {
        const newOrder = Math.min(Math.max(this._value + amount, SectionOrder.MIN_ORDER), SectionOrder.MAX_ORDER);
        return new SectionOrder(newOrder);
    }

    compareTo(other: SectionOrder): number {
        if (this._value < other._value) return -1;
        if (this._value > other._value) return 1;
        return 0;
    }

    isBefore(other: SectionOrder): boolean {
        return this._value < other._value;
    }

    isAfter(other: SectionOrder): boolean {
        return this._value > other._value;
    }

    equals(other: SectionOrder): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return this._value.toString();
    }
}