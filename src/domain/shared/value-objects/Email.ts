import { ValueObject } from './ValueObject';
import { ValueObjectValidationError } from '../errors/DomainError';

export class Email extends ValueObject<string> {
    private constructor(value: string) {
        super(value);
    }

    static create(email: string): Email {
        if (!email || typeof email !== 'string') {
            throw new ValueObjectValidationError('Email is required');
        }

        const trimmedEmail = email.trim().toLowerCase();

        if (!this.isValidEmail(trimmedEmail)) {
            throw new ValueObjectValidationError('Invalid email format');
        }

        return new Email(trimmedEmail);
    }

    private static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) && email.length <= 254;
    }

    getDomain(): string {
        return this._value.split('@')[1];
    }

    getLocalPart(): string {
        return this._value.split('@')[0];
    }
}