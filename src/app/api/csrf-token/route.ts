/**
 * API route for CSRF token generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCSRFToken } from '@/lib/security/csrf-protection';
import { auth } from '@/lib/auth/auth';

export async function GET(request: NextRequest) {
    try {
        // Get user session
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        const userId = session?.user?.id;

        // Generate CSRF token
        const { token, cookie } = await createCSRFToken(request, userId);

        // Create response
        const response = NextResponse.json({
            token,
            success: true,
        });

        // Set CSRF cookie
        response.cookies.set(cookie.name, cookie.value, cookie.options);

        return response;
    } catch (error) {
        console.error('Error generating CSRF token:', error);

        return NextResponse.json(
            {
                error: 'Failed to generate CSRF token',
                success: false,
            },
            { status: 500 }
        );
    }
}