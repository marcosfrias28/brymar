import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';
import { randomUUID } from 'crypto';

/**
 * SessionId value object representing a unique session identifier
 */
export class SessionId extends ValueObject {
    private constructor(private readonly _value: string) {
        super();
        this.validate();
    }

    /**
     * Creates a SessionId from a string value
     */
    static create(value: string): SessionId {
        return new SessionId(value);
    }

    /**
     * Generates a new unique SessionId
     */
    static generate(): SessionId {
        return new SessionId(randomUUID());
    }

    protected validate(): void {
        if (!this._value || typeof this._value !== 'string') {
            throw new ValueObjectValidationError('SessionId must be a non-empty string');
        }

        if (this._value.trim().length === 0) {
            throw new ValueObjectValidationError('SessionId cannot be empty');
        }

        // Validate UUID format (basic validation)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(this._value)) {
            throw new ValueObjectValidationError('SessionId must be a valid UUID format');
        }
    }

    /**
     * Gets the string value of the SessionId
     */
    get value(): string {
        return this._value;
    }

    /**
     * Checks if this SessionId equals another SessionId
     */
    equals(other: ValueObject): boolean {
        return other instanceof SessionId && this._value === other._value;
    }

    /**
     * Returns string representation
     */
    toString(): string {
        return this._value;
    }
}