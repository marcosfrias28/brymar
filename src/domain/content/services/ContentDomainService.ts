import { BlogPost } from "../entities/BlogPost";
import { PageSection } from "../entities/PageSection";
import { BlogContent } from "../value-objects/BlogContent";
import { BlogTitle } from "../value-objects/BlogTitle";
import { ContentStatus } from "../value-objects/ContentStatus";
import { BaseDomainService, ValidationResult, SEOSuggestion } from '@/domain/shared/services/BaseDomainService';
import { BusinessRuleViolationError } from '@/domain/shared/errors/DomainError';

export class ContentDomainService extends BaseDomainService<BlogPost> {

    constructor() {
        super('Content');
    }

    /**
     * Validates blog post entity according to business rules
     */
    validateEntity(blogPost: BlogPost): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Basic validation
        if (!blogPost.getTitle().isValid()) {
            errors.push("Blog post title is invalid");
        }

        if (!blogPost.getContent().isValid()) {
            errors.push("Blog post content is invalid");
        }

        if (!blogPost.getAuthor().isValid()) {
            errors.push("Blog post author is invalid");
        }

        if (!blogPost.getCategory().isValid()) {
            errors.push("Blog post category is invalid");
        }

        // Reading time validation
        if (blogPost.getReadingTime().minutes < 1) {
            warnings.push("Blog post is very short (less than 1 minute reading time)");
        }

        // SEO validation
        const seoValidation = this.validateSEORequirements(blogPost);
        warnings.push(...seoValidation.issues);

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Validates if a blog post can be published based on business rules
     */
    validateForPublication(blogPost: BlogPost): void {
        if (!blogPost.getTitle().isValid()) {
            throw new BusinessRuleViolationError("Blog post title is invalid for publishing", "CONTENT_VALIDATION");
        }

        if (!blogPost.getContent().isValid()) {
            throw new BusinessRuleViolationError("Blog post content is invalid for publishing", "CONTENT_VALIDATION");
        }

        if (!blogPost.getAuthor().isValid()) {
            throw new BusinessRuleViolationError("Blog post author is invalid for publishing", "CONTENT_VALIDATION");
        }

        if (!blogPost.getCategory().isValid()) {
            throw new BusinessRuleViolationError("Blog post category is invalid for publishing", "CONTENT_VALIDATION");
        }

        // Business rule: Blog posts should have a minimum reading time for quality
        if (blogPost.getReadingTime().minutes < 1) {
            throw new BusinessRuleViolationError("Blog post is too short for publishing (minimum 1 minute reading time)", "CONTENT_VALIDATION");
        }
    }

    /**
     * Validates SEO requirements for blog posts
     */
    validateSEORequirements(blogPost: BlogPost): { isValid: boolean; issues: string[] } {
        const issues: string[] = [];

        // Title length for SEO
        const titleLength = blogPost.getTitle().getLength();
        if (titleLength < 30) {
            issues.push("Title is too short for optimal SEO (recommended: 30-60 characters)");
        }
        if (titleLength > 60) {
            issues.push("Title is too long for optimal SEO (recommended: 30-60 characters)");
        }

        // Content length for SEO
        const contentLength = blogPost.getContent().getLength();
        if (contentLength < 300) {
            issues.push("Content is too short for good SEO (recommended: minimum 300 words)");
        }

        // Reading time for engagement
        const readingTime = blogPost.getReadingTime().minutes;
        if (readingTime > 15) {
            issues.push("Content might be too long for optimal engagement (recommended: under 15 minutes)");
        }

        // Image requirement for social sharing
        if (!blogPost.getImage()) {
            issues.push("Featured image is missing (recommended for social media sharing)");
        }

        return {
            isValid: issues.length === 0,
            issues
        };
    }

    /**
     * Generates SEO-friendly excerpt from blog content
     */
    generateSEOExcerpt(content: BlogContent, maxLength: number = 160): string {
        const excerpt = content.getExcerpt(maxLength);

        // Remove any HTML tags if present
        const cleanExcerpt = excerpt.replace(/<[^>]*>/g, '');

        // Ensure it ends with proper punctuation
        if (cleanExcerpt.length === maxLength && !cleanExcerpt.endsWith('...')) {
            return cleanExcerpt.substring(0, maxLength - 3) + '...';
        }

        return cleanExcerpt;
    }

    /**
     * Generates SEO suggestions for blog post
     */
    generateSEOSuggestions(blogPost: BlogPost): SEOSuggestion {
        const title = blogPost.getTitle();
        const content = blogPost.getContent();
        const category = blogPost.getCategory();
        const author = blogPost.getAuthor();

        // Generate SEO title
        const seoTitle = title.toString();

        // Generate meta description
        const description = this.generateSEOExcerpt(content, 160);

        // Generate keywords
        const keywords = [
            category.value,
            "blog",
            "article",
            author.value,
            "Dominican Republic",
            "real estate"
        ].filter(keyword => keyword.length > 0);

        return {
            title: seoTitle.substring(0, 60), // SEO title limit
            description,
            keywords
        };
    }

    /**
     * Validates page section content structure
     */
    validatePageSectionContent(pageSection: PageSection): void {
        const page = pageSection.getPage();
        const section = pageSection.getSection();
        const content = pageSection.getContent();

        // Business rules for specific page-section combinations
        if (page.isHome() && section.isHero()) {
            this.validateHeroSectionContent(content.value);
        }

        if (page.isHome() && section.isCategories()) {
            this.validateCategoriesSectionContent(content.value);
        }

        if (page.isHome() && section.isFeaturedProperties()) {
            this.validateFeaturedPropertiesSectionContent(content.value);
        }

        if (section.isContactForm()) {
            this.validateContactFormSectionContent(content.value);
        }
    }

    /**
     * Determines the optimal order for page sections based on UX best practices
     */
    suggestSectionOrder(pageName: string, sectionName: string): number {
        const orderMap: Record<string, Record<string, number>> = {
            home: {
                hero: 0,
                categories: 10,
                'featured-properties': 20,
                services: 30,
                testimonials: 40,
                news: 50,
                'contact-form': 60,
                footer: 100
            },
            about: {
                hero: 0,
                team: 10,
                services: 20,
                testimonials: 30,
                'contact-form': 40,
                footer: 100
            },
            contact: {
                hero: 0,
                'contact-form': 10,
                faq: 20,
                footer: 100
            }
        };

        return orderMap[pageName]?.[sectionName] ?? 50;
    }

    private validateHeroSectionContent(content: Record<string, any>): void {
        if (!content.title || typeof content.title !== 'string') {
            throw new BusinessRuleViolationError("Hero section must have a title", "CONTENT_VALIDATION");
        }

        if (!content.subtitle || typeof content.subtitle !== 'string') {
            throw new BusinessRuleViolationError("Hero section must have a subtitle", "CONTENT_VALIDATION");
        }

        if (content.title.length < 10) {
            throw new BusinessRuleViolationError("Hero section title is too short", "CONTENT_VALIDATION");
        }

        if (content.title.length > 100) {
            throw new BusinessRuleViolationError("Hero section title is too long", "CONTENT_VALIDATION");
        }
    }

    private validateCategoriesSectionContent(content: Record<string, any>): void {
        if (!content.categories || !Array.isArray(content.categories)) {
            throw new BusinessRuleViolationError("Categories section must have a categories array", "CONTENT_VALIDATION");
        }

        if (content.categories.length === 0) {
            throw new BusinessRuleViolationError("Categories section must have at least one category", "CONTENT_VALIDATION");
        }

        content.categories.forEach((category: any, index: number) => {
            if (!category.name || typeof category.name !== 'string') {
                throw new BusinessRuleViolationError(`Category ${index + 1} must have a name`, "CONTENT_VALIDATION");
            }
            if (!category.href || typeof category.href !== 'string') {
                throw new BusinessRuleViolationError(`Category ${index + 1} must have a href`, "CONTENT_VALIDATION");
            }
        });
    }

    private validateFeaturedPropertiesSectionContent(content: Record<string, any>): void {
        if (content.maxProperties && typeof content.maxProperties === 'number') {
            if (content.maxProperties < 1 || content.maxProperties > 12) {
                throw new BusinessRuleViolationError("Featured properties section can display between 1 and 12 properties", "CONTENT_VALIDATION");
            }
        }
    }

    private validateContactFormSectionContent(content: Record<string, any>): void {
        if (!content.fields || !Array.isArray(content.fields)) {
            throw new BusinessRuleViolationError("Contact form section must have a fields array", "CONTENT_VALIDATION");
        }

        const requiredFields = ['name', 'email', 'message'];
        const fieldNames = content.fields.map((field: any) => field.name);

        requiredFields.forEach(requiredField => {
            if (!fieldNames.includes(requiredField)) {
                throw new BusinessRuleViolationError(`Contact form must include ${requiredField} field`, "CONTENT_VALIDATION");
            }
        });
    }
}