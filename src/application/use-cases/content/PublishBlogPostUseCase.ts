import { BlogPostId } from '@/domain/content/value-objects/BlogPostId';
import { IBlogRepository } from '@/domain/content/repositories/IBlogRepository';
import { ContentDomainService } from '@/domain/content/services/ContentDomainService';
import { PublishBlogPostInput } from '../../dto/content/PublishBlogPostInput';
import { PublishBlogPostOutput } from '../../dto/content/PublishBlogPostOutput';
import { BusinessRuleViolationError, EntityNotFoundError, EntityValidationError } from '@/domain/shared/errors/DomainError';

export class PublishBlogPostUseCase {
    constructor(
        private readonly blogRepository: IBlogRepository,
        private readonly contentDomainService: ContentDomainService
    ) { }

    async execute(input: PublishBlogPostInput): Promise<PublishBlogPostOutput> {
        try {
            // Find the blog post
            const blogPostId = BlogPostId.create(input.id);
            const blogPost = await this.blogRepository.findById(blogPostId);

            if (!blogPost) {
                throw new EntityNotFoundError('BlogPost', input.id);
            }

            // Check if already published
            if (blogPost.getStatus().isPublished()) {
                throw new BusinessRuleViolationError('Blog post is already published', 'ALREADY_PUBLISHED');
            }

            // TODO: Add SEO optimization when getSEO and updateSEO methods are implemented

            // TODO: Add publication validation and SEO recommendations when methods are implemented

            // TODO: Add slug conflict check when getSEO and findBySlug methods are implemented

            // Publish the blog post
            blogPost.publish();

            // Save the updated blog post
            await this.blogRepository.save(blogPost);

            // Return the output with SEO recommendations
            return PublishBlogPostOutput.from(blogPost, []);

        } catch (error) {
            if (error instanceof BusinessRuleViolationError || error instanceof EntityNotFoundError || error instanceof EntityValidationError) {
                throw error;
            }

            throw new EntityValidationError(`Failed to publish blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}