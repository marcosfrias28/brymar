import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { DrizzleLandRepository } from '../DrizzleLandRepository';
import { Land } from '../../../../domain/land/entities/Land';
import { LandId } from '../../../../domain/land/value-objects/LandId';
import { LandStatus } from '../../../../domain/land/value-objects/LandStatus';
import { LandType } from '../../../../domain/land/value-objects/LandType';

// Mock database
const mockDb = {
    insert: jest.fn(),
    update: jest.fn(),
    select: jest.fn(),
    delete: jest.fn(),
} as any;

describe('DrizzleLandRepository', () => {
    let repository: DrizzleLandRepository;

    beforeEach(() => {
        repository = new DrizzleLandRepository(mockDb);
        jest.clearAllMocks();
    });

    describe('save', () => {
        it('should insert new land', async () => {
            const land = Land.create({
                name: 'Test Land',
                description: 'A test land property',
                area: 1000,
                price: 50000,
                location: 'Test Location',
                type: 'residential',
            });

            // Mock that the land is new
            jest.spyOn(land, 'isNew').mockReturnValue(true);

            mockDb.insert.mockReturnValue({
                values: jest.fn().mockResolvedValue(undefined)
            });

            await repository.save(land);

            expect(mockDb.insert).toHaveBeenCalled();
        });

        it('should update existing land', async () => {
            const land = Land.create({
                name: 'Test Land',
                description: 'A test land property',
                area: 1000,
                price: 50000,
                location: 'Test Location',
                type: 'residential',
            });

            // Mock that the land is not new
            jest.spyOn(land, 'isNew').mockReturnValue(false);

            mockDb.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue(undefined)
                })
            });

            await repository.save(land);

            expect(mockDb.update).toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('should return land when found', async () => {
            const landId = LandId.generate();
            const mockRow = {
                id: 1,
                name: 'Test Land',
                description: 'A test land property',
                area: 1000,
                price: 50000,
                location: 'Test Location',
                type: 'residential',
                images: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockDb.select.mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([mockRow])
                    })
                })
            });

            const result = await repository.findById(landId);

            expect(result).toBeInstanceOf(Land);
            expect(mockDb.select).toHaveBeenCalled();
        });

        it('should return null when not found', async () => {
            const landId = LandId.generate();

            mockDb.select.mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([])
                    })
                })
            });

            const result = await repository.findById(landId);

            expect(result).toBeNull();
        });
    });

    describe('search', () => {
        it('should return search results with pagination', async () => {
            const mockRows = [
                {
                    id: 1,
                    name: 'Test Land 1',
                    description: 'A test land property',
                    area: 1000,
                    price: 50000,
                    location: 'Test Location',
                    type: 'residential',
                    images: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            ];

            const mockCountResult = [{ count: 1 }];

            // Mock the query chain for lands
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        orderBy: jest.fn().mockReturnValue({
                            limit: jest.fn().mockReturnValue({
                                offset: jest.fn().mockResolvedValue(mockRows)
                            })
                        })
                    })
                })
            });

            // Mock the query chain for count
            mockDb.select.mockReturnValueOnce({
                from: jest.fn().mockReturnValue(mockCountResult)
            });

            const result = await repository.search({}, 1, 10);

            expect(result.lands).toHaveLength(1);
            expect(result.total).toBe(1);
            expect(result.currentPage).toBe(1);
            expect(result.totalPages).toBe(1);
        });
    });

    describe('exists', () => {
        it('should return true when land exists', async () => {
            const landId = LandId.generate();

            mockDb.select.mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([{ id: 1 }])
                    })
                })
            });

            const result = await repository.exists(landId);

            expect(result).toBe(true);
        });

        it('should return false when land does not exist', async () => {
            const landId = LandId.generate();

            mockDb.select.mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue([])
                    })
                })
            });

            const result = await repository.exists(landId);

            expect(result).toBe(false);
        });
    });
});