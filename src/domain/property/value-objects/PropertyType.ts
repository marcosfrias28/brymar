import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { DomainError } from '@/domain/shared/errors/DomainError';

export enum PropertyTypeEnum {
    HOUSE = "house",
    APARTMENT = "apartment",
    CONDO = "condo",
    TOWNHOUSE = "townhouse",
    VILLA = "villa",
    STUDIO = "studio",
    PENTHOUSE = "penthouse",
    DUPLEX = "duplex",
    LAND = "land",
    COMMERCIAL = "commercial",
    OFFICE = "office",
    WAREHOUSE = "warehouse",
}

export class PropertyType extends ValueObject<PropertyTypeEnum> {
    private constructor(value: PropertyTypeEnum) {
        super(value);
    }

    static create(type: string): PropertyType {
        if (!type || type.trim().length === 0) {
            throw new DomainError("Property type cannot be empty");
        }

        const normalizedType = type.toLowerCase().trim();

        // Check if the type is valid
        const validTypes = Object.values(PropertyTypeEnum);
        const matchedType = validTypes.find(validType => validType === normalizedType);

        if (!matchedType) {
            throw new DomainError(`Invalid property type: ${type}. Valid types are: ${validTypes.join(', ')}`);
        }

        return new PropertyType(matchedType);
    }

    static house(): PropertyType {
        return new PropertyType(PropertyTypeEnum.HOUSE);
    }

    static apartment(): PropertyType {
        return new PropertyType(PropertyTypeEnum.APARTMENT);
    }

    static condo(): PropertyType {
        return new PropertyType(PropertyTypeEnum.CONDO);
    }

    static townhouse(): PropertyType {
        return new PropertyType(PropertyTypeEnum.TOWNHOUSE);
    }

    static villa(): PropertyType {
        return new PropertyType(PropertyTypeEnum.VILLA);
    }

    static studio(): PropertyType {
        return new PropertyType(PropertyTypeEnum.STUDIO);
    }

    static penthouse(): PropertyType {
        return new PropertyType(PropertyTypeEnum.PENTHOUSE);
    }

    static duplex(): PropertyType {
        return new PropertyType(PropertyTypeEnum.DUPLEX);
    }

    static land(): PropertyType {
        return new PropertyType(PropertyTypeEnum.LAND);
    }

    static commercial(): PropertyType {
        return new PropertyType(PropertyTypeEnum.COMMERCIAL);
    }

    static office(): PropertyType {
        return new PropertyType(PropertyTypeEnum.OFFICE);
    }

    static warehouse(): PropertyType {
        return new PropertyType(PropertyTypeEnum.WAREHOUSE);
    }

    isResidential(): boolean {
        const residentialTypes = [
            PropertyTypeEnum.HOUSE,
            PropertyTypeEnum.APARTMENT,
            PropertyTypeEnum.CONDO,
            PropertyTypeEnum.TOWNHOUSE,
            PropertyTypeEnum.VILLA,
            PropertyTypeEnum.STUDIO,
            PropertyTypeEnum.PENTHOUSE,
            PropertyTypeEnum.DUPLEX,
        ];
        return residentialTypes.includes(this.value);
    }

    isCommercial(): boolean {
        const commercialTypes = [
            PropertyTypeEnum.COMMERCIAL,
            PropertyTypeEnum.OFFICE,
            PropertyTypeEnum.WAREHOUSE,
        ];
        return commercialTypes.includes(this.value);
    }

    isLand(): boolean {
        return this.value === PropertyTypeEnum.LAND;
    }

    requiresBedrooms(): boolean {
        // Land and some commercial properties don't require bedrooms
        return this.isResidential() && this.value !== PropertyTypeEnum.LAND;
    }

    requiresBathrooms(): boolean {
        // Similar to bedrooms
        return this.isResidential() && this.value !== PropertyTypeEnum.LAND;
    }

    getDisplayName(): string {
        const displayNames: Record<PropertyTypeEnum, string> = {
            [PropertyTypeEnum.HOUSE]: "House",
            [PropertyTypeEnum.APARTMENT]: "Apartment",
            [PropertyTypeEnum.CONDO]: "Condominium",
            [PropertyTypeEnum.TOWNHOUSE]: "Townhouse",
            [PropertyTypeEnum.VILLA]: "Villa",
            [PropertyTypeEnum.STUDIO]: "Studio",
            [PropertyTypeEnum.PENTHOUSE]: "Penthouse",
            [PropertyTypeEnum.DUPLEX]: "Duplex",
            [PropertyTypeEnum.LAND]: "Land",
            [PropertyTypeEnum.COMMERCIAL]: "Commercial",
            [PropertyTypeEnum.OFFICE]: "Office",
            [PropertyTypeEnum.WAREHOUSE]: "Warehouse",
        };

        return displayNames[this.value];
    }

    static getAllTypes(): PropertyType[] {
        return Object.values(PropertyTypeEnum).map(type => new PropertyType(type));
    }

    static getResidentialTypes(): PropertyType[] {
        return PropertyType.getAllTypes().filter(type => type.isResidential());
    }

    static getCommercialTypes(): PropertyType[] {
        return PropertyType.getAllTypes().filter(type => type.isCommercial());
    }
}