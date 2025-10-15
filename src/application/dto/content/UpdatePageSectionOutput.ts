import { PageSection } from '@/domain/content/entities/PageSection';

export class UpdatePageSectionOutput {
    constructor(
        public readonly id: string,
        public readonly page: string,
        public readonly section: string,
        public readonly title: string | null,
        public readonly isActive: boolean,
        public readonly order: number,
        public readonly updatedAt: Date,
        public readonly contentSummary: string,
        public readonly settingsSummary: string
    ) { }

    static from(pageSection: PageSection): UpdatePageSectionOutput {
        return new UpdatePageSectionOutput(
            pageSection.getId().value,
            pageSection.getPage().value,
            pageSection.getSection().value,
            pageSection.getTitle()?.value || null,
            pageSection.getIsActive(),
            pageSection.getOrder().value,
            pageSection.getUpdatedAt(),
            pageSection.getContent().toString(),
            JSON.stringify(pageSection.getSettings())
        );
    }

    /**
     * Frontend compatibility methods
     */
    getId(): { value: string } {
        return { value: this.id };
    }

    getPage(): { value: string } {
        return { value: this.page };
    }

    getSection(): { value: string } {
        return { value: this.section };
    }

    getTitle(): { value: string | null } {
        return { value: this.title };
    }

    toJSON(): string {
        return JSON.stringify({
            id: this.id,
            page: this.page,
            section: this.section,
            title: this.title,
            isActive: this.isActive,
            order: this.order,
            updatedAt: this.updatedAt.toISOString(),
            contentSummary: this.contentSummary,
            settingsSummary: this.settingsSummary,
        });
    }
}