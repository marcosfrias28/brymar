import { publishProperty, saveDraft, loadDraft, deleteDraft } from '../wizard-actions';
import db from '@/lib/db/drizzle';
import { properties, propertyDrafts, propertyImages } from '@/lib/db/schema';
import { auth } from '@/lib/auth/auth';

// Mock dependencies
jest.mock('@/lib/db/drizzle');
jest.mock('@/lib/auth/auth');

const mockDb = db as jest.Mocked<typeof db>;
const mockAuth = auth as jest.Mocked<typeof auth>;

describe('wizard-actions', () => {
    const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'agent',
    };

    const mockPropertyData = {
        title: 'Test Property',
        description: 'A beautiful test property',
        price: 150000,
        surface: 200,
        propertyType: 'house' as const,
        bedrooms: 3,
        bathrooms: 2,
        characteristics: [
            { id: '1', name: 'Pool', category: 'amenity' as const, selected: true },
        ],
        coordinates: { latitude: 18.4861, longitude: -69.9312 },
        address: {
            street: 'Test Street 123',
            city: 'Santo Domingo',
            province: 'Distrito Nacional',
            country: 'Dominican Republic',
            formattedAddress: 'Test Street 123, Santo Domingo',
        },
        images: [
            {
                id: 'img-1',
                url: 'https://example.com/image1.jpg',
                filename: 'image1.jpg',
                size: 1024 * 1024,
                contentType: 'image/jpeg',
                width: 800,
                height: 600,
            },
        ],
        status: 'published' as const,
        language: 'es' as const,
        aiGenerated: {
            title: true,
            description: true,
            tags: false,
        },
    };

    beforeEach(() => {
        mockAuth.api.getSession.mockResolvedValue({
            session: { userId: mockUser.id },
            user: mockUser,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('publishProperty', () => {
        it('publishes property successfully', async () => {
            const mockInsertedProperty = { id: 'prop-123', ...mockPropertyData };

            mockDb.insert.mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([mockInsertedProperty]),
                }),
            } as any);

            mockDb.transaction.mockImplementation(async (callback) => {
                return await callback(mockDb);
            });

            const result = await publishProperty(mockPropertyData);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockInsertedProperty);
            expect(mockDb.insert).toHaveBeenCalledWith(properties);
        });

        it('handles validation errors', async () => {
            const invalidData = {
                ...mockPropertyData,
                title: '', // Invalid: empty title
                price: -1000, // Invalid: negative price
            };

            const result = await publishProperty(invalidData);

            expect(result.success).toBe(false);
            expect(result.error).toContain('validation');
            expect(mockDb.insert).not.toHaveBeenCalled();
        });

        it('handles database errors', async () => {
            mockDb.insert.mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockRejectedValue(new Error('Database error')),
                }),
            } as any);

            mockDb.transaction.mockImplementation(async (callback) => {
                return await callback(mockDb);
            });

            const result = await publishProperty(mockPropertyData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Error al publicar la propiedad');
        });

        it('requires authentication', async () => {
            mockAuth.api.getSession.mockResolvedValue({
                session: null,
                user: null,
            });

            const result = await publishProperty(mockPropertyData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('No autorizado');
            expect(mockDb.insert).not.toHaveBeenCalled();
        });

        it('inserts property images', async () => {
            const mockInsertedProperty = { id: 'prop-123', ...mockPropertyData };

            mockDb.insert.mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([mockInsertedProperty]),
                }),
            } as any);

            mockDb.transaction.mockImplementation(async (callback) => {
                return await callback(mockDb);
            });

            await publishProperty(mockPropertyData);

            expect(mockDb.insert).toHaveBeenCalledWith(propertyImages);
        });

        it('handles transaction rollback on error', async () => {
            mockDb.insert
                .mockReturnValueOnce({
                    values: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([{ id: 'prop-123' }]),
                    }),
                } as any)
                .mockReturnValueOnce({
                    values: jest.fn().mockRejectedValue(new Error('Image insert failed')),
                } as any);

            mockDb.transaction.mockImplementation(async (callback) => {
                try {
                    return await callback(mockDb);
                } catch (error) {
                    throw error;
                }
            });

            const result = await publishProperty(mockPropertyData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Error al publicar la propiedad');
        });
    });

    describe('saveDraft', () => {
        it('saves draft successfully', async () => {
            const mockInsertedDraft = { id: 'draft-123', ...mockPropertyData };

            mockDb.insert.mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([mockInsertedDraft]),
                }),
            } as any);

            const result = await saveDraft(mockPropertyData);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockInsertedDraft);
            expect(mockDb.insert).toHaveBeenCalledWith(propertyDrafts);
        });

        it('updates existing draft', async () => {
            const existingDraftId = 'draft-123';
            const updatedData = { ...mockPropertyData, title: 'Updated Title' };

            mockDb.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([{ id: existingDraftId, ...updatedData }]),
                    }),
                }),
            } as any);

            const result = await saveDraft(updatedData, existingDraftId);

            expect(result.success).toBe(true);
            expect(mockDb.update).toHaveBeenCalledWith(propertyDrafts);
        });

        it('handles partial data for drafts', async () => {
            const partialData = {
                title: 'Partial Title',
                price: 100000,
            };

            mockDb.insert.mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([{ id: 'draft-123', ...partialData }]),
                }),
            } as any);

            const result = await saveDraft(partialData);

            expect(result.success).toBe(true);
        });

        it('requires authentication', async () => {
            mockAuth.api.getSession.mockResolvedValue({
                session: null,
                user: null,
            });

            const result = await saveDraft(mockPropertyData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('No autorizado');
        });
    });

    describe('loadDraft', () => {
        it('loads draft successfully', async () => {
            const mockDraft = {
                id: 'draft-123',
                userId: mockUser.id,
                formData: mockPropertyData,
                stepCompleted: 3,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockDb.select.mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([mockDraft]),
                }),
            } as any);

            const result = await loadDraft('draft-123');

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockDraft);
        });

        it('handles draft not found', async () => {
            mockDb.select.mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([]),
                }),
            } as any);

            const result = await loadDraft('nonexistent-draft');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Borrador no encontrado');
        });

        it('prevents loading drafts from other users', async () => {
            const otherUserDraft = {
                id: 'draft-123',
                userId: 'other-user',
                formData: mockPropertyData,
                stepCompleted: 3,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockDb.select.mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([otherUserDraft]),
                }),
            } as any);

            const result = await loadDraft('draft-123');

            expect(result.success).toBe(false);
            expect(result.error).toBe('No autorizado para acceder a este borrador');
        });

        it('requires authentication', async () => {
            mockAuth.api.getSession.mockResolvedValue({
                session: null,
                user: null,
            });

            const result = await loadDraft('draft-123');

            expect(result.success).toBe(false);
            expect(result.error).toBe('No autorizado');
        });
    });

    describe('deleteDraft', () => {
        it('deletes draft successfully', async () => {
            const mockDraft = {
                id: 'draft-123',
                userId: mockUser.id,
            };

            mockDb.select.mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([mockDraft]),
                }),
            } as any);

            mockDb.delete.mockReturnValue({
                where: jest.fn().mockResolvedValue({ rowCount: 1 }),
            } as any);

            const result = await deleteDraft('draft-123');

            expect(result.success).toBe(true);
            expect(mockDb.delete).toHaveBeenCalledWith(propertyDrafts);
        });

        it('handles draft not found', async () => {
            mockDb.select.mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([]),
                }),
            } as any);

            const result = await deleteDraft('nonexistent-draft');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Borrador no encontrado');
        });

        it('prevents deleting drafts from other users', async () => {
            const otherUserDraft = {
                id: 'draft-123',
                userId: 'other-user',
            };

            mockDb.select.mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([otherUserDraft]),
                }),
            } as any);

            const result = await deleteDraft('draft-123');

            expect(result.success).toBe(false);
            expect(result.error).toBe('No autorizado para eliminar este borrador');
        });

        it('requires authentication', async () => {
            mockAuth.api.getSession.mockResolvedValue({
                session: null,
                user: null,
            });

            const result = await deleteDraft('draft-123');

            expect(result.success).toBe(false);
            expect(result.error).toBe('No autorizado');
        });
    });
});