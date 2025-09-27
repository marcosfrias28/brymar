import { renderHook, act } from '@testing-library/react';
import { useWizardAnalytics } from '../use-wizard-analytics';
import { wizardAnalytics, WizardEventType } from '@/lib/services/wizard-analytics-service';

// Mock the analytics service
jest.mock('@/lib/services/wizard-analytics-service', () => ({
    wizardAnalytics: {
        setUserId: jest.fn(),
        setEnabled: jest.fn(),
        trackEvent: jest.fn(),
        trackStepCompletion: jest.fn(),
        trackAIGeneration: jest.fn(),
        trackUpload: jest.fn(),
        trackPerformanceMetric: jest.fn(),
        trackExternalServiceCall: jest.fn(),
        trackError: jest.fn(),
        getSessionSummary: jest.fn(() => ({
            sessionId: 'test-session',
            totalEvents: 5,
            stepsCompleted: 2
        })),
        clearEvents: jest.fn(),
        exportEvents: jest.fn(() => [])
    },
    WizardEventType: {
        STEP_STARTED: 'step_started',
        STEP_COMPLETED: 'step_completed',
        STEP_VALIDATION_FAILED: 'step_validation_failed',
        WIZARD_COMPLETED: 'wizard_completed',
        WIZARD_ABANDONED: 'wizard_abandoned',
        AI_GENERATION_REQUESTED: 'ai_generation_requested',
        AI_GENERATION_SUCCESS: 'ai_generation_success',
        AI_GENERATION_FAILED: 'ai_generation_failed',
        UPLOAD_STARTED: 'upload_started',
        UPLOAD_SUCCESS: 'upload_success',
        UPLOAD_FAILED: 'upload_failed',
        UPLOAD_PROGRESS: 'upload_progress',
        FIELD_FOCUSED: 'field_focused',
        FIELD_CHANGED: 'field_changed',
        NAVIGATION_ATTEMPTED: 'navigation_attempted',
        DRAFT_SAVED: 'draft_saved',
        DRAFT_LOADED: 'draft_loaded',
        PERFORMANCE_METRIC: 'performance_metric',
        ERROR_OCCURRED: 'error_occurred',
        EXTERNAL_SERVICE_CALL: 'external_service_call',
        EXTERNAL_SERVICE_ERROR: 'external_service_error'
    }
}));

// Mock the user hook
jest.mock('@/hooks/use-user', () => ({
    useUser: () => ({
        user: { id: 'test-user-123' }
    })
}));

describe('useWizardAnalytics', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Initialization', () => {
        it('should initialize with default options', () => {
            renderHook(() => useWizardAnalytics());

            expect(wizardAnalytics.setUserId).toHaveBeenCalledWith('test-user-123');
            expect(wizardAnalytics.setEnabled).toHaveBeenCalledWith(true);
        });

        it('should respect enabled option', () => {
            renderHook(() => useWizardAnalytics({ enabled: false }));

            expect(wizardAnalytics.setEnabled).toHaveBeenCalledWith(false);
        });
    });

    describe('Step Tracking', () => {
        it('should track step start', () => {
            const { result } = renderHook(() => useWizardAnalytics());

            act(() => {
                result.current.trackStepStart(1, { formData: 'test' });
            });

            expect(wizardAnalytics.trackEvent).toHaveBeenCalledWith(
                WizardEventType.STEP_STARTED,
                { formData: 'test' },
                1
            );
        });

        it('should track step completion with time calculation', () => {
            const { result } = renderHook(() => useWizardAnalytics());

            act(() => {
                result.current.trackStepStart(1);
            });

            // Simulate time passing
            jest.advanceTimersByTime(5000);

            act(() => {
                result.current.trackStepComplete(1, { success: true });
            });

            expect(wizardAnalytics.trackStepCompletion).toHaveBeenCalledWith(
                1,
                expect.any(Number),
                { success: true }
            );
        });

        it('should track step validation failures', () => {
            const { result } = renderHook(() => useWizardAnalytics());
            const errors = { title: ['Required field'] };

            act(() => {
                result.current.trackStepValidationFailed(1, errors);
            });

            expect(wizardAnalytics.trackEvent).toHaveBeenCalledWith(
                WizardEventType.STEP_VALIDATION_FAILED,
                {
                    errors,
                    errorCount: 1
                },
                1
            );
        });
    });

    describe('Wizard Completion', () => {
        it('should track wizard completion', () => {
            const { result } = renderHook(() => useWizardAnalytics());

            act(() => {
                result.current.trackWizardComplete({ propertyId: '123' });
            });

            expect(wizardAnalytics.trackEvent).toHaveBeenCalledWith(
                WizardEventType.WIZARD_COMPLETED,
                expect.objectContaining({
                    propertyId: '123',
                    sessionSummary: expect.any(Object)
                })
            );
        });

        it('should track wizard abandonment', () => {
            const { result } = renderHook(() => useWizardAnalytics());

            act(() => {
                result.current.trackWizardAbandoned(2, 'User closed browser');
            });

            expect(wizardAnalytics.trackEvent).toHaveBeenCalledWith(
                WizardEventType.WIZARD_ABANDONED,
                expect.objectContaining({
                    reason: 'User closed browser',
                    sessionSummary: expect.any(Object)
                }),
                2
            );
        });
    });

    describe('AI Generation Tracking', () => {
        it('should track AI generation requests', () => {
            const { result } = renderHook(() => useWizardAnalytics());
            const inputData = { propertyType: 'house', price: 100000 };

            act(() => {
                result.current.trackAIGenerationRequest('title', inputData);
            });

            expect(wizardAnalytics.trackEvent).toHaveBeenCalledWith(
                WizardEventType.AI_GENERATION_REQUESTED,
                {
                    generationType: 'title',
                    inputData
                }
            );
        });

        it('should track AI generation results', () => {
            const { result } = renderHook(() => useWizardAnalytics());
            const metrics = {
                model: 'test-model',
                inputTokens: 100,
                outputTokens: 50,
                responseTime: 1500,
                success: true
            };

            act(() => {
                result.current.trackAIGenerationResult('description', metrics);
            });

            expect(wizardAnalytics.trackAIGeneration).toHaveBeenCalledWith('description', metrics);
        });
    });

    describe('Upload Tracking', () => {
        it('should track upload start', () => {
            const { result } = renderHook(() => useWizardAnalytics());

            act(() => {
                result.current.trackUploadStart(3, 5000000);
            });

            expect(wizardAnalytics.trackEvent).toHaveBeenCalledWith(
                WizardEventType.UPLOAD_STARTED,
                {
                    fileCount: 3,
                    totalSize: 5000000
                }
            );
        });

        it('should track upload results', () => {
            const { result } = renderHook(() => useWizardAnalytics());
            const metrics = {
                fileSize: 1024000,
                fileType: 'image/jpeg',
                uploadTime: 2000,
                success: true
            };

            act(() => {
                result.current.trackUploadResult(metrics);
            });

            expect(wizardAnalytics.trackUpload).toHaveBeenCalledWith(metrics);
        });

        it('should track upload progress', () => {
            const { result } = renderHook(() => useWizardAnalytics());

            act(() => {
                result.current.trackUploadProgress('test.jpg', 50, 512000);
            });

            expect(wizardAnalytics.trackEvent).toHaveBeenCalledWith(
                WizardEventType.UPLOAD_PROGRESS,
                {
                    fileName: 'test.jpg',
                    progress: 50,
                    uploadedBytes: 512000
                }
            );
        });
    });

    describe('User Behavior Tracking', () => {
        it('should track field focus', () => {
            const { result } = renderHook(() => useWizardAnalytics());

            act(() => {
                result.current.trackFieldFocus('title');
            });

            expect(wizardAnalytics.trackEvent).toHaveBeenCalledWith(
                WizardEventType.FIELD_FOCUSED,
                { fieldName: 'title' }
            );
        });

        it('should track field changes with timing', () => {
            const { result } = renderHook(() => useWizardAnalytics());

            act(() => {
                result.current.trackFieldFocus('title');
            });

            jest.advanceTimersByTime(2000);

            act(() => {
                result.current.trackFieldChange('title', 25, false);
            });

            expect(wizardAnalytics.trackEvent).toHaveBeenCalledWith(
                WizardEventType.FIELD_CHANGED,
                {
                    fieldName: 'title',
                    valueLength: 25,
                    timeToChange: expect.any(Number),
                    isAIGenerated: false
                }
            );
        });

        it('should not track user behavior when disabled', () => {
            const { result } = renderHook(() =>
                useWizardAnalytics({ trackUserBehavior: false })
            );

            act(() => {
                result.current.trackFieldFocus('title');
            });

            expect(wizardAnalytics.trackEvent).not.toHaveBeenCalled();
        });
    });

    describe('Performance Tracking', () => {
        it('should track performance metrics', () => {
            const { result } = renderHook(() => useWizardAnalytics());
            const metric = {
                metricName: 'component_render',
                value: 150,
                unit: 'ms' as const
            };

            act(() => {
                result.current.trackPerformanceMetric(metric);
            });

            expect(wizardAnalytics.trackPerformanceMetric).toHaveBeenCalledWith(metric);
        });

        it('should provide performance measurement utility', () => {
            const { result } = renderHook(() => useWizardAnalytics());

            let endMeasurement: (() => void) | undefined;

            act(() => {
                endMeasurement = result.current.measurePerformance('test_operation');
            });

            expect(endMeasurement).toBeInstanceOf(Function);

            act(() => {
                endMeasurement!();
            });

            expect(wizardAnalytics.trackPerformanceMetric).toHaveBeenCalledWith({
                metricName: 'test_operation',
                value: expect.any(Number),
                unit: 'ms'
            });
        });

        it('should not track performance when disabled', () => {
            const { result } = renderHook(() =>
                useWizardAnalytics({ trackPerformance: false })
            );

            act(() => {
                const endMeasurement = result.current.measurePerformance('test');
                endMeasurement();
            });

            expect(wizardAnalytics.trackPerformanceMetric).not.toHaveBeenCalled();
        });
    });

    describe('Error Tracking', () => {
        it('should track errors with context', () => {
            const { result } = renderHook(() => useWizardAnalytics());
            const error = new Error('Test error');
            const context = { component: 'TestComponent' };

            act(() => {
                result.current.trackError(error, context);
            });

            expect(wizardAnalytics.trackError).toHaveBeenCalledWith(error, context);
        });
    });

    describe('External Service Tracking', () => {
        it('should track external service calls', () => {
            const { result } = renderHook(() => useWizardAnalytics());

            act(() => {
                result.current.trackExternalServiceCall('huggingface', true, 1200);
            });

            expect(wizardAnalytics.trackExternalServiceCall).toHaveBeenCalledWith(
                'huggingface',
                true,
                1200,
                undefined
            );
        });
    });

    describe('Utilities', () => {
        it('should provide session summary', () => {
            const { result } = renderHook(() => useWizardAnalytics());

            const summary = result.current.getSessionSummary();

            expect(summary).toEqual({
                sessionId: 'test-session',
                totalEvents: 5,
                stepsCompleted: 2
            });
        });

        it('should clear analytics data', () => {
            const { result } = renderHook(() => useWizardAnalytics());

            act(() => {
                result.current.clearAnalytics();
            });

            expect(wizardAnalytics.clearEvents).toHaveBeenCalled();
        });
    });

    describe('Disabled State', () => {
        it('should not track events when analytics is disabled', () => {
            const { result } = renderHook(() => useWizardAnalytics({ enabled: false }));

            act(() => {
                result.current.trackStepStart(1);
                result.current.trackStepComplete(1);
                result.current.trackAIGenerationRequest('title', {});
            });

            expect(wizardAnalytics.trackEvent).not.toHaveBeenCalled();
            expect(wizardAnalytics.trackStepCompletion).not.toHaveBeenCalled();
        });
    });
});