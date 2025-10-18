import { auth } from "./src/lib/auth/auth";
import {
    isPublicRoute,
    getRequiredPermission,
    shouldRedirectUser,
    getRedirectUrlForRole,
    type UserRole,
} from "./src/lib/auth/admin-config";
import { NextResponse, NextRequest } from "next/server";

/**
 * SIMPLIFIED MIDDLEWARE - AUTH FLOW FIX
 * 
 * This middleware has been simplified to focus on core authentication and authorization.
 * Complex circuit breaker and loop detection logic has been removed to prevent interference
 * with legitimate authentication flows.
 * 
 * Key behaviors:
 * - POST requests to auth endpoints bypass middleware checks
 * - Session validation uses better-auth's native API
 * - Authenticated user redirects only apply to GET requests
 * - Clear logging for session validation failures
 */

/**
 * Generate unique request ID for tracking using Web Crypto API
 */
function generateRequestId(): string {
    return crypto.randomUUID();
}

/**
 * Create an unauthorized response with redirect to sign-in
 */
function createUnauthorizedResponse(reason: string, requestId: string): NextResponse {
    console.log(`[Middleware] Unauthorized: ${reason} (Request ID: ${requestId})`);

    const response = NextResponse.redirect(
        new URL("/sign-in", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
    );

    // Add debugging headers in development
    if (process.env.NODE_ENV === "development") {
        response.headers.set("X-Middleware-Reason", reason);
        response.headers.set("X-Request-ID", requestId);
    }

    return response;
}

/**
 * Check if request should bypass middleware entirely
 */
function shouldBypassMiddleware(request: NextRequest): boolean {
    const { pathname } = request.nextUrl;
    const method = request.method;

    // Skip POST requests to authentication pages - these go to API routes
    const authPages = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password', '/verify-email'];
    if (method === 'POST' && authPages.some(page => pathname.startsWith(page))) {
        console.log(`[Middleware] Bypassing POST request to auth page: ${pathname}`);
        return true;
    }

    // Skip all requests to API routes (already handled by matcher but double-check)
    if (pathname.startsWith('/api/')) {
        return true;
    }

    return false;
}

/**
 * Main middleware for authentication and authorization
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const requestId = generateRequestId();

    console.log(`[Middleware] Processing ${request.method} ${pathname} (Request ID: ${requestId})`);

    // Check if this request should bypass middleware entirely
    if (shouldBypassMiddleware(request)) {
        return NextResponse.next();
    }

    // Allow access to public routes
    if (isPublicRoute(pathname)) {
        console.log(`[Middleware] Public route: ${pathname}`);
        return NextResponse.next();
    }

    try {
        // Validate session using better-auth
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        // Handle missing or invalid session
        if (!session || !session.user) {
            // For POST requests, allow them through to API routes to handle authentication
            if (request.method === 'POST') {
                console.log(`[Middleware] No session for POST request to ${pathname}, allowing through to API route`);
                return NextResponse.next();
            }

            // For GET requests to protected routes, redirect to sign-in
            console.log(`[Middleware] No valid session found for ${request.method} ${pathname}`);
            return createUnauthorizedResponse("No valid session found", requestId);
        }

        const { user } = session;
        console.log(`[Middleware] Valid session found for user: ${user.id} (role: ${user.role})`);

        // Handle verify-email page
        if (pathname.includes('verify-email')) {
            if (!user.id) {
                return createUnauthorizedResponse("Session required for email verification", requestId);
            }
            // If user is already verified, redirect to appropriate page
            if (user.emailVerified) {
                const redirectUrl = user.role === "user" ? "/profile" : "/dashboard";
                console.log(`[Middleware] User already verified, redirecting to ${redirectUrl}`);
                return NextResponse.redirect(new URL(redirectUrl, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
            }
            return NextResponse.next();
        }

        // Redirect authenticated users away from auth pages (GET requests only)
        if (user.id && request.method === 'GET') {
            const authPages = ['sign-in', 'sign-up', 'forgot-password', 'reset-password'];
            if (authPages.some(page => pathname.includes(page))) {
                const redirectUrl = getRedirectUrlForRole(user.role as UserRole);
                console.log(`[Middleware] Redirecting authenticated user from ${pathname} to ${redirectUrl}`);
                return NextResponse.redirect(new URL(redirectUrl, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
            }
        }

        // Role-based redirects for better UX (GET requests only)
        if (request.method === 'GET') {
            const userRole = user.role as UserRole;
            const redirectUrl = shouldRedirectUser(pathname, userRole);

            if (redirectUrl) {
                console.log(`[Middleware] Role-based redirect from ${pathname} to ${redirectUrl} for role ${userRole}`);
                return NextResponse.redirect(new URL(redirectUrl, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
            }
        }

        // Validate user role
        const validRoles: UserRole[] = ['admin', 'agent', 'user'];
        if (!user.role || !validRoles.includes(user.role as UserRole)) {
            console.log(`[Middleware] Invalid user role: ${user.role}`);
            return createUnauthorizedResponse("User role not defined or invalid", requestId);
        }

        // Check permissions for specific routes
        const requiredPermission = getRequiredPermission(pathname);
        if (requiredPermission) {
            const permissionConfig = {
                'dashboard.access': ['admin', 'agent'],
                'analytics.view': ['admin'],
                'settings.view': ['admin', 'agent'],
                'properties.view': ['admin', 'agent', 'user'],
                'properties.manage': ['admin', 'agent'],
                'lands.view': ['admin', 'agent', 'user'],
                'lands.manage': ['admin', 'agent'],
                'blog.view': ['admin', 'agent', 'user'],
                'blog.manage': ['admin'],
                'users.view': ['admin'],
                'users.manage': ['admin'],
                'profile.access': ['admin', 'agent', 'user'],
                'profile.manage': ['admin', 'agent', 'user'],
            } as const;

            const allowedRoles = permissionConfig[requiredPermission as keyof typeof permissionConfig];
            if (!allowedRoles || !allowedRoles.includes(user.role as any)) {
                console.log(`[Middleware] Insufficient permissions: ${user.role} cannot access ${requiredPermission}`);
                return createUnauthorizedResponse(`Insufficient permissions for role: ${user.role}`, requestId);
            }
        }

        // Add user information to headers for protected routes
        const response = NextResponse.next();
        response.headers.set("X-User-ID", user.id);
        response.headers.set("X-User-Role", user.role);
        response.headers.set("X-Email-Verified", user.emailVerified ? "true" : "false");
        response.headers.set("X-Request-ID", requestId);

        // Add basic security headers
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-XSS-Protection', '1; mode=block');

        console.log(`[Middleware] Request authorized for ${pathname}`);
        return response;

    } catch (error) {
        // Log session validation errors with details
        console.error(`[Middleware] Session validation error for ${pathname}:`, error);
        console.error(`[Middleware] Error details:`, {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            requestId,
            pathname,
            method: request.method
        });

        // For GET requests, redirect to sign-in
        if (request.method === 'GET') {
            const response = createUnauthorizedResponse("Authentication verification failed", requestId);
            response.headers.set('X-Content-Type-Options', 'nosniff');
            response.headers.set('X-Frame-Options', 'DENY');
            response.headers.set('X-XSS-Protection', '1; mode=block');
            response.headers.set("X-Auth-Error", "true");
            return response;
        }

        // For POST requests, allow them through to API routes
        console.log(`[Middleware] Session validation failed for POST request, allowing through to API route`);
        return NextResponse.next();
    }
}

// Configurazione del matcher per specificare su quali route applicare il middleware
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/ (all API routes including auth)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         * - files with extensions (images, css, js, etc.)
         */
        "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.).*)",
    ],
};