import { AggregateRoot } from '@/domain/shared/entities/AggregateRoot';
import { BlogPostId } from "../value-objects/BlogPostId";
import { Title } from "@/domain/shared/value-objects/Title";
import { BlogTitle } from "../value-objects/BlogTitle";
import { BlogContent } from "../value-objects/BlogContent";
import { BlogCategory } from "../value-objects/BlogCategory";
import { ContentStatus } from "../value-objects/ContentStatus";
import { BlogAuthor } from "../value-objects/BlogAuthor";
import { ReadingTime } from "../value-objects/ReadingTime";
import { BusinessRuleViolationError } from '@/domain/shared/errors/DomainError';

export interface CreateBlogPostData {
    title: string;
    content: string;
    author: string;
    category: string;
    status?: string;
    image?: string;
}

export interface BlogPostData {
    id: BlogPostId;
    title: Title;
    content: BlogContent;
    author: BlogAuthor;
    category: BlogCategory;
    status: ContentStatus;
    image?: string;
    readingTime: ReadingTime;
    createdAt: Date;
    updatedAt: Date;
}

export class BlogPost extends AggregateRoot {
    private constructor(
        id: BlogPostId,
        private title: Title,
        private content: BlogContent,
        private author: BlogAuthor,
        private category: BlogCategory,
        private status: ContentStatus,
        private image: string | undefined,
        private readingTime: ReadingTime,
        createdAt: Date,
        updatedAt: Date
    ) {
        super(id, createdAt, updatedAt);
    }

    static create(data: CreateBlogPostData): BlogPost {
        const id = BlogPostId.generate();
        const title = BlogTitle.create(data.title);
        const content = BlogContent.create(data.content);
        const author = BlogAuthor.create(data.author);
        const category = BlogCategory.create(data.category);
        const status = ContentStatus.create(data.status || "draft");
        const readingTime = ReadingTime.calculateFromContent(data.content);

        return new BlogPost(
            id,
            title,
            content,
            author,
            category,
            status,
            data.image,
            readingTime,
            new Date(),
            new Date()
        );
    }

    static reconstitute(data: BlogPostData): BlogPost {
        return new BlogPost(
            data.id,
            data.title,
            data.content,
            data.author,
            data.category,
            data.status,
            data.image,
            data.readingTime,
            data.createdAt,
            data.updatedAt
        );
    }

    // Business methods
    updateTitle(newTitle: string): void {
        this.title = BlogTitle.create(newTitle);
        this.markAsUpdated();
    }

    updateContent(newContent: string): void {
        this.content = BlogContent.create(newContent);
        this.readingTime = ReadingTime.calculateFromContent(newContent);
        this.markAsUpdated();
    }

    updateAuthor(newAuthor: string): void {
        this.author = BlogAuthor.create(newAuthor);
        this.markAsUpdated();
    }

    updateCategory(newCategory: string): void {
        this.category = BlogCategory.create(newCategory);
        this.markAsUpdated();
    }

    updateImage(imageUrl: string): void {
        this.image = imageUrl;
        this.markAsUpdated();
    }

    removeImage(): void {
        this.image = undefined;
        this.markAsUpdated();
    }

    publish(): void {
        if (!this.canBePublished()) {
            throw new BusinessRuleViolationError("Blog post cannot be published: missing required content", "PUBLISH_VALIDATION");
        }
        this.status = ContentStatus.published();
        this.markAsUpdated();
    }

    unpublish(): void {
        this.status = ContentStatus.draft();
        this.markAsUpdated();
    }

    private canBePublished(): boolean {
        return (
            this.title.isValid() &&
            this.content.isValid() &&
            this.author.isValid() &&
            this.category.isValid()
        );
    }

    private markAsUpdated(): void {
        this.updatedAt = new Date();
    }

    // Getters
    getId(): BlogPostId {
        return this.id as BlogPostId;
    }

    getTitle(): Title {
        return this.title;
    }

    getContent(): BlogContent {
        return this.content;
    }

    getAuthor(): BlogAuthor {
        return this.author;
    }

    getCategory(): BlogCategory {
        return this.category;
    }

    getStatus(): ContentStatus {
        return this.status;
    }

    getImage(): string | undefined {
        return this.image;
    }

    getReadingTime(): ReadingTime {
        return this.readingTime;
    }

    isPublished(): boolean {
        return this.status.isPublished();
    }

    isDraft(): boolean {
        return this.status.isDraft();
    }
}