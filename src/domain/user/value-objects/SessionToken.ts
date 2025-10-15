import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

/**
 * SessionToken value object representing a session authentication token
 */
export class SessionToken extends ValueObject<string> {
    private constructor(value: string) {
        super(value);
    }

    /**
     * Creates a SessionToken from a string value
     */
    static create(value: string): SessionToken {
        if (!value || typeof value !== 'string') {
            throw new ValueObjectValidationError('Session token must be a non-empty string');
        }

        if (value.trim().length === 0) {
            throw new ValueObjectValidationError('Session token cannot be empty');
        }

        // Basic validation - token should be at least 32 characters for security
        if (value.length < 32) {
            throw new ValueObjectValidationError('Session token must be at least 32 characters long');
        }

        // Token should not exceed reasonable length (to prevent DoS)
        if (value.length > 512) {
            throw new ValueObjectValidationError('Session token cannot exceed 512 characters');
        }

        return new SessionToken(value);
    }

    /**
     * Returns a masked version of the token for logging/display
     */
    getMasked(): string {
        if (this.value.length <= 8) {
            return '***';
        }
        const start = this.value.substring(0, 4);
        const end = this.value.substring(this.value.length - 4);
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
        return this.value;
    }
}