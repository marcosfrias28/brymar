import { useState, useEffect, useCallback, useRef } from "react";
import { WizardPersistence } from '@/lib/wizard/wizard-persistence';
import type { WizardData } from '@/types/wizard-core';
import { useDebounce } from '@/hooks/use-debounce';

export interface UseUnifiedWizardPersistenceOptions {
    autoSave?: boolean;
    autoSaveInterval?: number;
    enableOfflineSupport?: boolean;
    onSaveSuccess?: (draftId: string) => void;
    onSaveError?: (error: string) => void;
    onLoadSuccess?: () => void;
    onLoadError?: (error: string) => void;
}

export interface UseUnifiedWizardPersistenceReturn<T extends WizardData> {
    // Draft management
    saveDraft: (data: Partial<T>, currentStep: string) => Promise<string | null>;
    loadDraft: (draftId: string) => Promise<boolean>;
    deleteDraft: (draftId: string) => Promise<boolean>;

    // Auto-save
    enableAutoSave: (data: Partial<T>, currentStep: string) => void;
    disableAutoSave: () => void;

    // State
    isDraftLoaded: boolean;
    isSaving: boolean;
    isLoading: boolean;
    lastSaved: Date | null;
    currentDraftId: string | null;
    saveError: string | null;
    loadError: string | null;

    // Offline support
    isOnline: boolean;
    hasPendingSync: boolean;
    syncDrafts: () => Promise<boolean>;

    // Cache management
    clearCache: () => void;
    getCacheStats: () => {
        memoryCache: { size: number; keys: string[] };
        localStorage: { size: number; keys: string[] };
        autoSaveTimeouts: { count: number; keys: string[] };
    };
}

export function useUnifiedWizardPersistence<T extends WizardData>(
    wizardType: "property" | "land" | "blog",
    wizardConfigId: string,
    userId?: string,
    options: UseUnifiedWizardPersistenceOptions = {}
): UseUnifiedWizardPersistenceReturn<T> {
    const {
        autoSave = true,
        autoSaveInterval = 30000, // 30 seconds
        enableOfflineSupport = true,
        onSaveSuccess,
        onSaveError,
        onLoadSuccess,
        onLoadError,
    } = options;

    // State
    const [isDraftLoaded, setIsDraftLoaded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const [hasPendingSync, setHasPendingSync] = useState(false);

    // Refs for auto-save
    const autoSaveDataRef = useRef<Partial<T> | null>(null);
    const autoSaveStepRef = useRef<string | null>(null);
    const autoSaveEnabledRef = useRef(false);

    // Debounced auto-save trigger
    const debouncedAutoSave = useDebounce(() => {
        if (autoSaveEnabledRef.current && autoSaveDataRef.current && autoSaveStepRef.current && userId) {
            handleAutoSave(autoSaveDataRef.current, autoSaveStepRef.current);
        }
    }, autoSaveInterval);

    // Handle online/offline status
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleOnline = () => {
            setIsOnline(true);
            if (hasPendingSync && userId) {
                syncDrafts();
            }
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [hasPendingSync, userId]);

    // Initialize persistence system
    useEffect(() => {
        WizardPersistence.initialize();

        return () => {
            WizardPersistence.cleanup();
        };
    }, []);

    // Auto-save handler
    const handleAutoSave = useCallback(async (data: Partial<T>, currentStep: string) => {
        if (!userId) return;

        try {
            setIsSaving(true);
            setSaveError(null);

            const result = await WizardPersistence.autoSaveDraft(
                wizardType,
                wizardConfigId,
                data,
                currentStep,
                userId,
                currentDraftId || undefined,
                {
                    autoSave: true,
                    enableOfflineSupport,
                    interval: 0, // No additional debouncing since we handle it here
                }
            );

            if (result.success && result.data) {
                setCurrentDraftId(result.data.draftId);
                setLastSaved(new Date());
                onSaveSuccess?.(result.data.draftId);

                // Check if saved offline
                if (result.source !== 'database') {
                    setHasPendingSync(true);
                }
            } else {
                setSaveError(result.error || 'Auto-save failed');
                onSaveError?.(result.error || 'Auto-save failed');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Auto-save failed';
            setSaveError(errorMessage);
            onSaveError?.(errorMessage);
        } finally {
            setIsSaving(false);
        }
    }, [wizardType, wizardConfigId, userId, currentDraftId, enableOfflineSupport, onSaveSuccess, onSaveError]);

    // Manual save draft
    const saveDraft = useCallback(async (data: Partial<T>, currentStep: string): Promise<string | null> => {
        if (!userId) return null;

        try {
            setIsSaving(true);
            setSaveError(null);

            const result = await WizardPersistence.saveDraft(
                wizardType,
                wizardConfigId,
                data,
                currentStep,
                userId,
                currentDraftId || undefined,
                {
                    autoSave: false,
                    enableOfflineSupport,
                }
            );

            if (result.success && result.data) {
                setCurrentDraftId(result.data.draftId);
                setLastSaved(new Date());
                onSaveSuccess?.(result.data.draftId);

                // Check if saved offline
                if (result.source !== 'database') {
                    setHasPendingSync(true);
                }

                return result.data.draftId;
            } else {
                setSaveError(result.error || 'Save failed');
                onSaveError?.(result.error || 'Save failed');
                return null;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Save failed';
            setSaveError(errorMessage);
            onSaveError?.(errorMessage);
            return null;
        } finally {
            setIsSaving(false);
        }
    }, [wizardType, wizardConfigId, userId, currentDraftId, enableOfflineSupport, onSaveSuccess, onSaveError]);

    // Load draft
    const loadDraft = useCallback(async (draftId: string): Promise<boolean> => {
        if (!userId) return false;

        try {
            setIsLoading(true);
            setLoadError(null);

            const result = await WizardPersistence.loadDraft<T>(draftId, userId);

            if (result.success && result.data) {
                setCurrentDraftId(draftId);
                setIsDraftLoaded(true);
                onLoadSuccess?.();
                return true;
            } else {
                setLoadError(result.error || 'Load failed');
                onLoadError?.(result.error || 'Load failed');
                return false;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Load failed';
            setLoadError(errorMessage);
            onLoadError?.(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [userId, onLoadSuccess, onLoadError]);

    // Delete draft
    const deleteDraft = useCallback(async (draftId: string): Promise<boolean> => {
        if (!userId) return false;

        try {
            const result = await WizardPersistence.deleteDraft(draftId, userId);

            if (result.success) {
                if (currentDraftId === draftId) {
                    setCurrentDraftId(null);
                    setIsDraftLoaded(false);
                    setLastSaved(null);
                }
                return true;
            } else {
                setSaveError(result.error || 'Delete failed');
                return false;
            }
        } catch (error) {
            setSaveError(error instanceof Error ? error.message : 'Delete failed');
            return false;
        }
    }, [userId, currentDraftId]);

    // Enable auto-save
    const enableAutoSave = useCallback((data: Partial<T>, currentStep: string) => {
        if (!autoSave) return;

        autoSaveDataRef.current = data;
        autoSaveStepRef.current = currentStep;
        autoSaveEnabledRef.current = true;

        // Trigger debounced auto-save
        debouncedAutoSave();
    }, [autoSave, debouncedAutoSave]);

    // Disable auto-save
    const disableAutoSave = useCallback(() => {
        autoSaveEnabledRef.current = false;
        autoSaveDataRef.current = null;
        autoSaveStepRef.current = null;
    }, []);

    // Sync drafts
    const syncDrafts = useCallback(async (): Promise<boolean> => {
        if (!userId || !isOnline) return false;

        try {
            const result = await WizardPersistence.syncDrafts(userId);

            if (result.success) {
                setHasPendingSync(false);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Failed to sync drafts:', error);
            return false;
        }
    }, [userId, isOnline]);

    // Clear cache
    const clearCache = useCallback(() => {
        WizardPersistence.clearMemoryCache();
        WizardPersistence.clearAutoSaveTimeouts();
    }, []);

    // Get cache stats
    const getCacheStats = useCallback(() => {
        return WizardPersistence.getCacheStats();
    }, []);

    return {
        // Draft management
        saveDraft,
        loadDraft,
        deleteDraft,

        // Auto-save
        enableAutoSave,
        disableAutoSave,

        // State
        isDraftLoaded,
        isSaving,
        isLoading,
        lastSaved,
        currentDraftId,
        saveError,
        loadError,

        // Offline support
        isOnline,
        hasPendingSync,
        syncDrafts,

        // Cache management
        clearCache,
        getCacheStats,
    };
}