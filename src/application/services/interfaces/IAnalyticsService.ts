export interface AnalyticsEvent {
    name: string;
    properties: Record<string, any>;
    timestamp: Date;
}

/**
 * Interface for analytics and tracking services
 */
export interface IAnalyticsService {
    /**
     * Track an event
     */
    trackEvent(event: AnalyticsEvent): Promise<void>;

    /**
     * Track user action
     */
    trackUserAction(userId: string, action: string, properties?: Record<string, any>): Promise<void>;

    /**
     * Track page view
     */
    trackPageView(path: string, userId?: string): Promise<void>;
}