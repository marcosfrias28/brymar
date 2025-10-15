import { BlogPostId } from '@/domain/content/value-objects/BlogPostId';
import { IBlogRepository } from '@/domain/content/repositories/IBlogRepository';
import { ContentDomainService } from '@/domain/content/services/ContentDomainService';
import { UpdateBlogPostInput } from '../../dto/content/UpdateBlogPostInput';
import { UpdateBlogPostOutput } from '../../dto/content/UpdateBlogPostOutput';
import { BusinessRuleViolationError, EntityNotFoundError, EntityValidationError } from '@/domain/shared/errors/DomainError';

export class UpdateBlogPostUseCase {
    constructor(
        private readonly blogRepository: IBlogRepository,
        private readonly contentDomainService: ContentDomainService
    ) { }

    async execute(input: UpdateBlogPostInput): Promise<UpdateBlogPostOutput> {
        try {
            // Create the blog post ID value object
            const blogPostId = BlogPostId.create(input.id);

            // Find the existing blog post
            const blogPost = await this.blogRepository.findById(blogPostId);

            if (!blogPost) {
                throw new EntityNotFoundError('BlogPost', input.id);
            }

            // Update the blog post fields if provided
            if (input.title !== undefined) {
                blogPost.updateTitle(input.title);
            }

            if (input.content !== undefined) {
                blogPost.updateContent(input.content);
            }

            if (input.author !== undefined) {
                blogPost.updateAuthor(input.author);
            }

            if (input.category !== undefined) {
                blogPost.updateCategory(input.category);
            }

            if (input.coverImage !== undefined) {
                if (input.coverImage) {
                    blogPost.updateImage(input.coverImage);
                } else {
                    blogPost.removeImage();
                }
            }

            // Apply domain business rules and validations
            this.validateBlogPostUpdate(blogPost);

            // Save the updated blog post
            await this.blogRepository.save(blogPost);

            // Return the output
            return UpdateBlogPostOutput.from(blogPost);

        } catch (error) {
            if (error instanceof BusinessRuleViolationError ||
                error instanceof EntityNotFoundError ||
                error instanceof EntityValidationError) {
                throw error;
            }

            throw new EntityValidationError(`Failed to update blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private validateBlogPostUpdate(blogPost: any): void {
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