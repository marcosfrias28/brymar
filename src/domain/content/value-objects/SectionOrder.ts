import { DomainError } from '@/domain/shared/errors/DomainError';

export class SectionOrder {
    private static readonly MIN_ORDER = 0;
    private static readonly MAX_ORDER = 999;

    private constructor(private readonly value: number) {
        this.validate(value);
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
            throw new DomainError("Section order must be an integer");
        }

        if (order < SectionOrder.MIN_ORDER) {
            throw new DomainError(`Section order cannot be less than ${SectionOrder.MIN_ORDER}`);
        }

        if (order > SectionOrder.MAX_ORDER) {
            throw new DomainError(`Section order cannot exceed ${SectionOrder.MAX_ORDER}`);
        }
    }

    get value(): number {
        return this.value;
    }

    isValid(): boolean {
        try {
            this.validate(this.value);
            return true;
        } catch {
            return false;
        }
    }

    isFirst(): boolean {
        return this.value === SectionOrder.MIN_ORDER;
    }

    isLast(): boolean {
        return this.value === SectionOrder.MAX_ORDER;
    }

    increment(): SectionOrder {
        const newOrder = Math.min(this.value + 1, SectionOrder.MAX_ORDER);
        return new SectionOrder(newOrder);
    }

    decrement(): SectionOrder {
        const newOrder = Math.max(this.value - 1, SectionOrder.MIN_ORDER);
        return new SectionOrder(newOrder);
    }

    add(amount: number): SectionOrder {
        const newOrder = Math.min(Math.max(this.value + amount, SectionOrder.MIN_ORDER), SectionOrder.MAX_ORDER);
        return new SectionOrder(newOrder);
    }

    compareTo(other: SectionOrder): number {
        if (this.value < other.value) return -1;
        if (this.value > other.value) return 1;
        return 0;
    }

    isBefore(other: SectionOrder): boolean {
        return this.value < other.value;
    }

    isAfter(other: SectionOrder): boolean {
        return this.value > other.value;
    }

    equals(other: SectionOrder): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value.toString();
    }
}