import { randomBytes, createHash } from 'crypto';

/**
 * Service for generating and managing authentication tokens
 */
export class TokenService {
    /**
     * Generates a secure session token
     */
    generateSessionToken(): string {
        // Generate 32 bytes of random data and convert to hex
        const randomData = randomBytes(32);
        return randomData.toString('hex');
    }

    /**
     * Generates a secure API token
     */
    generateApiToken(): string {
        // Generate 48 bytes of random data for API tokens (longer than session tokens)
        const randomData = randomBytes(48);
        return randomData.toString('hex');
    }

    /**
     * Generates a verification token (for email verification, password reset, etc.)
     */
    generateVerificationToken(): string {
        // Generate 24 bytes of random data for verification tokens
        const randomData = randomBytes(24);
        return randomData.toString('hex');
    }

    /**
     * Generates a short numeric code (for 2FA, SMS verification, etc.)
     */
    generateNumericCode(length: number = 6): string {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        return Math.floor(Math.random() * (max - min + 1) + min).toString();
    }

    /**
     * Creates a hash of a token (for secure storage)
     */
    hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }

    /**
     * Verifies a token against its hash
     */
    verifyTokenHash(token: string, hash: string): boolean {
        const tokenHash = this.hashToken(token);
        return tokenHash === hash;
    }

    /**
     * Generates a JWT-like token structure (simplified)
     * Note: In production, use a proper JWT library
     */
    generateJwtLikeToken(payload: any, secret: string): string {
        const header = {
            alg: 'HS256',
            typ: 'JWT'
        };

        const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
        const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

        const signature = createHash('sha256')
            .update(`${encodedHeader}.${encodedPayload}.${secret}`)
            .digest('base64url');

        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }

    /**
     * Validates token format and length
     */
    validateTokenFormat(token: string, expectedLength?: number): boolean {
        if (!token || typeof token !== 'string') {
            return false;
        }

        // Check if token contains only valid hex characters
        if (!/^[a-f0-9]+$/i.test(token)) {
            return false;
        }

        // Check length if specified
        if (expectedLength && token.length !== expectedLength) {
            return false;
        }

        // Minimum length check
        if (token.length < 32) {
            return false;
        }

        return true;
    }

    /**
     * Generates a token with expiration
     */
    generateTokenWithExpiration(expirationMinutes: number = 60): {
        token: string;
        expiresAt: Date;
    } {
        const token = this.generateSessionToken();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);

        return {
            token,
            expiresAt,
        };
    }

    /**
     * Checks if a token is expired
     */
    isTokenExpired(expiresAt: Date): boolean {
        return new Date() > expiresAt;
    }
}