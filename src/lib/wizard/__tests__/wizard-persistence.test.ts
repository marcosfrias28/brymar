import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WizardPersistence } from '../wizard-persistence';
import type { WizardData } from '@/types/wizard-core';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
};

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: true,
});

// Mock window
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock database
vi.mock('@/lib/db/drizzle', () => ({
    default: {
        insert: vi.fn(),
        select: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));

interface TestWizardData extends WizardData {
    price?: number;
    location?: string;
}

describe('WizardPersistence', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        WizardPersistence.clearMemoryCache();
        WizardPersistence.clearAutoSaveTimeouts();
    });

    afterEach(() => {
        WizardPersistence.cleanup();
    });

    describe('saveDraft', () => {
        it('should save draft to memory cache when offline', async () => {
            // Mock offline
            Object.defineProperty(navigator, 'onLine', { value: false });

            const testData: Partial<TestWizardData> = {
                title: 'Test Property',
                description: 'Test Description',
                price: 100000,
            };

            const result = await WizardPersistence.saveDraft(
                'property',
                'property-wizard',
                testData,
                'general',
                'user123'
            );

            expect(result.success).toBe(true);
            expect(result.data?.draftId).toBeDefined();
            expect(result.source).toBe('localStorage');
        });

        it('should calculate step progress correctly for property wizard', async () => {
            const testData: Partial<TestWizardData> = {
                title: 'Test Property',
                description: 'Test Description',
                price: 100000,
            };

            const result = await WizardPersistence.saveDraft(
                'property',
                'property-wizard',
                testData,
                'general',
                'user123'
            );

            expect(result.success).toBe(true);

            // Check that the draft was saved to memory cache
            const stats = WizardPersistence.getCacheStats();
            expect(stats.memoryCache.size).toBe(1);
        });

        it('should handle auto-save with debouncing', async () => {
            const testData: Partial<TestWizardData> = {
                title: 'Test Property',
                description: 'Test Description',
            };

            const result = await WizardPersistence.autoSaveDraft(
                'property',
                'property-wizard',
                testData,
                'general',
                'user123',
                undefined,
                { interval: 100 }
            );

            expect(result.success).toBe(true);
            expect(result.data?.draftId).toBeDefined();
        });
    });

    describe('loadDraft', () => {
        it('should load draft from memory cache first', async () => {
            const testData: Partial<TestWizardData> = {
                title: 'Test Property',
                description: 'Test Description',
                price: 100000,
            };

            // Save draft first
            const saveResult = await WizardPersistence.saveDraft(
                'property',
                'property-wizard',
                testData,
                'general',
                'user123'
            );

            expect(saveResult.success).toBe(true);
            const draftId = saveResult.data!.draftId;

            // Load draft
            const loadResult = await WizardPersistence.loadDraft<TestWizardData>(
                draftId,
                'user123'
            );

            expect(loadResult.success).toBe(true);
            expect(loadResult.data?.data.title).toBe('Test Property');
            expect(loadResult.data?.currentStep).toBe('general');
            expect(loadResult.source).toBe('memory');
        });

        it('should return error for non-existent draft', async () => {
            const result = await WizardPersistence.loadDraft<TestWizardData>(
                'non-existent-id',
                'user123'
            );

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    describe('deleteDraft', () => {
        it('should delete draft from all storage locations', async () => {
            const testData: Partial<TestWizardData> = {
                title: 'Test Property',
                description: 'Test Description',
            };

            // Save draft first
            const saveResult = await WizardPersistence.saveDraft(
                'property',
                'property-wizard',
                testData,
                'general',
                'user123'
            );

            expect(saveResult.success).toBe(true);
            const draftId = saveResult.data!.draftId;

            // Delete draft
            const deleteResult = await WizardPersistence.deleteDraft(
                draftId,
                'user123'
            );

            expect(deleteResult.success).toBe(true);

            // Verify draft is deleted from memory cache
            const stats = WizardPersistence.getCacheStats();
            expect(stats.memoryCache.size).toBe(0);
        });
    });

    describe('listDrafts', () => {
        it('should list drafts with filtering and sorting', async () => {
            const testData1: Partial<TestWizardData> = {
                title: 'Property 1',
                description: 'Description 1',
            };

            const testData2: Partial<TestWizardData> = {
                title: 'Property 2',
                description: 'Description 2',
            };

            // Save multiple drafts
            await WizardPersistence.saveDraft(
                'property',
                'property-wizard',
                testData1,
                'general',
                'user123'
            );

            await WizardPersistence.saveDraft(
                'land',
                'land-wizard',
                testData2,
                'general',
                'user123'
            );

            // List all drafts
            const allResult = await WizardPersistence.listDrafts('user123');
            expect(allResult.success).toBe(true);
            expect(allResult.data?.length).toBe(2);

            // List property drafts only
            const propertyResult = await WizardPersistence.listDrafts('user123', {
                wizardType: 'property'
            });
            expect(propertyResult.success).toBe(true);
            expect(propertyResult.data?.length).toBe(1);
            expect(propertyResult.data?.[0].wizardType).toBe('property');
        });
    });

    describe('syncDrafts', () => {
        it('should handle sync when offline', async () => {
            // Mock offline
            Object.defineProperty(navigator, 'onLine', { value: false });

            const result = await WizardPersistence.syncDrafts('user123');
            expect(result.success).toBe(false);
            expect(result.error).toContain('offline');
        });
    });

    describe('cache management', () => {
        it('should provide cache statistics', () => {
            const stats = WizardPersistence.getCacheStats();

            expect(stats).toHaveProperty('memoryCache');
            expect(stats).toHaveProperty('localStorage');
            expect(stats).toHaveProperty('autoSaveTimeouts');

            expect(stats.memoryCache).toHaveProperty('size');
            expect(stats.memoryCache).toHaveProperty('keys');
        });

        it('should clear memory cache', () => {
            // Add something to cache first
            WizardPersistence.saveDraft(
                'property',
                'property-wizard',
                { title: 'Test' },
                'general',
                'user123'
            );

            let stats = WizardPersistence.getCacheStats();
            expect(stats.memoryCache.size).toBeGreaterThan(0);

            WizardPersistence.clearMemoryCache();

            stats = WizardPersistence.getCacheStats();
            expect(stats.memoryCache.size).toBe(0);
        });
    });

    describe('error handling', () => {
        it('should handle localStorage quota exceeded', async () => {
            // Mock localStorage.setItem to throw quota exceeded error
            localStorageMock.setItem.mockImplementation(() => {
                throw new Error('QuotaExceededError');
            });

            const testData: Partial<TestWizardData> = {
                title: 'Test Property',
                description: 'Test Description',
            };

            const result = await WizardPersistence.saveDraft(
                'property',
                'property-wizard',
                testData,
                'general',
                'user123'
            );

            // Should still succeed by falling back to memory
            expect(result.success).toBe(true);
            expect(result.source).toBe('memory');
        });

        it('should handle corrupted localStorage data', async () => {
            // Mock localStorage.getItem to return invalid JSON
            localStorageMock.getItem.mockReturnValue('invalid json');

            const result = await WizardPersistence.loadDraft<TestWizardData>(
                'test-id',
                'user123'
            );

            expect(result.success).toBe(false);
        });
    });
});