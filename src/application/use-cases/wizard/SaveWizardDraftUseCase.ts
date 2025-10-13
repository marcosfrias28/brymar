import { SaveWizardDraftInput } from "../../dto/wizard/SaveWizardDraftInput";
import { SaveWizardDraftOutput } from "../../dto/wizard/SaveWizardDraftOutput";
import { IWizardDraftRepository } from '@/domain/wizard/repositories/IWizardDraftRepository';
import { WizardDomainService, WizardStepDefinition } from '@/domain/wizard/services/WizardDomainService';
import { WizardDraft } from '@/domain/wizard/entities/WizardDraft';
import { WizardDraftId } from '@/domain/wizard/value-objects/WizardDraftId';
import { UserId } from '@/domain/user/value-objects/UserId';
import { DomainError } from '@/domain/shared/errors/DomainError';

export class SaveWizardDraftUseCase {
    constructor(
        private readonly wizardDraftRepository: IWizardDraftRepository,
        private readonly wizardDomainService: WizardDomainService
    ) { }

    async execute(input: SaveWizardDraftInput): Promise<SaveWizardDraftOutput> {
        try {
            let wizardDraft: WizardDraft;

            if (input.draftId) {
                // Update existing draft
                const draftId = WizardDraftId.create(input.draftId);
                const existingDraft = await this.wizardDraftRepository.findById(draftId);

                if (!existingDraft) {
                    throw new DomainError(`Wizard draft with ID ${input.draftId} not found`);
                }

                // Verify ownership
                const userId = UserId.create(input.userId);
                if (!existingDraft.getUserId().equals(userId)) {
                    throw new DomainError("You don't have permission to update this draft");
                }

                // Update the draft
                existingDraft.updateFormData(input.formData);
                existingDraft.updateCurrentStep(input.currentStep);

                if (input.title) {
                    existingDraft.updateTitle(input.title);
                }

                if (input.description) {
                    existingDraft.updateDescription(input.description);
                }

                // Calculate and update completion percentage
                const stepDefinitions = this.getStepDefinitions(input.wizardType, input.wizardConfigId);
                const completionPercentage = this.wizardDomainService.calculateCompletionPercentage(
                    existingDraft.getStepProgress(),
                    input.formData,
                    stepDefinitions
                );
                existingDraft.updateCompletionPercentage(completionPercentage.value);

                wizardDraft = existingDraft;
            } else {
                // Create new draft
                wizardDraft = WizardDraft.create({
                    userId: input.userId,
                    wizardType: input.wizardType,
                    wizardConfigId: input.wizardConfigId,
                    formData: input.formData,
                    currentStep: input.currentStep,
                    title: input.title,
                    description: input.description,
                });

                // Calculate initial completion percentage
                const stepDefinitions = this.getStepDefinitions(input.wizardType, input.wizardConfigId);
                const completionPercentage = this.wizardDomainService.calculateCompletionPercentage(
                    wizardDraft.getStepProgress(),
                    input.formData,
                    stepDefinitions
                );
                wizardDraft.updateCompletionPercentage(completionPercentage.value);
            }

            // Validate current step
            const stepDefinitions = this.getStepDefinitions(input.wizardType, input.wizardConfigId);
            const validationResult = this.wizardDomainService.validateStep({
                stepId: input.currentStep,
                formData: input.formData,
                wizardType: wizardDraft.getWizardType(),
                stepDefinitions,
            });

            // Mark step as completed if validation passes
            if (validationResult.isValid) {
                wizardDraft.markStepCompleted(input.currentStep);

                // Recalculate completion percentage after marking step complete
                const updatedCompletionPercentage = this.wizardDomainService.calculateCompletionPercentage(
                    wizardDraft.getStepProgress(),
                    input.formData,
                    stepDefinitions
                );
                wizardDraft.updateCompletionPercentage(updatedCompletionPercentage.value);
            }

            // Save the draft
            await this.wizardDraftRepository.save(wizardDraft);

            return SaveWizardDraftOutput.from(wizardDraft);
        } catch (error) {
            if (error instanceof DomainError) {
                throw error;
            }
            throw new Error(`Failed to save wizard draft: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    /**
     * Get step definitions for a wizard type and config
     * In a real implementation, this would come from a configuration service
     */
    private getStepDefinitions(wizardType: string, wizardConfigId: string): WizardStepDefinition[] {
        // This is a simplified implementation - in practice, you'd load this from configuration
        switch (wizardType) {
            case "property":
                return [
                    { id: "general", title: "General Information", isRequired: true },
                    { id: "location", title: "Location", isRequired: true },
                    { id: "media", title: "Media", isRequired: false },
                    { id: "preview", title: "Preview", isRequired: false },
                ];
            case "land":
                return [
                    { id: "general", title: "General Information", isRequired: true },
                    { id: "location", title: "Location", isRequired: true },
                    { id: "media", title: "Media", isRequired: false },
                    { id: "preview", title: "Preview", isRequired: false },
                ];
            case "blog":
                return [
                    { id: "content", title: "Content", isRequired: true },
                    { id: "settings", title: "Settings", isRequired: true },
                    { id: "preview", title: "Preview", isRequired: false },
                ];
            default:
                return [];
        }
    }
}