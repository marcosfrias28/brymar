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
        // Generate slug from title since SEO is not implemented yet
        const slug = blogPost.getTitle().toString().toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        return new CreateBlogPostOutput(
            blogPost.getId().value,
            blogPost.getTitle().value,
            slug,
            blogPost.getStatus().value,
            blogPost.getCategory().value,
            blogPost.getAuthor().value,
            blogPost.getReadingTime().minutes,
            blogPost.getCreatedAt()
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

    getCategory(): { value: string } {
        return { value: this.category };
    }

    getAuthor(): { value: string } {
        return { value: this.author };
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
            category: this.category,
            author: this.author,
            readingTime: this.readingTime,
            createdAt: this.createdAt.toISOString(),
        });
    }
}