"use client";

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { WizardError, AIServiceError, UploadError, ValidationError, NetworkError } from '../lib/errors/wizard-errors';
import { handleErrorWithRecovery, autoRetryWithRecovery } from '../lib/utils/error-recovery';
import { useNetworkStatus, useOfflineQueue } from '../lib/utils/network-detection';

export interface ErrorState {
    error: WizardError | null;
    isRetrying: boolean;
    retryCount: number;
    canRetry: boolean;
}

export interface ErrorHandlingOptions {
    maxRetries?: number;
    showToast?: boolean;
    autoRetry?: boolean;
    context?: string;
    onError?: (error: WizardError) => void;
    onRetry?: (attempt: number) => void;
    onRecover?: () => void;
}

export function useErrorHandling(options: ErrorHandlingOptions = {}) {
    const [errorState, setErrorState] = useState<ErrorState>({
        error: null,
        isRetrying: false,
        retryCount: 0,
        canRetry: false
    });

    const networkStatus = useNetworkStatus();
    const { queueOperation } = useOfflineQueue();

    const clearError = useCallback(() => {
        setErrorState({
            error: null,
            isRetrying: false,
            retryCount: 0,
            canRetry: false
        });

        if (options.onRecover) {
            options.onRecover();
        }
    }, [options]);

    const handleError = useCallback((error: unknown, context?: string) => {
        const wizardError = error instanceof WizardError
            ? error
            : new WizardError(
                error instanceof Error ? error.message : String(error),
                'UNKNOWN_ERROR',
                true,
                'Ha ocurrido un error inesperado.'
            );

        const recovery = handleErrorWithRecovery(wizardError, {
            ...options,
            context: context || options.context,
            showToast: options.showToast !== false
        });

        setErrorState(prev => ({
            error: wizardError,
            isRetrying: false,
            retryCount: prev.retryCount,
            canRetry: recovery.canAutoRecover
        }));

        if (options.onError) {
            options.onError(wizardError);
        }

        return wizardError;
    }, [options]);

    const retryOperation = useCallback(async <T>(
        operation: () => Promise<T>,
        context?: string
    ): Promise<T> => {
        if (!errorState.canRetry) {
            throw errorState.error || new Error('Operation cannot be retried');
        }

        setErrorState(prev => ({
            ...prev,
            isRetrying: true,
            retryCount: prev.retryCount + 1
        }));

        if (options.onRetry) {
            options.onRetry(errorState.retryCount + 1);
        }

        try {
            const result = await operation();
            clearError();
            return result;
        } catch (error) {
            const wizardError = handleError(error, context);
            setErrorState(prev => ({
                ...prev,
                isRetrying: false
            }));
            throw wizardError;
        }
    }, [errorState, options, handleError, clearError]);

    const executeWithErrorHandling = useCallback(async <T>(
        operation: () => Promise<T>,
        operationOptions: {
            context?: string;
            fallback?: () => T;
            queueIfOffline?: boolean;
            queueType?: 'draft' | 'upload' | 'ai' | 'general';
            queueDescription?: string;
        } = {}
    ): Promise<T> => {
        try {
            // Check if we should queue the operation when offline
            if (operationOptions.queueIfOffline && !networkStatus.isOnline) {
                const queueId = await queueOperation(operation, {
                    type: operationOptions.queueType || 'general',
                    description: operationOptions.queueDescription || 'Operación pendiente',
                    maxRetries: options.maxRetries || 3
                });

                toast.info('Operación guardada para cuando se restaure la conexión');

                if (operationOptions.fallback) {
                    return operationOptions.fallback();
                }

                throw new NetworkError('Operación no disponible sin conexión');
            }

            if (options.autoRetry) {
                return await autoRetryWithRecovery(operation, {
                    ...options,
                    context: operationOptions.context
                });
            }

            return await operation();
        } catch (error) {
            handleError(error, operationOptions.context);

            if (operationOptions.fallback) {
                return operationOptions.fallback();
            }

            throw error;
        }
    }, [networkStatus.isOnline, queueOperation, options, handleError]);

    // Auto-clear errors when network comes back online
    useEffect(() => {
        if (networkStatus.isOnline && errorState.error instanceof NetworkError) {
            clearError();
        }
    }, [networkStatus.isOnline, errorState.error, clearError]);

    return {
        errorState,
        handleError,
        clearError,
        retryOperation,
        executeWithErrorHandling,
        isOnline: networkStatus.isOnline
    };
}

// Specialized hooks for different types of operations

export function useAIErrorHandling() {
    return useErrorHandling({
        maxRetries: 3,
        autoRetry: true,
        context: 'AI Generation',
        showToast: true
    });
}

export function useUploadErrorHandling() {
    return useErrorHandling({
        maxRetries: 2,
        autoRetry: false,
        context: 'File Upload',
        showToast: true
    });
}

export function useDraftErrorHandling() {
    return useErrorHandling({
        maxRetries: 2,
        autoRetry: true,
        context: 'Draft Management',
        showToast: true
    });
}

export function useValidationErrorHandling() {
    return useErrorHandling({
        maxRetries: 0,
        autoRetry: false,
        context: 'Form Validation',
        showToast: false // Validation errors are shown inline
    });
}

// Hook for handling specific error types with custom recovery
export function useErrorRecovery() {
    const handleAIError = useCallback((error: AIServiceError, fallbackContent?: string) => {
        const recovery = handleErrorWithRecovery(error, {
            context: 'AI Service',
            customActions: fallbackContent ? [{
                label: 'Usar contenido predeterminado',
                action: () => {
                    toast.success('Usando contenido predeterminado');
                },
                primary: true
            }] : undefined
        });

        return {
            shouldUseFallback: error.code === 'RATE_LIMIT' || error.code === 'API_ERROR',
            fallbackContent,
            recovery
        };
    }, []);

    const handleUploadError = useCallback((error: UploadError, file?: File) => {
        const recovery = handleErrorWithRecovery(error, {
            context: 'File Upload',
            customActions: [{
                label: 'Seleccionar otro archivo',
                action: () => {
                    // This would trigger file selection
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.click();
                },
                primary: error.code === 'INVALID_TYPE' || error.code === 'FILE_TOO_LARGE'
            }]
        });

        return {
            shouldRetry: error.retryable,
            canSelectNewFile: error.code === 'INVALID_TYPE' || error.code === 'FILE_TOO_LARGE',
            recovery
        };
    }, []);

    const handleValidationError = useCallback((error: ValidationError) => {
        const fieldCount = Object.keys(error.fieldErrors).length;

        // Focus on first error field
        const firstField = Object.keys(error.fieldErrors)[0];
        const element = document.querySelector(`[name="${firstField}"]`) as HTMLElement;

        if (element) {
            element.focus();
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        toast.error(`Por favor corrige ${fieldCount} campo${fieldCount > 1 ? 's' : ''}`);

        return {
            fieldErrors: error.fieldErrors,
            firstErrorField: firstField
        };
    }, []);

    return {
        handleAIError,
        handleUploadError,
        handleValidationError
    };
}

// Hook for monitoring error patterns and suggesting improvements
export function useErrorAnalytics() {
    const [errorHistory, setErrorHistory] = useState<Array<{
        error: WizardError;
        timestamp: number;
        context?: string;
    }>>([]);

    const recordError = useCallback((error: WizardError, context?: string) => {
        setErrorHistory(prev => [
            ...prev.slice(-9), // Keep last 10 errors
            {
                error,
                timestamp: Date.now(),
                context
            }
        ]);
    }, []);

    const getErrorPatterns = useCallback(() => {
        const recentErrors = errorHistory.filter(
            entry => Date.now() - entry.timestamp < 300000 // Last 5 minutes
        );

        const errorCounts = recentErrors.reduce((acc, entry) => {
            const key = `${entry.error.constructor.name}:${entry.error.code}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const frequentErrors = Object.entries(errorCounts)
            .filter(([, count]) => count >= 3)
            .map(([key, count]) => ({ type: key, count }));

        return {
            recentErrorCount: recentErrors.length,
            frequentErrors,
            shouldSuggestHelp: recentErrors.length >= 5 || frequentErrors.length > 0
        };
    }, [errorHistory]);

    return {
        errorHistory,
        recordError,
        getErrorPatterns
    };
}