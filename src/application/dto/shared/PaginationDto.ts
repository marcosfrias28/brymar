/**
 * Shared DTOs for pagination and common operations
 */

export class PaginationInput {
    constructor(
        public readonly page: number = 1,
        public readonly limit: number = 10,
        public readonly sortBy?: string,
        public readonly sortOrder: 'asc' | 'desc' = 'desc'
    ) {
        if (page < 1) {
            throw new Error('Page must be greater than 0');
        }
        if (limit < 1 || limit > 100) {
            throw new Error('Limit must be between 1 and 100');
        }
    }

    static create(data: {
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): PaginationInput {
        return new PaginationInput(
            data.page,
            data.limit,
            data.sortBy,
            data.sortOrder
        );
    }

    getOffset(): number {
        return (this.page - 1) * this.limit;
    }
}

export class PaginationOutput<T> {
    constructor(
        public readonly items: T[],
        public readonly total: number,
        public readonly page: number,
        public readonly limit: number
    ) { }

    static create<T>(
        items: T[],
        total: number,
        pagination: PaginationInput
    ): PaginationOutput<T> {
        return new PaginationOutput(
            items,
            total,
            pagination.page,
            pagination.limit
        );
    }

    get totalPages(): number {
        return Math.ceil(this.total / this.limit);
    }

    get hasNextPage(): boolean {
        return this.page < this.totalPages;
    }

    get hasPreviousPage(): boolean {
        return this.page > 1;
    }

    get nextPage(): number | null {
        return this.hasNextPage ? this.page + 1 : null;
    }

    get previousPage(): number | null {
        return this.hasPreviousPage ? this.page - 1 : null;
    }
}