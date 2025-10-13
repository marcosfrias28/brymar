import { eq, and, or, desc, asc, count, sql } from 'drizzle-orm';
import { PageSection } from '@/domain/content/entities/PageSection';
import { PageSectionId } from '@/domain/content/value-objects/PageSectionId';
import { PageName } from '@/domain/content/value-objects/PageName';
import { SectionName } from '@/domain/content/value-objects/SectionName';
import {
    IPageSectionRepository,
    PageSectionFilters,
    PageSectionSearchOptions
} from '@/domain/content/repositories/IPageSectionRepository';
import { pageSections } from '@/lib/db/schema';
import type { Database } from '@/lib/db/drizzle';
import { PageSectionMapper } from '../mappers/PageSectionMapper.js';

export class DrizzlePageSectionRepository implements IPageSectionRepository {
    constructor(private readonly db: Database) { }

    async findById(id: PageSectionId): Promise<PageSection | null> {
        try {
            const result = await this.db
                .select()
                .from(pageSections)
                .where(eq(pageSections.id, id.isNumeric() ? id.toNumber() : parseInt(id.value, 10)))
                .limit(1);

            if (result.length === 0) {
                return null;
            }

            return PageSectionMapper.toDomain(result[0]);
        } catch (error) {
            console.error('Error finding page section by ID:', error);
            throw new Error(`Failed to find page section: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async save(pageSection: PageSection): Promise<void> {
        try {
            const pageSectionData = PageSectionMapper.toDatabase(pageSection);

            // Check if this is an update (existing section) or create (new section)
            const existingSection = await this.findById(pageSection.getId());

            if (existingSection) {
                // Update existing section
                await this.db
                    .update(pageSections)
                    .set({
                        page: pageSectionData.page,
                        section: pageSectionData.section,
                        title: pageSectionData.title,
                        subtitle: pageSectionData.subtitle,
                        description: pageSectionData.description,
                        content: pageSectionData.content,
                        images: pageSectionData.images,
                        settings: pageSectionData.settings,
                        isActive: pageSectionData.isActive,
                        order: pageSectionData.order,
                        updatedAt: new Date(),
                    })
                    .where(eq(pageSections.id, pageSectionData.id));
            } else {
                // Create new section
                await this.db
                    .insert(pageSections)
                    .values(pageSectionData);
            }
        } catch (error) {
            console.error('Error saving page section:', error);
            throw new Error(`Failed to save page section: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async delete(id: PageSectionId): Promise<void> {
        try {
            await this.db
                .delete(pageSections)
                .where(eq(pageSections.id, id.isNumeric() ? id.toNumber() : parseInt(id.value, 10)));
        } catch (error) {
            console.error('Error deleting page section:', error);
            throw new Error(`Failed to delete page section: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async exists(id: PageSectionId): Promise<boolean> {
        try {
            const result = await this.db
                .select({ count: count() })
                .from(pageSections)
                .where(eq(pageSections.id, id.isNumeric() ? id.toNumber() : parseInt(id.value, 10)));

            return (result[0]?.count || 0) > 0;
        } catch (error) {
            console.error('Error checking page section existence:', error);
            throw new Error(`Failed to check page section existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findAll(
        filters?: PageSectionFilters,
        options?: PageSectionSearchOptions
    ): Promise<PageSection[]> {
        try {
            const whereConditions = this.buildWhereConditions(filters);
            const { sortBy = 'order', sortOrder = 'asc' } = options || {};

            let orderBy;
            switch (sortBy) {
                case 'createdAt':
                    orderBy = sortOrder === 'asc' ? asc(pageSections.createdAt) : desc(pageSections.createdAt);
                    break;
                case 'updatedAt':
                    orderBy = sortOrder === 'asc' ? asc(pageSections.updatedAt) : desc(pageSections.updatedAt);
                    break;
                case 'order':
                default:
                    orderBy = sortOrder === 'asc' ? asc(pageSections.order) : desc(pageSections.order);
                    break;
            }

            const results = await this.db
                .select()
                .from(pageSections)
                .where(whereConditions)
                .orderBy(orderBy);

            return results.map(row => PageSectionMapper.toDomain(row));
        } catch (error) {
            console.error('Error finding all page sections:', error);
            throw new Error(`Failed to find page sections: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findByPage(
        page: PageName,
        includeInactive: boolean = false
    ): Promise<PageSection[]> {
        try {
            const whereConditions = includeInactive
                ? eq(pageSections.page, page.value)
                : and(eq(pageSections.page, page.value), eq(pageSections.isActive, true));

            const results = await this.db
                .select()
                .from(pageSections)
                .where(whereConditions)
                .orderBy(asc(pageSections.order));

            return results.map(row => PageSectionMapper.toDomain(row));
        } catch (error) {
            console.error('Error finding page sections by page:', error);
            throw new Error(`Failed to find page sections by page: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findActiveByPage(page: PageName): Promise<PageSection[]> {
        return this.findByPage(page, false);
    }

    async findByPageAndSection(
        page: PageName,
        section: SectionName
    ): Promise<PageSection | null> {
        try {
            const results = await this.db
                .select()
                .from(pageSections)
                .where(
                    and(
                        eq(pageSections.page, page.value),
                        eq(pageSections.section, section.value)
                    )
                )
                .limit(1);

            if (results.length === 0) {
                return null;
            }

            return PageSectionMapper.toDomain(results[0]);
        } catch (error) {
            console.error('Error finding page section by page and section:', error);
            throw new Error(`Failed to find page section: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findBySection(section: SectionName): Promise<PageSection[]> {
        try {
            const results = await this.db
                .select()
                .from(pageSections)
                .where(eq(pageSections.section, section.value))
                .orderBy(asc(pageSections.page), asc(pageSections.order));

            return results.map(row => PageSectionMapper.toDomain(row));
        } catch (error) {
            console.error('Error finding page sections by section:', error);
            throw new Error(`Failed to find page sections by section: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async updateSectionOrder(
        page: PageName,
        sectionOrders: Array<{ id: PageSectionId; order: number }>
    ): Promise<void> {
        try {
            // Use a transaction to update all orders atomically
            await this.db.transaction(async (tx) => {
                for (const { id, order } of sectionOrders) {
                    await tx
                        .update(pageSections)
                        .set({ order, updatedAt: new Date() })
                        .where(eq(pageSections.id, id.isNumeric() ? id.toNumber() : parseInt(id.value, 10)));
                }
            });
        } catch (error) {
            console.error('Error updating section order:', error);
            throw new Error(`Failed to update section order: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async activate(id: PageSectionId): Promise<void> {
        try {
            await this.db
                .update(pageSections)
                .set({ isActive: true, updatedAt: new Date() })
                .where(eq(pageSections.id, id.isNumeric() ? id.toNumber() : parseInt(id.value, 10)));
        } catch (error) {
            console.error('Error activating page section:', error);
            throw new Error(`Failed to activate page section: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async deactivate(id: PageSectionId): Promise<void> {
        try {
            await this.db
                .update(pageSections)
                .set({ isActive: false, updatedAt: new Date() })
                .where(eq(pageSections.id, id.isNumeric() ? id.toNumber() : parseInt(id.value, 10)));
        } catch (error) {
            console.error('Error deactivating page section:', error);
            throw new Error(`Failed to deactivate page section: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async existsByPageAndSection(
        page: PageName,
        section: SectionName
    ): Promise<boolean> {
        try {
            const result = await this.db
                .select({ count: count() })
                .from(pageSections)
                .where(
                    and(
                        eq(pageSections.page, page.value),
                        eq(pageSections.section, section.value)
                    )
                );

            return (result[0]?.count || 0) > 0;
        } catch (error) {
            console.error('Error checking page section existence:', error);
            throw new Error(`Failed to check page section existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getNextOrderForPage(page: PageName): Promise<number> {
        try {
            const result = await this.db
                .select({
                    maxOrder: sql<number>`MAX(${pageSections.order})`
                })
                .from(pageSections)
                .where(eq(pageSections.page, page.value));

            const maxOrder = result[0]?.maxOrder || 0;
            return maxOrder + 1;
        } catch (error) {
            console.error('Error getting next order for page:', error);
            throw new Error(`Failed to get next order: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async duplicateToPage(
        sectionId: PageSectionId,
        targetPage: PageName
    ): Promise<PageSection> {
        try {
            // Find the source section
            const sourceSection = await this.findById(sectionId);
            if (!sourceSection) {
                throw new Error('Source section not found');
            }

            // Get next order for target page
            const nextOrder = await this.getNextOrderForPage(targetPage);

            // Create new section with same content but different page and order
            const newSection = PageSection.create({
                page: targetPage.value,
                section: sourceSection.getSection().value,
                title: sourceSection.getTitle()?.value,
                subtitle: sourceSection.getContent().subtitle,
                description: sourceSection.getContent().description,
                content: sourceSection.getContent().content,
                images: sourceSection.getContent().images,
                settings: sourceSection.getSettings().value,
                isActive: sourceSection.getIsActive(),
                order: nextOrder
            });

            await this.save(newSection);
            return newSection;
        } catch (error) {
            console.error('Error duplicating page section:', error);
            throw new Error(`Failed to duplicate page section: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findIncomplete(): Promise<PageSection[]> {
        try {
            const results = await this.db
                .select()
                .from(pageSections)
                .where(
                    or(
                        eq(pageSections.title, ''),
                        sql`${pageSections.content} = '{}'`,
                        sql`json_array_length(${pageSections.images}) = 0`
                    )
                )
                .orderBy(asc(pageSections.page), asc(pageSections.order));

            return results.map(row => PageSectionMapper.toDomain(row));
        } catch (error) {
            console.error('Error finding incomplete page sections:', error);
            throw new Error(`Failed to find incomplete page sections: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async countByPage(page: PageName): Promise<number> {
        try {
            const result = await this.db
                .select({ count: count() })
                .from(pageSections)
                .where(eq(pageSections.page, page.value));

            return result[0]?.count || 0;
        } catch (error) {
            console.error('Error counting page sections by page:', error);
            throw new Error(`Failed to count page sections: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async countBySection(section: SectionName): Promise<number> {
        try {
            const result = await this.db
                .select({ count: count() })
                .from(pageSections)
                .where(eq(pageSections.section, section.value));

            return result[0]?.count || 0;
        } catch (error) {
            console.error('Error counting page sections by section:', error);
            throw new Error(`Failed to count page sections: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findByContentProperty(
        propertyKey: string,
        propertyValue: any
    ): Promise<PageSection[]> {
        try {
            const results = await this.db
                .select()
                .from(pageSections)
                .where(sql`${pageSections.content}->>${propertyKey} = ${propertyValue}`)
                .orderBy(asc(pageSections.page), asc(pageSections.order));

            return results.map(row => PageSectionMapper.toDomain(row));
        } catch (error) {
            console.error('Error finding page sections by content property:', error);
            throw new Error(`Failed to find page sections by content property: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findByImageUrl(imageUrl: string): Promise<PageSection[]> {
        try {
            const results = await this.db
                .select()
                .from(pageSections)
                .where(sql`${pageSections.images} @> ${JSON.stringify([imageUrl])}`)
                .orderBy(asc(pageSections.page), asc(pageSections.order));

            return results.map(row => PageSectionMapper.toDomain(row));
        } catch (error) {
            console.error('Error finding page sections by image URL:', error);
            throw new Error(`Failed to find page sections by image URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async bulkUpdate(
        filters: PageSectionFilters,
        updates: {
            settings?: Record<string, any>;
            isActive?: boolean;
        }
    ): Promise<number> {
        try {
            const whereConditions = this.buildWhereConditions(filters);

            const updateData: any = { updatedAt: new Date() };
            if (updates.settings !== undefined) {
                updateData.settings = updates.settings;
            }
            if (updates.isActive !== undefined) {
                updateData.isActive = updates.isActive;
            }

            const result = await this.db
                .update(pageSections)
                .set(updateData)
                .where(whereConditions);

            return result.rowCount || 0;
        } catch (error) {
            console.error('Error bulk updating page sections:', error);
            throw new Error(`Failed to bulk update page sections: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getStatistics(): Promise<{
        totalSections: number;
        activeSections: number;
        inactiveSections: number;
        sectionsByPage: Record<string, number>;
        sectionsByType: Record<string, number>;
        sectionsWithImages: number;
        sectionsWithCustomSettings: number;
    }> {
        try {
            // Get basic counts
            const [totalResult, activeResult, inactiveResult] = await Promise.all([
                this.db.select({ count: count() }).from(pageSections),
                this.db.select({ count: count() }).from(pageSections).where(eq(pageSections.isActive, true)),
                this.db.select({ count: count() }).from(pageSections).where(eq(pageSections.isActive, false))
            ]);

            // Get sections by page
            const pageResults = await this.db
                .select({
                    page: pageSections.page,
                    count: count()
                })
                .from(pageSections)
                .groupBy(pageSections.page);

            const sectionsByPage: Record<string, number> = {};
            pageResults.forEach(result => {
                sectionsByPage[result.page] = result.count;
            });

            // Get sections by type
            const typeResults = await this.db
                .select({
                    section: pageSections.section,
                    count: count()
                })
                .from(pageSections)
                .groupBy(pageSections.section);

            const sectionsByType: Record<string, number> = {};
            typeResults.forEach(result => {
                sectionsByType[result.section] = result.count;
            });

            // Get sections with images
            const imagesResult = await this.db
                .select({ count: count() })
                .from(pageSections)
                .where(sql`json_array_length(${pageSections.images}) > 0`);

            // Get sections with custom settings
            const settingsResult = await this.db
                .select({ count: count() })
                .from(pageSections)
                .where(sql`${pageSections.settings} != '{}'`);

            return {
                totalSections: totalResult[0]?.count || 0,
                activeSections: activeResult[0]?.count || 0,
                inactiveSections: inactiveResult[0]?.count || 0,
                sectionsByPage,
                sectionsByType,
                sectionsWithImages: imagesResult[0]?.count || 0,
                sectionsWithCustomSettings: settingsResult[0]?.count || 0
            };
        } catch (error) {
            console.error('Error getting page section statistics:', error);
            throw new Error(`Failed to get statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findModifiedAfter(date: Date): Promise<PageSection[]> {
        try {
            const results = await this.db
                .select()
                .from(pageSections)
                .where(sql`${pageSections.updatedAt} > ${date}`)
                .orderBy(desc(pageSections.updatedAt));

            return results.map(row => PageSectionMapper.toDomain(row));
        } catch (error) {
            console.error('Error finding modified page sections:', error);
            throw new Error(`Failed to find modified page sections: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async resetPageToDefaults(page: PageName): Promise<void> {
        try {
            // Delete all existing sections for the page
            await this.db
                .delete(pageSections)
                .where(eq(pageSections.page, page.value));

            // Create default sections for the page
            const defaultSections = page.getDefaultSections();

            for (let i = 0; i < defaultSections.length; i++) {
                const sectionName = defaultSections[i];
                const section = PageSection.create({
                    page: page.value,
                    section: sectionName,
                    title: SectionName.create(sectionName).getLabel(),
                    order: i
                });

                await this.save(section);
            }
        } catch (error) {
            console.error('Error resetting page to defaults:', error);
            throw new Error(`Failed to reset page to defaults: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async exportPageConfiguration(page: PageName): Promise<{
        page: string;
        sections: Array<{
            section: string;
            title?: string;
            content: any;
            settings: any;
            order: number;
            isActive: boolean;
        }>;
    }> {
        try {
            const sections = await this.findByPage(page, true);

            return {
                page: page.value,
                sections: sections.map(section => ({
                    section: section.getSection().value,
                    title: section.getTitle()?.value,
                    content: {
                        subtitle: section.getContent().subtitle,
                        description: section.getContent().description,
                        content: section.getContent().content,
                        images: section.getContent().images
                    },
                    settings: section.getSettings().value,
                    order: section.getOrder(),
                    isActive: section.getIsActive()
                }))
            };
        } catch (error) {
            console.error('Error exporting page configuration:', error);
            throw new Error(`Failed to export page configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async importPageConfiguration(
        page: PageName,
        configuration: {
            sections: Array<{
                section: string;
                title?: string;
                content: any;
                settings: any;
                order: number;
                isActive: boolean;
            }>;
        }
    ): Promise<void> {
        try {
            // Delete existing sections
            await this.db
                .delete(pageSections)
                .where(eq(pageSections.page, page.value));

            // Create new sections from configuration
            for (const sectionConfig of configuration.sections) {
                const section = PageSection.create({
                    page: page.value,
                    section: sectionConfig.section,
                    title: sectionConfig.title,
                    subtitle: sectionConfig.content.subtitle,
                    description: sectionConfig.content.description,
                    content: sectionConfig.content.content,
                    images: sectionConfig.content.images,
                    settings: sectionConfig.settings,
                    isActive: sectionConfig.isActive,
                    order: sectionConfig.order
                });

                await this.save(section);
            }
        } catch (error) {
            console.error('Error importing page configuration:', error);
            throw new Error(`Failed to import page configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private buildWhereConditions(filters?: PageSectionFilters) {
        if (!filters) return undefined;

        const conditions = [];

        if (filters.page) {
            conditions.push(eq(pageSections.page, filters.page.value));
        }

        if (filters.section) {
            conditions.push(eq(pageSections.section, filters.section.value));
        }

        if (filters.isActive !== undefined) {
            conditions.push(eq(pageSections.isActive, filters.isActive));
        }

        return conditions.length > 0 ? and(...conditions) : undefined;
    }
}