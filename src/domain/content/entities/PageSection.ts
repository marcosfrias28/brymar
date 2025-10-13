import { AggregateRoot } from '@/domain/shared/base/AggregateRoot';
import { PageSectionId } from "../value-objects/PageSectionId";
import { PageName } from "../value-objects/PageName";
import { SectionName } from "../value-objects/SectionName";
import { SectionTitle } from "../value-objects/SectionTitle";
import { SectionContent } from "../value-objects/SectionContent";
import { SectionOrder } from "../value-objects/SectionOrder";
import { DomainError } from '@/domain/shared/errors/DomainError';

export interface CreatePageSectionData {
    page: string;
    section: string;
    title?: string;
    subtitle?: string;
    description?: string;
    content?: Record<string, any>;
    images?: string[];
    settings?: Record<string, any>;
    isActive?: boolean;
    order?: number;
}

export interface PageSectionData {
    id: PageSectionId;
    page: PageName;
    section: SectionName;
    title?: SectionTitle;
    subtitle?: string;
    description?: string;
    content: SectionContent;
    images: string[];
    settings: Record<string, any>;
    isActive: boolean;
    order: SectionOrder;
    createdAt: Date;
    updatedAt: Date;
}

export class PageSection extends AggregateRoot {
    private constructor(
        id: PageSectionId,
        private page: PageName,
        private section: SectionName,
        private title: SectionTitle | undefined,
        private subtitle: string | undefined,
        private description: string | undefined,
        private content: SectionContent,
        private images: string[],
        private settings: Record<string, any>,
        private isActive: boolean,
        private order: SectionOrder,
        createdAt: Date,
        updatedAt: Date
    ) {
        super(id, createdAt, updatedAt);
    }

    static create(data: CreatePageSectionData): PageSection {
        const id = PageSectionId.generate();
        const page = PageName.create(data.page);
        const section = SectionName.create(data.section);
        const title = data.title ? SectionTitle.create(data.title) : undefined;
        const content = SectionContent.create(data.content || {});
        const order = SectionOrder.create(data.order || 0);

        return new PageSection(
            id,
            page,
            section,
            title,
            data.subtitle,
            data.description,
            content,
            data.images || [],
            data.settings || {},
            data.isActive !== false,
            order,
            new Date(),
            new Date()
        );
    }

    static reconstitute(data: PageSectionData): PageSection {
        return new PageSection(
            data.id,
            data.page,
            data.section,
            data.title,
            data.subtitle,
            data.description,
            data.content,
            data.images,
            data.settings,
            data.isActive,
            data.order,
            data.createdAt,
            data.updatedAt
        );
    }

    // Business methods
    updateTitle(newTitle: string): void {
        this.title = SectionTitle.create(newTitle);
        this.markAsUpdated();
    }

    updateSubtitle(newSubtitle: string): void {
        this.subtitle = newSubtitle;
        this.markAsUpdated();
    }

    updateDescription(newDescription: string): void {
        this.description = newDescription;
        this.markAsUpdated();
    }

    updateContent(newContent: Record<string, any>): void {
        this.content = SectionContent.create(newContent);
        this.markAsUpdated();
    }

    addImage(imageUrl: string): void {
        if (!this.images.includes(imageUrl)) {
            this.images.push(imageUrl);
            this.markAsUpdated();
        }
    }

    removeImage(imageUrl: string): void {
        const index = this.images.indexOf(imageUrl);
        if (index > -1) {
            this.images.splice(index, 1);
            this.markAsUpdated();
        }
    }

    updateImages(newImages: string[]): void {
        this.images = [...newImages];
        this.markAsUpdated();
    }

    updateSettings(newSettings: Record<string, any>): void {
        this.settings = { ...newSettings };
        this.markAsUpdated();
    }

    updateSetting(key: string, value: any): void {
        this.settings[key] = value;
        this.markAsUpdated();
    }

    activate(): void {
        this.isActive = true;
        this.markAsUpdated();
    }

    deactivate(): void {
        this.isActive = false;
        this.markAsUpdated();
    }

    updateOrder(newOrder: number): void {
        this.order = SectionOrder.create(newOrder);
        this.markAsUpdated();
    }

    private markAsUpdated(): void {
        this.updatedAt = new Date();
    }

    // Getters
    getId(): PageSectionId {
        return this.id as PageSectionId;
    }

    getPage(): PageName {
        return this.page;
    }

    getSection(): SectionName {
        return this.section;
    }

    getTitle(): SectionTitle | undefined {
        return this.title;
    }

    getSubtitle(): string | undefined {
        return this.subtitle;
    }

    getDescription(): string | undefined {
        return this.description;
    }

    getContent(): SectionContent {
        return this.content;
    }

    getImages(): string[] {
        return [...this.images];
    }

    getSettings(): Record<string, any> {
        return { ...this.settings };
    }

    getIsActive(): boolean {
        return this.isActive;
    }

    getOrder(): SectionOrder {
        return this.order;
    }
}