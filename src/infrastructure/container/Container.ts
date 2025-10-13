// Simple dependency injection container
// In a real implementation, you might use a library like TSyringe or InversifyJS

type Constructor<T = {}> = new (...args: any[]) => T;
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
                instance = typeof service === 'function' ? new service() : service();
                this.singletons.set(token, instance);
            }
            return instance;
        }

        // Create new instance
        return typeof service === 'function' ? new service() : service();
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