/**
 * Base class for all use cases in the application layer
 */
export abstract class UseCase<TInput, TOutput> {
    /**
     * Execute the use case with the given input
     */
    abstract execute(input: TInput): Promise<TOutput>;
}

/**
 * Base class for use cases that don't require input
 */
export abstract class QueryUseCase<TOutput> {
    /**
     * Execute the query use case
     */
    abstract execute(): Promise<TOutput>;
}

/**
 * Base class for use cases that don't return output
 */
export abstract class CommandUseCase<TInput> {
    /**
     * Execute the command use case
     */
    abstract execute(input: TInput): Promise<void>;
}