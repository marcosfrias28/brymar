import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { Currency } from '@/domain/shared/value-objects/Currency';
import { BusinessRuleViolationError } from '@/domain/shared/errors/DomainError';

interface PriceData {
    amount: number;
    currency: Currency;
}

export class Price extends ValueObject<PriceData> {
    private static readonly MIN_AMOUNT = 0;
    private static readonly MAX_AMOUNT = 100_000_000; // 100 million

    private constructor(amount: number, currency: Currency) {
        super({ amount, currency });
    }

    static create(amount: number, currencyCode: string = "USD"): Price {
        if (amount < this.MIN_AMOUNT) {
            throw new BusinessRuleViolationError("Price cannot be negative", "PROPERTY_VALIDATION");
        }

        if (amount > this.MAX_AMOUNT) {
            throw new BusinessRuleViolationError(`Price cannot exceed ${this.MAX_AMOUNT.toLocaleString()}`, "PROPERTY_VALIDATION");
        }

        const currency = Currency.create(currencyCode);
        return new Price(amount, currency);
    }

    get amount(): number {
        return this.value.amount;
    }

    get currency(): Currency {
        return this.value.currency;
    }

    isSignificantlyDifferent(other: Price, threshold: number = 0.1): boolean {
        if (!this.currency.equals(other.currency)) {
            throw new BusinessRuleViolationError("Cannot compare prices with different currencies", "PROPERTY_VALIDATION");
        }

        if (other.amount === 0) {
            return this.amount > 0;
        }

        const percentageChange = Math.abs(this.amount - other.amount) / other.amount;
        return percentageChange > threshold;
    }

    format(locale: string = "en-US"): string {
        return new Intl.NumberFormat(locale, {
            style: "currency",
            currency: this.currency.code,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(this.amount);
    }

    formatCompact(locale: string = "en-US"): string {
        return new Intl.NumberFormat(locale, {
            style: "currency",
            currency: this.currency.code,
            notation: "compact",
            minimumFractionDigits: 0,
            maximumFractionDigits: 1,
        }).format(this.amount);
    }

    add(other: Price): Price {
        if (!this.currency.equals(other.currency)) {
            throw new BusinessRuleViolationError("Cannot add prices with different currencies", "PROPERTY_VALIDATION");
        }
        return Price.create(this.amount + other.amount, this.currency.code);
    }

    subtract(other: Price): Price {
        if (!this.currency.equals(other.currency)) {
            throw new BusinessRuleViolationError("Cannot subtract prices with different currencies", "PROPERTY_VALIDATION");
        }
        return Price.create(this.amount - other.amount, this.currency.code);
    }

    multiply(factor: number): Price {
        if (factor < 0) {
            throw new BusinessRuleViolationError("Cannot multiply price by negative factor", "PROPERTY_VALIDATION");
        }
        return Price.create(this.amount * factor, this.currency.code);
    }

    isValid(): boolean {
        return this.amount >= Price.MIN_AMOUNT &&
            this.amount <= Price.MAX_AMOUNT;
    }

    isZero(): boolean {
        return this.amount === 0;
    }

    isGreaterThan(other: Price): boolean {
        if (!this.currency.equals(other.currency)) {
            throw new BusinessRuleViolationError("Cannot compare prices with different currencies", "PROPERTY_VALIDATION");
        }
        return this.amount > other.amount;
    }

    isLessThan(other: Price): boolean {
        if (!this.currency.equals(other.currency)) {
            throw new BusinessRuleViolationError("Cannot compare prices with different currencies", "PROPERTY_VALIDATION");
        }
        return this.amount < other.amount;
    }
}