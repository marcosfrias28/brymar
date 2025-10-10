import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock localStorage
const mockLocalStorage = {
    getItem: jest.fn(),
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

// Mock crypto.randomUUID
jest.mock('crypto', () => ({
    randomUUID: () => 'test-uuid-123'
}));

import { ClientDraftManager } from '../draft-management';

describe('Draft Persistence Integration Tests', () => {
    const mockUserId = 'user-123';
    const mockDraftId = 'draft-123';

    beforeEach(() => {
        jest.clearAllMocks();
        mockLocalStorage.length = 0;
    });

    describe('Cross-session persistence', () => {
        it('should persist draft data across browser sessions', () => {
            const draftData = {
                title: 'Test Property',
                description: 'A beautiful property',
                price: 250000,
                surface: 120,
                propertyType: 'house',
                step: 2
            };

            // Simulate saving draft in first session
            ClientDraftManager.saveDraft('property', mockUserId, draftData, mockDraftId);

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                `wizard_draft_property_${mockUserId}_${mockDraftId}`,
                expect.stringContaining(JSON.stringify(draftData))
            );

            // Simulate loading draft in new session
            const savedCall = mockLocalStorage.setItem.mock.calls[0];
            const savedData = savedCall[1];
            mockLocalStorage.getItem.mockReturnValue(savedData);

            const loadedData = ClientDraftManager.loadDraft('property', mockUserId, mockDraftId);

            expect(loadedData).toEqual(draftData);
        });

        it('should handle multiple drafts for different wizard types', () => {
            const propertyDraft = { title: 'Property Draft', type: 'house' };
            const landDraft = { name: 'Land Draft', landType: 'residential' };
            const blogDraft = { title: 'Blog Draft', category: 'news' };

            // Save different types of drafts
            ClientDraftManager.saveDraft('property', mockUserId, propertyDraft, 'prop-1');
            ClientDraftManager.saveDraft('land', mockUserId, landDraft, 'land-1');
            ClientDraftManager.saveDraft('blog', mockUserId, blogDraft, 'blog-1');

            expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(3);

            // Verify each draft was saved with correct key
            const calls = mockLocalStorage.setItem.mock.calls;
            expect(calls[0][0]).toBe(`wizard_draft_property_${mockUserId}_prop-1`);
            expect(calls[1][0]).toBe(`wizard_draft_land_${mockUserId}_land-1`);
            expect(calls[2][0]).toBe(`wizard_draft_blog_${mockUserId}_blog-1`);
        });

        it('should handle draft expiration correctly', () => {
            const now = Date.now();
            const expiredTimestamp = now - (25 * 60 * 60 * 1000); // 25 hours ago
            const validTimestamp = now - (1 * 60 * 60 * 1000); // 1 hour ago

            const expiredDraft = {
                data: { title: 'Expired Draft' },
                timestamp: expiredTimestamp,
                draftId: 'expired-draft',
                userId: mockUserId,
                type: 'property'
            };

            const validDraft = {
                data: { title: 'Valid Draft' },
                timestamp: validTimestamp,
                draftId: 'valid-draft',
                userId: mockUserId,
                type: 'property'
            };

            // Test expired draft
            mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(expiredDraft));
            const expiredResult = ClientDraftManager.loadDraft('property', mockUserId, 'expired-draft');
            expect(expiredResult).toBeNull();
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
                `wizard_draft_property_${mockUserId}_expired-draft`
            );

            // Test valid draft
            mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(validDraft));
            const validResult = ClientDraftManager.loadDraft('property', mockUserId, 'valid-draft');
            expect(validResult).toEqual({ title: 'Valid Draft' });
        });

        it('should clean up expired drafts from localStorage', () => {
            const now = Date.now();
            const validKey = 'wizard_draft_property_user1_valid';
            const expiredKey = 'wizard_draft_land_user1_expired';
            const invalidKey = 'wizard_draft_blog_user1_invalid';
            const nonWizardKey = 'other_data_key';

            mockLocalStorage.length = 4;
            mockLocalStorage.key
                .mockReturnValueOnce(validKey)
                .mockReturnValueOnce(expiredKey)
                .mockReturnValueOnce(invalidKey)
                .mockReturnValueOnce(nonWizardKey);

            const validData = JSON.stringify({
                data: { title: 'Valid' },
                timestamp: now - (1000 * 60 * 60), // 1 hour ago
            });

            const expiredData = JSON.stringify({
                data: { title: 'Expired' },
                timestamp: now - (25 * 60 * 60 * 1000), // 25 hours ago
            });

            mockLocalStorage.getItem
                .mockReturnValueOnce(validData)
                .mockReturnValueOnce(expiredData)
                .mockReturnValueOnce('invalid json')
                .mockReturnValueOnce('{"other": "data"}');

            ClientDraftManager.clearExpiredDrafts();

            // Should remove expired and invalid drafts
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(expiredKey);
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(invalidKey);

            // Should not remove valid draft or non-wizard keys
            expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith(validKey);
            expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith(nonWizardKey);
        });
    });

    describe('Draft data integrity', () => {
        it('should preserve complex nested data structures', () => {
            const complexData = {
                title: 'Complex Property',
                address: {
                    street: '123 Main St',
                    city: 'Test City',
                    coordinates: { lat: 40.7128, lng: -74.0060 }
                },
                images: [
                    { id: '1', url: 'image1.jpg', displayOrder: 0 },
                    { id: '2', url: 'image2.jpg', displayOrder: 1 }
                ],
                characteristics: ['pool', 'garage', 'garden'],
                aiGenerated: {
                    title: false,
                    description: true,
                    characteristics: false
                }
            };

            ClientDraftManager.saveDraft('property', mockUserId, complexData, mockDraftId);

            const savedCall = mockLocalStorage.setItem.mock.calls[0];
            const savedData = savedCall[1];
            mockLocalStorage.getItem.mockReturnValue(savedData);

            const loadedData = ClientDraftManager.loadDraft('property', mockUserId, mockDraftId);

            expect(loadedData).toEqual(complexData);
            expect(loadedData.address.coordinates.lat).toBe(40.7128);
            expect(loadedData.images).toHaveLength(2);
            expect(loadedData.characteristics).toContain('pool');
        });

        it('should handle special characters and unicode in draft data', () => {
            const unicodeData = {
                title: 'Propriété avec caractères spéciaux: àáâãäåæçèéêë',
                description: 'Descripción con emojis: 🏠🌟✨ and symbols: €$£¥',
                location: 'São Paulo, Brasil 🇧🇷',
                notes: 'Special chars: <>&"\'`'
            };

            ClientDraftManager.saveDraft('property', mockUserId, unicodeData, mockDraftId);

            const savedCall = mockLocalStorage.setItem.mock.calls[0];
            const savedData = savedCall[1];
            mockLocalStorage.getItem.mockReturnValue(savedData);

            const loadedData = ClientDraftManager.loadDraft('property', mockUserId, mockDraftId);

            expect(loadedData).toEqual(unicodeData);
            expect(loadedData.title).toContain('àáâãäåæçèéêë');
            expect(loadedData.description).toContain('🏠🌟✨');
            expect(loadedData.location).toContain('🇧🇷');
        });

        it('should handle large draft data within localStorage limits', () => {
            // Create a large draft (but within reasonable limits)
            const largeDescription = 'A'.repeat(10000); // 10KB description
            const largeData = {
                title: 'Large Property Draft',
                description: largeDescription,
                images: Array.from({ length: 50 }, (_, i) => ({
                    id: `img-${i}`,
                    url: `https://example.com/image-${i}.jpg`,
                    filename: `image-${i}.jpg`,
                    size: 1024 * 1024, // 1MB each
                    displayOrder: i
                })),
                characteristics: Array.from({ length: 100 }, (_, i) => `characteristic-${i}`)
            };

            ClientDraftManager.saveDraft('property', mockUserId, largeData, mockDraftId);

            const savedCall = mockLocalStorage.setItem.mock.calls[0];
            const savedData = savedCall[1];
            mockLocalStorage.getItem.mockReturnValue(savedData);

            const loadedData = ClientDraftManager.loadDraft('property', mockUserId, mockDraftId);

            expect(loadedData.description).toHaveLength(10000);
            expect(loadedData.images).toHaveLength(50);
            expect(loadedData.characteristics).toHaveLength(100);
        });
    });

    describe('Error recovery and edge cases', () => {
        it('should handle corrupted localStorage data gracefully', () => {
            // Test various corrupted data scenarios
            const corruptedScenarios = [
                'invalid json',
                '{"incomplete": json',
                '{"data": null}',
                '{"data": undefined}',
                '{}',
                '',
                null
            ];

            corruptedScenarios.forEach((corruptedData, index) => {
                mockLocalStorage.getItem.mockReturnValueOnce(corruptedData);

                const result = ClientDraftManager.loadDraft('property', mockUserId, `draft-${index}`);

                expect(result).toBeNull();
            });
        });

        it('should handle localStorage quota exceeded errors', () => {
            const quotaError = new Error('QuotaExceededError');
            quotaError.name = 'QuotaExceededError';

            mockLocalStorage.setItem.mockImplementation(() => {
                throw quotaError;
            });

            // Should not throw error
            expect(() => {
                ClientDraftManager.saveDraft('property', mockUserId, { title: 'Test' }, mockDraftId);
            }).not.toThrow();
        });

        it('should handle missing localStorage API', () => {
            // Temporarily remove localStorage
            const originalLocalStorage = global.localStorage;
            delete (global as any).localStorage;

            // Should not throw error
            expect(() => {
                ClientDraftManager.saveDraft('property', mockUserId, { title: 'Test' }, mockDraftId);
                ClientDraftManager.loadDraft('property', mockUserId, mockDraftId);
                ClientDraftManager.deleteDraft('property', mockUserId, mockDraftId);
                ClientDraftManager.hasDraft('property', mockUserId, mockDraftId);
                ClientDraftManager.clearExpiredDrafts();
            }).not.toThrow();

            // Restore localStorage
            global.localStorage = originalLocalStorage;
        });

        it('should handle concurrent draft operations', () => {
            const draftData1 = { title: 'Draft 1', step: 1 };
            const draftData2 = { title: 'Draft 2', step: 2 };

            // Simulate rapid successive saves
            ClientDraftManager.saveDraft('property', mockUserId, draftData1, mockDraftId);
            ClientDraftManager.saveDraft('property', mockUserId, draftData2, mockDraftId);

            // Should have been called twice
            expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2);

            // Last save should win
            const lastCall = mockLocalStorage.setItem.mock.calls[1];
            const lastSavedData = JSON.parse(lastCall[1]);
            expect(lastSavedData.data.title).toBe('Draft 2');
        });
    });

    describe('User isolation', () => {
        it('should isolate drafts between different users', () => {
            const user1Data = { title: 'User 1 Draft' };
            const user2Data = { title: 'User 2 Draft' };

            ClientDraftManager.saveDraft('property', 'user-1', user1Data, 'draft-1');
            ClientDraftManager.saveDraft('property', 'user-2', user2Data, 'draft-1');

            const calls = mockLocalStorage.setItem.mock.calls;
            expect(calls[0][0]).toBe('wizard_draft_property_user-1_draft-1');
            expect(calls[1][0]).toBe('wizard_draft_property_user-2_draft-1');

            // Verify data isolation
            const user1SavedData = JSON.parse(calls[0][1]);
            const user2SavedData = JSON.parse(calls[1][1]);

            expect(user1SavedData.data.title).toBe('User 1 Draft');
            expect(user2SavedData.data.title).toBe('User 2 Draft');
        });

        it('should not allow cross-user draft access', () => {
            const userData = { title: 'Private Draft' };

            ClientDraftManager.saveDraft('property', 'user-1', userData, 'draft-1');

            // Try to load with different user ID
            mockLocalStorage.getItem.mockReturnValue(null);
            const result = ClientDraftManager.loadDraft('property', 'user-2', 'draft-1');

            expect(result).toBeNull();
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('wizard_draft_property_user-2_draft-1');
        });
    });
});