import { BlogPost } from '@/domain/content/entities/BlogPost';
import { IBlogRepository } from '@/domain/content/repositories/IBlogRepository';
import { ContentDomainService } from '@/domain/content/services/ContentDomainService';
import { CreateBlogPostInput } from '../../dto/content/CreateBlogPostInput';
import { CreateBlogPostOutput } from '../../dto/content/CreateBlogPostOutput';
import { BusinessRuleViolationError, EntityValidationError } from '@/domain/shared/errors/DomainError';

export class CreateBlogPostUseCase {
    constructor(
        private readonly blogRepository: IBlogRepository,
        private readonly contentDomainService: ContentDomainService
    ) { }

    async execute(input: CreateBlogPostInput): Promise<CreateBlogPostOutput> {
        try {
            // Check if slug already exists (if provided)
            if (input.slug) {
                const existingPost = await this.blogRepository.findBySlug(input.slug);
                if (existingPost) {
                    throw new BusinessRuleViolationError(`A blog post with slug "${input.slug}" already exists`);
                }
            }

            // Create the blog post entity
            const blogPost = BlogPost.create({
                title: input.title,
                content: input.content,
                author: input.author,
                category: input.category,
                excerpt: input.excerpt,
                seoTitle: input.seoTitle,
                seoDescription: input.seoDescription,
                tags: input.tags,
                slug: input.slug,
                featured: input.featured,
                coverImage: input.coverImage,
                images: input.images
            });

            // Apply domain business rules and validations
            this.validateBlogPostCreation(blogPost);

            // Save the blog post
            await this.blogRepository.save(blogPost);

            // Return the output
            return CreateBlogPostOutput.from(blogPost);

        } catch (error) {
            if (error instanceof BusinessRuleViolationError || error instanceof EntityValidationError) {
                throw error;
            }

            throw new EntityValidationError(`Failed to create blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private validateBlogPostCreation(blogPost: BlogPost): void {
        // Validate content quality
        const content = blogPost.getContent();
        if (!content.hasGoodStructure()) {
            // This is a warning, not a blocking error for creation
            console.warn('Blog post content could benefit from better structure');
        }

        // Validate category appropriateness
        const suggestedCategory = this.contentDomainService.suggestCategoryForContent(
            blogPost.getTitle().value,
            blogPost.getContent().value
        );

        if (!suggestedCategory.equals(blogPost.getCategory())) {
            console.warn(`Suggested category "${suggestedCategory.value}" differs from selected category "${blogPost.getCategory().value}"`);
        }

        // Validate SEO completeness
        const seo = blogPost.getSEO();
        if (!seo.hasTitle() || !seo.hasDescription()) {
            console.warn('Blog post is missing SEO title or description - this will impact search visibility');
        }

        // Validate reading time appropriateness
        const readingTime = blogPost.getReadingTime();
        if (readingTime.getMinutes() < 2) {
            console.warn('Blog post has very short reading time - consider adding more content');
        }

        // Check for media optimization
        const media = blogPost.getMedia();
        if (!media.hasCoverImage()) {
            console.warn('Blog post is missing a cover image - this will impact engagement');
        }

        if (media.hasImages() && !media.hasProperAltTexts()) {
            console.warn('Some images are missing alt text - this impacts accessibility');
        }
    }
}