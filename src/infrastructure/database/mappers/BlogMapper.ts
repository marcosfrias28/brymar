import { BlogPost } from '@/domain/content/entities/BlogPost';
import { BlogPostId } from '@/domain/content/value-objects/BlogPostId';
import { Title } from '@/domain/shared/value-objects/Title';
import { BlogTitle } from '@/domain/content/value-objects/BlogTitle';
import { BlogContent } from '@/domain/content/value-objects/BlogContent';
import { BlogAuthor } from '@/domain/content/value-objects/BlogAuthor';
import { BlogCategory } from '@/domain/content/value-objects/BlogCategory';
import { ContentStatus } from '@/domain/content/value-objects/ContentStatus';

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
        const readingTime = ReadingTime.create(row.readingTime);

        return BlogPost.reconstitute({
            id,
            title,
            content,
            author,
            category,
            status,
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
        return {
            id: blogPost.getId().toNumber(),
            title: blogPost.getTitle().value,
            content: blogPost.getContent().value,
            author: blogPost.getAuthor().value,
            category: blogPost.getCategory().value,
            status: blogPost.getStatus().value,
            image: null, // No media support in current implementation
            readingTime: blogPost.getReadingTime().minutes,
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
        return {
            title: blogPost.getTitle().value,
            content: blogPost.getContent().value,
            author: blogPost.getAuthor().value,
            category: blogPost.getCategory().value,
            status: blogPost.getStatus().value,
            image: null, // No media support in current implementation
            readingTime: blogPost.getReadingTime().minutes
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
        return {
            title: blogPost.getTitle().value,
            content: blogPost.getContent().value,
            author: blogPost.getAuthor().value,
            category: blogPost.getCategory().value,
            status: blogPost.getStatus().value,
            image: null, // No media support in current implementation
            readingTime: blogPost.getReadingTime().minutes,
            updatedAt: new Date()
        };
    }
}