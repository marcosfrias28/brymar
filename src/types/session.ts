/**
 * Session Types
 *
 * Types for user session management
 */

export interface UserSession {
	user: {
		id: string;
		email: string;
		name?: string;
	};
	accessToken: string;
	refreshToken?: string;
	expiresAt: number;
}
