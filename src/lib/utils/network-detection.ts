/**
 * Network connectivity detection and offline queuing system
 * Provides robust network status monitoring and request queuing for offline scenarios
 */

import { toast } from 'sonner';

export interface QueuedOperation {
    id: string;
    operation: () => Promise<any>;
    data: any;
    timestamp: number;
    retries: number;
    maxRetries: number;
    type: 'draft' | 'upload' | 'ai' | 'general';
    description: string;
}

export interface NetworkStatus {
    isOnline: boolean;
    connectionType?: string;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
}

class NetworkDetectionService {
    private isOnline: boolean = true;
    private listeners: Set<(status: NetworkStatus) => void> = new Set();
    private operationQueue: Map<string, QueuedOperation> = new Map();
    private isProcessingQueue: boolean = false;
    private connectionCheckInterval?: NodeJS.Timeout;
    private lastOnlineCheck: number = Date.now();

    constructor() {
        if (typeof window !== 'undefined') {
            this.initializeNetworkDetection();
            this.startConnectionMonitoring();
        }
    }

    private initializeNetworkDetection(): void {
        // Initial state
        this.isOnline = navigator.onLine;

        // Listen to browser events
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));

        // Listen to connection change events (if supported)
        if ('connection' in navigator) {
            const connection = (navigator as any).connection;
            connection?.addEventListener('change', this.handleConnectionChange.bind(this));
        }

        // Visibility change detection (tab becomes active)
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    private startConnectionMonitoring(): void {
        // Periodic connectivity check
        this.connectionCheckInterval = setInterval(() => {
            this.performConnectivityCheck();
        }, 30000); // Check every 30 seconds
    }

    private async performConnectivityCheck(): Promise<void> {
        try {
            // Try to fetch a small resource with cache-busting
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch('/api/health-check', {
                method: 'HEAD',
                cache: 'no-cache',
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const wasOnline = this.isOnline;
            this.isOnline = response.ok;

            if (!wasOnline && this.isOnline) {
                this.handleOnline();
            } else if (wasOnline && !this.isOnline) {
                this.handleOffline();
            }

            this.lastOnlineCheck = Date.now();
        } catch (error) {
            // If fetch fails, we're likely offline
            if (this.isOnline) {
                this.handleOffline();
            }
        }
    }

    private handleOnline(): void {
        const wasOffline = !this.isOnline;
        this.isOnline = true;

        if (wasOffline) {
            toast.success('Conexión restaurada', {
                description: 'Procesando operaciones pendientes...'
            });

            this.notifyListeners();
            this.processQueuedOperations();
        }
    }

    private handleOffline(): void {
        this.isOnline = false;

        toast.error('Sin conexión a internet', {
            description: 'Las operaciones se guardarán para cuando se restaure la conexión.',
            duration: Infinity,
            action: {
                label: 'Reintentar',
                onClick: () => this.performConnectivityCheck()
            }
        });

        this.notifyListeners();
    }

    private handleConnectionChange(): void {
        // Additional logic for connection type changes
        this.notifyListeners();
    }

    private handleVisibilityChange(): void {
        if (!document.hidden && Date.now() - this.lastOnlineCheck > 10000) {
            // Tab became visible and it's been more than 10 seconds since last check
            this.performConnectivityCheck();
        }
    }

    private notifyListeners(): void {
        const status = this.getNetworkStatus();
        this.listeners.forEach(listener => {
            try {
                listener(status);
            } catch (error) {
                console.error('Error in network status listener:', error);
            }
        });
    }

    public getNetworkStatus(): NetworkStatus {
        const status: NetworkStatus = {
            isOnline: this.isOnline
        };

        if (typeof window !== 'undefined' && 'connection' in navigator) {
            const connection = (navigator as any).connection;
            if (connection) {
                status.connectionType = connection.type;
                status.effectiveType = connection.effectiveType;
                status.downlink = connection.downlink;
                status.rtt = connection.rtt;
            }
        }

        return status;
    }

    public addNetworkListener(listener: (status: NetworkStatus) => void): () => void {
        this.listeners.add(listener);

        // Return unsubscribe function
        return () => {
            this.listeners.delete(listener);
        };
    }

    public async queueOperation(operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retries'>): Promise<string> {
        const id = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const queuedOp: QueuedOperation = {
            id,
            timestamp: Date.now(),
            retries: 0,
            ...operation
        };

        this.operationQueue.set(id, queuedOp);

        // If we're online, try to process immediately
        if (this.isOnline && !this.isProcessingQueue) {
            this.processQueuedOperations();
        } else {
            toast.info('Operación guardada', {
                description: `${operation.description} se ejecutará cuando se restaure la conexión.`
            });
        }

        return id;
    }

    public removeQueuedOperation(id: string): boolean {
        return this.operationQueue.delete(id);
    }

    public getQueuedOperations(): QueuedOperation[] {
        return Array.from(this.operationQueue.values());
    }

    public clearQueue(): void {
        this.operationQueue.clear();
    }

    private async processQueuedOperations(): Promise<void> {
        if (this.isProcessingQueue || !this.isOnline || this.operationQueue.size === 0) {
            return;
        }

        this.isProcessingQueue = true;

        const operations = Array.from(this.operationQueue.values())
            .sort((a, b) => a.timestamp - b.timestamp); // Process oldest first

        let processedCount = 0;
        let failedCount = 0;

        for (const operation of operations) {
            try {
                await operation.operation();
                this.operationQueue.delete(operation.id);
                processedCount++;
            } catch (error) {
                operation.retries++;

                if (operation.retries >= operation.maxRetries) {
                    this.operationQueue.delete(operation.id);
                    failedCount++;

                    toast.error('Operación falló', {
                        description: `${operation.description} no pudo completarse después de ${operation.maxRetries} intentos.`
                    });
                } else {
                    // Keep in queue for next attempt
                    console.warn(`Operation ${operation.id} failed, will retry (${operation.retries}/${operation.maxRetries})`);
                }
            }

            // Check if we're still online
            if (!this.isOnline) {
                break;
            }
        }

        this.isProcessingQueue = false;

        if (processedCount > 0) {
            toast.success('Operaciones completadas', {
                description: `${processedCount} operación(es) procesada(s) exitosamente.`
            });
        }
    }

    public destroy(): void {
        if (typeof window !== 'undefined') {
            window.removeEventListener('online', this.handleOnline.bind(this));
            window.removeEventListener('offline', this.handleOffline.bind(this));
            document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        }

        if (this.connectionCheckInterval) {
            clearInterval(this.connectionCheckInterval);
        }

        this.listeners.clear();
        this.operationQueue.clear();
    }
}

// Singleton instance
export const networkDetection = new NetworkDetectionService();

// React hook for network status
export function useNetworkStatus() {
    const [networkStatus, setNetworkStatus] = React.useState<NetworkStatus>(() =>
        networkDetection.getNetworkStatus()
    );

    React.useEffect(() => {
        const unsubscribe = networkDetection.addNetworkListener(setNetworkStatus);
        return unsubscribe;
    }, []);

    return networkStatus;
}

// React hook for offline queue management
export function useOfflineQueue() {
    const [queuedOperations, setQueuedOperations] = React.useState<QueuedOperation[]>([]);

    React.useEffect(() => {
        const updateQueue = () => {
            setQueuedOperations(networkDetection.getQueuedOperations());
        };

        // Update queue initially
        updateQueue();

        // Listen for network status changes to update queue
        const unsubscribe = networkDetection.addNetworkListener(updateQueue);

        // Periodic update
        const interval = setInterval(updateQueue, 5000);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, []);

    const queueOperation = React.useCallback(async (
        operation: () => Promise<any>,
        options: {
            type: QueuedOperation['type'];
            description: string;
            data?: any;
            maxRetries?: number;
        }
    ) => {
        return await networkDetection.queueOperation({
            operation,
            data: options.data,
            type: options.type,
            description: options.description,
            maxRetries: options.maxRetries || 3
        });
    }, []);

    const removeOperation = React.useCallback((id: string) => {
        return networkDetection.removeQueuedOperation(id);
    }, []);

    const clearQueue = React.useCallback(() => {
        networkDetection.clearQueue();
        setQueuedOperations([]);
    }, []);

    return {
        queuedOperations,
        queueOperation,
        removeOperation,
        clearQueue
    };
}

// Utility function to execute operation with offline support
export async function executeWithOfflineSupport<T>(
    operation: () => Promise<T>,
    options: {
        type: QueuedOperation['type'];
        description: string;
        data?: any;
        maxRetries?: number;
        fallback?: () => T;
    }
): Promise<T> {
    const networkStatus = networkDetection.getNetworkStatus();

    if (networkStatus.isOnline) {
        try {
            return await operation();
        } catch (error) {
            // If operation fails and we have a fallback, use it
            if (options.fallback) {
                return options.fallback();
            }

            // Otherwise, queue the operation
            await networkDetection.queueOperation({
                operation,
                data: options.data,
                type: options.type,
                description: options.description,
                maxRetries: options.maxRetries || 3
            });

            throw error;
        }
    } else {
        // We're offline, queue the operation
        await networkDetection.queueOperation({
            operation,
            data: options.data,
            type: options.type,
            description: options.description,
            maxRetries: options.maxRetries || 3
        });

        // Return fallback if available
        if (options.fallback) {
            return options.fallback();
        }

        throw new Error('Operación no disponible sin conexión');
    }
}

// Import React for hooks
import React from 'react';