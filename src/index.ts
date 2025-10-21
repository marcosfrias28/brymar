// Main entry point for the DDD architecture
// Export specific modules to avoid naming conflicts
export * from './domain';
export * from './infrastructure';

// DDD layers have been removed - exports now come from simplified structure
// TODO: Update exports to use new simplified structure from lib/
// export * from './lib/actions';
// export * from './lib/types';
// export * from './hooks';