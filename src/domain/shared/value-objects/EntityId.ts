import { ValueObject } from './ValueObject';
import { BusinessRuleViolationError } from '../errors/DomainError';
import { v4 as uuidv4 } from "uuid";

export class EntityId extends ValueObject<string> {
    protected constructor(value: string) {
        super(value);
    }

    static create(value: string, entityType: string = 'Entity'): EntityId {
        if (!value || value.trim().length === 0) {
            throw new BusinessRuleViolationError(`${entityType} ID cannot be empty`, "VALIDATION_ERROR");
        }

        // Validate UUID format or numeric ID
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
        const isNumeric = /^\d+$/.test(value);

        if (!isUuid && !isNumeric) {
            throw new BusinessRuleViolationError(`${entityType} ID must be a valid UUID or numeric ID`, "VALIDATION_ERROR");
        }

        return new EntityId(value);
    }

    static generate(): EntityId {
        return new EntityId(uuidv4());
    }

    static fromNumber(id: number, entityType: string = 'Entity'): EntityId {
        if (id <= 0) {
            throw new BusinessRuleViolationError(`${entityType} ID must be a positive number`, "VALIDATION_ERROR");
        }
        return new EntityId(id.toString());
    }

    toNumber(): number {
        const num = parseInt(this.value);
        if (isNaN(num)) {
            throw new BusinessRuleViolationError("Cannot convert UUID EntityId to number", "VALIDATION_ERROR");
        }
        return num;
    }

    isUuid(): boolean {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(this.value);
    }

    isNumeric(): boolean {
        return /^\d+$/.test(this.value);
    }
}

// Specific ID types for type safety
export class PropertyId extends EntityId {
    static create(value: string): PropertyId {
        const id = super.create(value, 'Property');
        return Object.setPrototypeOf(id, PropertyId.prototype);
    }

    static generate(): PropertyId {
        const id = super.generate();
        return Object.setPrototypeOf(id, PropertyId.prototype);
    }

    static fromNumber(id: number): PropertyId {
        const entityId = super.fromNumber(id, 'Property');
        return Object.setPrototypeOf(entityId, PropertyId.prototype);
    }
}

export class LandId extends EntityId {
    static create(value: string): LandId {
        const id = super.create(value, 'Land');
        return Object.setPrototypeOf(id, LandId.prototype);
    }

    static generate(): LandId {
        const id = super.generate();
        return Object.setPrototypeOf(id, LandId.prototype);
    }

    static fromNumber(id: number): LandId {
        const entityId = super.fromNumber(id, 'Land');
        return Object.setPrototypeOf(entityId, LandId.prototype);
    }
}

export class BlogPostId extends EntityId {
    static create(value: string): BlogPostId {
        const id = super.create(value, 'BlogPost');
        return Object.setPrototypeOf(id, BlogPostId.prototype);
    }

    static generate(): BlogPostId {
        const id = super.generate();
        return Object.setPrototypeOf(id, BlogPostId.prototype);
    }

    static fromNumber(id: number): BlogPostId {
        const entityId = super.fromNumber(id, 'BlogPost');
        return Object.setPrototypeOf(entityId, BlogPostId.prototype);
    }
}

export class UserId extends EntityId {
    static create(value: string): UserId {
        const id = super.create(value, 'User');
        return Object.setPrototypeOf(id, UserId.prototype);
    }

    static generate(): UserId {
        const id = super.generate();
        return Object.setPrototypeOf(id, UserId.prototype);
    }

    static fromNumber(id: number): UserId {
        const entityId = super.fromNumber(id, 'User');
        return Object.setPrototypeOf(entityId, UserId.prototype);
    }
}

export class SessionId extends EntityId {
    static create(value: string): SessionId {
        const id = super.create(value, 'Session');
        return Object.setPrototypeOf(id, SessionId.prototype);
    }

    static generate(): SessionId {
        const id = super.generate();
        return Object.setPrototypeOf(id, SessionId.prototype);
    }

    static fromNumber(id: number): SessionId {
        const entityId = super.fromNumber(id, 'Session');
        return Object.setPrototypeOf(entityId, SessionId.prototype);
    }
}

export class WizardDraftId extends EntityId {
    static create(value: string): WizardDraftId {
        const id = super.create(value, 'WizardDraft');
        return Object.setPrototypeOf(id, WizardDraftId.prototype);
    }

    static generate(): WizardDraftId {
        const id = super.generate();
        return Object.setPrototypeOf(id, WizardDraftId.prototype);
    }

    static fromNumber(id: number): WizardDraftId {
        const entityId = super.fromNumber(id, 'WizardDraft');
        return Object.setPrototypeOf(entityId, WizardDraftId.prototype);
    }
}

export class WizardMediaId extends EntityId {
    static create(value: string): WizardMediaId {
        const id = super.create(value, 'WizardMedia');
        return Object.setPrototypeOf(id, WizardMediaId.prototype);
    }

    static generate(): WizardMediaId {
        const id = super.generate();
        return Object.setPrototypeOf(id, WizardMediaId.prototype);
    }

    static fromNumber(id: number): WizardMediaId {
        const entityId = super.fromNumber(id, 'WizardMedia');
        return Object.setPrototypeOf(entityId, WizardMediaId.prototype);
    }
}

export class PageSectionId extends EntityId {
    static create(value: string): PageSectionId {
        const id = super.create(value, 'PageSection');
        return Object.setPrototypeOf(id, PageSectionId.prototype);
    }

    static generate(): PageSectionId {
        const id = super.generate();
        return Object.setPrototypeOf(id, PageSectionId.prototype);
    }

    static fromNumber(id: number): PageSectionId {
        const entityId = super.fromNumber(id, 'PageSection');
        return Object.setPrototypeOf(entityId, PageSectionId.prototype);
    }
}