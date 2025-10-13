import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

export type LandTypeValue = "commercial" | "residential" | "agricultural" | "beachfront" | "industrial" | "mixed-use";

export class LandType extends ValueObject<LandTypeValue> {
    private static readonly VALID_TYPES: LandTypeValue[] = [
        "commercial",
        "residential",
        "agricultural",
        "beachfront",
        "industrial",
        "mixed-use"
    ];

    private static readonly TYPE_DESCRIPTIONS: Record<LandTypeValue, string> = {
        commercial: "Commercial Land",
        residential: "Residential Land",
        agricultural: "Agricultural Land",
        beachfront: "Beachfront Land",
        industrial: "Industrial Land",
        "mixed-use": "Mixed-Use Land"
    };

    private constructor(value: LandTypeValue) {
        super(value);
    }

    static create(type: string): LandType {
        if (!type || type.trim().length === 0) {
            throw new ValueObjectValidationError("Land type cannot be empty");
        }

        const normalizedType = type.toLowerCase().trim() as LandTypeValue;

        if (!this.VALID_TYPES.includes(normalizedType)) {
            throw new ValueObjectValidationError(
                `Invalid land type: ${type}. Valid types are: ${this.VALID_TYPES.join(", ")}`
            );
        }

        return new LandType(normalizedType);
    }

    static commercial(): LandType {
        return new LandType("commercial");
    }

    static residential(): LandType {
        return new LandType("residential");
    }

    static agricultural(): LandType {
        return new LandType("agricultural");
    }

    static beachfront(): LandType {
        return new LandType("beachfront");
    }

    static industrial(): LandType {
        return new LandType("industrial");
    }

    static mixedUse(): LandType {
        return new LandType("mixed-use");
    }

    get value(): LandTypeValue {
        return this._value;
    }

    getDescription(): string {
        return LandType.TYPE_DESCRIPTIONS[this._value];
    }

    isValid(): boolean {
        return LandType.VALID_TYPES.includes(this._value);
    }

    isCommercial(): boolean {
        return this._value === "commercial";
    }

    isResidential(): boolean {
        return this._value === "residential";
    }

    isAgricultural(): boolean {
        return this._value === "agricultural";
    }

    isBeachfront(): boolean {
        return this._value === "beachfront";
    }

    isIndustrial(): boolean {
        return this._value === "industrial";
    }

    isMixedUse(): boolean {
        return this._value === "mixed-use";
    }

    // Business rules for land types
    allowsResidentialDevelopment(): boolean {
        return this._value === "residential" || this._value === "mixed-use";
    }

    allowsCommercialDevelopment(): boolean {
        return this._value === "commercial" || this._value === "mixed-use";
    }

    requiresSpecialPermits(): boolean {
        return this._value === "beachfront" || this._value === "industrial";
    }

    hasEnvironmentalRestrictions(): boolean {
        return this._value === "beachfront" || this._value === "agricultural";
    }

    getTypicalZoningRequirements(): string[] {
        switch (this._value) {
            case "commercial":
                return ["Commercial zoning", "Business license required", "Parking requirements"];
            case "residential":
                return ["Residential zoning", "Building permits", "Setback requirements"];
            case "agricultural":
                return ["Agricultural zoning", "Water rights", "Soil quality assessment"];
            case "beachfront":
                return ["Coastal zone permit", "Environmental impact assessment", "Setback from high tide"];
            case "industrial":
                return ["Industrial zoning", "Environmental permits", "Utility access"];
            case "mixed-use":
                return ["Mixed-use zoning", "Flexible development permits", "Traffic impact study"];
            default:
                return [];
        }
    }

    static getAllTypes(): LandTypeValue[] {
        return [...this.VALID_TYPES];
    }

    static getTypeDescriptions(): Record<LandTypeValue, string> {
        return { ...this.TYPE_DESCRIPTIONS };
    }
}