import {
    validateBlobConfig,
    isBlobStorageAvailable,
    getBlobConfigInfo,
    shouldUseMockStorage
} from '../blob-config';

describe('Blob Configuration', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('validateBlobConfig', () => {
        it('returns not configured when token is missing', () => {
            delete process.env.BLOB_READ_WRITE_TOKEN;

            const config = validateBlobConfig();

            expect(config.isConfigured).toBe(false);
            expect(config.error).toContain('BLOB_READ_WRITE_TOKEN environment variable is not set');
        });

        it('returns not configured when token format is invalid', () => {
            process.env.BLOB_READ_WRITE_TOKEN = 'invalid_token';

            const config = validateBlobConfig();

            expect(config.isConfigured).toBe(false);
            expect(config.error).toContain('should start with vercel_blob_');
        });

        it('returns configured when token is valid', () => {
            process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_valid_token';

            const config = validateBlobConfig();

            expect(config.isConfigured).toBe(true);
            expect(config.token).toBe('vercel_blob_rw_valid_token');
            expect(config.error).toBeUndefined();
        });
    });

    describe('isBlobStorageAvailable', () => {
        it('returns false when blob is not configured', () => {
            delete process.env.BLOB_READ_WRITE_TOKEN;

            expect(isBlobStorageAvailable()).toBe(false);
        });

        it('returns true when blob is properly configured', () => {
            process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_valid_token';

            expect(isBlobStorageAvailable()).toBe(true);
        });
    });

    describe('getBlobConfigInfo', () => {
        it('provides recommendations when not configured', () => {
            delete process.env.BLOB_READ_WRITE_TOKEN;
            process.env.NODE_ENV = 'development';

            const info = getBlobConfigInfo();

            expect(info.isConfigured).toBe(false);
            expect(info.recommendations).toContain('Set up Vercel Blob storage:');
            expect(info.isDevelopment).toBe(true);
        });

        it('provides development-specific recommendations', () => {
            delete process.env.BLOB_READ_WRITE_TOKEN;
            process.env.NODE_ENV = 'development';

            const info = getBlobConfigInfo();

            expect(info.recommendations.some(r => r.includes('MOCK_BLOB_STORAGE=true'))).toBe(true);
        });

        it('does not provide mock recommendations in production', () => {
            delete process.env.BLOB_READ_WRITE_TOKEN;
            process.env.NODE_ENV = 'production';

            const info = getBlobConfigInfo();

            expect(info.recommendations.some(r => r.includes('MOCK_BLOB_STORAGE=true'))).toBe(false);
            expect(info.isDevelopment).toBe(false);
        });
    });

    describe('shouldUseMockStorage', () => {
        it('returns true when explicitly enabled', () => {
            process.env.MOCK_BLOB_STORAGE = 'true';
            process.env.NODE_ENV = 'production';
            process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_valid_token';

            expect(shouldUseMockStorage()).toBe(true);
        });

        it('returns true in development when blob not configured', () => {
            delete process.env.BLOB_READ_WRITE_TOKEN;
            process.env.NODE_ENV = 'development';
            process.env.MOCK_BLOB_STORAGE = 'false';

            expect(shouldUseMockStorage()).toBe(true);
        });

        it('returns false in development when blob is configured and mock not enabled', () => {
            process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_valid_token';
            process.env.NODE_ENV = 'development';
            process.env.MOCK_BLOB_STORAGE = 'false';

            expect(shouldUseMockStorage()).toBe(false);
        });

        it('returns false in production when blob is configured and mock not enabled', () => {
            process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_valid_token';
            process.env.NODE_ENV = 'production';
            delete process.env.MOCK_BLOB_STORAGE;

            expect(shouldUseMockStorage()).toBe(false);
        });
    });
});