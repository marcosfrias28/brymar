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

        // Check last 1 hour for system health
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const services = ['huggingface', 'vercel_blob', 'geocoding'];
        const healthMetrics: any = {
            averageResponseTimes: {},
            errorRates: {}
        };

        for (const service of services) {
            // Get successful service calls
            const successfulCallsResult = await db
                .select({
                    count: count(),
                    avgResponseTime: sql`AVG(CAST(event_data->>'responseTime' AS INTEGER))`
                })
                .from(wizardAnalytics)
                .where(
                    and(
                        gte(wizardAnalytics.createdAt, oneHourAgo),
                        sql`event_type = 'external_service_call' AND event_data->>'service' = ${service}`
                    )
                );

            // Get failed service calls
            const failedCallsResult = await db
                .select({ count: count() })
                .from(wizardAnalytics)
                .where(
                    and(
                        gte(wizardAnalytics.createdAt, oneHourAgo),
                        sql`event_type = 'external_service_error' AND event_data->>'service' = ${service}`
                    )
                );

            const successfulCalls = successfulCallsResult[0]?.count || 0;
            const failedCalls = failedCallsResult[0]?.count || 0;
            const totalCalls = successfulCalls + failedCalls;
            const averageResponseTime = Number(successfulCallsResult[0]?.avgResponseTime) || 0;
            const errorRate = totalCalls > 0 ? (failedCalls / totalCalls) * 100 : 0;

            healthMetrics.averageResponseTimes[service] = averageResponseTime;
            healthMetrics.errorRates[service] = errorRate;

            // Determine service status based on error rate and response time
            let status: 'healthy' | 'degraded' | 'down';

            if (totalCalls === 0) {
                status = 'healthy'; // No recent activity
            } else if (errorRate > 50) {
                status = 'down';
            } else if (errorRate > 10 || averageResponseTime > 5000) {
                status = 'degraded';
            } else {
                status = 'healthy';
            }

            // Map service names to status property names
            const statusKey = service === 'vercel_blob' ? 'vercelBlobStatus' :
                service === 'huggingface' ? 'huggingfaceStatus' :
                    'geocodingStatus';

            healthMetrics[statusKey] = status;
        }

        return NextResponse.json(healthMetrics);
    } catch (error) {
        console.error('System health API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch system health' },
            { status: 500 }
        );
    }
}