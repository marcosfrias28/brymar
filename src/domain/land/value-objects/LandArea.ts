import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

export class LandArea extends ValueObject<number> {
    private static readonly MIN_AREA = 1; // 1 square meter minimum
    private static readonly MAX_AREA = 100_000_000; // 100 million square meters (10,000 hectares)

    private constructor(value: number) {
        super(value);
    }

    static create(area: number): LandArea {
        if (typeof area !== 'number' || isNaN(area)) {
            throw new ValueObjectValidationError("Land area must be a valid number");
        }

        if (area < this.MIN_AREA) {
            throw new ValueObjectValidationError(`Land area must be at least ${this.MIN_AREA} square meter`);
        }

        if (area > this.MAX_AREA) {
            throw new ValueObjectValidationError(`Land area cannot exceed ${this.MAX_AREA.toLocaleString()} square meters`);
        }

        // Business rule: Area should be a positive integer (no fractional square meters)
        if (area % 1 !== 0) {
            throw new ValueObjectValidationError("Land area must be a whole number of square meters");
        }

        return new LandArea(area);
    }

    getValue(): number {
        return this._value;
    }

    isValid(): boolean {
        return (
            this._value >= LandArea.MIN_AREA &&
            this._value <= LandArea.MAX_AREA &&
            this._value % 1 === 0
        );
    }

    // Convert to hectares (1 hectare = 10,000 square meters)
    toHectares(): number {
        return this._value / 10_000;
    }

    // Convert to tareas (Dominican Republic unit: 1 tarea = 629 square meters)
    toTareas(): number {
        return this._value / 629;
    }

    // Convert to acres (1 acre = 4,047 square meters)
    toAcres(): number {
        return this._value / 4_047;
    }

    format(): string {
        return `${this._value.toLocaleString()} m²`;
    }

    formatWithUnits(): string {
        const hectares = this.toHectares();
        const tareas = this.toTareas();

        if (hectares >= 1) {
            return `${this._value.toLocaleString()} m² (${hectares.toFixed(2)} ha, ${tareas.toFixed(2)} tareas)`;
        } else if (tareas >= 1) {
            return `${this._value.toLocaleString()} m² (${tareas.toFixed(2)} tareas)`;
        } else {
            return `${this._value.toLocaleString()} m²`;
        }
    }

    isLargerThan(other: LandArea): boolean {
        return this._value > other._value;
    }

    isSmallerThan(other: LandArea): boolean {
        return this._value < other._value;
    }
}