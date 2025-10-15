// Main entry point for the DDD architecture
// Export specific modules to avoid naming conflicts
export * from './domain';
export * from './infrastructure';

// Export application layer selectively to avoid conflicts
export * from './application/use-cases';
export * from './application/services';
export * from './application/errors';