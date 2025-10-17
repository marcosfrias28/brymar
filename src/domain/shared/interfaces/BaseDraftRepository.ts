import { EntityId } from '../value-objects/EntityId';
import { BaseRepository, SearchCriteria, SearchResult } from './BaseRepository';

export interface DraftData {
    id: string;
    userId: string;
    entityId?: string; // If editing existing entity
    formData: Record<string, any>;
    stepCompleted: number;
    completionPercentage: number;
    title?: string;
    entityType?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface DraftSearchCriteria extends SearchCriteria {
    userId?: string;
    entityType?: string;
    minCompletionPercentage?: number;
    maxCompletionPercentage?: number;
    createdAfter?: Date;
    createdBefore?: Date;
    sortBy?: 'createdAt' | 'updatedAt' | 'completionPercentage' | 'title';
}

export interface BaseDraftRepository<TDraft extends DraftData> {
    /**
     * Find draft by ID
     */
    findById(id: string): Promise<TDraft | null>;

    /**
     * Save draft (create or update)
     */
    save(draft: TDraft): Promise<string>; // Returns draft ID

    /**
     * Delete draft by ID
     */
    delete(id: string): Promise<void>;

    /**
     * Find drafts by user ID
     */
    findByUserId(userId: string): Promise<TDraft[]>;

    /**
     * Find user's most recent draft
     */
    findMostRecentByUserId(userId: string): Promise<TDraft | null>;

    /**
     * Search drafts with criteria
     */
    search(criteria: DraftSearchCriteria): Promise<SearchResult<TDraft>>;

    /**
     * Find incomplete drafts (below certain completion percentage)
     */
    findIncomplete(maxCompletionPercentage?: number): Promise<TDraft[]>;

    /**
     * Find abandoned drafts (not updated for a certain period)
     */
    findAbandoned(daysOld: number): Promise<TDraft[]>;

    /**
     * Count drafts by user
     */
    countByUserId(userId: string): Promise<number>;

    /**
     * Count total drafts
     */
    count(criteria?: Partial<DraftSearchCriteria>): Promise<number>;

    /**
     * Clean up old drafts (for maintenance)
     */
    cleanupOldDrafts(daysOld: number): Promise<number>;

    /**
     * Check if draft exists
     */
    exists(id: string): Promise<boolean>;

    /**
     * Update draft completion percentage
     */
    updateCompletionPercentage(id: string, percentage: number): Promise<void>;

    /**
     * Update draft step
     */
    updateStep(id: string, step: number): Promise<void>;

    /**
     * Merge form data (partial update)
     */
    mergeFormData(id: string, partialData: Record<string, any>): Promise<void>;

    /**
     * Get user's draft statistics
     */
    getUserStatistics(userId: string): Promise<{
        totalDrafts: number;
        completedDrafts: number;
        averageCompletionPercentage: number;
        mostRecentActivity: Date | null;
        draftsByType: Record<string, number>;
    }>;
}