import { wizardAnalytics, WizardEventType } from '../wizard-analytics-service';

// Mock fetch for testing
global.fetch = jest.fn();

describe('WizardAnalyticsService', () => {
    beforeEach(() => {
        // Clear events before each test
        wizardAnalytics.clearEvents();
        (fetch as jest.Mock).mockClear();
    });

    afterEach(() => {
        // Reset fetch mock
        (fetch as jest.Mock).mockReset();
    });

    describe('Event Tracking', () => {
        it('should track step completion events', () => {
            const stepNumber = 1;
            const timeSpent = 5000;
            const data = { formValid: true };

            wizardAnalytics.trackStepCompletion(stepNumber, timeSpent, data);

            const events = wizardAnalytics.exportEvents();
            expect(events).toHaveLength(1);
            expect(events[0]).toMatchObject({
                eventType: WizardEventType.STEP_COMPLETED,
                stepNumber,
                data: {
                    timeSpent,
                    ...data
                }
            });
        });

        it('should track AI generation events', () => {
            const type = 'title';
            const metrics = {
                model: 'test-model',
                inputTokens: 100,
                outputTokens: 50,
                responseTime: 1500,
                success: true
            };

            wizardAnalytics.trackAIGeneration(type, metrics);

            const events = wizardAnalytics.exportEvents();
            expect(events).toHaveLength(1);
            expect(events[0]).toMatchObject({
                eventType: WizardEventType.AI_GENERATION_SUCCESS,
                data: {
                    generationType: type,
                    ...metrics
                }
            });
        });

        it('should track upload events', () => {
            const metrics = {
                fileSize: 1024000,
                fileType: 'image/jpeg',
                uploadTime: 2000,
                success: true
            };

            wizardAnalytics.trackUpload(metrics);

            const events = wizardAnalytics.exportEvents();
            expect(events).toHaveLength(1);
            expect(events[0]).toMatchObject({
                eventType: WizardEventType.UPLOAD_SUCCESS,
                data: metrics
            });
        });

        it('should track external service calls', () => {
            const service = 'huggingface';
            const success = true;
            const responseTime = 1200;

            wizardAnalytics.trackExternalServiceCall(service, success, responseTime);

            const events = wizardAnalytics.exportEvents();
            expect(events).toHaveLength(1);
            expect(events[0]).toMatchObject({
                eventType: WizardEventType.EXTERNAL_SERVICE_CALL,
                data: {
                    service,
                    responseTime
                }
            });
        });

        it('should track errors with context', () => {
            const error = new Error('Test error');
            const context = { component: 'TestComponent', stepNumber: 2 };

            wizardAnalytics.trackError(error, context);

            const events = wizardAnalytics.exportEvents();
            expect(events).toHaveLength(1);
            expect(events[0]).toMatchObject({
                eventType: WizardEventType.ERROR_OCCURRED,
                data: {
                    errorMessage: 'Test error',
                    errorName: 'Error',
                    ...context
                }
            });
        });
    });

    describe('Performance Metrics', () => {
        it('should track performance metrics', () => {
            const metric = {
                metricName: 'component_render',
                value: 150,
                unit: 'ms' as const,
                context: { component: 'TestComponent' }
            };

            wizardAnalytics.trackPerformanceMetric(metric);

            const events = wizardAnalytics.exportEvents();
            expect(events).toHaveLength(1);
            expect(events[0]).toMatchObject({
                eventType: WizardEventType.PERFORMANCE_METRIC,
                data: metric
            });
        });
    });

    describe('Session Management', () => {
        it('should generate unique session IDs', () => {
            const summary1 = wizardAnalytics.getSessionSummary();
            wizardAnalytics.clearEvents();

            // Create new instance to get new session ID
            const newAnalytics = new (wizardAnalytics.constructor as any)();
            const summary2 = newAnalytics.getSessionSummary();

            expect(summary1.sessionId).not.toBe(summary2.sessionId);
        });

        it('should track user ID when set', () => {
            const userId = 'test-user-123';
            wizardAnalytics.setUserId(userId);

            wizardAnalytics.trackEvent(WizardEventType.STEP_STARTED, {}, 1);

            const events = wizardAnalytics.exportEvents();
            expect(events[0].userId).toBe(userId);
        });

        it('should provide session summary', () => {
            // Track some events
            wizardAnalytics.trackStepCompletion(1, 1000);
            wizardAnalytics.trackStepCompletion(2, 2000);
            wizardAnalytics.trackAIGeneration('title', {
                model: 'test',
                inputTokens: 10,
                outputTokens: 5,
                responseTime: 500,
                success: true
            });
            wizardAnalytics.trackError(new Error('Test'));

            const summary = wizardAnalytics.getSessionSummary();

            expect(summary).toMatchObject({
                totalEvents: expect.any(Number),
                stepsCompleted: 2,
                aiGenerationsSuccessful: 1,
                errors: 1
            });
            expect(summary.totalEvents).toBeGreaterThan(0);
        });
    });

    describe('Event Filtering and Control', () => {
        it('should not track events when disabled', () => {
            wizardAnalytics.setEnabled(false);
            wizardAnalytics.trackEvent(WizardEventType.STEP_STARTED, {}, 1);

            const events = wizardAnalytics.exportEvents();
            expect(events).toHaveLength(0);
        });

        it('should resume tracking when re-enabled', () => {
            wizardAnalytics.setEnabled(false);
            wizardAnalytics.trackEvent(WizardEventType.STEP_STARTED, {}, 1);

            wizardAnalytics.setEnabled(true);
            wizardAnalytics.trackEvent(WizardEventType.STEP_COMPLETED, {}, 1);

            const events = wizardAnalytics.exportEvents();
            expect(events).toHaveLength(1);
            expect(events[0].eventType).toBe(WizardEventType.STEP_COMPLETED);
        });

        it('should clear events when requested', () => {
            wizardAnalytics.trackEvent(WizardEventType.STEP_STARTED, {}, 1);
            wizardAnalytics.trackEvent(WizardEventType.STEP_COMPLETED, {}, 1);

            expect(wizardAnalytics.exportEvents()).toHaveLength(2);

            wizardAnalytics.clearEvents();

            expect(wizardAnalytics.exportEvents()).toHaveLength(0);
        });
    });

    describe('Server Communication', () => {
        it('should send events to server endpoint', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            });

            wizardAnalytics.trackEvent(WizardEventType.STEP_STARTED, {}, 1);

            // Wait for async operation
            await new Promise(resolve => setTimeout(resolve, 0));

            expect(fetch).toHaveBeenCalledWith('/api/analytics/wizard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: expect.stringContaining('step_started')
            });
        });

        it('should handle server errors gracefully', async () => {
            (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            // Should not throw
            expect(() => {
                wizardAnalytics.trackEvent(WizardEventType.STEP_STARTED, {}, 1);
            }).not.toThrow();
        });
    });
});