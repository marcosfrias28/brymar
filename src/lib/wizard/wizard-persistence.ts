// Wizard Persistence Layer

import { eq, desc, and } from "drizzle-orm";
import db from '@/lib/db/drizzle';
import { wizardDrafts, wizardMedia } from '@/lib/db/schema';
import type { WizardDraft, NewWizardDraft, WizardMedia, NewWizardMedia } from '@/lib/db/schema';
import { WizardData, WizardConfig } from '@/types/wizard-core';

export interface WizardPersistenceOptions {
    autoSave?: boolean;
    autoSaveInterval?: number;
    enableOfflineSupport?: boolean;
    maxLocalStorageSize?: number;
}

export interface WizardDraftWithMedia extends WizardDraft {
    media?: WizardMedia[];
}

export interface PersistenceResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    source?: 'database' | 'localStorage' | 'memory';
}

export class WizardPersistence {
    private static readonly STORAGE_PREFIX = "wizard_draft_";
    private static readonly AUTO_SAVE_DEBOUNCE = 1000; // 1 second
    private static readonly MAX_LOCAL_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB
    private static autoSaveTimeouts = new Map<string, NodeJS.Timeout>();
    private static memoryCache = new Map<string, WizardDraftWithMedia>();

    /**
     * Saves a draft with enhanced error handling and offline support
     */
    static async saveDraft<T extends WizardData>(
        wizardType: string,
        configId: string,
        data: Partial<T>,
        currentStep: string,
        userId?: string,
        draftId?: string,
        options: WizardPersistenceOptions = {}
    ): Promise<PersistenceResult<{ draftId: string }>> {
        const finalDraftId = draftId || this.generateDraftId(wizardType, userId);
        const stepProgress = this.calculateStepProgress(data, configId);
        const completionPercentage = this.calculateCompletionPercentage(data, stepProgress);

        const draftData: Partial<NewWizardDraft> = {
            id: finalDraftId,
            userId: userId || "anonymous",
            wizardType,
            wizardConfigId: configId,
            formData: data as Record<string, any>,
            currentStep,
            stepProgress,
            completionPercentage,
            title: this.extractTitle(data),
            description: this.extractDescription(data),
            updatedAt: new Date(),
        };

        // If no draftId provided, set createdAt
        if (!draftId) {
            draftData.createdAt = new Date();
        }

        // Try database first if user is authenticated
        if (userId && typeof window !== 'undefined' && navigator.onLine) {
            try {
                const result = await this.saveToDatabaseWithRetry(draftData, !!draftId);
                if (result.success) {
                    // Update memory cache
                    this.memoryCache.set(finalDraftId, result.data as WizardDraftWithMedia);

                    // Clear local storage backup if database save succeeded
                    if (options.enableOfflineSupport !== false) {
                        this.clearLocalStorageBackup(finalDraftId);
                    }

                    return {
                        success: true,
                        data: { draftId: finalDraftId },
                        source: 'database'
                    };
                }
            } catch (error) {
                console.warn("Database save failed, falling back to local storage:", error);
            }
        }

        // Fallback to local storage
        try {
            await this.saveToLocalStorageWithCompression(finalDraftId, draftData);

            // Update memory cache
            this.memoryCache.set(finalDraftId, draftData as WizardDraftWithMedia);

            return {
                success: true,
                data: { draftId: finalDraftId },
                source: 'localStorage'
            };
        } catch (error) {
            console.error("Failed to save to local storage:", error);

            // Last resort: memory only
            this.memoryCache.set(finalDraftId, draftData as WizardDraftWithMedia);

            return {
                success: true,
                data: { draftId: finalDraftId },
                source: 'memory',
                error: 'Saved to memory only - data will be lost on page refresh'
            };
        }
    }

    /**
     * Loads a draft with enhanced fallback strategy
     */
    static async loadDraft<T extends WizardData>(
        draftId: string,
        userId?: string
    ): Promise<PersistenceResult<{ data: Partial<T>; currentStep: string; stepProgress: Record<string, boolean>; completionPercentage: number }>> {
        // Check memory cache first
        const cachedDraft = this.memoryCache.get(draftId);
        if (cachedDraft) {
            return {
                success: true,
                data: {
                    data: cachedDraft.formData as Partial<T>,
                    currentStep: cachedDraft.currentStep,
                    stepProgress: (cachedDraft.stepProgress as Record<string, boolean>) || {},
                    completionPercentage: cachedDraft.completionPercentage || 0,
                },
                source: 'memory'
            };
        }

        // Try database first if user is authenticated
        if (userId && typeof window !== 'undefined' && navigator.onLine) {
            try {
                const result = await this.loadFromDatabaseWithMedia(draftId, userId);
                if (result.success && result.data) {
                    // Update memory cache
                    this.memoryCache.set(draftId, result.data);

                    return {
                        success: true,
                        data: {
                            data: result.data.formData as Partial<T>,
                            currentStep: result.data.currentStep,
                            stepProgress: (result.data.stepProgress as Record<string, boolean>) || {},
                            completionPercentage: result.data.completionPercentage || 0,
                        },
                        source: 'database'
                    };
                }
            } catch (error) {
                console.warn("Failed to load draft from database:", error);
            }
        }

        // Fallback to local storage
        try {
            const draft = await this.loadFromLocalStorageWithDecompression(draftId);
            if (draft) {
                // Update memory cache
                this.memoryCache.set(draftId, draft);

                return {
                    success: true,
                    data: {
                        data: draft.formData as Partial<T>,
                        currentStep: draft.currentStep || "",
                        stepProgress: (draft.stepProgress as Record<string, boolean>) || {},
                        completionPercentage: draft.completionPercentage || 0,
                    },
                    source: 'localStorage'
                };
            }
        } catch (error) {
            console.warn("Failed to load from local storage:", error);
        }

        return {
            success: false,
            error: 'Draft not found in any storage location'
        };
    }

    /**
     * Deletes a draft from all storage locations
     */
    static async deleteDraft(draftId: string, userId?: string): Promise<PersistenceResult<void>> {
        const results: { source: string; success: boolean; error?: string }[] = [];

        // Delete from memory cache
        this.memoryCache.delete(draftId);

        // Delete from database if user is authenticated
        if (userId && typeof window !== 'undefined' && navigator.onLine) {
            try {
                const result = await this.deleteFromDatabaseWithMedia(draftId, userId);
                results.push({
                    source: 'database',
                    success: result.success,
                    error: result.error
                });
            } catch (error) {
                results.push({
                    source: 'database',
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown database error'
                });
            }
        }

        // Delete from local storage
        try {
            this.deleteFromLocalStorage(draftId);
            results.push({ source: 'localStorage', success: true });
        } catch (error) {
            results.push({
                source: 'localStorage',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown local storage error'
            });
        }

        // Clear auto-save timeout if exists
        const timeoutKey = `${draftId}_autosave`;
        const existingTimeout = this.autoSaveTimeouts.get(timeoutKey);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
            this.autoSaveTimeouts.delete(timeoutKey);
        }

        const allSuccessful = results.every(r => r.success);
        const errors = results.filter(r => !r.success).map(r => `${r.source}: ${r.error}`);

        return {
            success: allSuccessful,
            error: errors.length > 0 ? errors.join('; ') : undefined
        };
    }

    /**
     * Auto-saves draft with configurable debouncing and error recovery
     */
    static autoSaveDraft<T extends WizardData>(
        wizardType: string,
        configId: string,
        data: Partial<T>,
        currentStep: string,
        userId?: string,
        draftId?: string,
        options: WizardPersistenceOptions & { interval?: number } = {}
    ): Promise<PersistenceResult<{ draftId: string }>> {
        const interval = options.interval || this.AUTO_SAVE_DEBOUNCE;
        const key = draftId ? `${draftId}_autosave` : `${wizardType}_${userId || "anonymous"}_autosave`;

        // Clear existing timeout
        const existingTimeout = this.autoSaveTimeouts.get(key);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        // Set new timeout
        return new Promise((resolve) => {
            const timeout = setTimeout(async () => {
                try {
                    const result = await this.saveDraft(
                        wizardType,
                        configId,
                        data,
                        currentStep,
                        userId,
                        draftId,
                        options
                    );
                    this.autoSaveTimeouts.delete(key);
                    resolve(result);
                } catch (error) {
                    this.autoSaveTimeouts.delete(key);
                    resolve({
                        success: false,
                        error: error instanceof Error ? error.message : 'Auto-save failed'
                    });
                }
            }, interval);

            this.autoSaveTimeouts.set(key, timeout);
        });
    }

    /**
     * Lists all drafts for a user with enhanced filtering and sorting
     */
    static async listDrafts(
        userId: string,
        options: {
            wizardType?: string;
            configId?: string;
            limit?: number;
            offset?: number;
            sortBy?: 'updatedAt' | 'createdAt' | 'completionPercentage';
            sortOrder?: 'asc' | 'desc';
        } = {}
    ): Promise<PersistenceResult<WizardDraftWithMedia[]>> {
        const { wizardType, configId, limit = 50, offset = 0, sortBy = 'updatedAt', sortOrder = 'desc' } = options;

        // Try database first if user is authenticated and online
        if (typeof window !== 'undefined' && navigator.onLine) {
            try {
                const result = await this.listDraftsFromDatabase(userId, options);
                if (result.success) {
                    return result;
                }
            } catch (error) {
                console.warn("Failed to list drafts from database:", error);
            }
        }

        // Fallback to local storage and memory cache
        try {
            const drafts: WizardDraftWithMedia[] = [];

            // Get from memory cache first
            for (const [draftId, draft] of this.memoryCache.entries()) {
                if (draft.userId === userId) {
                    if (!wizardType || draft.wizardType === wizardType) {
                        if (!configId || draft.wizardConfigId === configId) {
                            drafts.push(draft);
                        }
                    }
                }
            }

            // Get from local storage (avoid duplicates)
            const existingIds = new Set(drafts.map(d => d.id));

            if (typeof window !== 'undefined' && window.localStorage) {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key?.startsWith(this.STORAGE_PREFIX)) {
                        const draftId = key.replace(this.STORAGE_PREFIX, "");
                        if (!existingIds.has(draftId)) {
                            const draft = await this.loadFromLocalStorageWithDecompression(draftId);
                            if (draft && draft.userId === userId) {
                                if (!wizardType || draft.wizardType === wizardType) {
                                    if (!configId || draft.wizardConfigId === configId) {
                                        drafts.push(draft);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Sort drafts
            drafts.sort((a, b) => {
                const aValue = a[sortBy] || 0;
                const bValue = b[sortBy] || 0;

                if (sortBy === 'updatedAt' || sortBy === 'createdAt') {
                    const aTime = new Date(aValue).getTime();
                    const bTime = new Date(bValue).getTime();
                    return sortOrder === 'desc' ? bTime - aTime : aTime - bTime;
                } else {
                    return sortOrder === 'desc' ? Number(bValue) - Number(aValue) : Number(aValue) - Number(bValue);
                }
            });

            // Apply pagination
            const paginatedDrafts = drafts.slice(offset, offset + limit);

            return {
                success: true,
                data: paginatedDrafts,
                source: 'localStorage'
            };
        } catch (error) {
            console.error("Failed to list drafts:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to list drafts'
            };
        }
    }

    /**
     * Checks if a draft exists
     */
    static async hasDraft(draftId: string, userId?: string): Promise<PersistenceResult<boolean>> {
        const result = await this.loadDraft(draftId, userId);
        return {
            success: true,
            data: result.success,
            source: result.source
        };
    }

    /**
     * Synchronizes local drafts with database when coming back online
     */
    static async syncDrafts(userId: string): Promise<PersistenceResult<{ synced: number; failed: number }>> {
        if (!userId || typeof window === 'undefined' || !navigator.onLine) {
            return {
                success: false,
                error: 'Cannot sync: user not authenticated or offline'
            };
        }

        let synced = 0;
        let failed = 0;

        try {
            // Get all local drafts
            const localDrafts: WizardDraftWithMedia[] = [];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith(this.STORAGE_PREFIX)) {
                    const draftId = key.replace(this.STORAGE_PREFIX, "");
                    const draft = await this.loadFromLocalStorageWithDecompression(draftId);
                    if (draft && draft.userId === userId) {
                        localDrafts.push(draft);
                    }
                }
            }

            // Sync each draft
            for (const draft of localDrafts) {
                try {
                    const result = await this.saveToDatabaseWithRetry(draft, true);
                    if (result.success) {
                        synced++;
                        // Clear local storage backup after successful sync
                        this.clearLocalStorageBackup(draft.id);
                    } else {
                        failed++;
                    }
                } catch (error) {
                    console.warn(`Failed to sync draft ${draft.id}:`, error);
                    failed++;
                }
            }

            return {
                success: true,
                data: { synced, failed }
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Sync failed'
            };
        }
    }

    /**
     * Clears all auto-save timeouts
     */
    static clearAutoSaveTimeouts(): void {
        this.autoSaveTimeouts.forEach(timeout => clearTimeout(timeout));
        this.autoSaveTimeouts.clear();
    }

    /**
     * Clears memory cache
     */
    static clearMemoryCache(): void {
        this.memoryCache.clear();
    }

    /**
     * Gets cache statistics
     */
    static getCacheStats(): {
        memoryCache: { size: number; keys: string[] };
        localStorage: { size: number; keys: string[] };
        autoSaveTimeouts: { count: number; keys: string[] };
    } {
        const localStorageKeys: string[] = [];

        if (typeof window !== 'undefined' && window.localStorage) {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith(this.STORAGE_PREFIX)) {
                    localStorageKeys.push(key);
                }
            }
        }

        return {
            memoryCache: {
                size: this.memoryCache.size,
                keys: Array.from(this.memoryCache.keys())
            },
            localStorage: {
                size: localStorageKeys.length,
                keys: localStorageKeys
            },
            autoSaveTimeouts: {
                count: this.autoSaveTimeouts.size,
                keys: Array.from(this.autoSaveTimeouts.keys())
            }
        };
    }

    // Private helper methods

    private static generateDraftId(wizardType: string, userId?: string): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const userPart = userId ? userId.slice(0, 8) : "anon";
        return `${wizardType}_${userPart}_${timestamp}_${random}`;
    }

    private static calculateStepProgress<T extends WizardData>(
        data: Partial<T>,
        configId: string
    ): Record<string, boolean> {
        const progress: Record<string, boolean> = {};

        // Basic validation for common wizard steps
        switch (configId) {
            case 'property-wizard':
                progress.general = !!(data.title && data.description && (data as any).price);
                progress.location = !!((data as any).address && (data as any).coordinates);
                progress.media = !!((data as any).images && (data as any).images.length > 0);
                progress.preview = progress.general && progress.location && progress.media;
                break;

            case 'land-wizard':
                progress.general = !!(data.title && data.description && (data as any).price);
                progress.location = !!((data as any).location || (data as any).coordinates);
                progress.media = !!((data as any).images && (data as any).images.length > 0);
                progress.preview = progress.general && progress.location && progress.media;
                break;

            case 'blog-wizard':
                progress.content = !!(data.title && data.description);
                progress.media = !!((data as any).coverImage || ((data as any).images && (data as any).images.length > 0));
                progress.seo = !!((data as any).seoTitle && (data as any).seoDescription);
                progress.preview = progress.content;
                break;

            default:
                // Generic progress calculation
                if (data.title) progress.general = true;
                if (data.description) progress.details = true;
                break;
        }

        return progress;
    }

    private static calculateCompletionPercentage<T extends WizardData>(
        data: Partial<T>,
        stepProgress: Record<string, boolean>
    ): number {
        const completedSteps = Object.values(stepProgress).filter(Boolean).length;
        const totalSteps = Math.max(Object.keys(stepProgress).length, 1);
        return Math.round((completedSteps / totalSteps) * 100);
    }

    private static extractTitle<T extends WizardData>(data: Partial<T>): string | undefined {
        return data.title || (data as any).name || undefined;
    }

    private static extractDescription<T extends WizardData>(data: Partial<T>): string | undefined {
        if (data.description) return data.description;
        if ((data as any).content) return (data as any).content.substring(0, 200) + '...';
        return undefined;
    }

    private static async saveToLocalStorageWithCompression(
        draftId: string,
        draft: Partial<NewWizardDraft>
    ): Promise<void> {
        if (typeof window === 'undefined' || !window.localStorage) {
            throw new Error('Local storage not available');
        }

        try {
            const key = this.STORAGE_PREFIX + draftId;
            const data = JSON.stringify(draft);

            // Check size limits
            if (data.length > this.MAX_LOCAL_STORAGE_SIZE) {
                throw new Error('Draft too large for local storage');
            }

            // Simple compression for large data
            const compressedData = data.length > 10000 ? this.compressData(data) : data;

            localStorage.setItem(key, compressedData);
            localStorage.setItem(key + '_meta', JSON.stringify({
                compressed: data.length > 10000,
                originalSize: data.length,
                compressedSize: compressedData.length,
                timestamp: Date.now()
            }));
        } catch (error) {
            // Try to free up space by removing old drafts
            await this.cleanupOldLocalStorageDrafts();

            // Retry once
            try {
                const key = this.STORAGE_PREFIX + draftId;
                const data = JSON.stringify(draft);
                localStorage.setItem(key, data);
            } catch (retryError) {
                console.warn("Failed to save to local storage after cleanup:", retryError);
                throw retryError;
            }
        }
    }

    private static async loadFromLocalStorageWithDecompression(draftId: string): Promise<WizardDraftWithMedia | null> {
        if (typeof window === 'undefined' || !window.localStorage) {
            return null;
        }

        try {
            const key = this.STORAGE_PREFIX + draftId;
            const metaKey = key + '_meta';

            const stored = localStorage.getItem(key);
            const meta = localStorage.getItem(metaKey);

            if (!stored) return null;

            let data = stored;

            // Decompress if needed
            if (meta) {
                const metadata = JSON.parse(meta);
                if (metadata.compressed) {
                    data = this.decompressData(stored);
                }
            }

            return JSON.parse(data);
        } catch (error) {
            console.warn("Failed to load from local storage:", error);
            // Try to remove corrupted data
            try {
                this.deleteFromLocalStorage(draftId);
            } catch (deleteError) {
                console.warn("Failed to cleanup corrupted draft:", deleteError);
            }
            return null;
        }
    }

    private static deleteFromLocalStorage(draftId: string): void {
        if (typeof window === 'undefined' || !window.localStorage) {
            return;
        }

        try {
            const key = this.STORAGE_PREFIX + draftId;
            const metaKey = key + '_meta';

            localStorage.removeItem(key);
            localStorage.removeItem(metaKey);
        } catch (error) {
            console.warn("Failed to delete from local storage:", error);
            throw error;
        }
    }

    private static clearLocalStorageBackup(draftId: string): void {
        try {
            this.deleteFromLocalStorage(draftId);
        } catch (error) {
            console.warn("Failed to clear local storage backup:", error);
        }
    }

    private static async cleanupOldLocalStorageDrafts(): Promise<void> {
        if (typeof window === 'undefined' || !window.localStorage) {
            return;
        }

        try {
            const draftsToRemove: string[] = [];
            const now = Date.now();
            const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith(this.STORAGE_PREFIX) && key.endsWith('_meta')) {
                    try {
                        const meta = JSON.parse(localStorage.getItem(key) || '{}');
                        if (now - meta.timestamp > maxAge) {
                            const draftKey = key.replace('_meta', '');
                            draftsToRemove.push(draftKey.replace(this.STORAGE_PREFIX, ''));
                        }
                    } catch (error) {
                        // Remove corrupted metadata
                        const draftKey = key.replace('_meta', '');
                        draftsToRemove.push(draftKey.replace(this.STORAGE_PREFIX, ''));
                    }
                }
            }

            // Remove old drafts
            for (const draftId of draftsToRemove) {
                this.deleteFromLocalStorage(draftId);
            }
        } catch (error) {
            console.warn("Failed to cleanup old local storage drafts:", error);
        }
    }

    private static compressData(data: string): string {
        // Simple compression using base64 encoding of compressed string
        // In a real implementation, you might use a proper compression library
        try {
            return btoa(encodeURIComponent(data));
        } catch (error) {
            return data; // Fallback to uncompressed
        }
    }

    private static decompressData(compressedData: string): string {
        // Simple decompression
        try {
            return decodeURIComponent(atob(compressedData));
        } catch (error) {
            return compressedData; // Fallback to treating as uncompressed
        }
    }

    private static async saveToDatabaseWithRetry(
        draft: Partial<NewWizardDraft>,
        isUpdate: boolean = false,
        maxRetries: number = 3
    ): Promise<PersistenceResult<WizardDraftWithMedia>> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                if (isUpdate && draft.id) {
                    // Update existing draft
                    const [updatedDraft] = await db
                        .update(wizardDrafts)
                        .set({
                            formData: draft.formData,
                            currentStep: draft.currentStep,
                            stepProgress: draft.stepProgress,
                            completionPercentage: draft.completionPercentage,
                            title: draft.title,
                            description: draft.description,
                            updatedAt: new Date(),
                        })
                        .where(and(
                            eq(wizardDrafts.id, draft.id),
                            eq(wizardDrafts.userId, draft.userId!)
                        ))
                        .returning();

                    if (updatedDraft) {
                        return {
                            success: true,
                            data: updatedDraft as WizardDraftWithMedia,
                            source: 'database'
                        };
                    } else {
                        throw new Error('Draft not found or access denied');
                    }
                } else {
                    // Create new draft
                    const [newDraft] = await db
                        .insert(wizardDrafts)
                        .values(draft as NewWizardDraft)
                        .returning();

                    return {
                        success: true,
                        data: newDraft as WizardDraftWithMedia,
                        source: 'database'
                    };
                }
            } catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown database error');

                if (attempt < maxRetries) {
                    // Wait before retry with exponential backoff
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }

        return {
            success: false,
            error: lastError?.message || 'Database operation failed after retries'
        };
    }

    private static async loadFromDatabaseWithMedia(
        draftId: string,
        userId: string
    ): Promise<PersistenceResult<WizardDraftWithMedia>> {
        try {
            // Load draft
            const [draft] = await db
                .select()
                .from(wizardDrafts)
                .where(and(
                    eq(wizardDrafts.id, draftId),
                    eq(wizardDrafts.userId, userId)
                ));

            if (!draft) {
                return {
                    success: false,
                    error: 'Draft not found or access denied'
                };
            }

            // Load associated media
            const media = await db
                .select()
                .from(wizardMedia)
                .where(eq(wizardMedia.draftId, draftId));

            const draftWithMedia: WizardDraftWithMedia = {
                ...draft,
                media
            };

            return {
                success: true,
                data: draftWithMedia,
                source: 'database'
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to load draft from database'
            };
        }
    }

    private static async listDraftsFromDatabase(
        userId: string,
        options: {
            wizardType?: string;
            configId?: string;
            limit?: number;
            offset?: number;
            sortBy?: 'updatedAt' | 'createdAt' | 'completionPercentage';
            sortOrder?: 'asc' | 'desc';
        }
    ): Promise<PersistenceResult<WizardDraftWithMedia[]>> {
        try {
            const { wizardType, configId, limit = 50, offset = 0, sortBy = 'updatedAt', sortOrder = 'desc' } = options;

            // Build where conditions
            const whereConditions = [eq(wizardDrafts.userId, userId)];

            if (wizardType) {
                whereConditions.push(eq(wizardDrafts.wizardType, wizardType));
            }

            if (configId) {
                whereConditions.push(eq(wizardDrafts.wizardConfigId, configId));
            }

            const baseQuery = db.select().from(wizardDrafts);
            const queryWithWhere = baseQuery.where(
                whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions)
            );

            // Apply sorting
            const sortColumn = wizardDrafts[sortBy];
            const queryWithSort = sortOrder === 'desc'
                ? queryWithWhere.orderBy(desc(sortColumn))
                : queryWithWhere.orderBy(sortColumn);

            // Apply pagination
            const finalQuery = queryWithSort.limit(limit).offset(offset);

            const drafts = await finalQuery;

            // Load media for each draft (could be optimized with a join)
            const draftsWithMedia: WizardDraftWithMedia[] = await Promise.all(
                drafts.map(async (draft) => {
                    const media = await db
                        .select()
                        .from(wizardMedia)
                        .where(eq(wizardMedia.draftId, draft.id));

                    return { ...draft, media };
                })
            );

            return {
                success: true,
                data: draftsWithMedia,
                source: 'database'
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to list drafts from database'
            };
        }
    }

    private static async deleteFromDatabaseWithMedia(
        draftId: string,
        userId: string
    ): Promise<PersistenceResult<void>> {
        try {
            // Delete associated media first (cascade should handle this, but being explicit)
            await db
                .delete(wizardMedia)
                .where(eq(wizardMedia.draftId, draftId));

            // Delete the draft
            const result = await db
                .delete(wizardDrafts)
                .where(and(
                    eq(wizardDrafts.id, draftId),
                    eq(wizardDrafts.userId, userId)
                ))
                .returning({ id: wizardDrafts.id });

            if (result.length === 0) {
                return {
                    success: false,
                    error: 'Draft not found or access denied'
                };
            }

            return {
                success: true,
                source: 'database'
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete draft from database'
            };
        }
    }

    /**
     * Save media associated with a draft
     */
    static async saveWizardMedia(
        draftId: string,
        mediaItems: Omit<NewWizardMedia, 'draftId'>[]
    ): Promise<PersistenceResult<WizardMedia[]>> {
        try {
            // Delete existing media for this draft
            await db
                .delete(wizardMedia)
                .where(eq(wizardMedia.draftId, draftId));

            if (mediaItems.length === 0) {
                return {
                    success: true,
                    data: [],
                    source: 'database'
                };
            }

            // Insert new media
            const mediaWithDraftId = mediaItems.map(item => ({
                ...item,
                draftId
            }));

            const savedMedia = await db
                .insert(wizardMedia)
                .values(mediaWithDraftId)
                .returning();

            return {
                success: true,
                data: savedMedia,
                source: 'database'
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to save wizard media'
            };
        }
    }

    /**
     * Load media for a draft
     */
    static async loadWizardMedia(draftId: string): Promise<PersistenceResult<WizardMedia[]>> {
        try {
            const media = await db
                .select()
                .from(wizardMedia)
                .where(eq(wizardMedia.draftId, draftId));

            return {
                success: true,
                data: media,
                source: 'database'
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to load wizard media'
            };
        }
    }

    /**
     * Initialize the persistence system
     */
    static initialize(): void {
        // Set up online/offline event listeners
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => {
                console.log('Connection restored, syncing drafts...');
                // Auto-sync could be implemented here
            });

            window.addEventListener('offline', () => {
                console.log('Connection lost, switching to offline mode');
            });

            // Cleanup on page unload
            window.addEventListener('beforeunload', () => {
                this.clearAutoSaveTimeouts();
            });
        }
    }

    /**
     * Cleanup resources
     */
    static cleanup(): void {
        this.clearAutoSaveTimeouts();
        this.clearMemoryCache();
    }
}