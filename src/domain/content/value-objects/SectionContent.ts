import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

export class SectionContent {
    private constructor(private readonly _value: Record<string, any>) {
        this.validate(_value);
    }

    static create(content: Record<string, any>): SectionContent {
        return new SectionContent(content);
    }

    static empty(): SectionContent {
        return new SectionContent({});
    }

    private validate(content: Record<string, any>): void {
        if (content === null || content === undefined) {
            throw new ValueObjectValidationError("Section content cannot be null or undefined");
        }

        if (typeof content !== 'object' || Array.isArray(content)) {
            throw new ValueObjectValidationError("Section content must be a valid object");
        }

        // Validate that content doesn't contain functions or other non-serializable values
        try {
            JSON.stringify(content);
        } catch (error) {
            throw new ValueObjectValidationError("Section content must be JSON serializable");
        }
    }

    get value(): Record<string, any> {
        return { ...this._value };
    }

    isValid(): boolean {
        try {
            this.validate(this._value);
            return true;
        } catch {
            return false;
        }
    }

    isEmpty(): boolean {
        return Object.keys(this._value).length === 0;
    }

    hasProperty(key: string): boolean {
        return key in this._value;
    }

    getProperty(key: string): any {
        return this._value[key];
    }

    getPropertyAsString(key: string, defaultValue: string = ""): string {
        const value = this._value[key];
        return typeof value === 'string' ? value : defaultValue;
    }

    getPropertyAsNumber(key: string, defaultValue: number = 0): number {
        const value = this._value[key];
        return typeof value === 'number' ? value : defaultValue;
    }

    getPropertyAsBoolean(key: string, defaultValue: boolean = false): boolean {
        const value = this._value[key];
        return typeof value === 'boolean' ? value : defaultValue;
    }

    getPropertyAsArray(key: string, defaultValue: any[] = []): any[] {
        const value = this._value[key];
        return Array.isArray(value) ? value : defaultValue;
    }

    getPropertyAsObject(key: string, defaultValue: Record<string, any> = {}): Record<string, any> {
        const value = this._value[key];
        return (typeof value === 'object' && value !== null && !Array.isArray(value)) ? value : defaultValue;
    }

    withProperty(key: string, value: any): SectionContent {
        const newContent = { ...this._value, [key]: value };
        return new SectionContent(newContent);
    }

    withoutProperty(key: string): SectionContent {
        const newContent = { ...this._value };
        delete newContent[key];
        return new SectionContent(newContent);
    }

    merge(other: SectionContent): SectionContent {
        const mergedContent = { ...this._value, ...other._value };
        return new SectionContent(mergedContent);
    }

    getKeys(): string[] {
        return Object.keys(this._value);
    }

    getSize(): number {
        return Object.keys(this._value).length;
    }

    toJSON(): Record<string, any> {
        return { ...this._value };
    }

    equals(other: SectionContent): boolean {
        return JSON.stringify(this._value) === JSON.stringify(other._value);
    }

    toString(): string {
        return JSON.stringify(this._value);
    }
}