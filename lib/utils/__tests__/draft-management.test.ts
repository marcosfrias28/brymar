import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock the database
jest.mock('@/lib/db/drizzle', () => ({
    default: {
        insert: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        select: jest.fn(),
    }
}));

// Mock crypto.randomUUID
jest.mock('crypto', () => ({
    randomUUID: () => 'mock-uuid-123'
}));

// Import after mocks
import {
    PropertyDraftManager,
    LandDraftManager,
    BlogDraftManager,
    DraftManager,
    ClientDraftManager
} from '../draft-management';

describe('Draft Management System', () => {
    const mockUserId = 'user-123';
    const mockDraftId = 'draft-123';
    const mockFormData = {
        title: 'Test Title',
        description: 'Test Description',
        price: 100000,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('DraftManager Factory', () => {
        it('should return correct manager for each type', () => {
            expect(DraftManager.getManager('property')).toBe(PropertyDraftManager);
            expect(DraftManager.getManager('land')).toBe(LandDraftManager);
            expect(DraftManager.getManager('blog')).toBe(BlogDraftManager);
        });

        it('should throw error for unknown type', () => {
            expect(() => DraftManager.getManager('unknown' as any)).toThrow('Unknown draft type: unknown');
        });
    });

    describe('ClientDraftManager', () => {
        const mockLocalStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            key: jest.fn(),
            length: 0,
            clear: jest.fn()
        };

        beforeEach(() => {
            Object.defineProperty(global, 'localStorage', {
                value: mockLocalStorage,
                writable: true
            });
            jest.clearAllMocks();
        });

        it('should save draft to localStorage', () => {
            const testData = { title: 'Test', description: 'Test desc' };

            ClientDraftManager.saveDraft('property', mockUserId, testData, mockDraftId);

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                `wizard_draft_property_${mockUserId}_${mockDraftId}`,
                expect.stringContaining('"data":{"title":"Test","description":"Test desc"}')
            );
        });

        it('should load draft from localStorage', () => {
            const testData = { title: 'Test', description: 'Test desc' };
            const storedData = {
                data: testData,
                timestamp: Date.now(),
                draftId: mockDraftId,
                userId: mockUserId,
                type: 'property'
            };

            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedData));

            const result = ClientDraftManager.loadDraft('property', mockUserId, mockDraftId);

            expect(result).toEqual(testData);
        });

        it('should return null for expired draft', () => {
            const testData = { title: 'Test', description: 'Test desc' };
            const expiredData = {
                data: testData,
                timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
                draftId: mockDraftId,
                userId: mockUserId,
                type: 'property'
            };

            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(expiredData));

            const result = ClientDraftManager.loadDraft('property', mockUserId, mockDraftId);

            expect(result).toBeNull();
            expect(mockLocalStorage.removeItem).toHaveBeenCalled();
        });

        it('should delete draft from localStorage', () => {
            ClientDraftManager.deleteDraft('property', mockUserId, mockDraftId);

            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
                `wizard_draft_property_${mockUserId}_${mockDraftId}`
            );
        });

        it('should check if draft exists', () => {
            mockLocalStorage.getItem.mockReturnValue('{"data":{}}');

            const exists = ClientDraftManager.hasDraft('property', mockUserId, mockDraftId);

            expect(exists).toBe(true);
        });

        it('should clear expired drafts', () => {
            const validKey = 'wizard_draft_property_user1_draft1';
            const expiredKey = 'wizard_draft_land_user1_draft2';
            const invalidKey = 'wizard_draft_blog_user1_draft3';

            mockLocalStorage.length = 3;
            mockLocalStorage.key
                .mockReturnValueOnce(validKey)
                .mockReturnValueOnce(expiredKey)
                .mockReturnValueOnce(invalidKey);

            const validData = JSON.stringify({
                data: {},
                timestamp: Date.now() - (1000 * 60 * 60), // 1 hour ago
            });

            const expiredData = JSON.stringify({
                data: {},
                timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
            });

            mockLocalStorage.getItem
                .mockReturnValueOnce(validData)
                .mockReturnValueOnce(expiredData)
                .mockReturnValueOnce('invalid json');

            ClientDraftManager.clearExpiredDrafts();

            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(expiredKey);
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(invalidKey);
            expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith(validKey);
        });
    });

    describe('Error Handling', () => {
        it('should handle localStorage errors gracefully', () => {
            const mockError = new Error('Storage quota exceeded');
            const mockLocalStorage = {
                setItem: jest.fn().mockImplementation(() => {
                    throw mockError;
                }),
                getItem: jest.fn(),
                removeItem: jest.fn(),
                key: jest.fn(),
                length: 0,
                clear: jest.fn()
            };

            Object.defineProperty(global, 'localStorage', {
                value: mockLocalStorage,
                writable: true
            });

            // Should not throw
            expect(() => {
                ClientDraftManager.saveDraft('property', mockUserId, mockFormData);
            }).not.toThrow();
        });
    });

    describe('Edge Cases', () => {
        it('should handle invalid JSON in localStorage', () => {
            const mockLocalStorage = {
                getItem: jest.fn().mockReturnValue('invalid json'),
                setItem: jest.fn(),
                removeItem: jest.fn(),
                key: jest.fn(),
                length: 0,
                clear: jest.fn()
            };

            Object.defineProperty(global, 'localStorage', {
                value: mockLocalStorage,
                writable: true
            });

            const result = ClientDraftManager.loadDraft('property', mockUserId, mockDraftId);

            expect(result).toBeNull();
        });

        it('should handle missing localStorage', () => {
            // Simulate environment without localStorage
            Object.defineProperty(global, 'localStorage', {
                value: undefined,
                writable: true
            });

            expect(() => {
                ClientDraftManager.saveDraft('property', mockUserId, mockFormData);
            }).not.toThrow();
        });
    });
});