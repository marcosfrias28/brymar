import { BlogPost } from '@/domain/content/entities/BlogPost';

export class UpdateBlogPostOutput {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly content: string,
        public readonly author: string,
        public readonly category: string,
        public readonly status: string,
        public readonly image?: string,
        public readonly readingTime: number = 0,
        public readonly updatedAt: Date = new Date()
    ) { }

    static from(blogPost: BlogPost): UpdateBlogPostOutput {
        return new UpdateBlogPostOutput(
            blogPost.getId().value,
            blogPost.getTitle().value,
            blogPost.getContent().value,
            blogPost.getAuthor().value,
            blogPost.getCategory().value,
            blogPost.getStatus().value,
            blogPost.getImage(),
            blogPost.getReadingTime().minutes,
            blogPost.getUpdatedAt()
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

    getContent(): { value: string } {
        return { value: this.content };
    }

    getAuthor(): { value: string } {
        return { value: this.author };
    }

    getCategory(): { value: string } {
        return { value: this.category };
    }

    getStatus(): { value: string } {
        return { value: this.status };
    }

    getImage(): string | undefined {
        return this.image;
    }

    getReadingTime(): { minutes: number } {
        return { minutes: this.readingTime };
    }

    getUpdatedAt(): Date {
        return this.updatedAt;
    }

    toJSON(): string {
        return JSON.stringify({
            id: this.id,
            title: this.title,
            content: this.content,
            author: this.author,
            category: this.category,
            status: this.status,
            image: this.image,
            readingTime: this.readingTime,
            updatedAt: this.updatedAt.toISOString(),
        });
    }
}