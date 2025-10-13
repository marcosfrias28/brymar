import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { DomainError } from '@/domain/shared/errors/DomainError';
import { randomUUID } from "crypto";

export class WizardMediaId extends ValueObject<string> {
    private constructor(value: string) {
        super(value);
    }

    static create(id: string): WizardMediaId {
        if (!id || id.trim().length === 0) {
            throw new DomainError("Wizard media ID cannot be empty");
        }

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id.trim())) {
            throw new DomainError("Wizard media ID must be a valid UUID");
        }

        return new WizardMediaId(id.trim());
    }

    static generate(): WizardMediaId {
        return new WizardMediaId(randomUUID());
    }

    get value(): string {
        return this._value;
    }

    equals(other: WizardMediaId): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return this._value;
    }
}