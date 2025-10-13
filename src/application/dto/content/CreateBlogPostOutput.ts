import { BlogPost } from '@/domain/content/entities/BlogPost';

export class CreateBlogPostOutput {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly slug: string,
        public readonly status: string,
        public readonly category: string,
        public readonly author: string,
        public readonly readingTime: number,
        public readonly createdAt: Date
    ) { }

    static from(blogPost: BlogPost): CreateBlogPostOutput {
        const seo = blogPost.getSEO();
        const slug = seo.hasSlug()
            ? seo.slug!
            : blogPost.getTitle().toSlug();

        return new CreateBlogPostOutput(
            blogPost.getId().value,
            blogPost.getTitle().value,
            slug,
            blogPost.getStatus().value,
            blogPost.getCategory().value,
            blogPost.getAuthor().value,
            blogPost.getReadingTime().getMinutes(),
            blogPost.getCreatedAt()
        );
    }

    toJSON(): string {
        return JSON.stringify({
            id: this.id,
            title: this.title,
            slug: this.slug,
            status: this.status,
            category: this.category,
            author: this.author,
            readingTime: this.readingTime,
            createdAt: this.createdAt.toISOString(),
        });
    }
}