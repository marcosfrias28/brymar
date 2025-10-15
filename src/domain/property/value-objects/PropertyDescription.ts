import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { BusinessRuleViolationError } from '@/domain/shared/errors/DomainError';

export class PropertyDescription extends ValueObject<string> {
    private static readonly MIN_LENGTH = 10;
    private static readonly MAX_LENGTH = 2000;

    private constructor(value: string) {
        super(value);
    }

    static create(description: string): PropertyDescription {
        if (!description || description.trim().length === 0) {
            throw new BusinessRuleViolationError("Property description cannot be empty", "PROPERTY_VALIDATION");
        }

        const trimmedDescription = description.trim();

        if (trimmedDescription.length < this.MIN_LENGTH) {
            throw new BusinessRuleViolationError(`Property description must be at least ${this.MIN_LENGTH} characters long`, "PROPERTY_VALIDATION");
        }

        if (trimmedDescription.length > this.MAX_LENGTH) {
            throw new BusinessRuleViolationError(`Property description cannot exceed ${this.MAX_LENGTH} characters`, "PROPERTY_VALIDATION");
        }

        // Check for inappropriate content (basic validation)
        if (this.containsInappropriateContent(trimmedDescription)) {
            throw new BusinessRuleViolationError("Property description contains inappropriate content", "PROPERTY_VALIDATION");
        }

        return new PropertyDescription(trimmedDescription);
    }

    private static containsInappropriateContent(description: string): boolean {
        const inappropriateWords = ["spam", "scam", "fake", "fraud"];
        const lowerDescription = description.toLowerCase();
        return inappropriateWords.some(word => lowerDescription.includes(word));
    }

    isValid(): boolean {
        return this.value.length >= PropertyDescription.MIN_LENGTH &&
            this.value.length <= PropertyDescription.MAX_LENGTH;
    }

    getDisplayValue(): string {
        return this.value;
    }

    getExcerpt(maxLength: number = 150): string {
        if (this.value.length <= maxLength) {
            return this.value;
        }

        // Find the last complete word within the limit
        const truncated = this.value.substring(0, maxLength);
        const lastSpaceIndex = truncated.lastIndexOf(' ');

        if (lastSpaceIndex > 0) {
            return truncated.substring(0, lastSpaceIndex) + '...';
        }

        return truncated + '...';
    }

    getWordCount(): number {
        return this.value.split(/\s+/).filter(word => word.length > 0).length;
    }

    getReadingTime(): number {
        // Average reading speed is 200-250 words per minute
        const wordsPerMinute = 225;
        const wordCount = this.getWordCount();
        return Math.ceil(wordCount / wordsPerMinute);
    }

    containsKeywords(keywords: string[]): boolean {
        const lowerDescription = this.value.toLowerCase();
        return keywords.some(keyword =>
            lowerDescription.includes(keyword.toLowerCase())
        );
    }

    // Extract potential features/amenities mentioned in description
    extractFeatures(): string[] {
        const commonFeatures = [
            'pool', 'swimming pool', 'garage', 'parking', 'garden', 'balcony',
            'terrace', 'fireplace', 'air conditioning', 'heating', 'elevator',
            'security', 'gym', 'fitness', 'laundry', 'storage', 'basement',
            'attic', 'walk-in closet', 'hardwood floors', 'tile floors',
            'granite counters', 'stainless steel', 'updated kitchen', 'renovated'
        ];

        const lowerDescription = this.value.toLowerCase();
        return commonFeatures.filter(feature =>
            lowerDescription.includes(feature.toLowerCase())
        );
    }

    // Clean and format description for display
    getFormattedDescription(): string {
        return this.value
            .replace(/\n\s*\n/g, '\n\n') // Normalize line breaks
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();
    }

    // Check if description seems AI-generated (basic heuristics)
    seemsAIGenerated(): boolean {
        const aiIndicators = [
            'this property offers',
            'perfect for',
            'ideal for',
            'boasts',
            'features include',
            'don\'t miss this opportunity',
            'schedule a viewing today'
        ];

        const lowerDescription = this.value.toLowerCase();
        const indicatorCount = aiIndicators.filter(indicator =>
            lowerDescription.includes(indicator)
        ).length;

        // If more than 2 AI indicators are present, it might be AI-generated
        return indicatorCount >= 2;
    }
}