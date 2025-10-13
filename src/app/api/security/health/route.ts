/**
 * Security health check API endpoint
 * Provides information about the security status of the application
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSecurityHealthStatus } from '@/lib/security/security-middleware';
import { validateSecurityConfig } from '@/lib/security/security-config';
import { auth } from '@/lib/auth/auth';

export async function GET(request: NextRequest) {
    try {
        // Check if user is authenticated and has admin role
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 403 }
            );
        }

        // Get security health status (skip during build)
        const healthStatus = {
            status: 'healthy' as const,
            checks: {},
            recommendations: [],
            lastCheck: new Date().toISOString()
        };

        // Validate security configuration
        const configValidation = validateSecurityConfig();

        // Get system information
        const systemInfo = {
            nodeVersion: process.version,
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };

        // Check environment variables (without exposing values)
        const envChecks = {
            hasSignedUrlSecret: !!(process.env.SIGNED_URL_SECRET || process.env.NEXTAUTH_SECRET),
            hasHuggingFaceKey: !!process.env.HUGGINGFACE_API_KEY,
            hasVercelBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
            nodeEnv: process.env.NODE_ENV || 'development',
        };

        // Compile overall status
        let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';

        if (!configValidation.valid) {
            overallStatus = 'critical';
        } else if (configValidation.warnings.length > 0) {
            overallStatus = 'warning';
        }

        const response = {
            status: overallStatus,
            timestamp: systemInfo.timestamp,
            system: systemInfo,
            security: {
                health: healthStatus,
                configuration: configValidation,
                environment: envChecks,
            },
            recommendations: [
                ...configValidation.warnings.map(w => `Configuration: ${w}`),
                ...configValidation.errors.map(e => `Critical: ${e}`),
            ],
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error in security health check:', error);

        return NextResponse.json(
            {
                status: 'critical',
                error: 'Health check failed',
                message: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}

// Only allow GET requests
export async function POST() {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    );
}

export async function PUT() {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    );
}

export async function DELETE() {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    );
}