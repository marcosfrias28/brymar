import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { BusinessRuleViolationError } from '@/domain/shared/errors/DomainError';

export interface MediaMetadataData {
    filename: string;
    originalFilename?: string;
    size: number;
    contentType: string;
    width?: number;
    height?: number;
    duration?: number;
}

export class MediaMetadata extends ValueObject<MediaMetadataData> {
    private constructor(value: MediaMetadataData) {
        super(value);
    }

    static create(data: MediaMetadataData): MediaMetadata {
        // Validate required fields
        if (!data.filename || data.filename.trim().length === 0) {
            throw new BusinessRuleViolationError("Filename is required", "WIZARD_VALIDATION");
        }

        if (typeof data.size !== "number" || data.size < 0) {
            throw new BusinessRuleViolationError("Size must be a non-negative number", "WIZARD_VALIDATION");
        }

        if (!data.contentType || data.contentType.trim().length === 0) {
            throw new BusinessRuleViolationError("Content type is required", "WIZARD_VALIDATION");
        }

        // Validate optional numeric fields
        if (data.width !== undefined && (typeof data.width !== "number" || data.width < 0)) {
            throw new BusinessRuleViolationError("Width must be a non-negative number", "WIZARD_VALIDATION");
        }

        if (data.height !== undefined && (typeof data.height !== "number" || data.height < 0)) {
            throw new BusinessRuleViolationError("Height must be a non-negative number", "WIZARD_VALIDATION");
        }

        if (data.duration !== undefined && (typeof data.duration !== "number" || data.duration < 0)) {
            throw new BusinessRuleViolationError("Duration must be a non-negative number", "WIZARD_VALIDATION");
        }

        // Validate content type format
        const contentTypeRegex = /^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/;
        if (!contentTypeRegex.test(data.contentType.trim())) {
            throw new BusinessRuleViolationError("Content type must be a valid MIME type", "WIZARD_VALIDATION");
        }

        const validatedData: MediaMetadataData = {
            filename: data.filename.trim(),
            originalFilename: data.originalFilename?.trim(),
            size: data.size,
            contentType: data.contentType.trim(),
            width: data.width,
            height: data.height,
            duration: data.duration,
        };

        return new MediaMetadata(validatedData);
    }

    get value(): MediaMetadataData {
        return { ...this._value };
    }

    getFilename(): string {
        return this._value.filename;
    }

    getOriginalFilename(): string | undefined {
        return this._value.originalFilename;
    }

    getSize(): number {
        return this._value.size;
    }

    getContentType(): string {
        return this._value.contentType;
    }

    getWidth(): number | undefined {
        return this._value.width;
    }

    getHeight(): number | undefined {
        return this._value.height;
    }

    getDuration(): number | undefined {
        return this._value.duration;
    }

    isImage(): boolean {
        return this._value.contentType.startsWith("image/");
    }

    isVideo(): boolean {
        return this._value.contentType.startsWith("video/");
    }

    hasImageDimensions(): boolean {
        return this._value.width !== undefined && this._value.height !== undefined;
    }

    hasVideoDuration(): boolean {
        return this._value.duration !== undefined;
    }

    getFormattedSize(): string {
        const bytes = this._value.size;
        const sizes = ["Bytes", "KB", "MB", "GB"];

        if (bytes === 0) return "0 Bytes";

        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        const size = bytes / Math.pow(1024, i);

        return `${Math.round(size * 100) / 100} ${sizes[i]}`;
    }

    getFormattedDuration(): string | undefined {
        if (this._value.duration === undefined) return undefined;

        const duration = this._value.duration;
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = Math.floor(duration % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        } else {
            return `${minutes}:${seconds.toString().padStart(2, "0")}`;
        }
    }

    equals(other: MediaMetadata): boolean {
        return JSON.stringify(this._value) === JSON.stringify(other._value);
    }

    toJSON(): MediaMetadataData {
        return this.value;
    }
}