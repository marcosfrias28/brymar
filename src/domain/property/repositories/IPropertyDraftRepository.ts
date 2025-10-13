import { Repository } from '@/domain/shared/interfaces/Repository';

export interface PropertyDraftId {
    value: string;
}

export interface PropertyDraftData {
    id: PropertyDraftId;
    userId: string;
    formData: any; // Partial property data
    stepCompleted: number;
    title?: string;
    propertyType?: string;
    completionPercentage: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface PropertyDraft {
    getId(): PropertyDraftId;
    getUserId(): string;
    getFormData(): any;
    getStepCompleted(): number;
    getTitle(): string | undefined;
    getPropertyType(): string | undefined;
    getCompletionPercentage(): number;
    getCreatedAt(): Date;
    getUpdatedAt(): Date;

    updateFormData(data: any): void;
    updateStep(step: number): void;
    updateCompletionPercentage(percentage: number): void;
    updateTitle(title: string): void;
}

export interface PropertyDraftSearchCriteria {
    userId?: string;
    propertyType?: string;
    minCompletionPercentage?: number;
    maxCompletionPercentage?: number;
    createdAfter?: Date;
    createdBefore?: Date;
    limit?: number;
    offset?: number;
    sortBy?: 'createdAt' | 'updatedAt' | 'completionPercentage' | 'title';
    sortOrder?: 'asc' | 'desc';
}

export interface PropertyDraftSearchResult {
    drafts: PropertyDraft[];
    total: number;
    hasMore: boolean;
}

export interface IPropertyDraftRepository extends Repository<PropertyDraft, PropertyDraftId> {
    /**
     * Find draft by ID
     */
    findById(id: PropertyDraftId): Promise<PropertyDraft | null>;

    /**
     * Save draft (create or update)
     */
    save(draft: PropertyDraft): Promise<void>;

    /**
     * Delete draft by ID
     */
    delete(id: PropertyDraftId): Promise<void>;

    /**
     * Find drafts by user ID
     */
    findByUserId(userId: string): Promise<PropertyDraft[]>;

    /**
     * Find user's most recent draft
     */
    findMostRecentByUserId(userId: string): Promise<PropertyDraft | null>;

    /**
     * Search drafts with criteria
     */
    search(criteria: PropertyDraftSearchCriteria): Promise<PropertyDraftSearchResult>;

    /**
     * Find drafts by property type
     */
    findByPropertyType(propertyType: string): Promise<PropertyDraft[]>;

    /**
     * Find incomplete drafts (below certain completion percentage)
     */
    findIncomplete(maxCompletionPercentage?: number): Promise<PropertyDraft[]>;

    /**
     * Find abandoned drafts (not updated for a certain period)
     */
    findAbandoned(daysOld: number): Promise<PropertyDraft[]>;

    /**
     * Find drafts ready for completion (high completion percentage)
     */
    findReadyForCompletion(minCompletionPercentage?: number): Promise<PropertyDraft[]>;

    /**
     * Count drafts by user
     */
    countByUserId(userId: string): Promise<number>;

    /**
     * Count total drafts
     */
    count(criteria?: Partial<PropertyDraftSearchCriteria>): Promise<number>;

    /**
     * Get draft statistics
     */
    getStatistics(): Promise<{
        total: number;
        byPropertyType: Record<string, number>;
        averageCompletionPercentage: number;
        completedDrafts: number;
        abandonedDrafts: number;
    }>;

    /**
     * Clean up old drafts (for maintenance)
     */
    cleanupOldDrafts(daysOld: number): Promise<number>;

    /**
     * Check if user has existing draft for property type
     */
    hasExistingDraft(userId: string, propertyType: string): Promise<boolean>;

    /**
     * Find user's draft by property type
     */
    findByUserIdAndType(userId: string, propertyType: string): Promise<PropertyDraft | null>;

    /**
     * Bulk delete drafts by criteria
     */
    bulkDelete(criteria: Partial<PropertyDraftSearchCriteria>): Promise<number>;

    /**
     * Update draft completion percentage
     */
    updateCompletionPercentage(id: PropertyDraftId, percentage: number): Promise<void>;

    /**
     * Update draft step
     */
    updateStep(id: PropertyDraftId, step: number): Promise<void>;

    /**
     * Merge form data (partial update)
     */
    mergeFormData(id: PropertyDraftId, partialData: any): Promise<void>;

    /**
     * Check if draft exists
     */
    exists(id: PropertyDraftId): Promise<boolean>;

    /**
     * Find drafts that haven't been updated recently
     */
    findStale(hoursOld: number): Promise<PropertyDraft[]>;

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