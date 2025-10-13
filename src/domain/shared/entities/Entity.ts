export abstract class Entity {
    protected constructor(
        protected readonly id: any,
        protected readonly createdAt: Date,
        protected updatedAt: Date
    ) { }

    getId(): any {
        return this.id;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }

    getUpdatedAt(): Date {
        return this.updatedAt;
    }

    protected touch(): void {
        this.updatedAt = new Date();
    }

    equals(other: Entity): boolean {
        if (!other || other.constructor !== this.constructor) {
            return false;
        }
        return this.id === other.id;
    }
}