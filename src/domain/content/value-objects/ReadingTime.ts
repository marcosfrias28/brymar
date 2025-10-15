import { ValueObjectValidationError } from '@/domain/shared/errors/DomainError';

export class ReadingTime {
    private static readonly WORDS_PER_MINUTE = 200;
    private static readonly MIN_READING_TIME = 1; // Minimum 1 minute

    private constructor(private readonly _minutes: number) {
        this.validate(_minutes);
    }

    static create(minutes: number): ReadingTime {
        return new ReadingTime(minutes);
    }

    static calculateFromContent(content: string): ReadingTime {
        if (!content || content.trim().length === 0) {
            return new ReadingTime(ReadingTime.MIN_READING_TIME);
        }

        const wordCount = content.trim().split(/\s+/).length;
        const calculatedMinutes = Math.ceil(wordCount / ReadingTime.WORDS_PER_MINUTE);

        return new ReadingTime(Math.max(calculatedMinutes, ReadingTime.MIN_READING_TIME));
    }

    static calculateFromWordCount(wordCount: number): ReadingTime {
        if (wordCount <= 0) {
            return new ReadingTime(ReadingTime.MIN_READING_TIME);
        }

        const calculatedMinutes = Math.ceil(wordCount / ReadingTime.WORDS_PER_MINUTE);
        return new ReadingTime(Math.max(calculatedMinutes, ReadingTime.MIN_READING_TIME));
    }

    private validate(minutes: number): void {
        if (!Number.isInteger(minutes) || minutes < ReadingTime.MIN_READING_TIME) {
            throw new ValueObjectValidationError(`Reading time must be at least ${ReadingTime.MIN_READING_TIME} minute`);
        }

        if (minutes > 120) { // Maximum 2 hours seems reasonable for a blog post
            throw new ValueObjectValidationError("Reading time cannot exceed 120 minutes");
        }
    }

    get minutes(): number {
        return this._minutes;
    }

    isValid(): boolean {
        try {
            this.validate(this._minutes);
            return true;
        } catch {
            return false;
        }
    }

    isShortRead(): boolean {
        return this._minutes <= 3;
    }

    isMediumRead(): boolean {
        return this._minutes > 3 && this._minutes <= 10;
    }

    isLongRead(): boolean {
        return this._minutes > 10;
    }

    getReadingCategory(): "short" | "medium" | "long" {
        if (this.isShortRead()) return "short";
        if (this.isMediumRead()) return "medium";
        return "long";
    }

    getDisplayText(): string {
        if (this._minutes === 1) {
            return "1 minuto de lectura";
        }
        return `${this._minutes} minutos de lectura`;
    }

    getShortDisplayText(): string {
        return `${this._minutes} min`;
    }

    equals(other: ReadingTime): boolean {
        return this._minutes === other._minutes;
    }

    toString(): string {
        return this._minutes.toString();
    }
}