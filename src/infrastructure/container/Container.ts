// Simple dependency injection container
// In a real implementation, you might use a library like TSyringe or InversifyJS

type Constructor<T = {}> = new () => T;
type ServiceFactory<T> = () => T;

class DIContainer {
    private services = new Map<string, any>();
    private singletons = new Map<string, any>();

    register<T>(token: string, implementation: Constructor<T> | ServiceFactory<T>): void {
        this.services.set(token, implementation);
    }

    registerSingleton<T>(token: string, implementation: Constructor<T> | ServiceFactory<T>): void {
        this.services.set(token, implementation);
        // Mark as singleton
        this.singletons.set(token, null);
    }

    get<T>(token: string): T {
        const service = this.services.get(token);

        if (!service) {
            throw new Error(`Service ${token} not found`);
        }

        // Check if it's a singleton
        if (this.singletons.has(token)) {
            let instance = this.singletons.get(token);
            if (!instance) {
                instance = this.createInstance(service);
                this.singletons.set(token, instance);
            }
            return instance;
        }

        // Create new instance
        return this.createInstance(service);
    }

    private createInstance<T>(service: any): T {
        // If it's a factory function (arrow function or function that returns something)
        if (typeof service === 'function') {
            try {
                // Try calling as factory function first
                const result = service();
                // If the result is an object (not undefined/null), it's a factory
                if (result && typeof result === 'object') {
                    return result;
                }
                // If it returns undefined/null, try as constructor
                return new service();
            } catch (error) {
                // If factory call fails, try as constructor
                try {
                    return new service();
                } catch {
                    throw new Error(`Failed to instantiate service: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
        }

        return service;
    }

    has(token: string): boolean {
        return this.services.has(token);
    }

    clear(): void {
        this.services.clear();
        this.singletons.clear();
    }
}

export const container = new DIContainer();