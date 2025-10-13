/**
 * Integration test for Property Infrastructure
 * Tests the complete property infrastructure setup
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { configurePropertyServices, getPropertyRepository, getImageService } from '../config/property-services';
import { container } from '../config/container';

describe('Property Infrastructure Integration', () => {
    beforeAll(() => {
        // Configure all property services
        configurePropertyServices();
    });

    describe('Service Registration', () => {
        it('should register all required services', () => {
            expect(container.has('Database')).toBe(true);
            expect(container.has('IPropertyRepository')).toBe(true);
            expect(container.has('IPropertyDraftRepository')).toBe(true);
            expect(container.has('IImageService')).toBe(true);
            expect(container.has('PropertyDomainService')).toBe(true);
            expect(container.has('CreatePropertyUseCase')).toBe(true);
            expect(container.has('UpdatePropertyUseCase')).toBe(true);
            expect(container.has('SearchPropertiesUseCase')).toBe(true);
            expect(container.has('PublishPropertyUseCase')).toBe(true);
        });

        it('should resolve property repository', () => {
            const repository = getPropertyRepository();
            expect(repository).toBeDefined();
            expect(typeof repository.findById).toBe('function');
            expect(typeof repository.save).toBe('function');
            expect(typeof repository.search).toBe('function');
        });

        it('should resolve image service', () => {
            const imageService = getImageService();
            expect(imageService).toBeDefined();
            expect(typeof imageService.processImages).toBe('function');
            expect(typeof imageService.deleteImage).toBe('function');
            expect(typeof imageService.getImageUrl).toBe('function');
        });

        it('should resolve use cases with dependencies', () => {
            const createUseCase = container.get('CreatePropertyUseCase');
            expect(createUseCase).toBeDefined();
            expect(typeof createUseCase.execute).toBe('function');

            const searchUseCase = container.get('SearchPropertiesUseCase');
            expect(searchUseCase).toBeDefined();
            expect(typeof searchUseCase.execute).toBe('function');
        });
    });

    describe('Service Dependencies', () => {
        it('should inject dependencies correctly', () => {
            // Test that use cases can be created with their dependencies
            expect(() => {
                const createUseCase = container.get('CreatePropertyUseCase');
                const updateUseCase = container.get('UpdatePropertyUseCase');
                const searchUseCase = container.get('SearchPropertiesUseCase');
                const publishUseCase = container.get('PublishPropertyUseCase');
            }).not.toThrow();
        });

        it('should maintain singleton instances for repositories', () => {
            const repo1 = container.get('IPropertyRepository');
            const repo2 = container.get('IPropertyRepository');
            expect(repo1).toBe(repo2); // Should be the same instance
        });

        it('should create new instances for transient services', () => {
            const useCase1 = container.get('CreatePropertyUseCase');
            const useCase2 = container.get('CreatePropertyUseCase');
            expect(useCase1).not.toBe(useCase2); // Should be different instances
        });
    });

    describe('Error Handling', () => {
        it('should throw error for unregistered service', () => {
            expect(() => {
                container.get('NonExistentService');
            }).toThrow("Service 'NonExistentService' not registered");
        });
    });
});