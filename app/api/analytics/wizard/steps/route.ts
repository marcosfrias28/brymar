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

        const stepNames = [
            'General Information',
            'Location',
            'Media Upload',
            'Preview & Publish'
        ];

        const stepAnalytics = [];

        for (let step = 1; step <= 4; step++) {
            // Get step started count
            const startedResult = await db
                .select({ count: count() })
                .from(wizardAnalytics)
                .where(
                    and(
                        gte(wizardAnalytics.createdAt, timeThreshold),
                        sql`event_type = 'step_started' AND step_number = ${step}`
                    )
                );

            // Get step completed count
            const completedResult = await db
                .select({ count: count() })
                .from(wizardAnalytics)
                .where(
                    and(
                        gte(wizardAnalytics.createdAt, timeThreshold),
                        sql`event_type = 'step_completed' AND step_number = ${step}`
                    )
                );

            // Get average time spent on step
            const avgTimeResult = await db
                .select({ avgTime: avg(wizardAnalytics.timeSpentMs) })
                .from(wizardAnalytics)
                .where(
                    and(
                        gte(wizardAnalytics.createdAt, timeThreshold),
                        sql`event_type = 'step_completed' AND step_number = ${step}`
                    )
                );

            const started = startedResult[0]?.count || 0;
            const completed = completedResult[0]?.count || 0;
            const averageTime = Number(avgTimeResult[0]?.avgTime) || 0;
            const dropoffRate = started > 0 ? ((started - completed) / started) * 100 : 0;

            stepAnalytics.push({
                step,
                stepName: stepNames[step - 1],
                started,
                completed,
                averageTime,
                dropoffRate
            });
        }

        return NextResponse.json(stepAnalytics);
    } catch (error) {
        console.error('Step analytics API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch step analytics' },
            { status: 500 }
        );
    }
}