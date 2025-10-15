import { PageSection } from '@/domain/content/entities/PageSection';
import { PageSectionId } from '@/domain/content/value-objects/PageSectionId';
import { PageName } from '@/domain/content/value-objects/PageName';
import { SectionName } from '@/domain/content/value-objects/SectionName';
import { SectionTitle } from '@/domain/content/value-objects/SectionTitle';
import { SectionContent } from '@/domain/content/value-objects/SectionContent';
import { SectionSettings } from '@/domain/content/value-objects/SectionSettings';
import { SectionOrder } from '@/domain/content/value-objects/SectionOrder';
import { PageSection as PageSectionSchema } from '@/lib/db/schema';

export class PageSectionMapper {
    static toDomain(row: PageSectionSchema): PageSection {
        // Map database row to domain entity
        const id = PageSectionId.fromNumber(row.id);
        const page = PageName.create(row.page);
        const section = SectionName.create(row.section);
        const title = row.title ? SectionTitle.create(row.title) : undefined;

        // Create content object from database fields
        const content = SectionContent.create({
            subtitle: row.subtitle || undefined,
            description: row.description || undefined,
            content: (row.content as Record<string, any>) || {},
            images: (row.images as string[]) || []
        });

        // Create settings object (for potential future use)
        SectionSettings.create((row.settings as Record<string, any>) || {});

        return PageSection.reconstitute({
            id,
            page,
            section,
            title,
            subtitle: row.subtitle || undefined,
            description: row.description || undefined,
            content,
            images: (row.images as string[]) || [],
            settings: (row.settings as Record<string, any>) || {},
            isActive: row.isActive ?? true,
            order: SectionOrder.create(row.order ?? 0),
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
            id: pageSection.getId().toNumber(),
            page: pageSection.getPage().value,
            section: pageSection.getSection().value,
            title: pageSection.getTitle()?.value || null,
            subtitle: pageSection.getSubtitle() || null,
            description: pageSection.getDescription() || null,
            content: content.value,
            images: pageSection.getImages(),
            settings: pageSection.getSettings().value,
            isActive: pageSection.getIsActive(),
            order: pageSection.getOrder().value,
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
            subtitle: pageSection.getSubtitle() || null,
            description: pageSection.getDescription() || null,
            content: content.value,
            images: pageSection.getImages(),
            settings: pageSection.getSettings().value,
            isActive: pageSection.getIsActive(),
            order: pageSection.getOrder().value
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
            subtitle: pageSection.getSubtitle() || null,
            description: pageSection.getDescription() || null,
            content: content.value,
            images: pageSection.getImages(),
            settings: pageSection.getSettings().value,
            isActive: pageSection.getIsActive(),
            order: pageSection.getOrder().value,
            updatedAt: new Date()
        };
    }
}