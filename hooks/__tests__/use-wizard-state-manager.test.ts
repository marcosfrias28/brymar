import { renderHook, act } from '@testing-library/react';
import { useWizardStateManager } from '../use-wizard-state-manager';
import { WizardPersistence } from '@/lib/utils/wizard-persistence';

// Mock the persistence utility
jest.mock('@/lib/utils/wizard-persistence');

const mockWizardPersistence = WizardPersistence as jest.Mocked<typeof WizardPersistence>;

// Mock validation functions
jest.mock('@/lib/schemas/wizard-schemas', () => ({
    validateStep: jest.fn(),
    validatePartialStep: jest.fn(),
}));

import { validateStep, validatePartialStep } from '@/lib/schemas/wizard-schemas';

const mockValidateStep = validateStep as jest.MockedFunction<typeof validateStep>;
const mockValidatePartialStep = validatePartialStep as jest.MockedFunction<typeof validatePartialStep>;

describe('useWizardStateManager', () => {
    beforeEach(() => {
        mockValidateStep.mockReturnValue({ success: true });
        mockValidatePartialStep.mockReturnValue({ success: true });
        mockWizardPersistence.loadWizardData.mockReturnValue(null);
        mockWizardPersistence.saveWizardData.mockImplementation(() => { });
        mockWizardPersistence.clearWizardData.mockImplementation(() => { });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it('initializes with default state', () => {
        const { result } = renderHook(() => useWizardStateManager());

        expect(result.current.wizardState.currentStep).toBe(1);
        expect(result.current.wizardState.formData).toEqual({ language: 'es' });
        expect(result.current.wizardState.isValid).toEqual({ 1: false, 2: false, 3: false, 4: false });
        expect(result.current.wizardState.isDirty).toBe(false);
        expect(result.current.wizardState.isLoading).toBe(false);
    });

    it('initializes with provided initial data', () => {
        const initialData = { title: 'Test Property', price: 100000 };

        const { result } = renderHook(() => useWizardStateManager(initialData));

        expect(result.current.wizardState.formData).toEqual({
            ...initialData,
            language: 'es',
        });
    });

    it('updates form data correctly', () => {
        const { result } = renderHook(() => useWizardStateManager());

        act(() => {
            result.current.updateFormData({ title: 'New Title' });
        });

        expect(result.current.wizardState.formData.title).toBe('New Title');
        expect(result.current.wizardState.isDirty).toBe(true);
    });

    it('navigates to next step when valid', () => {
        mockValidateStep.mockReturnValue({ success: true });

        const { result } = renderHook(() => useWizardStateManager());

        act(() => {
            result.current.goToNextStep();
        });

        expect(result.current.wizardState.currentStep).toBe(2);
    });

    it('prevents navigation when step is invalid', () => {
        mockValidateStep.mockReturnValue({
            success: false,
            errors: { title: 'Title is required' }
        });

        const { result } = renderHook(() => useWizardStateManager());

        act(() => {
            result.current.goToNextStep();
        });

        expect(result.current.wizardState.currentStep).toBe(1);
        expect(result.current.wizardState.errors).toEqual({ title: 'Title is required' });
    });

    it('navigates to previous step', () => {
        const { result } = renderHook(() => useWizardStateManager());

        // First go to step 2
        act(() => {
            result.current.goToStep(2);
        });

        expect(result.current.wizardState.currentStep).toBe(2);

        // Then go back
        act(() => {
            result.current.goToPreviousStep();
        });

        expect(result.current.wizardState.currentStep).toBe(1);
    });

    it('prevents going to previous step from step 1', () => {
        const { result } = renderHook(() => useWizardStateManager());

        act(() => {
            result.current.goToPreviousStep();
        });

        expect(result.current.wizardState.currentStep).toBe(1);
    });

    it('manages history for undo/redo functionality', () => {
        const { result } = renderHook(() => useWizardStateManager());

        // Make some changes
        act(() => {
            result.current.updateFormData({ title: 'First Title' });
        });

        act(() => {
            result.current.updateFormData({ title: 'Second Title' });
        });

        expect(result.current.canUndo).toBe(true);

        // Undo
        act(() => {
            result.current.undo();
        });

        expect(result.current.wizardState.formData.title).toBe('First Title');
        expect(result.current.canRedo).toBe(true);

        // Redo
        act(() => {
            result.current.redo();
        });

        expect(result.current.wizardState.formData.title).toBe('Second Title');
    });

    it('limits history size', () => {
        const { result } = renderHook(() =>
            useWizardStateManager({}, 'es', { maxHistorySize: 2 })
        );

        // Add more changes than history limit
        act(() => {
            result.current.updateFormData({ title: 'Title 1' });
        });

        act(() => {
            result.current.updateFormData({ title: 'Title 2' });
        });

        act(() => {
            result.current.updateFormData({ title: 'Title 3' });
        });

        // Should only be able to undo twice (history size limit)
        act(() => {
            result.current.undo();
        });

        expect(result.current.wizardState.formData.title).toBe('Title 2');

        act(() => {
            result.current.undo();
        });

        expect(result.current.wizardState.formData.title).toBe('Title 1');
        expect(result.current.canUndo).toBe(false);
    });

    it('sets loading state', () => {
        const { result } = renderHook(() => useWizardStateManager());

        act(() => {
            result.current.setLoading(true);
        });

        expect(result.current.wizardState.isLoading).toBe(true);

        act(() => {
            result.current.setLoading(false);
        });

        expect(result.current.wizardState.isLoading).toBe(false);
    });

    it('sets errors', () => {
        const { result } = renderHook(() => useWizardStateManager());

        const errors = { title: 'Title is required', price: 'Price must be positive' };

        act(() => {
            result.current.setErrors(errors);
        });

        expect(result.current.wizardState.errors).toEqual(errors);
    });

    it('clears dirty state', () => {
        const { result } = renderHook(() => useWizardStateManager());

        // Make form dirty
        act(() => {
            result.current.updateFormData({ title: 'Test' });
        });

        expect(result.current.wizardState.isDirty).toBe(true);

        // Clear dirty state
        act(() => {
            result.current.clearDirtyState();
        });

        expect(result.current.wizardState.isDirty).toBe(false);
    });

    it('calculates step validation correctly', () => {
        mockValidatePartialStep
            .mockReturnValueOnce({ success: true })  // Step 1
            .mockReturnValueOnce({ success: false }) // Step 2
            .mockReturnValueOnce({ success: true })  // Step 3
            .mockReturnValueOnce({ success: false }); // Step 4

        const { result } = renderHook(() => useWizardStateManager());

        expect(result.current.stepValidation[1]).toBe(true);
        expect(result.current.stepValidation[2]).toBe(false);
        expect(result.current.stepValidation[3]).toBe(true);
        expect(result.current.stepValidation[4]).toBe(false);
    });

    it('calculates step completion percentage', () => {
        const formData = {
            title: 'Test Property',
            description: 'Test description that is long enough to meet requirements',
            price: 100000,
            surface: 200,
            propertyType: 'house',
        };

        const { result } = renderHook(() => useWizardStateManager(formData));

        // Step 1 should be mostly complete
        expect(result.current.stepCompletion[1]).toBeGreaterThan(80);
    });

    it('auto-saves data when dirty', async () => {
        jest.useFakeTimers();

        const onAutoSave = jest.fn().mockResolvedValue(undefined);

        const { result } = renderHook(() =>
            useWizardStateManager({}, 'es', { autoSaveInterval: 1000, onAutoSave })
        );

        // Make form dirty
        act(() => {
            result.current.updateFormData({ title: 'Test' });
        });

        // Fast-forward time
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        await act(async () => {
            await Promise.resolve(); // Wait for async operations
        });

        expect(mockWizardPersistence.saveWizardData).toHaveBeenCalled();
        expect(onAutoSave).toHaveBeenCalled();

        jest.useRealTimers();
    });

    it('loads persisted data on initialization', () => {
        const persistedData = {
            formData: { title: 'Persisted Title', price: 50000 },
            currentStep: 2,
        };

        mockWizardPersistence.loadWizardData.mockReturnValue(persistedData);

        const { result } = renderHook(() => useWizardStateManager());

        expect(result.current.wizardState.formData.title).toBe('Persisted Title');
        expect(result.current.wizardState.currentStep).toBe(2);
    });

    it('does not load persisted data when initial data is provided', () => {
        const persistedData = {
            formData: { title: 'Persisted Title' },
            currentStep: 2,
        };

        const initialData = { title: 'Initial Title' };

        mockWizardPersistence.loadWizardData.mockReturnValue(persistedData);

        const { result } = renderHook(() => useWizardStateManager(initialData));

        expect(result.current.wizardState.formData.title).toBe('Initial Title');
        expect(result.current.wizardState.currentStep).toBe(1);
    });

    it('handles different locales', () => {
        const { result } = renderHook(() => useWizardStateManager({}, 'en'));

        expect(result.current.wizardState.formData.language).toBe('en');

        act(() => {
            result.current.goToNextStep();
        });

        expect(mockValidateStep).toHaveBeenCalledWith(
            1,
            expect.any(Object)
            'en'
        );
    });

    it('prevents navigation beyond step limits', () => {
        const { result } = renderHook(() => useWizardStateManager());

        // Try to go to step 5 (beyond limit)
        act(() => {
            result.current.goToStep(5);
        });

        expect(result.current.wizardState.currentStep).toBe(1);

        // Try to go to step 0 (below limit)
        act(() => {
            result.current.goToStep(0);
        });

        expect(result.current.wizardState.currentStep).toBe(1);
    });
});