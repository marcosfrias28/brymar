import { ValueObject } from './ValueObject';
import { ValueObjectValidationError } from '../errors/DomainError';

export class Currency extends ValueObject<string> {
    private static readonly SUPPORTED_CURRENCIES = [
        'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK', 'NZD'
    ];

    private constructor(value: string) {
        super(value);
    }

    static create(code: string): Currency {
        if (!code || typeof code !== 'string') {
            throw new ValueObjectValidationError('Currency code is required');
        }

        const upperCode = code.toUpperCase().trim();

        if (upperCode.length !== 3) {
            throw new ValueObjectValidationError('Currency code must be 3 characters');
        }

        if (!this.SUPPORTED_CURRENCIES.includes(upperCode)) {
            throw new ValueObjectValidationError(`Unsupported currency: ${upperCode}`);
        }

        return new Currency(upperCode);
    }

    get code(): string {
        return this._value;
    }

    getSymbol(): string {
        const symbols: Record<string, string> = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            JPY: '¥',
            CAD: 'C$',
            AUD: 'A$',
            CHF: 'CHF',
            CNY: '¥',
            SEK: 'kr',
            NZD: 'NZ$'
        };
        return symbols[this._value] || this._value;
    }
}