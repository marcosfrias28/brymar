import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { DomainError } from '@/domain/shared/errors/DomainError';

export class MediaUrl extends ValueObject<string> {
    private constructor(value: string) {
        super(value);
    }

    static create(url: string): MediaUrl {
        if (!url || url.trim().length === 0) {
            throw new DomainError("Media URL cannot be empty");
        }

        const trimmedUrl = url.trim();

        // Validate URL format
        try {
            new URL(trimmedUrl);
        } catch {
            throw new DomainError("Media URL must be a valid URL");
        }

        // Validate protocol (should be https for security)
        if (!trimmedUrl.startsWith("https://") && !trimmedUrl.startsWith("http://")) {
            throw new DomainError("Media URL must use HTTP or HTTPS protocol");
        }

        return new MediaUrl(trimmedUrl);
    }

    get value(): string {
        return this._value;
    }

    isSecure(): boolean {
        return this._value.startsWith("https://");
    }

    getDomain(): string {
        try {
            const url = new URL(this._value);
            return url.hostname;
        } catch {
            return "";
        }
    }

    getPath(): string {
        try {
            const url = new URL(this._value);
            return url.pathname;
        } catch {
            return "";
        }
    }

    getFilename(): string {
        const path = this.getPath();
        const segments = path.split("/");
        return segments[segments.length - 1] || "";
    }

    equals(other: MediaUrl): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return this._value;
    }
}