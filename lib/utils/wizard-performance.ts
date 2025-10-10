/**
 * Wizard Performance Monitoring and Optimization Utilities
 * Provides performance tracking, lazy loading, and cleanup functionality
 */

export interface WizardPerformanceMetrics {
    loadTime: number;
    stepTransitionTime: number;
    completionTime: number;
    memoryUsage?: number;
    networkRequests: number;
    errorCount: number;
    retryCount: number;
}

export interface WizardSession {
    id: string;
    type: string;
    startTime: number;
    endTime?: number;
    metrics: WizardPerformanceMetrics;
    userAgent: string;
    viewport: { width: number; height: number };
    connectionType?: string;
}

class WizardPerformanceMonitor {
    private sessions = new Map<string, WizardSession>();
    private observers = new Map<string, PerformanceObserver>();

    /**
     * Start monitoring a wizard session
     */
    startSession(wizardId: string, type: string): WizardSession {
        const session: WizardSession = {
            id: wizardId,
            type,
            startTime: performance.now(),
            metrics: {
                loadTime: 0,
                stepTransitionTime: 0,
                completionTime: 0,
                networkRequests: 0,
                errorCount: 0,
                retryCount: 0,
            },
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
            },
            connectionType: this.getConnectionType(),
        };

        this.sessions.set(wizardId, session);
        this.setupPerformanceObserver(wizardId);

        return session;
    }

    /**
     * Record wizard load completion
     */
    recordLoadTime(wizardId: string): void {
        const session = this.sessions.get(wizardId);
        if (session) {
            session.metrics.loadTime = performance.now() - session.startTime;
        }
    }

    /**
     * Record step transition time
     */
    recordStepTransition(wizardId: string, fromStep: number, toStep: number): void {
        const session = this.sessions.get(wizardId);
        if (session) {
            const transitionTime = performance.now();
            session.metrics.stepTransitionTime = transitionTime;

            // Track step-specific metrics
            this.trackCustomMetric(wizardId, `step_${fromStep}_to_${toStep}`, transitionTime);
        }
    }

    /**
     * Record wizard completion
     */
    recordCompletion(wizardId: string): void {
        const session = this.sessions.get(wizardId);
        if (session) {
            session.endTime = performance.now();
            session.metrics.completionTime = session.endTime - session.startTime;

            // Log completion metrics
            this.logSessionMetrics(session);
        }
    }

    /**
     * Record error occurrence
     */
    recordError(wizardId: string, error: Error): void {
        const session = this.sessions.get(wizardId);
        if (session) {
            session.metrics.errorCount++;

            // Track error details
            console.warn(`Wizard ${wizardId} error:`, {
                message: error.message,
                stack: error.stack,
                timestamp: Date.now(),
            });
        }
    }

    /**
     * Record retry attempt
     */
    recordRetry(wizardId: string): void {
        const session = this.sessions.get(wizardId);
        if (session) {
            session.metrics.retryCount++;
        }
    }

    /**
     * Get current session metrics
     */
    getMetrics(wizardId: string): WizardPerformanceMetrics | null {
        const session = this.sessions.get(wizardId);
        return session ? { ...session.metrics } : null;
    }

    /**
     * Clean up session data
     */
    endSession(wizardId: string): void {
        const observer = this.observers.get(wizardId);
        if (observer) {
            observer.disconnect();
            this.observers.delete(wizardId);
        }

        this.sessions.delete(wizardId);
    }

    /**
     * Setup performance observer for detailed metrics
     */
    private setupPerformanceObserver(wizardId: string): void {
        if (!('PerformanceObserver' in window)) return;

        try {
            const observer = new PerformanceObserver((list) => {
                const session = this.sessions.get(wizardId);
                if (!session) return;

                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'navigation') {
                        // Track navigation timing
                        const navEntry = entry as PerformanceNavigationTiming;
                        session.metrics.loadTime = navEntry.loadEventEnd - navEntry.fetchStart;
                    } else if (entry.entryType === 'resource') {
                        // Count network requests
                        session.metrics.networkRequests++;
                    }
                }
            });

            observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] });
            this.observers.set(wizardId, observer);
        } catch (error) {
            console.warn('Performance observer setup failed:', error);
        }
    }

    /**
     * Track custom performance metric
     */
    private trackCustomMetric(wizardId: string, name: string, value: number): void {
        try {
            performance.mark(`wizard-${wizardId}-${name}`);
            performance.measure(`wizard-${wizardId}-${name}-duration`, `wizard-${wizardId}-${name}`);
        } catch (error) {
            // Silently fail if performance API is not available
        }
    }

    /**
     * Get connection type for performance context
     */
    private getConnectionType(): string | undefined {
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        return connection?.effectiveType || connection?.type;
    }

    /**
     * Log session metrics for analysis
     */
    private logSessionMetrics(session: WizardSession): void {
        const metrics = {
            sessionId: session.id,
            type: session.type,
            duration: session.metrics.completionTime,
            loadTime: session.metrics.loadTime,
            errors: session.metrics.errorCount,
            retries: session.metrics.retryCount,
            networkRequests: session.metrics.networkRequests,
            viewport: session.viewport,
            connectionType: session.connectionType,
            userAgent: session.userAgent,
        };

        // In production, send to analytics service
        if (process.env.NODE_ENV === 'development') {
            console.log('Wizard Performance Metrics:', metrics);
        }

        // Could integrate with analytics services here
        // Example: analytics.track('wizard_completed', metrics);
    }
}

// Singleton instance
export const wizardPerformanceMonitor = new WizardPerformanceMonitor();

/**
 * Lazy loading utilities for wizard components
 */
export class WizardLazyLoader {
    private loadedComponents = new Set<string>();
    private loadingPromises = new Map<string, Promise<any>>();

    /**
     * Lazy load a wizard step component
     */
    async loadStepComponent(stepId: string, loader: () => Promise<any>): Promise<any> {
        if (this.loadedComponents.has(stepId)) {
            return; // Already loaded
        }

        if (this.loadingPromises.has(stepId)) {
            return this.loadingPromises.get(stepId);
        }

        const loadPromise = loader().then((component) => {
            this.loadedComponents.add(stepId);
            this.loadingPromises.delete(stepId);
            return component;
        }).catch((error) => {
            this.loadingPromises.delete(stepId);
            throw error;
        });

        this.loadingPromises.set(stepId, loadPromise);
        return loadPromise;
    }

    /**
     * Preload next step component
     */
    preloadNextStep(stepId: string, loader: () => Promise<any>): void {
        // Use requestIdleCallback for non-blocking preloading
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.loadStepComponent(stepId, loader).catch(() => {
                    // Silently fail preloading
                });
            });
        } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(() => {
                this.loadStepComponent(stepId, loader).catch(() => {
                    // Silently fail preloading
                });
            }, 100);
        }
    }

    /**
     * Clear loaded components to free memory
     */
    cleanup(): void {
        this.loadedComponents.clear();
        this.loadingPromises.clear();
    }
}

/**
 * Memory cleanup utilities
 */
export class WizardMemoryManager {
    private cleanupTasks = new Set<() => void>();
    private intervals = new Set<NodeJS.Timeout>();
    private timeouts = new Set<NodeJS.Timeout>();
    private eventListeners = new Map<EventTarget, Map<string, EventListener>>();

    /**
     * Register cleanup task
     */
    registerCleanup(task: () => void): void {
        this.cleanupTasks.add(task);
    }

    /**
     * Register interval for cleanup
     */
    registerInterval(interval: NodeJS.Timeout): void {
        this.intervals.add(interval);
    }

    /**
     * Register timeout for cleanup
     */
    registerTimeout(timeout: NodeJS.Timeout): void {
        this.timeouts.add(timeout);
    }

    /**
     * Register event listener for cleanup
     */
    registerEventListener(target: EventTarget, event: string, listener: EventListener): void {
        if (!this.eventListeners.has(target)) {
            this.eventListeners.set(target, new Map());
        }
        this.eventListeners.get(target)!.set(event, listener);
        target.addEventListener(event, listener);
    }

    /**
     * Perform complete cleanup
     */
    cleanup(): void {
        // Clear intervals
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals.clear();

        // Clear timeouts
        this.timeouts.forEach(timeout => clearTimeout(timeout));
        this.timeouts.clear();

        // Remove event listeners
        this.eventListeners.forEach((listeners, target) => {
            listeners.forEach((listener, event) => {
                target.removeEventListener(event, listener);
            });
        });
        this.eventListeners.clear();

        // Run custom cleanup tasks
        this.cleanupTasks.forEach(task => {
            try {
                task();
            } catch (error) {
                console.warn('Cleanup task failed:', error);
            }
        });
        this.cleanupTasks.clear();
    }
}

/**
 * Cross-browser compatibility utilities
 */
export const browserCompatibility = {
    /**
     * Check if browser supports modern features
     */
    supportsModernFeatures(): boolean {
        return !!(
            window.IntersectionObserver &&
            window.ResizeObserver &&
            'requestIdleCallback' in window &&
            CSS.supports('display', 'grid')
        );
    },

    /**
     * Check if browser is mobile
     */
    isMobile(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    /**
     * Check if browser supports touch
     */
    supportsTouch(): boolean {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    /**
     * Get browser performance capabilities
     */
    getPerformanceCapabilities(): {
        isLowEnd: boolean;
        memoryLimit: number;
        connectionSpeed: string;
    } {
        const memory = (navigator as any).deviceMemory || 4; // Default to 4GB
        const connection = (navigator as any).connection;

        return {
            isLowEnd: memory <= 2,
            memoryLimit: memory,
            connectionSpeed: connection?.effectiveType || 'unknown',
        };
    },

    /**
     * Apply performance optimizations based on device capabilities
     */
    applyPerformanceOptimizations(): {
        reduceAnimations: boolean;
        lazyLoadImages: boolean;
        limitConcurrentRequests: boolean;
    } {
        const capabilities = this.getPerformanceCapabilities();
        const isMobile = this.isMobile();

        return {
            reduceAnimations: capabilities.isLowEnd || isMobile,
            lazyLoadImages: true,
            limitConcurrentRequests: capabilities.isLowEnd,
        };
    }
};