import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { DomainError } from '@/domain/shared/errors/DomainError';

export interface BlogSEOData {
    title?: string;
    description?: string;
    tags: string[];
    slug?: string;
    featured: boolean;
}

export class BlogSEO extends ValueObject<BlogSEOData> {
    private static readonly MAX_TITLE_LENGTH = 60;
    private static readonly MAX_DESCRIPTION_LENGTH = 160;
    private static readonly MAX_TAGS = 10;
    private static readonly MIN_TAGS = 1;
    private static readonly MAX_SLUG_LENGTH = 100;
    private static readonly MIN_SLUG_LENGTH = 3;

    private constructor(value: BlogSEOData) {
        super(value);
    }

    static create(data: BlogSEOData): BlogSEO {
        const validatedData = this.validateSEOData(data);
        return new BlogSEO(validatedData);
    }

    private static validateSEOData(data: BlogSEOData): BlogSEOData {
        // Validate SEO title
        if (data.title && data.title.length > this.MAX_TITLE_LENGTH) {
            throw new DomainError(`SEO title cannot exceed ${this.MAX_TITLE_LENGTH} characters`);
        }

        // Validate SEO description
        if (data.description && data.description.length > this.MAX_DESCRIPTION_LENGTH) {
            throw new DomainError(`SEO description cannot exceed ${this.MAX_DESCRIPTION_LENGTH} characters`);
        }

        // Validate tags
        if (!data.tags || data.tags.length < this.MIN_TAGS) {
            throw new DomainError(`Must have at least ${this.MIN_TAGS} tag`);
        }

        if (data.tags.length > this.MAX_TAGS) {
            throw new DomainError(`Cannot have more than ${this.MAX_TAGS} tags`);
        }

        // Validate each tag
        data.tags.forEach(tag => {
            if (!tag || tag.trim().length === 0) {
                throw new DomainError('Tags cannot be empty');
            }
            if (tag.length > 50) {
                throw new DomainError('Individual tags cannot exceed 50 characters');
            }
        });

        // Validate slug
        if (data.slug) {
            if (data.slug.length < this.MIN_SLUG_LENGTH) {
                throw new DomainError(`Slug must be at least ${this.MIN_SLUG_LENGTH} characters long`);
            }
            if (data.slug.length > this.MAX_SLUG_LENGTH) {
                throw new DomainError(`Slug cannot exceed ${this.MAX_SLUG_LENGTH} characters`);
            }
            if (!/^[a-z0-9-]+$/.test(data.slug)) {
                throw new DomainError('Slug can only contain lowercase letters, numbers, and hyphens');
            }
        }

        return {
            title: data.title?.trim(),
            description: data.description?.trim(),
            tags: data.tags.map(tag => tag.trim()).filter(tag => tag.length > 0),
            slug: data.slug?.trim(),
            featured: data.featured
        };
    }

    get title(): string | undefined {
        return this.value.title;
    }

    get description(): string | undefined {
        return this.value.description;
    }

    get tags(): string[] {
        return this.value.tags;
    }

    get slug(): string | undefined {
        return this.value.slug;
    }

    get featured(): boolean {
        return this.value.featured;
    }

    isValid(): boolean {
        try {
            BlogSEO.validateSEOData(this.value);
            return true;
        } catch {
            return false;
        }
    }

    hasTitle(): boolean {
        return !!this.value.title && this.value.title.length > 0;
    }

    hasDescription(): boolean {
        return !!this.value.description && this.value.description.length > 0;
    }

    hasSlug(): boolean {
        return !!this.value.slug && this.value.slug.length > 0;
    }

    isFeatured(): boolean {
        return this.value.featured;
    }

    // SEO quality checks
    getTitleLength(): number {
        return this.value.title?.length || 0;
    }

    getDescriptionLength(): number {
        return this.value.description?.length || 0;
    }

    isTitleOptimal(): boolean {
        const length = this.getTitleLength();
        return length >= 30 && length <= 60; // Optimal SEO title length
    }

    isDescriptionOptimal(): boolean {
        const length = this.getDescriptionLength();
        return length >= 120 && length <= 160; // Optimal SEO description length
    }

    hasGoodTagDiversity(): boolean {
        // Check if tags are diverse (not too similar)
        const uniqueWords = new Set();
        this.value.tags.forEach(tag => {
            tag.split(/[\s-]/).forEach(word => {
                if (word.length > 2) {
                    uniqueWords.add(word.toLowerCase());
                }
            });
        });

        return uniqueWords.size >= this.value.tags.length * 0.7; // At least 70% unique words
    }

    // Utility methods
    addTag(tag: string): BlogSEO {
        if (this.value.tags.length >= BlogSEO.MAX_TAGS) {
            throw new DomainError(`Cannot add more than ${BlogSEO.MAX_TAGS} tags`);
        }

        const trimmedTag = tag.trim();
        if (this.value.tags.includes(trimmedTag)) {
            throw new DomainError('Tag already exists');
        }

        return BlogSEO.create({
            ...this.value,
            tags: [...this.value.tags, trimmedTag]
        });
    }

    removeTag(tag: string): BlogSEO {
        const newTags = this.value.tags.filter(t => t !== tag);

        if (newTags.length < BlogSEO.MIN_TAGS) {
            throw new DomainError(`Must have at least ${BlogSEO.MIN_TAGS} tag`);
        }

        return BlogSEO.create({
            ...this.value,
            tags: newTags
        });
    }

    generateSlugFromTitle(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
            .substring(0, BlogSEO.MAX_SLUG_LENGTH);
    }
}