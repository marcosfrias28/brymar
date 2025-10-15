import { IAnalyticsService, AnalyticsEvent } from "@/application/services/interfaces/IAnalyticsService";

/**
 * Stub implementation of IAnalyticsService for development/testing
 * In production, this would be replaced with actual analytics service (Google Analytics, Mixpanel, etc.)
 */
export class StubAnalyticsService implements IAnalyticsService {
    async trackEvent(_event: AnalyticsEvent): Promise<void> {
        // Stub implementation - in production would send to analytics service
        // Note: Would track event in production
    }

    async trackUserAction(_userId: string, _action: string, _properties?: Record<string, any>): Promise<void> {
        // Stub implementation - in production would send to analytics service
        // Note: Would track user action in production
    }

    async trackPageView(_path: string, _userId?: string): Promise<void> {
        // Stub implementation - in production would send to analytics service
        // Note: Would track page view in production
    }
}