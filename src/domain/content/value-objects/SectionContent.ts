import { DomainError } from '@/domain/shared/errors/DomainError';

export class SectionContent {
    private constructor(private readonly value: Record<string, any>) {
        this.validate(value);
    }

    static create(content: Record<string, any>): SectionContent {
        return new SectionContent(content);
    }

    static empty(): SectionContent {
        return new SectionContent({});
    }

    private validate(content: Record<string, any>): void {
        if (content === null || content === undefined) {
            throw new DomainError("Section content cannot be null or undefined");
        }

        if (typeof content !== 'object' || Array.isArray(content)) {
            throw new DomainError("Section content must be a valid object");
        }

        // Validate that content doesn't contain functions or other non-serializable values
        try {
            JSON.stringify(content);
        } catch (error) {
            throw new DomainError("Section content must be JSON serializable");
        }
    }

    get value(): Record<string, any> {
        return { ...this.value };
    }

    isValid(): boolean {
        try {
            this.validate(this.value);
            return true;
        } catch {
            return false;
        }
    }

    isEmpty(): boolean {
        return Object.keys(this.value).length === 0;
    }

    hasProperty(key: string): boolean {
        return key in this.value;
    }

    getProperty(key: string): any {
        return this.value[key];
    }

    getPropertyAsString(key: string, defaultValue: string = ""): string {
        const value = this.value[key];
        return typeof value === 'string' ? value : defaultValue;
    }

    getPropertyAsNumber(key: string, defaultValue: number = 0): number {
        const value = this.value[key];
        return typeof value === 'number' ? value : defaultValue;
    }

    getPropertyAsBoolean(key: string, defaultValue: boolean = false): boolean {
        const value = this.value[key];
        return typeof value === 'boolean' ? value : defaultValue;
    }

    getPropertyAsArray(key: string, defaultValue: any[] = []): any[] {
        const value = this.value[key];
        return Array.isArray(value) ? value : defaultValue;
    }

    getPropertyAsObject(key: string, defaultValue: Record<string, any> = {}): Record<string, any> {
        const value = this.value[key];
        return (typeof value === 'object' && value !== null && !Array.isArray(value)) ? value : defaultValue;
    }

    withProperty(key: string, value: any): SectionContent {
        const newContent = { ...this.value, [key]: value };
        return new SectionContent(newContent);
    }

    withoutProperty(key: string): SectionContent {
        const newContent = { ...this.value };
        delete newContent[key];
        return new SectionContent(newContent);
    }

    merge(other: SectionContent): SectionContent {
        const mergedContent = { ...this.value, ...other.value };
        return new SectionContent(mergedContent);
    }

    getKeys(): string[] {
        return Object.keys(this.value);
    }

    getSize(): number {
        return Object.keys(this.value).length;
    }

    toJSON(): Record<string, any> {
        return { ...this.value };
    }

    equals(other: SectionContent): boolean {
        return JSON.stringify(this.value) === JSON.stringify(other.value);
    }

    toString(): string {
        return JSON.stringify(this.value);
    }
}