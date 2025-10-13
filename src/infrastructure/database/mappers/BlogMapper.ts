import { BlogPost } from '@/domain/content/entities/BlogPost';
import { BlogPostId } from '@/domain/content/value-objects/BlogPostId';
import { BlogTitle } from '@/domain/content/value-objects/BlogTitle';
import { BlogContent } from '@/domain/content/value-objects/BlogContent';
import { BlogAuthor } from '@/domain/content/value-objects/BlogAuthor';
import { BlogCategory } from '@/domain/content/value-objects/BlogCategory';
import { ContentStatus } from '@/domain/content/value-objects/ContentStatus';
import { BlogSEO } from '@/domain/content/value-objects/BlogSEO';
import { BlogMedia } from '@/domain/content/value-objects/BlogMedia';
import { ReadingTime } from '@/domain/content/value-objects/ReadingTime';
import { BlogPost as BlogPostSchema } from '@/lib/db/schema';

export class BlogMapper {
    static toDomain(row: BlogPostSchema): BlogPost {
        // Map database row to domain entity
        const id = BlogPostId.fromNumber(row.id);
        const title = BlogTitle.create(row.title);
        const content = BlogContent.create(row.content);
        const author = BlogAuthor.create(row.author);
        const category = BlogCategory.create(row.category);
        const status = ContentStatus.create(row.status);

        // Create SEO object with available data
        // Note: Current schema doesn't have all SEO fields, so we'll use defaults
        const seo = BlogSEO.create({
            title: undefined, // Not in current schema
            description: undefined, // Not in current schema
            tags: ['inmobiliaria'], // Default tag since not in current schema
            slug: undefined, // Not in current schema
            featured: false // Not in current schema
        });

        // Create media object
        // Note: Current schema has single image field, we'll adapt it
        const media = BlogMedia.create({
            coverImage: row.image || undefined,
            images: [] // Not in current schema
        });

        const readingTime = ReadingTime.create(row.readingTime);

        return BlogPost.reconstitute({
            id,
            title,
            content,
            author,
            category,
            status,
            seo,
            media,
            readingTime,
            createdAt: row.createdAt || new Date(),
            updatedAt: row.updatedAt || new Date()
        });
    }

    static toDatabase(blogPost: BlogPost): {
        id: number;
        title: string;
        content: string;
        author: string;
        category: string;
        status: string;
        image: string | null;
        readingTime: number;
        createdAt: Date;
        updatedAt: Date;
    } {
        const media = blogPost.getMedia();

        return {
            id: blogPost.getId().isNumeric() ? blogPost.getId().toNumber() : parseInt(blogPost.getId().value, 10),
            title: blogPost.getTitle().value,
            content: blogPost.getContent().value,
            author: blogPost.getAuthor().value,
            category: blogPost.getCategory().value,
            status: blogPost.getStatus().value,
            image: media.hasCoverImage() ? media.coverImage! : null,
            readingTime: blogPost.getReadingTime().getMinutes(),
            createdAt: blogPost.getCreatedAt(),
            updatedAt: blogPost.getUpdatedAt()
        };
    }

    static toCreateInput(blogPost: BlogPost): {
        title: string;
        content: string;
        author: string;
        category: string;
        status: string;
        image: string | null;
        readingTime: number;
    } {
        const media = blogPost.getMedia();

        return {
            title: blogPost.getTitle().value,
            content: blogPost.getContent().value,
            author: blogPost.getAuthor().value,
            category: blogPost.getCategory().value,
            status: blogPost.getStatus().value,
            image: media.hasCoverImage() ? media.coverImage! : null,
            readingTime: blogPost.getReadingTime().getMinutes()
        };
    }

    static toUpdateInput(blogPost: BlogPost): {
        title: string;
        content: string;
        author: string;
        category: string;
        status: string;
        image: string | null;
        readingTime: number;
        updatedAt: Date;
    } {
        const media = blogPost.getMedia();

        return {
            title: blogPost.getTitle().value,
            content: blogPost.getContent().value,
            author: blogPost.getAuthor().value,
            category: blogPost.getCategory().value,
            status: blogPost.getStatus().value,
            image: media.hasCoverImage() ? media.coverImage! : null,
            readingTime: blogPost.getReadingTime().getMinutes(),
            updatedAt: new Date()
        };
    }
}