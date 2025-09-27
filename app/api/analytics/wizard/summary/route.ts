import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/drizzle';
import { wizardAnalytics, propertyDrafts } from '@/lib/db/schema';
import { auth } from '@/lib/auth/auth';
import { sql, and, gte, count, avg } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Only admins can view analytics
        if (session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const timeRange = searchParams.get('timeRange') || '24h';

        // Calculate time threshold
        const now = new Date();
        let timeThreshold: Date;

        switch (timeRange) {
            case '7d':
                timeThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                timeThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default: // 24h
                timeThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }

        // Get total sessions
        const totalSessionsResult = await db
            .select({ count: count() })
            .from(wizardAnalytics)
            .where(
                and(
                    gte(wizardAnalytics.createdAt, timeThreshold),
                    sql`event_type = 'step_started' AND step_number = 1`
                )
            );

        const totalSessions = totalSessionsResult[0]?.count || 0;

        // Get completed wizards
        const completedWizardsResult = await db
            .select({ count: count() })
            .from(wizardAnalytics)
            .where(
                and(
                    gte(wizardAnalytics.createdAt, timeThreshold),
                    sql`event_type = 'wizard_completed'`
                )
            );

        const completedWizards = completedWizardsResult[0]?.count || 0;

        // Get average completion time
        const avgCompletionTimeResult = await db
            .select({ avgTime: avg(wizardAnalytics.timeSpentMs) })
            .from(wizardAnalytics)
            .where(
                and(
                    gte(wizardAnalytics.createdAt, timeThreshold),
                    sql`event_type = 'wizard_completed'`
                )
            );

        const averageCompletionTime = Number(avgCompletionTimeResult[0]?.avgTime) || 0;

        // Calculate completion rate
        const completionRate = totalSessions > 0 ? (completedWizards / totalSessions) * 100 : 0;

        // Get AI generation success rate
        const aiAttemptsResult = await db
            .select({ count: count() })
            .from(wizardAnalytics)
            .where(
                and(
                    gte(wizardAnalytics.createdAt, timeThreshold),
                    sql`event_type = 'ai_generation_requested'`
                )
            );

        const aiSuccessesResult = await db
            .select({ count: count() })
            .from(wizardAnalytics)
            .where(
                and(
                    gte(wizardAnalytics.createdAt, timeThreshold),
                    sql`event_type = 'ai_generation_success'`
                )
            );

        const aiAttempts = aiAttemptsResult[0]?.count || 0;
        const aiSuccesses = aiSuccessesResult[0]?.count || 0;
        const aiGenerationSuccessRate = aiAttempts > 0 ? (aiSuccesses / aiAttempts) * 100 : 0;

        // Get upload success rate
        const uploadAttemptsResult = await db
            .select({ count: count() })
            .from(wizardAnalytics)
            .where(
                and(
                    gte(wizardAnalytics.createdAt, timeThreshold),
                    sql`event_type = 'upload_started'`
                )
            );

        const uploadSuccessesResult = await db
            .select({ count: count() })
            .from(wizardAnalytics)
            .where(
                and(
                    gte(wizardAnalytics.createdAt, timeThreshold),
                    sql`event_type = 'upload_success'`
                )
            );

        const uploadAttempts = uploadAttemptsResult[0]?.count || 0;
        const uploadSuccesses = uploadSuccessesResult[0]?.count || 0;
        const uploadSuccessRate = uploadAttempts > 0 ? (uploadSuccesses / uploadAttempts) * 100 : 0;

        // Get most common dropoff step
        const dropoffStepsResult = await db
            .select({
                stepNumber: wizardAnalytics.stepNumber,
                count: count()
            })
            .from(wizardAnalytics)
            .where(
                and(
                    gte(wizardAnalytics.createdAt, timeThreshold),
                    sql`event_type = 'wizard_abandoned'`
                )
            )
            .groupBy(wizardAnalytics.stepNumber)
            .orderBy(sql`count DESC`)
            .limit(1);

        const mostCommonDropoffStep = dropoffStepsResult[0]?.stepNumber || 1;

        // Get active users (unique users in time range)
        const activeUsersResult = await db
            .select({ count: sql`COUNT(DISTINCT user_id)` })
            .from(wizardAnalytics)
            .where(gte(wizardAnalytics.createdAt, timeThreshold));

        const activeUsers = Number(activeUsersResult[0]?.count) || 0;

        const summary = {
            totalSessions,
            completedWizards,
            averageCompletionTime,
            completionRate,
            aiGenerationSuccessRate,
            uploadSuccessRate,
            mostCommonDropoffStep,
            activeUsers
        };

        return NextResponse.json(summary);
    } catch (error) {
        console.error('Analytics summary API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics summary' },
            { status: 500 }
        );
    }
}