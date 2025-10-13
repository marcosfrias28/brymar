import { WizardMedia } from "../entities/WizardMedia";
import { WizardMediaId } from "../value-objects/WizardMediaId";
import { WizardDraftId } from "../value-objects/WizardDraftId";
import { WizardType } from "../value-objects/WizardType";
import { MediaType } from "../value-objects/MediaType";

export interface WizardMediaFilters {
    draftId?: WizardDraftId;
    publishedId?: number;
    wizardType?: WizardType;
    mediaType?: MediaType;
    uploadedAfter?: Date;
    uploadedBefore?: Date;
}

export interface WizardMediaSearchOptions {
    limit?: number;
    offset?: number;
    sortBy?: "uploadedAt" | "displayOrder" | "filename";
    sortOrder?: "asc" | "desc";
}

export interface WizardMediaSearchResult {
    media: WizardMedia[];
    total: number;
    hasMore: boolean;
}

export interface IWizardMediaRepository {
    /**
     * Save wizard media (create or update)
     */
    save(media: WizardMedia): Promise<void>;

    /**
     * Save multiple wizard media items
     */
    saveMany(mediaItems: WizardMedia[]): Promise<void>;

    /**
     * Find wizard media by ID
     */
    findById(id: WizardMediaId): Promise<WizardMedia | null>;

    /**
     * Find all media for a wizard draft
     */
    findByDraftId(draftId: WizardDraftId): Promise<WizardMedia[]>;

    /**
     * Find all media for a published entity
     */
    findByPublishedId(publishedId: number, wizardType: WizardType): Promise<WizardMedia[]>;

    /**
     * Find media by wizard type
     */
    findByWizardType(wizardType: WizardType): Promise<WizardMedia[]>;

    /**
     * Find media by media type (images or videos)
     */
    findByMediaType(mediaType: MediaType): Promise<WizardMedia[]>;

    /**
     * Search wizard media with filters and options
     */
    search(filters: WizardMediaFilters, options?: WizardMediaSearchOptions): Promise<WizardMediaSearchResult>;

    /**
     * Delete wizard media
     */
    delete(id: WizardMediaId): Promise<void>;

    /**
     * Delete all media for a wizard draft
     */
    deleteByDraftId(draftId: WizardDraftId): Promise<void>;

    /**
     * Delete all media for a published entity
     */
    deleteByPublishedId(publishedId: number, wizardType: WizardType): Promise<void>;

    /**
     * Update display order for multiple media items
     */
    updateDisplayOrder(mediaIds: WizardMediaId[], newOrders: number[]): Promise<void>;

    /**
     * Move media from draft to published entity
     */
    moveToPublished(draftId: WizardDraftId, publishedId: number): Promise<void>;

    /**
     * Count media items by filters
     */
    count(filters: WizardMediaFilters): Promise<number>;

    /**
     * Check if wizard media exists
     */
    exists(id: WizardMediaId): Promise<boolean>;

    /**
     * Find orphaned media (not associated with any draft or published entity)
     */
    findOrphaned(olderThanDays?: number): Promise<WizardMedia[]>;

    /**
     * Get media statistics
     */
    getStatistics(): Promise<{
        totalMedia: number;
        totalSize: number;
        mediaByType: Record<string, number>;
        mediaByWizardType: Record<string, number>;
    }>;

    /**
     * Find media by URL (for deduplication)
     */
    findByUrl(url: string): Promise<WizardMedia | null>;

    /**
     * Get next display order for a draft
     */
    getNextDisplayOrder(draftId: WizardDraftId): Promise<number>;
}