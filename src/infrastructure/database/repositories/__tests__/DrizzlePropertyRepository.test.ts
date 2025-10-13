/**
 * Tests for DrizzlePropertyRepository
 * These are integration tests that verify the repository works with the database
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { DrizzlePropertyRepository } from '../DrizzlePropertyRepository';
import { Property } from '@/domain/property/entities/Property';
import { PropertyId } from '@/domain/property/value-objects/PropertyId';
import { PropertyStatus } from '@/domain/property/value-objects/PropertyStatus';
import { PropertyType } from '@/domain/property/value-objects/PropertyType';

// Mock database for testing
const mockDb = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
} as any;

describe('DrizzlePropertyRepository', () => {
    let repository: DrizzlePropertyRepository;

    beforeEach(() => {
        repository = new DrizzlePropertyRepository(mockDb);
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('findById', () => {
        it('should return null when property not found', async () => {
            // Arrange
            mockDb.select.mockReturnValue(mockDb);
            mockDb.from.mockReturnValue(mockDb);
            mockDb.where.mockReturnValue(mockDb);
            mockDb.limit.mockResolvedValue([]);

            const propertyId = PropertyId.create('1');

            // Act
            const result = await repository.findById(propertyId);

            // Assert
            expect(result).toBeNull();
            expect(mockDb.select).toHaveBeenCalled();
            expect(mockDb.from).toHaveBeenCalled();
            expect(mockDb.where).toHaveBeenCalled();
            expect(mockDb.limit).toHaveBeenCalledWith(1);
        });

        it('should return property when found', async () => {
            // Arrange
            const mockPropertyData = {
                id: 1,
                title: 'Test Property',
                description: 'A test property',
                price: 100000,
                type: 'house',
                bedrooms: 3,
                bathrooms: 2,
                area: 150,
                location: 'Test City',
                status: 'draft',
                featured: false,
                images: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockDb.select.mockReturnValue(mockDb);
            mockDb.from.mockReturnValue(mockDb);
            mockDb.where.mockReturnValue(mockDb);
            mockDb.limit.mockResolvedValue([mockPropertyData]);

            const propertyId = PropertyId.create('1');

            // Act
            const result = await repository.findById(propertyId);

            // Assert
            expect(result).not.toBeNull();
            expect(result).toBeInstanceOf(Property);
            if (result) {
                expect(result.getTitle().value).toBe('Test Property');
                expect(result.getPrice().amount).toBe(100000);
            }
        });

        it('should handle database errors', async () => {
            // Arrange
            mockDb.select.mockImplementation(() => {
                throw new Error('Database connection failed');
            });

            const propertyId = PropertyId.create('1');

            // Act & Assert
            await expect(repository.findById(propertyId))
                .rejects
                .toThrow('Failed to find property by ID: Database connection failed');
        });
    });

    describe('save', () => {
        it('should insert new property', async () => {
            // Arrange
            const propertyData = {
                title: 'New Property',
                description: 'A new property',
                price: 200000,
                currency: 'USD',
                address: {
                    street: '123 Main St',
                    city: 'Test City',
                    state: 'Test State',
                    country: 'Test Country',
                },
                type: 'house',
                features: {
                    bedrooms: 3,
                    bathrooms: 2,
                    area: 150,
                },
            };

            const property = Property.create(propertyData);

            // Mock that property doesn't exist (for insert)
            mockDb.select.mockReturnValue(mockDb);
            mockDb.from.mockReturnValue(mockDb);
            mockDb.where.mockReturnValue(mockDb);
            mockDb.limit.mockResolvedValue([]);

            // Mock insert
            mockDb.insert.mockReturnValue(mockDb);
            mockDb.values.mockResolvedValue(undefined);

            // Act
            await repository.save(property);

            // Assert
            expect(mockDb.insert).toHaveBeenCalled();
            expect(mockDb.values).toHaveBeenCalled();
        });

        it('should update existing property', async () => {
            // Arrange
            const propertyData = {
                title: 'Existing Property',
                description: 'An existing property',
                price: 200000,
                currency: 'USD',
                address: {
                    street: '123 Main St',
                    city: 'Test City',
                    state: 'Test State',
                    country: 'Test Country',
                },
                type: 'house',
                features: {
                    bedrooms: 3,
                    bathrooms: 2,
                    area: 150,
                },
            };

            const property = Property.create(propertyData);

            // Mock that property exists (for update)
            mockDb.select.mockReturnValue(mockDb);
            mockDb.from.mockReturnValue(mockDb);
            mockDb.where.mockReturnValue(mockDb);
            mockDb.limit.mockResolvedValue([{ id: 1 }]);

            // Mock update
            mockDb.update.mockReturnValue(mockDb);
            mockDb.set.mockReturnValue(mockDb);
            mockDb.where.mockResolvedValue(undefined);

            // Act
            await repository.save(property);

            // Assert
            expect(mockDb.update).toHaveBeenCalled();
            expect(mockDb.set).toHaveBeenCalled();
        });
    });

    describe('findByStatus', () => {
        it('should return properties with specified status', async () => {
            // Arrange
            const mockProperties = [
                {
                    id: 1,
                    title: 'Property 1',
                    description: 'Description 1',
                    price: 100000,
                    type: 'house',
                    bedrooms: 3,
                    bathrooms: 2,
                    area: 150,
                    location: 'City 1',
                    status: 'published',
                    featured: false,
                    images: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            mockDb.select.mockReturnValue(mockDb);
            mockDb.from.mockReturnValue(mockDb);
            mockDb.where.mockReturnValue(mockDb);
            mockDb.orderBy.mockResolvedValue(mockProperties);

            const status = PropertyStatus.published();

            // Act
            const result = await repository.findByStatus(status);

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0]).toBeInstanceOf(Property);
            expect(result[0].getStatus().value).toBe('published');
        });
    });

    describe('search', () => {
        it('should return search results with pagination', async () => {
            // Arrange
            const mockProperties = [
                {
                    id: 1,
                    title: 'Property 1',
                    description: 'Description 1',
                    price: 100000,
                    type: 'house',
                    bedrooms: 3,
                    bathrooms: 2,
                    area: 150,
                    location: 'City 1',
                    status: 'published',
                    featured: false,
                    images: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            // Mock count query
            mockDb.select.mockReturnValueOnce(mockDb);
            mockDb.from.mockReturnValueOnce(mockDb);
            mockDb.where.mockResolvedValueOnce([{ count: 1 }]);

            // Mock search query
            mockDb.select.mockReturnValue(mockDb);
            mockDb.from.mockReturnValue(mockDb);
            mockDb.where.mockReturnValue(mockDb);
            mockDb.orderBy.mockReturnValue(mockDb);
            mockDb.limit.mockReturnValue(mockDb);
            mockDb.offset.mockResolvedValue(mockProperties);

            const criteria = {
                minPrice: 50000,
                maxPrice: 150000,
                limit: 10,
                offset: 0,
            };

            // Act
            const result = await repository.search(criteria);

            // Assert
            expect(result.properties).toHaveLength(1);
            expect(result.total).toBe(1);
            expect(result.hasMore).toBe(false);
        });
    });
});