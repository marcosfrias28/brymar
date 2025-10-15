import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { BusinessRuleViolationError } from '@/domain/shared/errors/DomainError';
import { v4 as uuidv4 } from "uuid";

export class PropertyId extends ValueObject<string> {
    private constructor(value: string) {
        super(value);
    }

    static create(value: string): PropertyId {
        if (!value || value.trim().length === 0) {
            throw new BusinessRuleViolationError("Property ID cannot be empty", "PROPERTY_VALIDATION");
        }

        // Validate UUID format or numeric ID
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
        const isNumeric = /^\d+$/.test(value);

        if (!isUuid && !isNumeric) {
            throw new BusinessRuleViolationError("Property ID must be a valid UUID or numeric ID", "PROPERTY_VALIDATION");
        }

        return new PropertyId(value);
    }

    static generate(): PropertyId {
        return new PropertyId(uuidv4());
    }

    static fromNumber(id: number): PropertyId {
        if (id <= 0) {
            throw new BusinessRuleViolationError("Property ID must be a positive number", "PROPERTY_VALIDATION");
        }
        return new PropertyId(id.toString());
    }

    toNumber(): number {
        const num = parseInt(this.value);
        if (isNaN(num)) {
            throw new BusinessRuleViolationError("Cannot convert UUID PropertyId to number", "PROPERTY_VALIDATION");
        }
        return num;
    }

    isUuid(): boolean {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(this.value);
    }

    isNumeric(): boolean {
        return /^\d+$/.test(this.value);
    }
}