import { ValueObject } from './ValueObject';
import { Currency } from './Currency';
import { BusinessRuleViolationError } from '../errors/DomainError';

interface PriceData {
    amount: number;
    currency: Currency;
}

export class Price extends ValueObject<PriceData> {
    private static readonly DEFAULT_MIN_AMOUNT = 0;
    private static readonly DEFAULT_MAX_AMOUNT = 1_000_000_000; // 1 billion

    private constructor(amount: number, currency: Currency, private readonly entityType: string) {
        super({ amount, currency });
    }

    static create(
        amount: number,
        currencyCode: string = "USD",
        entityType: string = 'Entity',
        minAmount: number = Price.DEFAULT_MIN_AMOUNT,
        maxAmount: number = Price.DEFAULT_MAX_AMOUNT,
        allowDecimals: boolean = true
    ): Price {
        if (typeof amount !== 'number' || isNaN(amount)) {
            throw new BusinessRuleViolationError(`${entityType} price must be a valid number`, "VALIDATION_ERROR");
        }

        if (amount < minAmount) {
            throw new BusinessRuleViolationError(
                `${entityType} price cannot be less than ${minAmount.toLocaleString()}`,
                "VALIDATION_ERROR"
            );
        }

        if (amount > maxAmount) {
            throw new BusinessRuleViolationError(
                `${entityType} price cannot exceed ${maxAmount.toLocaleString()}`,
                "VALIDATION_ERROR"
            );
        }

        // Check for decimal restriction (e.g., land prices should be whole numbers)
        if (!allowDecimals && amount % 1 !== 0) {
            throw new BusinessRuleViolationError(
                `${entityType} price must be a whole number (no cents)`,
                "VALIDATION_ERROR"
            );
        }

        const currency = Currency.create(currencyCode);
        return new Price(amount, currency, entityType);
    }

    get amount(): number {
        return this.value.amount;
    }

    get currency(): Currency {
        return this.value.currency;
    }

    getEntityType(): string {
        return this.entityType;
    }

    isSignificantlyDifferent(other: Price, threshold: number = 0.1): boolean {
        if (!this.currency.equals(other.currency)) {
            throw new BusinessRuleViolationError(
                "Cannot compare prices with different currencies",
                "VALIDATION_ERROR"
            );
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
            throw new BusinessRuleViolationError(
                "Cannot add prices with different currencies",
                "VALIDATION_ERROR"
            );
        }
        return Price.create(
            this.amount + other.amount,
            this.currency.code,
            this.entityType
        );
    }

    subtract(other: Price): Price {
        if (!this.currency.equals(other.currency)) {
            throw new BusinessRuleViolationError(
                "Cannot subtract prices with different currencies",
                "VALIDATION_ERROR"
            );
        }
        const result = this.amount - other.amount;
        if (result < 0) {
            throw new BusinessRuleViolationError("Price cannot be negative", "VALIDATION_ERROR");
        }
        return Price.create(result, this.currency.code, this.entityType);
    }

    multiply(factor: number): Price {
        if (factor < 0) {
            throw new BusinessRuleViolationError(
                "Cannot multiply price by negative factor",
                "VALIDATION_ERROR"
            );
        }
        return Price.create(
            this.amount * factor,
            this.currency.code,
            this.entityType
        );
    }

    isValid(): boolean {
        return this.amount >= 0;
    }

    isZero(): boolean {
        return this.amount === 0;
    }

    isGreaterThan(other: Price): boolean {
        if (!this.currency.equals(other.currency)) {
            throw new BusinessRuleViolationError(
                "Cannot compare prices with different currencies",
                "VALIDATION_ERROR"
            );
        }
        return this.amount > other.amount;
    }

    isLessThan(other: Price): boolean {
        if (!this.currency.equals(other.currency)) {
            throw new BusinessRuleViolationError(
                "Cannot compare prices with different currencies",
                "VALIDATION_ERROR"
            );
        }
        return this.amount < other.amount;
    }

    getPricePerUnit(units: number): number {
        if (units <= 0) {
            throw new BusinessRuleViolationError(
                "Units must be greater than 0 to calculate price per unit",
                "VALIDATION_ERROR"
            );
        }
        return Math.round(this.amount / units);
    }

    formatPricePerUnit(units: number, unitLabel: string = "unit"): string {
        const pricePerUnit = this.getPricePerUnit(units);
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: this.currency.code,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(pricePerUnit) + `/${unitLabel}`;
    }
}

// Specific price factory functions for different validation rules
export class PropertyPrice {
    static create(amount: number, currencyCode: string = "USD"): Price {
        return Price.create(amount, currencyCode, 'Property', 0, 100_000_000, true);
    }
}

export class LandPrice {
    static create(amount: number, currencyCode: string = "USD"): Price {
        return Price.create(amount, currencyCode, 'Land', 1000, 1_000_000_000, false);
    }
}