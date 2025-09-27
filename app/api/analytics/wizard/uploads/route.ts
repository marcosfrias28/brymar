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

        // Get total uploads
        const totalUploadsResult = await db
            .select({ count: count() })
            .from(wizardAnalytics)
            .where(
                and(
                    gte(wizardAnalytics.createdAt, timeThreshold),
                    sql`event_type = 'upload_started'`
                )
            );

        // Get successful uploads
        const successfulUploadsResult = await db
            .select({ count: count() })
            .from(wizardAnalytics)
            .where(
                and(
                    gte(wizardAnalytics.createdAt, timeThreshold),
                    sql`event_type = 'upload_success'`
                )
            );

        // Get failed uploads
        const failedUploadsResult = await db
            .select({ count: count() })
            .from(wizardAnalytics)
            .where(
                and(
                    gte(wizardAnalytics.createdAt, timeThreshold),
                    sql`event_type = 'upload_failed'`
                )
            );

        // Get average upload time for successful uploads
        const avgUploadTimeResult = await db
            .select({
                avgTime: sql`AVG(CAST(event_data->>'uploadTime' AS INTEGER))`
            })
            .from(wizardAnalytics)
            .where(
                and(
                    gte(wizardAnalytics.createdAt, timeThreshold),
                    sql`event_type = 'upload_success'`
                )
            );

        // Get average file size
        const avgFileSizeResult = await db
            .select({
                avgSize: sql`AVG(CAST(event_data->>'fileSize' AS INTEGER))`
            })
            .from(wizardAnalytics)
            .where(
                and(
                    gte(wizardAnalytics.createdAt, timeThreshold),
                    sql`event_type IN ('upload_success', 'upload_failed')`
                )
            );

        const totalUploads = totalUploadsResult[0]?.count || 0;
        const successfulUploads = successfulUploadsResult[0]?.count || 0;
        const failedUploads = failedUploadsResult[0]?.count || 0;
        const averageUploadTime = Number(avgUploadTimeResult[0]?.avgTime) || 0;
        const averageFileSize = Number(avgFileSizeResult[0]?.avgSize) || 0;
        const successRate = totalUploads > 0 ? (successfulUploads / totalUploads) * 100 : 0;

        const uploadAnalytics = {
            totalUploads,
            successfulUploads,
            failedUploads,
            averageUploadTime,
            averageFileSize,
            successRate
        };

        return NextResponse.json(uploadAnalytics);
    } catch (error) {
        console.error('Upload analytics API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch upload analytics' },
            { status: 500 }
        );
    }
}