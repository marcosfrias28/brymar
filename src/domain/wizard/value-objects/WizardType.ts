import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { DomainError } from '@/domain/shared/errors/DomainError';

type ValidWizardType = "property" | "land" | "blog";

export class WizardType extends ValueObject<ValidWizardType> {
    private static readonly VALID_TYPES: ValidWizardType[] = ["property", "land", "blog"];

    private constructor(value: ValidWizardType) {
        super(value);
    }

    static create(type: string): WizardType {
        if (!type || type.trim().length === 0) {
            throw new DomainError("Wizard type cannot be empty");
        }

        const normalizedType = type.trim().toLowerCase() as ValidWizardType;

        if (!this.VALID_TYPES.includes(normalizedType)) {
            throw new DomainError(
                `Invalid wizard type: ${type}. Valid types are: ${this.VALID_TYPES.join(", ")}`
            );
        }

        return new WizardType(normalizedType);
    }

    static property(): WizardType {
        return new WizardType("property");
    }

    static land(): WizardType {
        return new WizardType("land");
    }

    static blog(): WizardType {
        return new WizardType("blog");
    }

    get value(): ValidWizardType {
        return this._value;
    }

    isProperty(): boolean {
        return this._value === "property";
    }

    isLand(): boolean {
        return this._value === "land";
    }

    isBlog(): boolean {
        return this._value === "blog";
    }

    equals(other: WizardType): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return this._value;
    }
}