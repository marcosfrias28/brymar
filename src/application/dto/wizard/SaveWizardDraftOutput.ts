import { WizardDraft } from '@/domain/wizard/entities/WizardDraft';

export class SaveWizardDraftOutput {
    constructor(
        public readonly draftId: string,
        public readonly wizardType: string,
        public readonly currentStep: string,
        public readonly completionPercentage: number,
        public readonly title?: string,
        public readonly description?: string,
        public readonly createdAt?: Date,
        public readonly updatedAt?: Date
    ) { }

    static from(draft: WizardDraft): SaveWizardDraftOutput {
        return new SaveWizardDraftOutput(
            draft.getId().value,
            draft.getWizardType().value,
            draft.getCurrentStep(),
            draft.getCompletionPercentage().value,
            draft.getTitle(),
            draft.getDescription(),
            draft.getCreatedAt(),
            draft.getUpdatedAt()
        );
    }

    /**
     * Frontend compatibility methods
     */
    getId(): { value: string } {
        return { value: this.draftId };
    }

    getWizardType(): { value: string } {
        return { value: this.wizardType };
    }

    getTitle(): { value: string | undefined } {
        return { value: this.title };
    }

    toJSON(): Record<string, any> {
        return {
            draftId: this.draftId,
            wizardType: this.wizardType,
            currentStep: this.currentStep,
            completionPercentage: this.completionPercentage,
            title: this.title,
            description: this.description,
            createdAt: this.createdAt?.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
        };
    }
}