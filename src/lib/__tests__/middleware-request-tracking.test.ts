/**
 * Tests for enhanced middleware request tracking and loop prevention
 */

import { NextRequest } from 'next/server';

// Mock the crypto module for Edge Runtime compatibility
const mockRandomUUID = jest.fn(() => 'test-uuid-123');
jest.mock('crypto', () => ({
    randomUUID: mockRandomUUID
}));

// Mock the auth module
jest.mock('@/lib/auth/auth', () => ({
    auth: {
        api: {
            getSession: jest.fn()
        }
    }
}));

// Mock the admin config
jest.mock('@/lib/auth/admin-config', () => ({
    isPublicRoute: jest.fn(() => false),
    getRequiredPermission: jest.fn(() => null),
    shouldRedirectUser: jest.fn(() => null),
    getRedirectUrlForRole: jest.fn(() => '/dashboard')
}));

describe('Middleware Request Tracking', () => {
    let middleware: any;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();

        // Clear any existing intervals
        jest.clearAllTimers();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('Request ID Generation', () => {
        it('should generate unique request IDs', () => {
            mockRandomUUID
                .mockReturnValueOnce('uuid-1')
                .mockReturnValueOnce('uuid-2')
                .mockReturnValueOnce('uuid-3');

            // Import after mocking
            const { generateRequestId } = require('../../middleware');

            expect(generateRequestId()).toBe('uuid-1');
            expect(generateRequestId()).toBe('uuid-2');
            expect(generateRequestId()).toBe('uuid-3');
        });
    });

    describe('Authentication Flow Detection', () => {
        it('should detect authentication flow paths', () => {
            const { isAuthenticationFlow } = require('../../middleware');

            expect(isAuthenticationFlow('/sign-in')).toBe(true);
            expect(isAuthenticationFlow('/sign-up')).toBe(true);
            expect(isAuthenticationFlow('/forgot-password')).toBe(true);
            expect(isAuthenticationFlow('/reset-password')).toBe(true);
            expect(isAuthenticationFlow('/verify-email')).toBe(true);
            expect(isAuthenticationFlow('/dashboard')).toBe(true);
            expect(isAuthenticationFlow('/profile')).toBe(true);

            expect(isAuthenticationFlow('/api/test')).toBe(false);
            expect(isAuthenticationFlow('/properties')).toBe(false);
            expect(isAuthenticationFlow('/about')).toBe(false);
        });
    });

    describe('Circuit Breaker Pattern', () => {
        it('should open circuit breaker after failure threshold', () => {
            const { getCircuitBreakerState, updateCircuitBreaker } = require('../../middleware');

            const key = 'GET:/test';

            // Initial state should be closed
            let state = getCircuitBreakerState(key);
            expect(state.isOpen).toBe(false);
            expect(state.failureCount).toBe(0);

            // Add failures up to threshold
            updateCircuitBreaker(key, true); // failure 1
            updateCircuitBreaker(key, true); // failure 2
            updateCircuitBreaker(key, true); // failure 3 - should open circuit

            state = getCircuitBreakerState(key);
            expect(state.isOpen).toBe(true);
            expect(state.failureCount).toBe(3);
        });

        it('should reset circuit breaker after timeout', () => {
            const { getCircuitBreakerState, updateCircuitBreaker } = require('../../middleware');

            const key = 'GET:/test';

            // Open the circuit breaker
            updateCircuitBreaker(key, true);
            updateCircuitBreaker(key, true);
            updateCircuitBreaker(key, true);

            let state = getCircuitBreakerState(key);
            expect(state.isOpen).toBe(true);

            // Advance time past timeout
            jest.advanceTimersByTime(31000); // 31 seconds (timeout is 30s)

            // Next request should reset the circuit breaker
            const shouldBlock = updateCircuitBreaker(key, false);
            expect(shouldBlock).toBe(false);

            state = getCircuitBreakerState(key);
            expect(state.isOpen).toBe(false);
            expect(state.failureCount).toBe(0);
        });
    });

    describe('Request Tracking', () => {
        it('should track consecutive requests and detect loops', () => {
            const { trackRequest } = require('../../middleware');

            const createMockRequest = (pathname: string, method: string = 'GET') => ({
                nextUrl: { pathname },
                method,
                headers: {
                    get: jest.fn(() => 'test-user-agent')
                }
            });

            const request = createMockRequest('/sign-in', 'GET');

            // First few requests should be allowed
            let result = trackRequest(request);
            expect(result.shouldBlock).toBe(false);
            expect(result.context.consecutiveCount).toBe(1);

            result = trackRequest(request);
            expect(result.shouldBlock).toBe(false);
            expect(result.context.consecutiveCount).toBe(2);

            // Continue until loop detection threshold
            for (let i = 3; i <= 5; i++) {
                result = trackRequest(request);
                expect(result.context.consecutiveCount).toBe(i);
            }

            // Next request should trigger loop detection
            result = trackRequest(request);
            expect(result.shouldBlock).toBe(true);
            expect(result.context.consecutiveCount).toBe(6);
        });

        it('should reset tracking after cleanup interval', () => {
            const { trackRequest } = require('../../middleware');

            const createMockRequest = (pathname: string) => ({
                nextUrl: { pathname },
                method: 'GET',
                headers: {
                    get: jest.fn(() => 'test-user-agent')
                }
            });

            const request = createMockRequest('/test');

            // Make initial request
            let result = trackRequest(request);
            expect(result.context.consecutiveCount).toBe(1);

            // Advance time past cleanup interval
            jest.advanceTimersByTime(61000); // 61 seconds (cleanup is 60s)

            // Next request should reset counter
            result = trackRequest(request);
            expect(result.context.consecutiveCount).toBe(1);
        });
    });

    describe('Authentication Flow Tracking', () => {
        it('should track authentication flows', () => {
            const { trackAuthFlow } = require('../../middleware');

            const createMockRequest = (pathname: string) => ({
                nextUrl: { pathname },
                headers: {
                    get: jest.fn(() => 'test-user-agent')
                }
            });

            const request = createMockRequest('/sign-in');
            const requestId = 'test-request-id';

            // Should not throw and should track the flow
            expect(() => {
                trackAuthFlow(request, requestId);
            }).not.toThrow();
        });
    });
});