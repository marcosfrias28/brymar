import { BlogPostId } from '@/domain/content/value-objects/BlogPostId';
import { IBlogRepository } from '@/domain/content/repositories/IBlogRepository';
import { DeleteBlogPostInput } from '../../dto/content/DeleteBlogPostInput';
import { DeleteBlogPostOutput } from '../../dto/content/DeleteBlogPostOutput';
import { BusinessRuleViolationError, EntityNotFoundError, EntityValidationError } from '@/domain/shared/errors/DomainError';

export class DeleteBlogPostUseCase {
    constructor(
        private readonly blogRepository: IBlogRepository
    ) { }

    async execute(input: DeleteBlogPostInput): Promise<DeleteBlogPostOutput> {
        try {
            // Create the blog post ID value object
            const blogPostId = BlogPostId.create(input.id);

            // Find the blog post to ensure it exists
            const blogPost = await this.blogRepository.findById(blogPostId);

            if (!blogPost) {
                throw new EntityNotFoundError('BlogPost', input.id);
            }

            // Apply business rules for deletion
            this.validateBlogPostDeletion(blogPost);

            // Delete the blog post
            await this.blogRepository.delete(blogPostId);

            // Return success output
            return DeleteBlogPostOutput.success(input.id);

        } catch (error) {
            if (error instanceof BusinessRuleViolationError ||
                error instanceof EntityNotFoundError) {
                return DeleteBlogPostOutput.failure(
                    input.id,
                    error.message
                );
            }

            const errorMessage = `Failed to delete blog post: ${error instanceof Error ? error.message : 'Unknown error'}`;
            return DeleteBlogPostOutput.failure(input.id, errorMessage);
        }
    }

    private validateBlogPostDeletion(blogPost: any): void {
        // TODO: Add business rules for blog post deletion
        // For example:
        // - Check if blog post is referenced by other entities
        // - Check if user has permission to delete
        // - Check if blog post is published and needs special handling

        // For now, allow all deletions
    }
}