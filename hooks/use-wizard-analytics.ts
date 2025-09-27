'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useUser } from '@/hooks/use-user';
import {
    wizardAnalytics,
    WizardEventType,
    PerformanceMetric,
    AIGenerationMetrics,
    UploadMetrics
} from '@/lib/services/wizard-analytics-service';

interface UseWizardAnalyticsOptions {
    enabled?: boolean;
    trackPerformance?: boolean;
    trackUserBehavior?: boolean;
}

export function useWizardAnalytics(options: UseWizardAnalyticsOptions = {}) {
    const {
        enabled = true,
        trackPerformance = true,
        trackUserBehavior = true
    } = options;

    const { user } = useUser();
    const stepStartTimes = useRef<Record<number, number>>({});
    const fieldInteractionTimes = useRef<Record<string, number>>({});

    useEffect(() => {
        if (enabled && user?.id) {
            wizardAnalytics.setUserId(user.id);
        }
        wizardAnalytics.setEnabled(enabled);
    }, [enabled, user?.id]);

    // Track step navigation
    const trackStepStart = useCallback((stepNumber: number, data: Record<string, any> = {}) => {
        if (!enabled) return;

        stepStartTimes.current[stepNumber] = Date.now();
        wizardAnalytics.trackEvent(WizardEventType.STEP_STARTED, data, stepNumber);
    }, [enabled]);

    const trackStepComplete = useCallback((stepNumber: number, data: Record<string, any> = {}) => {
        if (!enabled) return;

        const startTime = stepStartTimes.current[stepNumber];
        const timeSpent = startTime ? Date.now() - startTime : 0;

        wizardAnalytics.trackStepCompletion(stepNumber, timeSpent, data);
        delete stepStartTimes.current[stepNumber];
    }, [enabled]);

    const trackStepValidationFailed = useCallback((
        stepNumber: number,
        errors: Record<string, string[]>
    ) => {
        if (!enabled) return;

        wizardAnalytics.trackEvent(WizardEventType.STEP_VALIDATION_FAILED, {
            errors,
            errorCount: Object.keys(errors).length
        }, stepNumber);
    }, [enabled]);

    // Track wizard completion
    const trackWizardComplete = useCallback((data: Record<string, any> = {}) => {
        if (!enabled) return;

        const sessionSummary = wizardAnalytics.getSessionSummary();
        wizardAnalytics.trackEvent(WizardEventType.WIZARD_COMPLETED, {
            ...data,
            sessionSummary
        });
    }, [enabled]);

    const trackWizardAbandoned = useCallback((
        stepNumber: number,
        reason?: string
    ) => {
        if (!enabled) return;

        wizardAnalytics.trackEvent(WizardEventType.WIZARD_ABANDONED, {
            reason,
            sessionSummary: wizardAnalytics.getSessionSummary()
        }, stepNumber);
    }, [enabled]);

    // Track AI generation
    const trackAIGenerationRequest = useCallback((
        type: 'title' | 'description' | 'tags',
        inputData: Record<string, any>
    ) => {
        if (!enabled) return;

        wizardAnalytics.trackEvent(WizardEventType.AI_GENERATION_REQUESTED, {
            generationType: type,
            inputData
        });
    }, [enabled]);

    const trackAIGenerationResult = useCallback((
        type: 'title' | 'description' | 'tags',
        metrics: AIGenerationMetrics
    ) => {
        if (!enabled) return;

        wizardAnalytics.trackAIGeneration(type, metrics);
    }, [enabled]);

    // Track uploads
    const trackUploadStart = useCallback((fileCount: number, totalSize: number) => {
        if (!enabled) return;

        wizardAnalytics.trackEvent(WizardEventType.UPLOAD_STARTED, {
            fileCount,
            totalSize
        });
    }, [enabled]);

    const trackUploadResult = useCallback((metrics: UploadMetrics) => {
        if (!enabled) return;

        wizardAnalytics.trackUpload(metrics);
    }, [enabled]);

    const trackUploadProgress = useCallback((
        fileName: string,
        progress: number,
        uploadedBytes: number
    ) => {
        if (!enabled) return;

        wizardAnalytics.trackEvent(WizardEventType.UPLOAD_PROGRESS, {
            fileName,
            progress,
            uploadedBytes
        });
    }, [enabled]);

    // Track user behavior
    const trackFieldFocus = useCallback((fieldName: string) => {
        if (!enabled || !trackUserBehavior) return;

        fieldInteractionTimes.current[fieldName] = Date.now();
        wizardAnalytics.trackEvent(WizardEventType.FIELD_FOCUSED, {
            fieldName
        });
    }, [enabled, trackUserBehavior]);

    const trackFieldChange = useCallback((
        fieldName: string,
        valueLength: number,
        isAIGenerated: boolean = false
    ) => {
        if (!enabled || !trackUserBehavior) return;

        const focusTime = fieldInteractionTimes.current[fieldName];
        const timeToChange = focusTime ? Date.now() - focusTime : 0;

        wizardAnalytics.trackEvent(WizardEventType.FIELD_CHANGED, {
            fieldName,
            valueLength,
            timeToChange,
            isAIGenerated
        });
    }, [enabled, trackUserBehavior]);

    const trackNavigationAttempt = useCallback((
        fromStep: number,
        toStep: number,
        successful: boolean,
        reason?: string
    ) => {
        if (!enabled) return;

        wizardAnalytics.trackEvent(WizardEventType.NAVIGATION_ATTEMPTED, {
            fromStep,
            toStep,
            successful,
            reason
        });
    }, [enabled]);

    // Track draft operations
    const trackDraftSaved = useCallback((
        draftId: string,
        completionPercentage: number,
        stepNumber: number
    ) => {
        if (!enabled) return;

        wizardAnalytics.trackEvent(WizardEventType.DRAFT_SAVED, {
            draftId,
            completionPercentage
        }, stepNumber);
    }, [enabled]);

    const trackDraftLoaded = useCallback((
        draftId: string,
        stepNumber: number,
        completionPercentage: number
    ) => {
        if (!enabled) return;

        wizardAnalytics.trackEvent(WizardEventType.DRAFT_LOADED, {
            draftId,
            completionPercentage
        }, stepNumber);
    }, [enabled]);

    // Track performance metrics
    const trackPerformanceMetric = useCallback((metric: PerformanceMetric) => {
        if (!enabled || !trackPerformance) return;

        wizardAnalytics.trackPerformanceMetric(metric);
    }, [enabled, trackPerformance]);

    // Track external service calls
    const trackExternalServiceCall = useCallback((
        service: 'huggingface' | 'vercel_blob' | 'geocoding',
        success: boolean,
        responseTime: number,
        errorType?: string
    ) => {
        if (!enabled) return;

        wizardAnalytics.trackExternalServiceCall(service, success, responseTime, errorType);
    }, [enabled]);

    // Track errors
    const trackError = useCallback((
        error: Error,
        context: Record<string, any> = {}
    ) => {
        if (!enabled) return;

        wizardAnalytics.trackError(error, context);
    }, [enabled]);

    // Performance measurement utilities
    const measurePerformance = useCallback((name: string) => {
        if (!enabled || !trackPerformance) return () => { };

        const startTime = performance.now();

        return () => {
            const duration = performance.now() - startTime;
            trackPerformanceMetric({
                metricName: name,
                value: duration,
                unit: 'ms'
            });
        };
    }, [enabled, trackPerformance, trackPerformanceMetric]);

    // Get session summary
    const getSessionSummary = useCallback(() => {
        return wizardAnalytics.getSessionSummary();
    }, []);

    // Clear analytics data (for testing or privacy)
    const clearAnalytics = useCallback(() => {
        wizardAnalytics.clearEvents();
        stepStartTimes.current = {};
        fieldInteractionTimes.current = {};
    }, []);

    return {
        // Step tracking
        trackStepStart,
        trackStepComplete,
        trackStepValidationFailed,

        // Wizard completion
        trackWizardComplete,
        trackWizardAbandoned,

        // AI generation
        trackAIGenerationRequest,
        trackAIGenerationResult,

        // Upload tracking
        trackUploadStart,
        trackUploadResult,
        trackUploadProgress,

        // User behavior
        trackFieldFocus,
        trackFieldChange,
        trackNavigationAttempt,

        // Draft operations
        trackDraftSaved,
        trackDraftLoaded,

        // Performance and errors
        trackPerformanceMetric,
        trackExternalServiceCall,
        trackError,
        measurePerformance,

        // Utilities
        getSessionSummary,
        clearAnalytics,

        // State
        enabled
    };
}