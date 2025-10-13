import { PageSectionId } from '@/domain/content/value-objects/PageSectionId';
import { IPageSectionRepository } from '@/domain/content/repositories/IPageSectionRepository';
import { ContentDomainService } from '@/domain/content/services/ContentDomainService';
import { UpdatePageSectionInput } from '../../dto/content/UpdatePageSectionInput';
import { UpdatePageSectionOutput } from '../../dto/content/UpdatePageSectionOutput';
import { BusinessRuleViolationError, EntityNotFoundError, EntityValidationError } from '@/domain/shared/errors/DomainError';

export class UpdatePageSectionUseCase {
    constructor(
        private readonly pageSectionRepository: IPageSectionRepository,
        private readonly contentDomainService: ContentDomainService
    ) { }

    async execute(input: UpdatePageSectionInput): Promise<UpdatePageSectionOutput> {
        try {
            // Validate input has updates
            if (!input.hasUpdates()) {
                throw new EntityValidationError('No updates provided');
            }

            // Find the page section
            const pageSectionId = PageSectionId.create(input.id);
            const pageSection = await this.pageSectionRepository.findById(pageSectionId);

            if (!pageSection) {
                throw new EntityNotFoundError('PageSection', input.id);
            }

            // Apply updates
            if (input.title !== undefined) {
                pageSection.updateTitle(input.title);
            }

            if (input.content !== undefined) {
                pageSection.updateContent({
                    subtitle: input.content.subtitle,
                    description: input.content.description,
                    content: input.content.content,
                    images: input.content.images
                });
            }

            if (input.settings !== undefined) {
                pageSection.updateSettings(input.settings);
            }

            if (input.isActive !== undefined) {
                if (input.isActive) {
                    pageSection.activate();
                } else {
                    pageSection.deactivate();
                }
            }

            if (input.order !== undefined) {
                // Check if the new order conflicts with existing sections
                const existingSections = await this.pageSectionRepository.findByPage(pageSection.getPage());
                const conflictingSection = existingSections.find(
                    section => section.getOrder() === input.order && !section.getId().equals(pageSection.getId())
                );

                if (conflictingSection) {
                    // Auto-resolve by shifting other sections
                    await this.resolveOrderConflict(pageSection.getPage(), input.order, pageSection.getId());
                }

                pageSection.updateOrder(input.order);
            }

            // Validate the updated page section
            this.contentDomainService.validatePageSectionConfiguration(pageSection);

            // Save the updated page section
            await this.pageSectionRepository.save(pageSection);

            // Return the output
            return UpdatePageSectionOutput.from(pageSection);

        } catch (error) {
            if (error instanceof BusinessRuleViolationError || error instanceof EntityNotFoundError || error instanceof EntityValidationError) {
                throw error;
            }

            throw new EntityValidationError(`Failed to update page section: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async resolveOrderConflict(
        page: any,
        newOrder: number,
        excludeId: PageSectionId
    ): Promise<void> {
        // Get all sections for the page
        const sections = await this.pageSectionRepository.findByPage(page);

        // Find sections that need to be reordered
        const sectionsToReorder = sections.filter(
            section => section.getOrder() >= newOrder && !section.getId().equals(excludeId)
        );

        // Update their orders
        const orderUpdates = sectionsToReorder.map(section => ({
            id: section.getId(),
            order: section.getOrder() + 1
        }));

        if (orderUpdates.length > 0) {
            await this.pageSectionRepository.updateSectionOrder(page, orderUpdates);
        }
    }
}