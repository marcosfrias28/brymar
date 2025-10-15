import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';
import { randomUUID } from 'crypto';

/**
 * SessionId value object representing a unique session identifier
 */
export class SessionId extends ValueObject<string> {
    private constructor(value: string) {
        super(value);
    }

    /**
     * Creates a SessionId from a string value
     */
    static create(value: string): SessionId {
        if (!value || typeof value !== 'string') {
            throw new ValueObjectValidationError('SessionId must be a non-empty string');
        }

        if (value.trim().length === 0) {
            throw new ValueObjectValidationError('SessionId cannot be empty');
        }

        // Validate UUID format (basic validation)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(value)) {
            throw new ValueObjectValidationError('SessionId must be a valid UUID format');
        }

        return new SessionId(value);
    }

    /**
     * Generates a new unique SessionId
     */
    static generate(): SessionId {
        return new SessionId(randomUUID());
    }


}