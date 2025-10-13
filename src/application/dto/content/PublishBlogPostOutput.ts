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
        const seo = blogPost.getSEO();
        const slug = seo.hasSlug()
            ? seo.slug!
            : blogPost.getTitle().toSlug();

        return new PublishBlogPostOutput(
            blogPost.getId().value,
            blogPost.getTitle().value,
            slug,
            blogPost.getStatus().value,
            blogPost.getUpdatedAt(), // Use updated date as publish date
            seoRecommendations
        );
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