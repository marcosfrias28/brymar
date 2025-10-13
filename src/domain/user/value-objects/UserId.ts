import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';
import { randomUUID } from 'crypto';

export class UserId extends ValueObject<string> {
    private constructor(value: string) {
        super(value);
    }

    static create(id: string): UserId {
        if (!id || typeof id !== 'string') {
            throw new ValueObjectValidationError('User ID is required');
        }

        const trimmedId = id.trim();

        if (trimmedId.length === 0) {
            throw new ValueObjectValidationError('User ID cannot be empty');
        }

        return new UserId(trimmedId);
    }

    static generate(): UserId {
        return new UserId(randomUUID());
    }
}