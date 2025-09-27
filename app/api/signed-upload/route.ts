/**
 * API route for signed URL upload handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateSignedUrlRequest } from '@/lib/security/signed-url-generation';
import { uploadDirect } from '@/lib/services/image-upload-service';
import { auth } from '@/lib/auth/auth';
import { getUploadSecurityHeaders } from '@/lib/security/file-upload-security';

export async function POST(request: NextRequest) {
    try {
        // Get user session
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        const userId = session?.user?.id;

        // Get signed URL parameters
        const url = new URL(request.url);
        const token = url.searchParams.get('token');
        const uploadPath = url.searchParams.get('path');
        const operation = url.searchParams.get('operation');

        if (!token || !uploadPath || !operation) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        // Validate signed URL
        const validation = await validateSignedUrlRequest(token, operation as any, uploadPath);
        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.error || 'Invalid signed URL' },
                { status: 403 }
            );
        }

        // Get file from form data
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Upload file
        const result = await uploadDirect(file, uploadPath, userId);

        // Create response with security headers
        const response = NextResponse.json({
            success: true,
            data: result,
        });

        // Add security headers
        const securityHeaders = getUploadSecurityHeaders();
        Object.entries(securityHeaders).forEach(([key, value]) => {
            response.headers.set(key, value);
        });

        return response;
    } catch (error) {
        console.error('Error in signed upload:', error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Upload failed',
                success: false,
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    // Handle signed URL validation for downloads/previews
    try {
        const url = new URL(request.url);
        const token = url.searchParams.get('token');
        const operation = url.searchParams.get('operation');

        if (!token || !operation) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        // Validate signed URL
        const validation = await validateSignedUrlRequest(token, operation as any);
        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.error || 'Invalid signed URL' },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            valid: true,
            payload: validation.payload,
        });
    } catch (error) {
        console.error('Error validating signed URL:', error);

        return NextResponse.json(
            {
                error: 'Validation failed',
                success: false,
            },
            { status: 500 }
        );
    }
}