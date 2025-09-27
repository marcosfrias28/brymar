import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/drizzle';
import { wizardAnalytics } from '@/lib/db/schema';
import { auth } from '@/lib/auth/auth';
import { sql, and, gte, count, avg } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
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

        const aiTypes = ['title', 'description', 'tags'];
        const aiAnalytics = [];

        for (const type of aiTypes) {
            // Get AI generation attempts for this type
            const attemptsResult = await db
                .select({ count: count() })
                .from(wizardAnalytics)
                .where(
                    and(
                        gte(wizardAnalytics.createdAt, timeThreshold),
                        sql`event_type = 'ai_generation_requested' AND event_data->>'generationType' = ${type}`
                    )
                );

            // Get AI generation successes for this type
            const successesResult = await db
                .select({ count: count() })
                .from(wizardAnalytics)
                .where(
                    and(
                        gte(wizardAnalytics.createdAt, timeThreshold),
                        sql`event_type = 'ai_generation_success' AND event_data->>'generationType' = ${type}`
                    )
                );

            // Get AI generation failures for this type
            const failuresResult = await db
                .select({ count: count() })
                .from(wizardAnalytics)
                .where(
                    and(
                        gte(wizardAnalytics.createdAt, timeThreshold),
                        sql`event_type = 'ai_generation_failed' AND event_data->>'generationType' = ${type}`
                    )
                );

            // Get average response time for successful generations
            const avgResponseTimeResult = await db
                .select({
                    avgTime: sql`AVG(CAST(event_data->>'responseTime' AS INTEGER))`
                })
                .from(wizardAnalytics)
                .where(
                    and(
                        gte(wizardAnalytics.createdAt, timeThreshold),
                        sql`event_type = 'ai_generation_success' AND event_data->>'generationType' = ${type}`
                    )
                );

            const attempts = attemptsResult[0]?.count || 0;
            const successes = successesResult[0]?.count || 0;
            const failures = failuresResult[0]?.count || 0;
            const averageResponseTime = Number(avgResponseTimeResult[0]?.avgTime) || 0;
            const successRate = attempts > 0 ? (successes / attempts) * 100 : 0;

            aiAnalytics.push({
                type,
                attempts,
                successes,
                failures,
                averageResponseTime,
                successRate
            });
        }

        return NextResponse.json(aiAnalytics);
    } catch (error) {
        console.error('AI analytics API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch AI analytics' },
            { status: 500 }
        );
    }
}