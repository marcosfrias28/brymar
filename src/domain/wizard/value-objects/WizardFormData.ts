import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { BusinessRuleViolationError } from '@/domain/shared/errors/DomainError';

export class WizardFormData extends ValueObject<Record<string, any>> {
    private constructor(value: Record<string, any>) {
        super(value);
    }

    static create(formData: Record<string, any> = {}): WizardFormData {
        if (typeof formData !== "object" || formData === null) {
            throw new BusinessRuleViolationError("Form data must be a valid object", "WIZARD_VALIDATION");
        }

        // Create a deep copy to ensure immutability
        const clonedData = this.deepClone(formData);

        return new WizardFormData(clonedData);
    }

    static empty(): WizardFormData {
        return new WizardFormData({});
    }

    private static deepClone(obj: any): any {
        if (obj === null || typeof obj !== "object") {
            return obj;
        }

        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.deepClone(item));
        }

        const cloned: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }

        return cloned;
    }

    get value(): Record<string, any> {
        return WizardFormData.deepClone(this._value);
    }

    getField(fieldName: string): any {
        return this._value[fieldName];
    }

    hasField(fieldName: string): boolean {
        return fieldName in this._value;
    }

    updateField(fieldName: string, value: any): WizardFormData {
        if (!fieldName || fieldName.trim().length === 0) {
            throw new BusinessRuleViolationError("Field name cannot be empty", "WIZARD_VALIDATION");
        }

        const newData = { ...this._value };
        newData[fieldName] = value;

        return new WizardFormData(newData);
    }

    removeField(fieldName: string): WizardFormData {
        if (!fieldName || fieldName.trim().length === 0) {
            throw new BusinessRuleViolationError("Field name cannot be empty", "WIZARD_VALIDATION");
        }

        const newData = { ...this._value };
        delete newData[fieldName];

        return new WizardFormData(newData);
    }

    merge(otherData: Record<string, any>): WizardFormData {
        if (typeof otherData !== "object" || otherData === null) {
            throw new BusinessRuleViolationError("Data to merge must be a valid object", "WIZARD_VALIDATION");
        }

        const mergedData = {
            ...this._value,
            ...otherData,
        };

        return new WizardFormData(mergedData);
    }

    getFieldNames(): string[] {
        return Object.keys(this._value);
    }

    isEmpty(): boolean {
        return Object.keys(this._value).length === 0;
    }

    size(): number {
        return Object.keys(this._value).length;
    }

    equals(other: WizardFormData): boolean {
        return JSON.stringify(this._value) === JSON.stringify(other._value);
    }

    toJSON(): Record<string, any> {
        return this.value;
    }

    toString(): string {
        return JSON.stringify(this._value, null, 2);
    }
}