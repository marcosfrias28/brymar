import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';
import { randomUUID } from "crypto";

export class LandId extends ValueObject<string> {
    private constructor(value: string) {
        super(value);
    }

    static create(id: string): LandId {
        if (!id || id.trim().length === 0) {
            throw new ValueObjectValidationError("Land ID cannot be empty");
        }

        // Validate UUID format (basic validation)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id.trim())) {
            throw new ValueObjectValidationError("Land ID must be a valid UUID");
        }

        return new LandId(id.trim());
    }

    static generate(): LandId {
        return new LandId(randomUUID());
    }

    get value(): string {
        return this._value;
    }
}