import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { Currency } from '@/domain/shared/value-objects/Currency';
import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

interface LandPriceData {
    amount: number;
    currency: Currency;
}

export class LandPrice extends ValueObject<LandPriceData> {
    private static readonly MIN_PRICE = 1000; // Minimum $1,000 USD
    private static readonly MAX_PRICE = 1_000_000_000; // Maximum $1 billion USD

    private constructor(amount: number, currency: Currency) {
        super({ amount, currency });
    }

    static create(amount: number, currencyCode: string = "USD"): LandPrice {
        if (typeof amount !== 'number' || isNaN(amount)) {
            throw new ValueObjectValidationError("Land price must be a valid number");
        }

        if (amount < this.MIN_PRICE) {
            throw new ValueObjectValidationError(`Land price must be at least $${this.MIN_PRICE.toLocaleString()}`);
        }

        if (amount > this.MAX_PRICE) {
            throw new ValueObjectValidationError(`Land price cannot exceed $${this.MAX_PRICE.toLocaleString()}`);
        }

        // Business rule: Price should be a positive integer (no cents for land prices)
        if (amount % 1 !== 0) {
            throw new ValueObjectValidationError("Land price must be a whole number (no cents)");
        }

        const currency = Currency.create(currencyCode);
        return new LandPrice(amount, currency);
    }

    get amount(): number {
        return this._value.amount;
    }

    get currency(): Currency {
        return this._value.currency;
    }

    isValid(): boolean {
        return (
            this._value.amount >= LandPrice.MIN_PRICE &&
            this._value.amount <= LandPrice.MAX_PRICE &&
            this._value.amount % 1 === 0
        );
    }

    format(): string {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: this._value.currency.code,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(this._value.amount);
    }

    formatCompact(): string {
        const formatter = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: this._value.currency.code,
            notation: "compact",
            minimumFractionDigits: 0,
            maximumFractionDigits: 1,
        });
        return formatter.format(this._value.amount);
    }

    getPricePerUnit(area: number): number {
        if (area <= 0) {
            throw new ValueObjectValidationError("Area must be greater than 0 to calculate price per unit");
        }
        return Math.round(this._value.amount / area);
    }

    formatPricePerSquareMeter(area: number): string {
        const pricePerM2 = this.getPricePerUnit(area);
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: this._value.currency.code,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(pricePerM2) + "/m²";
    }

    isSignificantlyDifferent(other: LandPrice): boolean {
        // Business rule: 15% change is considered significant for land prices
        const percentageChange = Math.abs(this._value.amount - other._value.amount) / other._value.amount;
        return percentageChange > 0.15;
    }

    isHigherThan(other: LandPrice): boolean {
        // Convert to same currency if needed (simplified - assumes USD for now)
        return this._value.amount > other._value.amount;
    }

    isLowerThan(other: LandPrice): boolean {
        // Convert to same currency if needed (simplified - assumes USD for now)
        return this._value.amount < other._value.amount;
    }

    add(other: LandPrice): LandPrice {
        // Simplified - assumes same currency
        if (!this._value.currency.equals(other._value.currency)) {
            throw new ValueObjectValidationError("Cannot add prices with different currencies");
        }
        return LandPrice.create(this._value.amount + other._value.amount, this._value.currency.code);
    }

    subtract(other: LandPrice): LandPrice {
        // Simplified - assumes same currency
        if (!this._value.currency.equals(other._value.currency)) {
            throw new ValueObjectValidationError("Cannot subtract prices with different currencies");
        }
        const result = this._value.amount - other._value.amount;
        if (result < 0) {
            throw new ValueObjectValidationError("Price cannot be negative");
        }
        return LandPrice.create(result, this._value.currency.code);
    }

    multiplyBy(factor: number): LandPrice {
        if (factor <= 0) {
            throw new ValueObjectValidationError("Price multiplication factor must be positive");
        }
        return LandPrice.create(Math.round(this._value.amount * factor), this._value.currency.code);
    }
}