import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/drizzle';
import { wizardAnalytics as wizardAnalyticsTable } from '@/lib/db/schema';
import { auth } from '@/lib/auth/auth';
import { checkGlobalApiRateLimit, getClientIdentifier } from '@/lib/security/rate-limiting';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const clientIdentifier = getClientIdentifier(request);
        await checkGlobalApiRateLimit(clientIdentifier);

        const session = await auth.api.getSession({ headers: request.headers });
        const body = await request.json();

        // Validate the analytics event structure
        if (!body.id || !body.sessionId || !body.eventType) {
            return NextResponse.json(
                { error: 'Invalid analytics event structure' },
                { status: 400 }
            );
        }

        // Get client IP for tracking (respecting privacy)
        const clientIP = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // Store analytics event in database
        await db.insert(wizardAnalyticsTable).values({
            id: body.id,
            sessionId: body.sessionId,
            userId: session?.user?.id || body.userId,
            eventType: body.eventType,
            stepNumber: body.stepNumber,
            eventData: body.data,
            userAgent: body.userAgent,
            ipAddress: clientIP,
            createdAt: new Date(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json(
            { error: 'Failed to store analytics event' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });

        // Only allow authenticated users to view analytics
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');
        const userId = searchParams.get('userId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Build query with proper Drizzle ORM syntax
        const events = session.user.role === 'admin'
            ? await db.select().from(wizardAnalyticsTable).limit(1000)
            : await db.select().from(wizardAnalyticsTable)
                .where(eq(wizardAnalyticsTable.userId, session.user.id))
                .limit(1000);

        return NextResponse.json({ events });
    } catch (error) {
        console.error('Analytics GET API error:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve analytics' },
            { status: 500 }
        );
    }
}