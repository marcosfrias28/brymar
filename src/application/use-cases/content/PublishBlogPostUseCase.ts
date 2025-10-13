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
                throw new BusinessRuleViolationError('Blog post is already published');
            }

            // Apply SEO optimizations if provided
            if (input.seoOptimizations) {
                const currentSEO = blogPost.getSEO();
                blogPost.updateSEO({
                    title: input.seoOptimizations.title || currentSEO.title,
                    description: input.seoOptimizations.description || currentSEO.description,
                    tags: input.seoOptimizations.tags || currentSEO.tags,
                    slug: input.seoOptimizations.slug || currentSEO.slug,
                    featured: currentSEO.featured
                });
            }

            // Validate the blog post is ready for publication
            this.contentDomainService.validateBlogPostForPublication(blogPost);

            // Generate SEO recommendations
            const seoRecommendations = this.contentDomainService.generateSEORecommendations(blogPost);

            // Check for slug conflicts if slug was updated
            const seo = blogPost.getSEO();
            if (seo.hasSlug()) {
                const existingPost = await this.blogRepository.findBySlug(seo.slug!);
                if (existingPost && !existingPost.getId().equals(blogPost.getId())) {
                    throw new BusinessRuleViolationError(`A blog post with slug "${seo.slug}" already exists`);
                }
            }

            // Publish the blog post
            blogPost.publish();

            // Save the updated blog post
            await this.blogRepository.save(blogPost);

            // Return the output with SEO recommendations
            return PublishBlogPostOutput.from(blogPost, seoRecommendations);

        } catch (error) {
            if (error instanceof BusinessRuleViolationError || error instanceof EntityNotFoundError || error instanceof EntityValidationError) {
                throw error;
            }

            throw new EntityValidationError(`Failed to publish blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}