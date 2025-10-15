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
            // TODO: Add slug uniqueness check when findBySlug method is implemented

            // Create the blog post entity
            const blogPost = BlogPost.create({
                title: input.title,
                content: input.content,
                author: input.author,
                category: input.category,
                status: 'draft', // Default status
                image: input.coverImage, // Map coverImage to image
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
        // TODO: Add content quality validation when hasGoodStructure method is implemented

        // TODO: Add category appropriateness validation when suggestCategoryForContent method is implemented

        // TODO: Add SEO validation when getSEO method is implemented

        // Validate reading time appropriateness
        const readingTime = blogPost.getReadingTime();
        if (readingTime.minutes < 2) {
            // Note: Blog post has very short reading time - consider adding more content
        }

        // TODO: Add media validation when getMedia method is implemented

        // TODO: Add image alt text validation when media methods are implemented
    }
}