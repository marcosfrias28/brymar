import { BlogPostId } from '@/domain/content/value-objects/BlogPostId';
import { IBlogRepository } from '@/domain/content/repositories/IBlogRepository';
import { GetBlogPostByIdInput } from '../../dto/content/GetBlogPostByIdInput';
import { GetBlogPostByIdOutput } from '../../dto/content/GetBlogPostByIdOutput';
import { EntityNotFoundError, EntityValidationError } from '@/domain/shared/errors/DomainError';

export class GetBlogPostByIdUseCase {
    constructor(
        private readonly blogRepository: IBlogRepository
    ) { }

    async execute(input: GetBlogPostByIdInput): Promise<GetBlogPostByIdOutput> {
        try {
            // Create the blog post ID value object
            const blogPostId = BlogPostId.create(input.id);

            // Find the blog post
            const blogPost = await this.blogRepository.findById(blogPostId);

            if (!blogPost) {
                throw new EntityNotFoundError('BlogPost', input.id);
            }

            // Return the output
            return GetBlogPostByIdOutput.from(blogPost);

        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                throw error;
            }

            throw new EntityValidationError(`Failed to get blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}