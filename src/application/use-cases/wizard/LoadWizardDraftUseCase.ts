import { LoadWizardDraftInput } from "../../dto/wizard/LoadWizardDraftInput";
import { LoadWizardDraftOutput } from "../../dto/wizard/LoadWizardDraftOutput";
import { IWizardDraftRepository } from '@/domain/wizard/repositories/IWizardDraftRepository';
import { WizardDraftId } from '@/domain/wizard/value-objects/WizardDraftId';
import { UserId } from '@/domain/user/value-objects/UserId';
import { EntityNotFoundError, BusinessRuleViolationError } from '@/domain/shared/errors/DomainError';

export class LoadWizardDraftUseCase {
    constructor(
        private readonly wizardDraftRepository: IWizardDraftRepository
    ) { }

    async execute(input: LoadWizardDraftInput): Promise<LoadWizardDraftOutput> {
        try {
            const draftId = WizardDraftId.create(input.draftId);
            const userId = UserId.create(input.userId);

            // Find the draft
            const wizardDraft = await this.wizardDraftRepository.findById(draftId);

            if (!wizardDraft) {
                throw new EntityNotFoundError('WizardDraft', input.draftId);
            }

            // Verify ownership
            if (!wizardDraft.getUserId().equals(userId)) {
                throw new BusinessRuleViolationError("You don't have permission to access this draft", 'UNAUTHORIZED_DRAFT_ACCESS');
            }

            return LoadWizardDraftOutput.from(wizardDraft);
        } catch (error) {
            if (error instanceof EntityNotFoundError || error instanceof BusinessRuleViolationError) {
                throw error;
            }
            throw new Error(`Failed to load wizard draft: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
}