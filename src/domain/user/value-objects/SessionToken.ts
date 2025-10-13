import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

/**
 * SessionToken value object representing a session authentication token
 */
export class SessionToken extends ValueObject {
    private constructor(private readonly _value: string) {
        super();
        this.validate();
    }

    /**
     * Creates a SessionToken from a string value
     */
    static create(value: string): SessionToken {
        return new SessionToken(value);
    }

    protected validate(): void {
        if (!this._value || typeof this._value !== 'string') {
            throw new ValueObjectValidationError('Session token must be a non-empty string');
        }

        if (this._value.trim().length === 0) {
            throw new ValueObjectValidationError('Session token cannot be empty');
        }

        // Basic validation - token should be at least 32 characters for security
        if (this._value.length < 32) {
            throw new ValueObjectValidationError('Session token must be at least 32 characters long');
        }

        // Token should not exceed reasonable length (to prevent DoS)
        if (this._value.length > 512) {
            throw new ValueObjectValidationError('Session token cannot exceed 512 characters');
        }
    }

    /**
     * Gets the string value of the token
     */
    get value(): string {
        return this._value;
    }

    /**
     * Checks if this token equals another token
     */
    equals(other: ValueObject): boolean {
        return other instanceof SessionToken && this._value === other._value;
    }

    /**
     * Returns a masked version of the token for logging/display
     */
    getMasked(): string {
        if (this._value.length <= 8) {
            return '***';
        }
        const start = this._value.substring(0, 4);
        const end = this._value.substring(this._value.length - 4);
        return `${start}...${end}`;
    }

    /**
     * Returns string representation (masked for security)
     */
    toString(): string {
        return this.getMasked();
    }

    /**
     * Gets the raw token value (use with caution)
     */
    getRawValue(): string {
        return this._value;
    }
}