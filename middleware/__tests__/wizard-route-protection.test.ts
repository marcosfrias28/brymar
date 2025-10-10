/**
 * @jest-environment node
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../../middleware';

// Mock the auth module
jest.mock('@/lib/auth/auth', () => ({
    auth: {
        api: {
            getSession: jest.fn(),
        },
    },
}));

// Mock admin config
jest.mock('@/lib/auth/admin-config', () => ({
    isPublicRoute: jest.fn(),
    getRequiredPermission: jest.fn(),
    shouldRedirectUser: jest.fn(),
    getRedirectUrlForRole: jest.fn(),
}));

const mockGetSession = require('@/lib/auth/auth').auth.api.getSession;
const mockIsPublicRoute = require('@/lib/auth/admin-config').isPublicRoute;
const mockGetRequiredPermission = require('@/lib/auth/admin-config').getRequiredPermission;
const mockShouldRedirectUser = require('@/lib/auth/admin-config').shouldRedirectUser;
const mockGetRedirectUrlForRole = require('@/lib/auth/admin-config').getRedirectUrlForRole;

describe('Middleware - Wizard Route Protection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
    });

    const createMockRequest = (pathname: string, method = 'GET') => {
        return new NextRequest(`http://localhost:3000${pathname}`, {
            method,
            headers: new Headers(),
        });
    };

    describe('Wizard Route Authentication', () => {
        it('should protect property wizard route for unauthenticated users', async () => {
            const request = createMockRequest('/dashboard/properties/new');

            mockIsPublicRoute.mockReturnValue(false);
            mockGetSession.mockResolvedValue(null);

            const response = await middleware(request);

            expect(response).toBeInstanceOf(NextResponse);
            expect(response.headers.get('location')).toContain('/sign-in');
        });

        it('should protect land wizard route for unauthenticated users', async () => {
            const request = createMockRequest('/dashboard/lands/new');

            mockIsPublicRoute.mockReturnValue(false);
            mockGetSession.mockResolvedValue(null);

            const response = await middleware(request);

            expect(response).toBeInstanceOf(NextResponse);
            expect(response.headers.get('location')).toContain('/sign-in');
        });

        it('should protect blog wizard route for unauthenticated users', async () => {
            const request = createMockRequest('/dashboard/blog/new');

            mockIsPublicRoute.mockReturnValue(false);
            mockGetSession.mockResolvedValue(null);

            const response = await middleware(request);

            expect(response).toBeInstanceOf(NextResponse);
            expect(response.headers.get('location')).toContain('/sign-in');
        });
    });

    describe('Permission-based Access Control', () => {
        it('should allow agent access to property wizard', async () => {
            const request = createMockRequest('/dashboard/properties/new');
            const mockSession = {
                user: {
                    id: 'agent-id',
                    role: 'agent',
                    email: 'agent@test.com',
                    emailVerified: true,
                },
            };

            mockIsPublicRoute.mockReturnValue(false);
            mockGetSession.mockResolvedValue(mockSession);
            mockGetRequiredPermission.mockReturnValue('properties.manage');
            mockShouldRedirectUser.mockReturnValue(null);

            const response = await middleware(request);

            expect(response).toBeInstanceOf(NextResponse);
            expect(response.headers.get('X-User-ID')).toBe('agent-id');
            expect(response.headers.get('X-User-Role')).toBe('agent');
        });

        it('should allow agent access to land wizard', async () => {
            const request = createMockRequest('/dashboard/lands/new');
            const mockSession = {
                user: {
                    id: 'agent-id',
                    role: 'agent',
                    email: 'agent@test.com',
                    emailVerified: true,
                },
            };

            mockIsPublicRoute.mockReturnValue(false);
            mockGetSession.mockResolvedValue(mockSession);
            mockGetRequiredPermission.mockReturnValue('lands.manage');
            mockShouldRedirectUser.mockReturnValue(null);

            const response = await middleware(request);

            expect(response).toBeInstanceOf(NextResponse);
            expect(response.headers.get('X-User-ID')).toBe('agent-id');
            expect(response.headers.get('X-User-Role')).toBe('agent');
        });

        it('should allow admin access to blog wizard', async () => {
            const request = createMockRequest('/dashboard/blog/new');
            const mockSession = {
                user: {
                    id: 'admin-id',
                    role: 'admin',
                    email: 'admin@test.com',
                    emailVerified: true,
                },
            };

            mockIsPublicRoute.mockReturnValue(false);
            mockGetSession.mockResolvedValue(mockSession);
            mockGetRequiredPermission.mockReturnValue('blog.manage');
            mockShouldRedirectUser.mockReturnValue(null);

            const response = await middleware(request);

            expect(response).toBeInstanceOf(NextResponse);
            expect(response.headers.get('X-User-ID')).toBe('admin-id');
            expect(response.headers.get('X-User-Role')).toBe('admin');
        });

        it('should deny regular user access to property wizard', async () => {
            const request = createMockRequest('/dashboard/properties/new');
            const mockSession = {
                user: {
                    id: 'user-id',
                    role: 'user',
                    email: 'user@test.com',
                    emailVerified: true,
                },
            };

            mockIsPublicRoute.mockReturnValue(false);
            mockGetSession.mockResolvedValue(mockSession);
            mockGetRequiredPermission.mockReturnValue('properties.manage');
            mockShouldRedirectUser.mockReturnValue(null);

            const response = await middleware(request);

            expect(response).toBeInstanceOf(NextResponse);
            expect(response.headers.get('location')).toContain('/sign-in');
        });

        it('should deny agent access to blog wizard', async () => {
            const request = createMockRequest('/dashboard/blog/new');
            const mockSession = {
                user: {
                    id: 'agent-id',
                    role: 'agent',
                    email: 'agent@test.com',
                    emailVerified: true,
                },
            };

            mockIsPublicRoute.mockReturnValue(false);
            mockGetSession.mockResolvedValue(mockSession);
            mockGetRequiredPermission.mockReturnValue('blog.manage');
            mockShouldRedirectUser.mockReturnValue(null);

            const response = await middleware(request);

            expect(response).toBeInstanceOf(NextResponse);
            expect(response.headers.get('location')).toContain('/sign-in');
        });
    });

    describe('Role-based Redirections', () => {
        it('should redirect regular users from dashboard to profile', async () => {
            const request = createMockRequest('/dashboard/properties/new');
            const mockSession = {
                user: {
                    id: 'user-id',
                    role: 'user',
                    email: 'user@test.com',
                    emailVerified: true,
                },
            };

            mockIsPublicRoute.mockReturnValue(false);
            mockGetSession.mockResolvedValue(mockSession);
            mockShouldRedirectUser.mockReturnValue('/profile');

            const response = await middleware(request);

            expect(response).toBeInstanceOf(NextResponse);
            expect(response.headers.get('location')).toContain('/profile');
        });

        it('should not redirect agents from dashboard routes', async () => {
            const request = createMockRequest('/dashboard/properties/new');
            const mockSession = {
                user: {
                    id: 'agent-id',
                    role: 'agent',
                    email: 'agent@test.com',
                    emailVerified: true,
                },
            };

            mockIsPublicRoute.mockReturnValue(false);
            mockGetSession.mockResolvedValue(mockSession);
            mockGetRequiredPermission.mockReturnValue('properties.manage');
            mockShouldRedirectUser.mockReturnValue(null);

            const response = await middleware(request);

            expect(response).toBeInstanceOf(NextResponse);
            expect(response.headers.get('X-User-Role')).toBe('agent');
            expect(response.headers.get('location')).toBeNull();
        });
    });

    describe('Security Headers', () => {
        it('should add security headers to wizard routes', async () => {
            const request = createMockRequest('/dashboard/properties/new');
            const mockSession = {
                user: {
                    id: 'agent-id',
                    role: 'agent',
                    email: 'agent@test.com',
                    emailVerified: true,
                },
            };

            mockIsPublicRoute.mockReturnValue(false);
            mockGetSession.mockResolvedValue(mockSession);
            mockGetRequiredPermission.mockReturnValue('properties.manage');
            mockShouldRedirectUser.mockReturnValue(null);

            const response = await middleware(request);

            expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
            expect(response.headers.get('X-Frame-Options')).toBe('DENY');
            expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
        });
    });

    describe('Error Handling', () => {
        it('should handle authentication errors gracefully', async () => {
            const request = createMockRequest('/dashboard/properties/new');

            mockIsPublicRoute.mockReturnValue(false);
            mockGetSession.mockRejectedValue(new Error('Auth service unavailable'));

            const response = await middleware(request);

            expect(response).toBeInstanceOf(NextResponse);
            expect(response.headers.get('location')).toContain('/sign-in');
            expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
        });

        it('should handle invalid user roles', async () => {
            const request = createMockRequest('/dashboard/properties/new');
            const mockSession = {
                user: {
                    id: 'user-id',
                    role: 'invalid-role',
                    email: 'user@test.com',
                    emailVerified: true,
                },
            };

            mockIsPublicRoute.mockReturnValue(false);
            mockGetSession.mockResolvedValue(mockSession);
            mockShouldRedirectUser.mockReturnValue(null);

            const response = await middleware(request);

            expect(response).toBeInstanceOf(NextResponse);
            expect(response.headers.get('location')).toContain('/sign-in');
        });
    });
});