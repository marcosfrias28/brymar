import { PageSection } from "../entities/PageSection";
import { PageSectionId } from "../value-objects/PageSectionId";
import { PageName } from "../value-objects/PageName";
import { SectionName } from "../value-objects/SectionName";

export interface PageSectionFilters {
    page?: PageName;
    section?: SectionName;
    isActive?: boolean;
}

export interface IPageSectionRepository {
    /**
     * Save a page section (create or update)
     */
    save(pageSection: PageSection): Promise<void>;

    /**
     * Find a page section by its ID
     */
    findById(id: PageSectionId): Promise<PageSection | null>;

    /**
     * Find a specific page section by page and section name
     */
    findByPageAndSection(
        page: PageName,
        section: SectionName
    ): Promise<PageSection | null>;

    /**
     * Find all sections for a specific page
     */
    findByPage(page: PageName): Promise<PageSection[]>;

    /**
     * Find all active sections for a specific page, ordered by order field
     */
    findActiveByPage(page: PageName): Promise<PageSection[]>;

    /**
     * Find sections with filters
     */
    findWithFilters(filters: PageSectionFilters): Promise<PageSection[]>;

    /**
     * Find all sections of a specific type across all pages
     */
    findBySection(section: SectionName): Promise<PageSection[]>;

    /**
     * Delete a page section
     */
    delete(id: PageSectionId): Promise<void>;

    /**
     * Check if a page section exists
     */
    exists(id: PageSectionId): Promise<boolean>;

    /**
     * Check if a specific page-section combination exists
     */
    existsByPageAndSection(
        page: PageName,
        section: SectionName
    ): Promise<boolean>;

    /**
     * Get all sections ordered by page and order
     */
    findAllOrdered(): Promise<PageSection[]>;

    /**
     * Update section order for a specific page
     */
    updateSectionOrders(
        page: PageName,
        sectionOrders: Array<{ sectionId: PageSectionId; order: number }>
    ): Promise<void>;
}