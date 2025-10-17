import { WizardDraft } from "../entities/WizardDraft";
import { WizardDraftId } from "../value-objects/WizardDraftId";
import { WizardType } from "../value-objects/WizardType";
import { UserId } from "../../user/value-objects/UserId";
import { BaseDraftRepository, DraftData } from '@/domain/shared/interfaces/BaseDraftRepository';

export interface WizardDraftRepositoryData extends DraftData {
    wizardType?: string;
    wizardConfigId?: string;
}

export interface IWizardDraftRepository extends BaseDraftRepository<WizardDraftRepositoryData> {
    /**
     * Find wizard drafts by wizard type
     */
    findByWizardType(wizardType: WizardType): Promise<WizardDraftRepositoryData[]>;

    /**
     * Find wizard drafts by user ID and wizard type
     */
    findByUserIdAndWizardType(userId: string, wizardType: WizardType): Promise<WizardDraftRepositoryData[]>;

    /**
     * Delete all wizard drafts for a user
     */
    deleteByUserId(userId: string): Promise<void>;

    /**
     * Find wizard drafts that haven't been updated recently
     */
    findStale(olderThanDays: number): Promise<WizardDraftRepositoryData[]>;
}