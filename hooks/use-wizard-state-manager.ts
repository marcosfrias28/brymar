"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { PropertyFormData, WizardState } from "@/types/wizard";
import { validateStep, validatePartialStep } from "@/lib/schemas/wizard-schemas";
import { WizardPersistence } from "@/lib/utils/wizard-persistence";

interface WizardStateSnapshot {
    formData: Partial<PropertyFormData>;
    currentStep: number;
    timestamp: number;
}

interface WizardStateManagerOptions {
    maxHistorySize?: number;
    autoSaveInterval?: number;
    onAutoSave?: (data: Partial<PropertyFormData>) => Promise<void>;
    onUpdate?: (data: Partial<PropertyFormData>) => void;
}

export function useWizardStateManager(
    initialData: Partial<PropertyFormData> = {},
    options: WizardStateManagerOptions = {}
) {
    const {
        maxHistorySize = 50,
        autoSaveInterval = 30000, // 30 seconds
        onAutoSave,
        onUpdate,
    } = options;

    // Main wizard state
    const [wizardState, setWizardState] = useState<WizardState>({
        currentStep: 1,
        formData: { ...initialData, language: "es" },
        isValid: {},
        isDirty: false,
        isLoading: false,
        errors: {},
    });

    // History management for undo/redo
    const [history, setHistory] = useState<WizardStateSnapshot[]>([
        {
            formData: { ...initialData, language: "es" },
            currentStep: 1,
            timestamp: Date.now(),
        },
    ]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

    // Step validation and completion tracking
    const [stepValidation, setStepValidation] = useState<Record<number, boolean>>({});
    const [stepCompletion, setStepCompletion] = useState<Record<number, number>>({});

    // Calculate step completion percentage
    const calculateStepCompletion = useCallback(
        (step: number, data: Partial<PropertyFormData>): number => {
            const validation = validatePartialStep(step, data);

            if (validation.success) return 100;

            // Calculate partial completion based on filled fields
            const requiredFields = getRequiredFieldsForStep(step);
            const filledFields = requiredFields.filter((field) => {
                const value = getNestedValue(data, field);
                return value !== undefined && value !== null && value !== "";
            });

            return Math.round((filledFields.length / requiredFields.length) * 100);
        },
        []
    );

    // Get required fields for each step
    const getRequiredFieldsForStep = (step: number): string[] => {
        switch (step) {
            case 1:
                return ["title", "description", "price", "surface", "propertyType"];
            case 2:
                return ["coordinates", "address.street", "address.city", "address.province"];
            case 3:
                return ["images"];
            case 4:
                return ["title", "description", "price", "surface", "propertyType", "coordinates", "images"];
            default:
                return [];
        }
    };

    // Get nested value from object
    const getNestedValue = (obj: any, path: string): any => {
        return path.split(".").reduce((current, key) => current?.[key], obj);
    };

    // Update step validation and completion
    const updateStepMetrics = useCallback(
        (data: Partial<PropertyFormData>) => {
            const newValidation: Record<number, boolean> = {};
            const newCompletion: Record<number, number> = {};

            for (let step = 1; step <= 4; step++) {
                const validation = validateStep(step, data);
                const completion = calculateStepCompletion(step, data);

                newValidation[step] = validation.success;
                newCompletion[step] = completion;
            }

            setStepValidation(newValidation);
            setStepCompletion(newCompletion);
        },
        [calculateStepCompletion]
    );

    // Add state to history
    const addToHistory = useCallback(
        (formData: Partial<PropertyFormData>, currentStep: number) => {
            const snapshot: WizardStateSnapshot = {
                formData: JSON.parse(JSON.stringify(formData)), // Deep clone
                currentStep,
                timestamp: Date.now(),
            };

            setHistory((prev) => {
                // Remove any history after current index (when making new changes after undo)
                const newHistory = prev.slice(0, historyIndex + 1);
                newHistory.push(snapshot);

                // Limit history size
                if (newHistory.length > maxHistorySize) {
                    newHistory.shift();
                    setHistoryIndex((prevIndex) => Math.max(0, prevIndex - 1));
                } else {
                    setHistoryIndex(newHistory.length - 1);
                }

                return newHistory;
            });
        },
        [historyIndex, maxHistorySize]
    );

    // Update form data with history tracking
    const updateFormData = useCallback(
        (newData: Partial<PropertyFormData>, trackHistory: boolean = true) => {
            setWizardState((prev) => {
                const updatedData = { ...prev.formData, ...newData };

                // Update step metrics
                updateStepMetrics(updatedData);

                // Add to history if requested
                if (trackHistory) {
                    addToHistory(updatedData, prev.currentStep);
                }

                // Call onUpdate callback if provided
                if (onUpdate) {
                    onUpdate(updatedData);
                }

                return {
                    ...prev,
                    formData: updatedData,
                    isDirty: true,
                    errors: {}, // Clear errors when data changes
                };
            });
        },
        [updateStepMetrics, addToHistory]
    );

    // Navigate to step with validation
    const goToStep = useCallback(
        (step: number, trackHistory: boolean = true) => {
            if (step >= 1 && step <= 4) {
                setWizardState((prev) => {
                    if (trackHistory) {
                        addToHistory(prev.formData, step);
                    }

                    return {
                        ...prev,
                        currentStep: step,
                        errors: {},
                    };
                });
            }
        },
        [addToHistory]
    );

    // Navigate to next step
    const goToNextStep = useCallback(() => {
        const currentStep = wizardState.currentStep;
        const validation = validateStep(currentStep, wizardState.formData);

        if (validation.success && currentStep < 4) {
            goToStep(currentStep + 1);
        } else if (!validation.success) {
            setWizardState((prev) => ({
                ...prev,
                errors: validation.errors || {},
            }));
        }
    }, [wizardState.currentStep, wizardState.formData, goToStep]);

    // Navigate to previous step
    const goToPreviousStep = useCallback(() => {
        if (wizardState.currentStep > 1) {
            goToStep(wizardState.currentStep - 1);
        }
    }, [wizardState.currentStep, goToStep]);

    // Undo functionality
    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            const snapshot = history[newIndex];

            setHistoryIndex(newIndex);
            setWizardState((prev) => ({
                ...prev,
                formData: snapshot.formData,
                currentStep: snapshot.currentStep,
                isDirty: true,
                errors: {},
            }));

            updateStepMetrics(snapshot.formData);
        }
    }, [historyIndex, history, updateStepMetrics]);

    // Redo functionality
    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            const snapshot = history[newIndex];

            setHistoryIndex(newIndex);
            setWizardState((prev) => ({
                ...prev,
                formData: snapshot.formData,
                currentStep: snapshot.currentStep,
                isDirty: true,
                errors: {},
            }));

            updateStepMetrics(snapshot.formData);
        }
    }, [historyIndex, history, updateStepMetrics]);

    // Set loading state
    const setLoading = useCallback((loading: boolean) => {
        setWizardState((prev) => ({ ...prev, isLoading: loading }));
    }, []);

    // Set errors
    const setErrors = useCallback((errors: Record<string, string>) => {
        setWizardState((prev) => ({ ...prev, errors }));
    }, []);

    // Clear dirty state (after successful save)
    const clearDirtyState = useCallback(() => {
        setWizardState((prev) => ({ ...prev, isDirty: false }));
    }, []);

    // Auto-save functionality with persistence
    useEffect(() => {
        if (wizardState.isDirty && Object.keys(wizardState.formData).length > 0) {
            if (autoSaveTimer.current) {
                clearTimeout(autoSaveTimer.current);
            }

            autoSaveTimer.current = setTimeout(async () => {
                try {
                    // Save to localStorage for immediate persistence
                    WizardPersistence.saveWizardData(wizardState.formData, wizardState.currentStep);

                    // Save to server if callback provided
                    if (onAutoSave) {
                        await onAutoSave(wizardState.formData);
                    }

                    clearDirtyState();
                } catch (error) {
                    console.error("Auto-save failed:", error);
                }
            }, autoSaveInterval);
        }

        return () => {
            if (autoSaveTimer.current) {
                clearTimeout(autoSaveTimer.current);
            }
        };
    }, [wizardState.isDirty, wizardState.formData, wizardState.currentStep, onAutoSave, autoSaveInterval, clearDirtyState]);

    // Initialize step metrics
    useEffect(() => {
        updateStepMetrics(wizardState.formData);
    }, [updateStepMetrics, wizardState.formData]);

    // Load persisted data on initialization
    useEffect(() => {
        const persistedData = WizardPersistence.loadWizardData();
        if (persistedData && Object.keys(initialData).length === 0) {
            // Only load persisted data if no initial data was provided
            setWizardState((prev) => ({
                ...prev,
                formData: { ...persistedData.formData, language: "es" },
                currentStep: persistedData.currentStep,
            }));
        }
    }, []); // Only run on mount

    // Set default language to Spanish
    useEffect(() => {
        updateFormData({ language: "es" }, false);
    }, [updateFormData]);

    return {
        // State
        wizardState,
        stepValidation,
        stepCompletion,

        // Navigation
        goToStep,
        goToNextStep,
        goToPreviousStep,

        // Data management
        updateFormData,

        // History management
        undo,
        redo,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,

        // Utility functions
        setLoading,
        setErrors,
        clearDirtyState,
    };
}