import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { BusinessRuleViolationError } from '@/domain/shared/errors/DomainError';

type ValidMediaType = "image" | "video";

export class MediaType extends ValueObject<ValidMediaType> {
    private static readonly VALID_TYPES: ValidMediaType[] = ["image", "video"];

    private constructor(value: ValidMediaType) {
        super(value);
    }

    static create(type: string): MediaType {
        if (!type || type.trim().length === 0) {
            throw new BusinessRuleViolationError("Media type cannot be empty", "WIZARD_VALIDATION");
        }

        const normalizedType = type.trim().toLowerCase() as ValidMediaType;

        if (!this.VALID_TYPES.includes(normalizedType)) {
            throw new BusinessRuleViolationError(
                `Invalid media type: ${type}. Valid types are: ${this.VALID_TYPES.join(", ")}`,
                "WIZARD_VALIDATION"
            );
        }

        return new MediaType(normalizedType);
    }

    static image(): MediaType {
        return new MediaType("image");
    }

    static video(): MediaType {
        return new MediaType("video");
    }

    get value(): ValidMediaType {
        return this._value;
    }

    isImage(): boolean {
        return this._value === "image";
    }

    isVideo(): boolean {
        return this._value === "video";
    }

    equals(other: MediaType): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return this._value;
    }
}