import { WizardDraft } from '@/domain/wizard/entities/WizardDraft';

export class LoadWizardDraftOutput {
    constructor(
        public readonly draftId: string,
        public readonly userId: string,
        public readonly wizardType: string,
        public readonly wizardConfigId: string,
        public readonly formData: Record<string, any>,
        public readonly currentStep: string,
        public readonly stepProgress: Record<string, any>,
        public readonly completionPercentage: number,
        public readonly title?: string,
        public readonly description?: string,
        public readonly createdAt?: Date,
        public readonly updatedAt?: Date
    ) { }

    static from(draft: WizardDraft): LoadWizardDraftOutput {
        return new LoadWizardDraftOutput(
            draft.getId().value,
            draft.getUserId().value,
            draft.getWizardType().value,
            draft.getWizardConfigId(),
            draft.getFormData().value,
            draft.getCurrentStep(),
            draft.getStepProgress().toJSON(),
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

    getUserId(): { value: string } {
        return { value: this.userId };
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
            userId: this.userId,
            wizardType: this.wizardType,
            wizardConfigId: this.wizardConfigId,
            formData: this.formData,
            currentStep: this.currentStep,
            stepProgress: this.stepProgress,
            completionPercentage: this.completionPercentage,
            title: this.title,
            description: this.description,
            createdAt: this.createdAt?.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
        };
    }
}