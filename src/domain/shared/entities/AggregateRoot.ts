export abstract class AggregateRoot {
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

    isNew(): boolean {
        return this.createdAt === this.updatedAt;
    }

    equals(other: AggregateRoot): boolean {
        if (!other || other.constructor !== this.constructor) {
            return false;
        }
        return this.id === other.id;
    }
}