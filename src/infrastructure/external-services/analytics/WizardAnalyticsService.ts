import type { Database } from '@/lib/db/drizzle';
import { wizardAnalytics } from '@/lib/db/schema';
import { randomUUID } from "crypto";

export interface WizardAnalyticsEvent {
    userId?: string;
    sessionId?: string;
    wizardType: string;
    draftId?: string;
    eventType: string;
    stepNumber?: number;
    eventData?: Record<string, any>;
    timeSpentMs?: number;
    userAgent?: string;
    ipAddress?: string;
}

export interface WizardAnalyticsQuery {
    wizardType?: string;
    eventType?: string;
    userId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
}

export interface WizardAnalyticsStats {
    totalEvents: number;
    uniqueUsers: number;
    uniqueSessions: number;
    eventsByType: Record<string, number>;
    eventsByWizardType: Record<string, number>;
    averageTimeSpent: number;
    completionRate: number;
}

export class WizardAnalyticsService {
    constructor(private readonly db: Database) { }

    /**
     * Track a wizard analytics event
     */
    async trackEvent(event: WizardAnalyticsEvent): Promise<void> {
        try {
            const analyticsData = {
                id: randomUUID(),
                userId: event.userId || null,
                sessionId: event.sessionId || null,
                wizardType: event.wizardType,
                propertyDraftId: event.wizardType === "property" ? event.draftId : null,
                landDraftId: event.wizardType === "land" ? event.draftId : null,
                blogDraftId: event.wizardType === "blog" ? event.draftId : null,
                eventType: event.eventType,
                stepNumber: event.stepNumber || null,
                eventData: event.eventData || {},
                timeSpentMs: event.timeSpentMs || null,
                userAgent: event.userAgent || null,
                ipAddress: event.ipAddress || null,
                createdAt: new Date(),
            };

            await this.db.insert(wizardAnalytics).values(analyticsData);
        } catch (error) {
            // Log error but don't throw - analytics should not break the main flow
            console.error("Failed to track wizard analytics event:", error);
        }
    }

    /**
     * Track step started event
     */
    async trackStepStarted(data: {
        userId?: string;
        sessionId?: string;
        wizardType: string;
        draftId?: string;
        stepNumber: number;
        userAgent?: string;
        ipAddress?: string;
    }): Promise<void> {
        await this.trackEvent({
            ...data,
            eventType: "step_started",
        });
    }

    /**
     * Track step completed event
     */
    async trackStepCompleted(data: {
        userId?: string;
        sessionId?: string;
        wizardType: string;
        draftId?: string;
        stepNumber: number;
        timeSpentMs?: number;
        userAgent?: string;
        ipAddress?: string;
    }): Promise<void> {
        await this.trackEvent({
            ...data,
            eventType: "step_completed",
        });
    }

    /**
     * Track AI content generation event
     */
    async trackAIGeneration(data: {
        userId?: string;
        sessionId?: string;
        wizardType: string;
        draftId?: string;
        contentType: string;
        success: boolean;
        timeSpentMs?: number;
        userAgent?: string;
        ipAddress?: string;
    }): Promise<void> {
        await this.trackEvent({
            ...data,
            eventType: "ai_generated",
            eventData: {
                contentType: data.contentType,
                success: data.success,
            },
        });
    }

    /**
     * Track draft saved event
     */
    async trackDraftSaved(data: {
        userId?: string;
        sessionId?: string;
        wizardType: string;
        draftId: string;
        completionPercentage: number;
        userAgent?: string;
        ipAddress?: string;
    }): Promise<void> {
        await this.trackEvent({
            ...data,
            eventType: "draft_saved",
            eventData: {
                completionPercentage: data.completionPercentage,
            },
        });
    }

    /**
     * Track wizard published event
     */
    async trackWizardPublished(data: {
        userId?: string;
        sessionId?: string;
        wizardType: string;
        draftId: string;
        publishedId: number;
        timeSpentMs?: number;
        userAgent?: string;
        ipAddress?: string;
    }): Promise<void> {
        await this.trackEvent({
            ...data,
            eventType: "published",
            eventData: {
                publishedId: data.publishedId,
            },
        });
    }

    /**
     * Get wizard analytics statistics
     */
    async getStatistics(query: WizardAnalyticsQuery = {}): Promise<WizardAnalyticsStats> {
        const conditions = this.buildWhereConditions(query);

        // Get all matching events
        let queryBuilder = this.db.select().from(wizardAnalytics);

        if (conditions.length > 0) {
            queryBuilder = queryBuilder.where(conditions.reduce((acc, condition) => acc && condition));
        }

        const events = await queryBuilder;

        // Calculate statistics
        const totalEvents = events.length;
        const uniqueUsers = new Set(events.filter((e: any) => e.userId).map((e: any) => e.userId)).size;
        const uniqueSessions = new Set(events.filter((e: any) => e.sessionId).map((e: any) => e.sessionId)).size;

        // Count events by type
        const eventsByType: Record<string, number> = {};
        events.forEach((event: any) => {
            eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
        });

        // Count events by wizard type
        const eventsByWizardType: Record<string, number> = {};
        events.forEach((event: any) => {
            eventsByWizardType[event.wizardType] = (eventsByWizardType[event.wizardType] || 0) + 1;
        });

        // Calculate average time spent
        const timeSpentEvents = events.filter((e: any) => e.timeSpentMs && e.timeSpentMs > 0);
        const averageTimeSpent = timeSpentEvents.length > 0
            ? timeSpentEvents.reduce((sum: number, e: any) => sum + (e.timeSpentMs || 0), 0) / timeSpentEvents.length
            : 0;

        // Calculate completion rate
        const startedEvents = events.filter((e: any) => e.eventType === "step_started" && e.stepNumber === 1);
        const publishedEvents = events.filter((e: any) => e.eventType === "published");
        const completionRate = startedEvents.length > 0
            ? (publishedEvents.length / startedEvents.length) * 100
            : 0;

        return {
            totalEvents,
            uniqueUsers,
            uniqueSessions,
            eventsByType,
            eventsByWizardType,
            averageTimeSpent: Math.round(averageTimeSpent),
            completionRate: Math.round(completionRate * 100) / 100,
        };
    }

    /**
     * Get user journey for a specific session or user
     */
    async getUserJourney(sessionId?: string, userId?: string): Promise<any[]> {
        if (!sessionId && !userId) {
            throw new Error("Either sessionId or userId must be provided");
        }

        let queryBuilder = this.db.select().from(wizardAnalytics);

        if (sessionId) {
            queryBuilder = queryBuilder.where(eq(wizardAnalytics.sessionId, sessionId));
        } else if (userId) {
            queryBuilder = queryBuilder.where(eq(wizardAnalytics.userId, userId));
        }

        const events = await queryBuilder.orderBy(wizardAnalytics.createdAt);

        return events.map((event: any) => ({
            eventType: event.eventType,
            wizardType: event.wizardType,
            stepNumber: event.stepNumber,
            timeSpentMs: event.timeSpentMs,
            eventData: event.eventData,
            createdAt: event.createdAt,
        }));
    }

    /**
     * Get funnel analysis for a specific wizard type
     */
    async getFunnelAnalysis(wizardType: string, dateFrom?: Date, dateTo?: Date): Promise<{
        stepFunnel: Array<{ step: number; users: number; dropoffRate: number }>;
        totalStarted: number;
        totalCompleted: number;
        overallCompletionRate: number;
    }> {
        const conditions = [eq(wizardAnalytics.wizardType, wizardType)];

        if (dateFrom) {
            conditions.push(gte(wizardAnalytics.createdAt, dateFrom));
        }

        if (dateTo) {
            conditions.push(lte(wizardAnalytics.createdAt, dateTo));
        }

        const events = await this.db
            .select()
            .from(wizardAnalytics)
            .where(and(...conditions));

        // Group events by step
        const stepEvents: Record<number, Set<string>> = {};
        const publishedUsers = new Set<string>();

        events.forEach((event: any) => {
            const userId = event.userId || event.sessionId;
            if (!userId) return;

            if (event.eventType === "step_completed" && event.stepNumber) {
                if (!stepEvents[event.stepNumber]) {
                    stepEvents[event.stepNumber] = new Set();
                }
                stepEvents[event.stepNumber].add(userId);
            }

            if (event.eventType === "published") {
                publishedUsers.add(userId);
            }
        });

        // Calculate funnel
        const steps = Object.keys(stepEvents).map(Number).sort((a, b) => a - b);
        const stepFunnel = [];
        let previousUsers = 0;

        for (const step of steps) {
            const users = stepEvents[step].size;
            const dropoffRate = previousUsers > 0 ? ((previousUsers - users) / previousUsers) * 100 : 0;

            stepFunnel.push({
                step,
                users,
                dropoffRate: Math.round(dropoffRate * 100) / 100,
            });

            previousUsers = users;
        }

        const totalStarted = stepEvents[1]?.size || 0;
        const totalCompleted = publishedUsers.size;
        const overallCompletionRate = totalStarted > 0 ? (totalCompleted / totalStarted) * 100 : 0;

        return {
            stepFunnel,
            totalStarted,
            totalCompleted,
            overallCompletionRate: Math.round(overallCompletionRate * 100) / 100,
        };
    }

    private buildWhereConditions(query: WizardAnalyticsQuery): any[] {
        const conditions = [];

        if (query.wizardType) {
            conditions.push(eq(wizardAnalytics.wizardType, query.wizardType));
        }

        if (query.eventType) {
            conditions.push(eq(wizardAnalytics.eventType, query.eventType));
        }

        if (query.userId) {
            conditions.push(eq(wizardAnalytics.userId, query.userId));
        }

        if (query.dateFrom) {
            conditions.push(gte(wizardAnalytics.createdAt, query.dateFrom));
        }

        if (query.dateTo) {
            conditions.push(lte(wizardAnalytics.createdAt, query.dateTo));
        }

        return conditions;
    }
}

// Import the necessary functions from drizzle-orm
import { eq, and, gte, lte } from "drizzle-orm";