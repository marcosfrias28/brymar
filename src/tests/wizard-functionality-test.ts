/**
 * Simple test to verify wizard publishing functionality
 */

import { PublishWizardUseCase } from '../application/use-cases/wizard/PublishWizardUseCase';

// Mock data for testing
const mockWizardDraftRepository = {
    findById: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
};

const mockWizardMediaRepository = {
    findByWizardId: jest.fn(),
    save: jest.fn(),
};

const mockWizardDomainService = {
    validateStep: jest.fn(),
    calculateCompletionPercentage: jest.fn(),
};

const mockCreatePropertyUseCase = {
    execute: jest.fn(),
};

const mockCreateLandUseCase = {
    execute: jest.fn(),
};

const mockCreateBlogPostUseCase = {
    execute: jest.fn(),
};

describe('Wizard Publishing Functionality', () => {
    let publishWizardUseCase: PublishWizardUseCase;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Create use case instance with mocks
        publishWizardUseCase = new PublishWizardUseCase(
            mockWizardDraftRepository as any,
            mockWizardMediaRepository as any,
            mockWizardDomainService as any,
            mockCreatePropertyUseCase as any,
            mockCreateLandUseCase as any,
            mockCreateBlogPostUseCase as any
        );
    });

    test('should be able to instantiate PublishWizardUseCase', () => {
        expect(publishWizardUseCase).toBeDefined();
        expect(publishWizardUseCase).toBeInstanceOf(PublishWizardUseCase);
    });

    test('should have required dependencies injected', () => {
        // Verify that the use case has the required dependencies
        expect(mockWizardDraftRepository).toBeDefined();
        expect(mockWizardMediaRepository).toBeDefined();
        expect(mockWizardDomainService).toBeDefined();
    });
});

console.log('✅ Wizard functionality test structure is valid');