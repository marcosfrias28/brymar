import { PageSection } from '@/domain/content/entities/PageSection';
import { PageSectionId } from '@/domain/content/value-objects/PageSectionId';
import { PageName } from '@/domain/content/value-objects/PageName';
import { SectionName } from '@/domain/content/value-objects/SectionName';
import { SectionTitle } from '@/domain/content/value-objects/SectionTitle';
import { SectionContent } from '@/domain/content/value-objects/SectionContent';
import { SectionSettings } from '@/domain/content/value-objects/SectionSettings';
import { PageSection as PageSectionSchema } from '@/lib/db/schema';

export class PageSectionMapper {
    static toDomain(row: PageSectionSchema): PageSection {
        // Map database row to domain entity
        const id = PageSectionId.fromNumber(row.id);
        const page = PageName.create(row.page);
        const section = SectionName.create(row.section);
        const title = row.title ? SectionTitle.create(row.title) : null;

        // Create content object from database fields
        const content = SectionContent.create({
            subtitle: row.subtitle || undefined,
            description: row.description || undefined,
            content: (row.content as Record<string, any>) || {},
            images: (row.images as string[]) || []
        });

        // Create settings object
        const settings = SectionSettings.create((row.settings as Record<string, any>) || {});

        return PageSection.reconstitute({
            id,
            page,
            section,
            title,
            content,
            settings,
            isActive: row.isActive ?? true,
            order: row.order ?? 0,
            createdAt: row.createdAt || new Date(),
            updatedAt: row.updatedAt || new Date()
        });
    }

    static toDatabase(pageSection: PageSection): {
        id: number;
        page: string;
        section: string;
        title: string | null;
        subtitle: string | null;
        description: string | null;
        content: Record<string, any>;
        images: string[];
        settings: Record<string, any>;
        isActive: boolean;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    } {
        const content = pageSection.getContent();

        return {
            id: pageSection.getId().isNumeric() ? pageSection.getId().toNumber() : parseInt(pageSection.getId().value, 10),
            page: pageSection.getPage().value,
            section: pageSection.getSection().value,
            title: pageSection.getTitle()?.value || null,
            subtitle: content.subtitle || null,
            description: content.description || null,
            content: content.content,
            images: content.images,
            settings: pageSection.getSettings().value,
            isActive: pageSection.getIsActive(),
            order: pageSection.getOrder(),
            createdAt: pageSection.getCreatedAt(),
            updatedAt: pageSection.getUpdatedAt()
        };
    }

    static toCreateInput(pageSection: PageSection): {
        page: string;
        section: string;
        title: string | null;
        subtitle: string | null;
        description: string | null;
        content: Record<string, any>;
        images: string[];
        settings: Record<string, any>;
        isActive: boolean;
        order: number;
    } {
        const content = pageSection.getContent();

        return {
            page: pageSection.getPage().value,
            section: pageSection.getSection().value,
            title: pageSection.getTitle()?.value || null,
            subtitle: content.subtitle || null,
            description: content.description || null,
            content: content.content,
            images: content.images,
            settings: pageSection.getSettings().value,
            isActive: pageSection.getIsActive(),
            order: pageSection.getOrder()
        };
    }

    static toUpdateInput(pageSection: PageSection): {
        page: string;
        section: string;
        title: string | null;
        subtitle: string | null;
        description: string | null;
        content: Record<string, any>;
        images: string[];
        settings: Record<string, any>;
        isActive: boolean;
        order: number;
        updatedAt: Date;
    } {
        const content = pageSection.getContent();

        return {
            page: pageSection.getPage().value,
            section: pageSection.getSection().value,
            title: pageSection.getTitle()?.value || null,
            subtitle: content.subtitle || null,
            description: content.description || null,
            content: content.content,
            images: content.images,
            settings: pageSection.getSettings().value,
            isActive: pageSection.getIsActive(),
            order: pageSection.getOrder(),
            updatedAt: new Date()
        };
    }
}