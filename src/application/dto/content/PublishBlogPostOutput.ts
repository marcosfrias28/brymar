import { BlogPost } from '@/domain/content/entities/BlogPost';

export class PublishBlogPostOutput {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly slug: string,
        public readonly status: string,
        public readonly publishedAt: Date,
        public readonly seoRecommendations: string[]
    ) { }

    static from(blogPost: BlogPost, seoRecommendations: string[] = []): PublishBlogPostOutput {
        // Generate slug from title since SEO is not implemented yet
        const slug = blogPost.getTitle().toString().toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        return new PublishBlogPostOutput(
            blogPost.getId().value,
            blogPost.getTitle().value,
            slug,
            blogPost.getStatus().value,
            blogPost.getUpdatedAt(), // Use updated date as publish date
            seoRecommendations
        );
    }

    /**
     * Frontend compatibility methods
     */
    getId(): { value: string } {
        return { value: this.id };
    }

    getTitle(): { value: string } {
        return { value: this.title };
    }

    getStatus(): { value: string } {
        return { value: this.status };
    }

    getSlug(): { value: string } {
        return { value: this.slug };
    }

    toJSON(): string {
        return JSON.stringify({
            id: this.id,
            title: this.title,
            slug: this.slug,
            status: this.status,
            publishedAt: this.publishedAt.toISOString(),
            seoRecommendations: this.seoRecommendations,
        });
    }
}