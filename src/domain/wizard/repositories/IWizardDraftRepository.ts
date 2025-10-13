import { WizardDraft } from "../entities/WizardDraft";
import { WizardDraftId } from "../value-objects/WizardDraftId";
import { WizardType } from "../value-objects/WizardType";
import { UserId } from "../../user/value-objects/UserId";

export interface WizardDraftFilters {
    userId?: UserId;
    wizardType?: WizardType;
    wizardConfigId?: string;
    completionPercentageMin?: number;
    completionPercentageMax?: number;
    createdAfter?: Date;
    createdBefore?: Date;
    updatedAfter?: Date;
    updatedBefore?: Date;
}

export interface WizardDraftSearchOptions {
    limit?: number;
    offset?: number;
    sortBy?: "createdAt" | "updatedAt" | "completionPercentage" | "title";
    sortOrder?: "asc" | "desc";
}

export interface WizardDraftSearchResult {
    drafts: WizardDraft[];
    total: number;
    hasMore: boolean;
}

export interface IWizardDraftRepository {
    /**
     * Save a wizard draft (create or update)
     */
    save(draft: WizardDraft): Promise<void>;

    /**
     * Find a wizard draft by ID
     */
    findById(id: WizardDraftId): Promise<WizardDraft | null>;

    /**
     * Find wizard drafts by user ID
     */
    findByUserId(userId: UserId): Promise<WizardDraft[]>;

    /**
     * Find wizard drafts by wizard type
     */
    findByWizardType(wizardType: WizardType): Promise<WizardDraft[]>;

    /**
     * Find wizard drafts by user ID and wizard type
     */
    findByUserIdAndWizardType(userId: UserId, wizardType: WizardType): Promise<WizardDraft[]>;

    /**
     * Search wizard drafts with filters and options
     */
    search(filters: WizardDraftFilters, options?: WizardDraftSearchOptions): Promise<WizardDraftSearchResult>;

    /**
     * Delete a wizard draft
     */
    delete(id: WizardDraftId): Promise<void>;

    /**
     * Delete all wizard drafts for a user
     */
    deleteByUserId(userId: UserId): Promise<void>;

    /**
     * Count wizard drafts by filters
     */
    count(filters: WizardDraftFilters): Promise<number>;

    /**
     * Check if a wizard draft exists
     */
    exists(id: WizardDraftId): Promise<boolean>;

    /**
     * Find incomplete wizard drafts (for cleanup or reminders)
     */
    findIncomplete(userId?: UserId, olderThanDays?: number): Promise<WizardDraft[]>;

    /**
     * Find wizard drafts that haven't been updated recently
     */
    findStale(olderThanDays: number): Promise<WizardDraft[]>;

    /**
     * Get wizard draft statistics for a user
     */
    getUserStatistics(userId: UserId): Promise<{
        totalDrafts: number;
        completedDrafts: number;
        draftsByType: Record<string, number>;
        averageCompletionPercentage: number;
    }>;
}