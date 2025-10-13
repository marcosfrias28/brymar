export abstract class ValueObject<T> {
    protected constructor(protected readonly _value: T) { }

    get value(): T {
        return this._value;
    }

    equals(other: ValueObject<T>): boolean {
        if (!other || other.constructor !== this.constructor) {
            return false;
        }
        return this._value === other._value;
    }

    toString(): string {
        return String(this._value);
    }
}