// Core Wizard Framework Tests

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { WizardValidator } from '@/lib/wizard/wizard-validator';
import { WizardPersistence } from '@/lib/wizard/wizard-persistence';
import { z } from 'zod';

// Mock data types for testing
interface TestWizardData {
    id?: string;
    title: string;
    description: string;
    status: "draft" | "published";
    createdAt?: Date;
    updatedAt?: Date;
    email?: string;
    age?: number;
}

const TestStepSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    email: z.string().email("Invalid email").optional(),
    age: z.number().min(18, "Must be at least 18").optional(),
});

const TestFinalSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(10),
    status: z.enum(["draft", "published"]),
});

describe('WizardValidator', () => {
    describe('validateStep', () => {
        it('should validate step data successfully', () => {
            const data = {
                title: "Test Title",
                description: "This is a test description that is long enough",
                email: "test@example.com",
            };

            const result = WizardValidator.validateStep("test-step", data, TestStepSchema);

            expect(result.isValid).toBe(true);
            expect(Object.keys(result.errors)).toHaveLength(0);
        });

        it('should return validation errors for invalid data', () => {
            const data = {
                title: "",
                description: "Short",
                email: "invalid-email",
            };

            const result = WizardValidator.validateStep("test-step", data, TestStepSchema);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveProperty('title');
            expect(result.errors).toHaveProperty('description');
            expect(result.errors).toHaveProperty('email');
        });

        it('should handle optional fields correctly', () => {
            const data = {
                title: "Test Title",
                description: "This is a test description that is long enough",
                // email and age are optional
            };

            const result = WizardValidator.validateStep("test-step", data, TestStepSchema);

            expect(result.isValid).toBe(true);
        });
    });

    describe('canProceedToNextStep', () => {
        const mockConfig = {
            id: "test-wizard",
            type: "test",
            title: "Test Wizard",
            steps: [
                {
                    id: "step1",
                    title: "Step 1",
                    component: jest.fn() as any,
                    isOptional: false,
                },
                {
                    id: "step2",
                    title: "Step 2",
                    component: jest.fn() as any,
                    isOptional: true,
                },
            ],
            validation: {
                stepSchemas: {
                    step1: TestStepSchema,
                    step2: TestStepSchema,
                },
                finalSchema: TestFinalSchema,
            },
        };

        it('should allow proceeding with valid data', () => {
            const data = {
                title: "Test Title",
                description: "This is a test description that is long enough",
            };

            const canProceed = WizardValidator.canProceedToNextStep("step1", data, mockConfig);

            expect(canProceed).toBe(true);
        });

        it('should prevent proceeding with invalid data', () => {
            const data = {
                title: "",
                description: "Short",
            };

            const canProceed = WizardValidator.canProceedToNextStep("step1", data, mockConfig);

            expect(canProceed).toBe(false);
        });

        it('should allow proceeding for optional steps', () => {
            const data = {
                title: "",
                description: "Short",
            };

            const canProceed = WizardValidator.canProceedToNextStep("step2", data, mockConfig);

            expect(canProceed).toBe(true);
        });
    });

    describe('formatErrorMessage', () => {
        it('should format Zod error messages to user-friendly Spanish', () => {
            const formatted = WizardValidator.formatErrorMessage(
                "email",
                "String must contain at least 1 character(s)"
            );

            expect(formatted).toBe("Este campo es requerido");
        });

        it('should format email validation errors', () => {
            const formatted = WizardValidator.formatErrorMessage(
                "email",
                "Invalid email"
            );

            expect(formatted).toBe("Correo electrónico inválido");
        });

        it('should format number validation errors', () => {
            const formatted = WizardValidator.formatErrorMessage(
                "age",
                "Number must be greater than 18"
            );

            expect(formatted).toBe("Debe ser un número válido");
        });
    });
});

describe('WizardPersistence', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        jest.clearAllMocks();
    });

    describe('saveDraft', () => {
        it('should save draft to localStorage', async () => {
            const data = {
                title: "Test Title",
                description: "Test Description",
                status: "draft" as const,
            };

            const draftId = await WizardPersistence.saveDraft(
                "test-wizard",
                "test-config",
                data,
                "step1"
            );

            expect(draftId).toBeTruthy();
            expect(localStorage.getItem(`wizard_draft_${draftId}`)).toBeTruthy();
        });

        it('should generate unique draft IDs', async () => {
            const data = {
                title: "Test Title",
                description: "Test Description",
                status: "draft" as const,
            };

            const draftId1 = await WizardPersistence.saveDraft(
                "test-wizard",
                "test-config",
                data,
                "step1"
            );

            const draftId2 = await WizardPersistence.saveDraft(
                "test-wizard",
                "test-config",
                data,
                "step1"
            );

            expect(draftId1).not.toBe(draftId2);
        });
    });

    describe('loadDraft', () => {
        it('should load draft from localStorage', async () => {
            const originalData = {
                title: "Test Title",
                description: "Test Description",
                status: "draft" as const,
            };

            const draftId = await WizardPersistence.saveDraft(
                "test-wizard",
                "test-config",
                originalData,
                "step1"
            );

            const loaded = await WizardPersistence.loadDraft<TestWizardData>(draftId);

            expect(loaded).toBeTruthy();
            expect(loaded?.data.title).toBe(originalData.title);
            expect(loaded?.data.description).toBe(originalData.description);
            expect(loaded?.currentStep).toBe("step1");
        });

        it('should return null for non-existent draft', async () => {
            const loaded = await WizardPersistence.loadDraft<TestWizardData>("non-existent");

            expect(loaded).toBeNull();
        });
    });

    describe('deleteDraft', () => {
        it('should delete draft from localStorage', async () => {
            const data = {
                title: "Test Title",
                description: "Test Description",
                status: "draft" as const,
            };

            const draftId = await WizardPersistence.saveDraft(
                "test-wizard",
                "test-config",
                data,
                "step1"
            );

            const deleted = await WizardPersistence.deleteDraft(draftId);

            expect(deleted).toBe(true);
            expect(localStorage.getItem(`wizard_draft_${draftId}`)).toBeNull();
        });
    });

    describe('autoSaveDraft', () => {
        it('should debounce auto-save calls', async () => {
            const data = {
                title: "Test Title",
                description: "Test Description",
                status: "draft" as const,
            };

            // Make multiple rapid calls
            const promise1 = WizardPersistence.autoSaveDraft(
                "test-wizard",
                "test-config",
                data,
                "step1",
                undefined,
                100
            );

            const promise2 = WizardPersistence.autoSaveDraft(
                "test-wizard",
                "test-config",
                { ...data, title: "Updated Title" },
                "step1",
                undefined,
                100
            );

            // Only the last call should succeed
            const draftId = await promise2;
            expect(draftId).toBeTruthy();

            // First promise should be cancelled
            try {
                await promise1;
            } catch (error) {
                // Expected to be cancelled
            }
        });
    });

    describe('listDrafts', () => {
        it('should list all drafts for a user', async () => {
            const userId = "test-user";

            await WizardPersistence.saveDraft(
                "test-wizard",
                "test-config",
                { title: "Draft 1", description: "Description 1", status: "draft" as const },
                "step1",
                userId
            );

            await WizardPersistence.saveDraft(
                "test-wizard",
                "test-config",
                { title: "Draft 2", description: "Description 2", status: "draft" as const },
                "step1",
                userId
            );

            const drafts = await WizardPersistence.listDrafts(userId);

            expect(drafts).toHaveLength(2);
            expect(drafts[0].userId).toBe(userId);
            expect(drafts[1].userId).toBe(userId);
        });

        it('should filter drafts by wizard type', async () => {
            const userId = "test-user";

            await WizardPersistence.saveDraft(
                "property-wizard",
                "property-config",
                { title: "Property Draft", description: "Description", status: "draft" as const },
                "step1",
                userId
            );

            await WizardPersistence.saveDraft(
                "blog-wizard",
                "blog-config",
                { title: "Blog Draft", description: "Description", status: "draft" as const },
                "step1",
                userId
            );

            const propertyDrafts = await WizardPersistence.listDrafts(userId, "property-wizard");
            const blogDrafts = await WizardPersistence.listDrafts(userId, "blog-wizard");

            expect(propertyDrafts).toHaveLength(1);
            expect(blogDrafts).toHaveLength(1);
            expect(propertyDrafts[0].wizardType).toBe("property-wizard");
            expect(blogDrafts[0].wizardType).toBe("blog-wizard");
        });
    });
});

// Test the core framework integration
describe('Core Wizard Framework Integration', () => {
    it('should validate the framework components exist', () => {
        expect(WizardValidator).toBeDefined();
        expect(WizardPersistence).toBeDefined();
        expect(typeof WizardValidator.validateStep).toBe('function');
        expect(typeof WizardPersistence.saveDraft).toBe('function');
    });

    it('should handle complete wizard workflow', async () => {
        // Step 1: Create wizard configuration
        const config = {
            id: "integration-test",
            type: "test",
            title: "Integration Test Wizard",
            steps: [
                {
                    id: "step1",
                    title: "Basic Info",
                    component: jest.fn() as any,
                },
                {
                    id: "step2",
                    title: "Details",
                    component: jest.fn() as any,
                },
            ],
            validation: {
                stepSchemas: {
                    step1: z.object({
                        title: z.string().min(1),
                    }),
                    step2: z.object({
                        description: z.string().min(10),
                    }),
                },
                finalSchema: z.object({
                    title: z.string().min(1),
                    description: z.string().min(10),
                    status: z.enum(["draft", "published"]),
                }),
            },
        };

        // Step 2: Validate step progression
        let data: any = { title: "Test Title" };

        const canProceedStep1 = WizardValidator.canProceedToNextStep("step1", data, config);
        expect(canProceedStep1).toBe(true);

        // Step 3: Save draft
        const draftId = await WizardPersistence.saveDraft(
            config.type,
            config.id,
            data,
            "step1"
        );
        expect(draftId).toBeTruthy();

        // Step 4: Load draft and continue
        const loaded = await WizardPersistence.loadDraft(draftId);
        expect(loaded?.data.title).toBe("Test Title");

        // Step 5: Complete second step
        data = { ...loaded?.data, description: "This is a complete description" };

        const canProceedStep2 = WizardValidator.canProceedToNextStep("step2", data, config);
        expect(canProceedStep2).toBe(true);

        // Step 6: Final validation
        data.status = "published";
        const canComplete = WizardValidator.canComplete(data, config);
        expect(canComplete).toBe(true);

        // Step 7: Clean up
        const deleted = await WizardPersistence.deleteDraft(draftId);
        expect(deleted).toBe(true);
    });
});