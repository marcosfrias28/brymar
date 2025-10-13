export abstract class DomainError extends Error {
    constructor(message: string, public readonly code?: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class ValueObjectValidationError extends DomainError {
    constructor(message: string) {
        super(message, 'VALUE_OBJECT_VALIDATION_ERROR');
    }
}

export class EntityValidationError extends DomainError {
    constructor(message: string, public readonly field?: string) {
        super(message, 'ENTITY_VALIDATION_ERROR');
    }
}

export class BusinessRuleViolationError extends DomainError {
    constructor(message: string, public readonly rule: string) {
        super(message, 'BUSINESS_RULE_VIOLATION');
    }
}

export class EntityNotFoundError extends DomainError {
    constructor(entityType: string, id: string) {
        super(`${entityType} with id ${id} not found`, 'ENTITY_NOT_FOUND');
    }
}