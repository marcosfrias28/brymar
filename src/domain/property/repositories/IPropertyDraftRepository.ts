import { BaseDraftRepository, DraftData } from '@/domain/shared/interfaces/BaseDraftRepository';

export interface PropertyDraftData extends DraftData {
    propertyType?: string;
    propertyId?: string; // If editing existing property
}

export interface IPropertyDraftRepository extends BaseDraftRepository<PropertyDraftData> {
    /**
     * Find drafts by property type
     */
    findByPropertyType(propertyType: string): Promise<PropertyDraftData[]>;

    /**
     * Find drafts ready for completion (high completion percentage)
     */
    findReadyForCompletion(minCompletionPercentage?: number): Promise<PropertyDraftData[]>;

    /**
     * Check if user has existing draft for property type
     */
    hasExistingDraft(userId: string, propertyType: string): Promise<boolean>;

    /**
     * Find user's draft by property type
     */
    findByUserIdAndType(userId: string, propertyType: string): Promise<PropertyDraftData | null>;

    /**
     * Find drafts that haven't been updated recently
     */
    findStale(hoursOld: number): Promise<PropertyDraftData[]>;
}