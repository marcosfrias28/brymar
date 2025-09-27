/**
 * AI Property Wizard Health Monitoring System
 * 
 * This module provides comprehensive health monitoring for the wizard,
 * including service health checks, performance monitoring, and alerting.
 */

import { getDeploymentConfig, checkServiceHealth } from '@/deployment/wizard-deployment-config';

export interface HealthCheckResult {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    services: ServiceHealthStatus[];
    performance: PerformanceMetrics;
    errors: HealthError[];
    uptime: number;
}

export interface ServiceHealthStatus {
    name: string;
    status: 'healthy' | 'unhealthy';
    latency?: number;
    error?: string;
    lastCheck: string;
    uptime: number;
}

export interface PerformanceMetrics {
    responseTime: {
        avg: number;
        p95: number;
        p99: number;
    };
    throughput: number;
    errorRate: number;
    memoryUsage: {
        used: number;
        total: number;
        percentage: number;
    };
    cpuUsage?: number;
}

export interface HealthError {
    service: string;
    error: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AlertRule {
    name: string;
    condition: (metrics: PerformanceMetrics, services: ServiceHealthStatus[]) => boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    cooldown: number; // minutes
}

class WizardHealthMonitor {
    private static instance: WizardHealthMonitor;
    private healthHistory: HealthCheckResult[] = [];
    private alertHistory: Map<string, number> = new Map();
    private startTime: number = Date.now();

    // Alert rules
    private alertRules: AlertRule[] = [
        {
            name: 'high_error_rate',
            condition: (metrics) => metrics.errorRate > 0.05, // 5%
            severity: 'high',
            message: 'Error rate is above 5%',
            cooldown: 15,
        },
        {
            name: 'slow_response_time',
            condition: (metrics) => metrics.responseTime.p95 > 2000, // 2 seconds
            severity: 'medium',
            message: '95th percentile response time is above 2 seconds',
            cooldown: 10,
        },
        {
            name: 'very_slow_response_time',
            condition: (metrics) => metrics.responseTime.p99 > 5000, // 5 seconds
            severity: 'high',
            message: '99th percentile response time is above 5 seconds',
            cooldown: 5,
        },
        {
            name: 'low_throughput',
            condition: (metrics) => metrics.throughput < 1, // 1 req/s
            severity: 'medium',
            message: 'Throughput is below 1 request per second',
            cooldown: 10,
        },
        {
            name: 'high_memory_usage',
            condition: (metrics) => metrics.memoryUsage.percentage > 85,
            severity: 'high',
            message: 'Memory usage is above 85%',
            cooldown: 5,
        },
        {
            name: 'critical_memory_usage',
            condition: (metrics) => metrics.memoryUsage.percentage > 95,
            severity: 'critical',
            message: 'Memory usage is above 95%',
            cooldown: 2,
        },
        {
            name: 'service_down',
            condition: (_, services) => services.some(s => s.status === 'unhealthy'),
            severity: 'critical',
            message: 'One or more critical services are down',
            cooldown: 1,
        },
    ];

    public static getInstance(): WizardHealthMonitor {
        if (!WizardHealthMonitor.instance) {
            WizardHealthMonitor.instance = new WizardHealthMonitor();
        }
        return WizardHealthMonitor.instance;
    }

    /**
     * Perform comprehensive health check
     */
    public async performHealthCheck(): Promise<HealthCheckResult> {
        const timestamp = new Date().toISOString();
        const errors: HealthError[] = [];

        try {
            // Check external services
            const serviceHealth = await this.checkExternalServices();

            // Get performance metrics
            const performance = await this.getPerformanceMetrics();

            // Determine overall status
            const overallStatus = this.determineOverallStatus(serviceHealth, performance);

            // Check for alerts
            const alerts = this.checkAlerts(performance, serviceHealth);
            errors.push(...alerts);

            const result: HealthCheckResult = {
                status: overallStatus,
                timestamp,
                services: serviceHealth,
                performance,
                errors,
                uptime: Date.now() - this.startTime,
            };

            // Store in history (keep last 100 checks)
            this.healthHistory.push(result);
            if (this.healthHistory.length > 100) {
                this.healthHistory.shift();
            }

            return result;

        } catch (error) {
            errors.push({
                service: 'health_monitor',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp,
                severity: 'critical',
            });

            return {
                status: 'unhealthy',
                timestamp,
                services: [],
                performance: this.getDefaultPerformanceMetrics(),
                errors,
                uptime: Date.now() - this.startTime,
            };
        }
    }

    /**
     * Check external service health
     */
    private async checkExternalServices(): Promise<ServiceHealthStatus[]> {
        const config = getDeploymentConfig();
        const services: ServiceHealthStatus[] = [];

        // Check AI service
        try {
            const start = Date.now();
            const response = await fetch(`${config.services.ai.baseUrl}/models`, {
                headers: {
                    'Authorization': `Bearer ${config.services.ai.apiKey}`,
                },
                signal: AbortSignal.timeout(10000),
            });

            services.push({
                name: 'ai_service',
                status: response.ok ? 'healthy' : 'unhealthy',
                latency: Date.now() - start,
                error: response.ok ? undefined : `HTTP ${response.status}`,
                lastCheck: new Date().toISOString(),
                uptime: this.calculateServiceUptime('ai_service'),
            });
        } catch (error) {
            services.push({
                name: 'ai_service',
                status: 'unhealthy',
                error: error instanceof Error ? error.message : 'Unknown error',
                lastCheck: new Date().toISOString(),
                uptime: this.calculateServiceUptime('ai_service'),
            });
        }

        // Check database
        try {
            const start = Date.now();
            // This would be replaced with actual database health check
            // const db = await getDatabase();
            // await db.raw('SELECT 1');

            services.push({
                name: 'database',
                status: 'healthy', // Placeholder
                latency: Date.now() - start,
                lastCheck: new Date().toISOString(),
                uptime: this.calculateServiceUptime('database'),
            });
        } catch (error) {
            services.push({
                name: 'database',
                status: 'unhealthy',
                error: error instanceof Error ? error.message : 'Unknown error',
                lastCheck: new Date().toISOString(),
                uptime: this.calculateServiceUptime('database'),
            });
        }

        // Check storage service
        try {
            const start = Date.now();
            // This would be replaced with actual storage health check

            services.push({
                name: 'storage',
                status: 'healthy', // Placeholder
                latency: Date.now() - start,
                lastCheck: new Date().toISOString(),
                uptime: this.calculateServiceUptime('storage'),
            });
        } catch (error) {
            services.push({
                name: 'storage',
                status: 'unhealthy',
                error: error instanceof Error ? error.message : 'Unknown error',
                lastCheck: new Date().toISOString(),
                uptime: this.calculateServiceUptime('storage'),
            });
        }

        return services;
    }

    /**
     * Get current performance metrics
     */
    private async getPerformanceMetrics(): Promise<PerformanceMetrics> {
        // Get memory usage
        const memoryUsage = process.memoryUsage();
        const totalMemory = memoryUsage.heapTotal + memoryUsage.external;
        const usedMemory = memoryUsage.heapUsed;

        // Calculate response time metrics from recent history
        const recentChecks = this.healthHistory.slice(-10);
        const responseTimes = recentChecks
            .flatMap(check => check.services.map(s => s.latency))
            .filter((latency): latency is number => latency !== undefined)
            .sort((a, b) => a - b);

        const responseTime = {
            avg: responseTimes.length > 0 ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length : 0,
            p95: responseTimes.length > 0 ? responseTimes[Math.floor(responseTimes.length * 0.95)] || 0 : 0,
            p99: responseTimes.length > 0 ? responseTimes[Math.floor(responseTimes.length * 0.99)] || 0 : 0,
        };

        // Calculate error rate from recent history
        const totalChecks = recentChecks.length;
        const errorChecks = recentChecks.filter(check => check.status !== 'healthy').length;
        const errorRate = totalChecks > 0 ? errorChecks / totalChecks : 0;

        // Calculate throughput (simplified)
        const throughput = totalChecks > 0 ? totalChecks / 60 : 0; // requests per minute converted to per second

        return {
            responseTime,
            throughput,
            errorRate,
            memoryUsage: {
                used: usedMemory,
                total: totalMemory,
                percentage: (usedMemory / totalMemory) * 100,
            },
        };
    }

    /**
     * Determine overall system status
     */
    private determineOverallStatus(
        services: ServiceHealthStatus[],
        performance: PerformanceMetrics
    ): 'healthy' | 'degraded' | 'unhealthy' {
        // Critical services down
        const criticalServices = ['database', 'ai_service'];
        const criticalDown = services.some(s =>
            criticalServices.includes(s.name) && s.status === 'unhealthy'
        );

        if (criticalDown) {
            return 'unhealthy';
        }

        // High error rate or very slow response times
        if (performance.errorRate > 0.1 || performance.responseTime.p99 > 10000) {
            return 'unhealthy';
        }

        // Some degradation
        if (
            performance.errorRate > 0.05 ||
            performance.responseTime.p95 > 3000 ||
            performance.memoryUsage.percentage > 90 ||
            services.some(s => s.status === 'unhealthy')
        ) {
            return 'degraded';
        }

        return 'healthy';
    }

    /**
     * Check alert conditions and generate alerts
     */
    private checkAlerts(
        performance: PerformanceMetrics,
        services: ServiceHealthStatus[]
    ): HealthError[] {
        const alerts: HealthError[] = [];
        const now = Date.now();

        for (const rule of this.alertRules) {
            if (rule.condition(performance, services)) {
                const lastAlert = this.alertHistory.get(rule.name) || 0;
                const cooldownMs = rule.cooldown * 60 * 1000;

                if (now - lastAlert > cooldownMs) {
                    alerts.push({
                        service: 'wizard_monitor',
                        error: rule.message,
                        timestamp: new Date().toISOString(),
                        severity: rule.severity,
                    });

                    this.alertHistory.set(rule.name, now);
                }
            }
        }

        return alerts;
    }

    /**
     * Calculate service uptime percentage
     */
    private calculateServiceUptime(serviceName: string): number {
        const recentChecks = this.healthHistory.slice(-50); // Last 50 checks
        const serviceChecks = recentChecks.map(check =>
            check.services.find(s => s.name === serviceName)
        ).filter(Boolean);

        if (serviceChecks.length === 0) return 100;

        const healthyChecks = serviceChecks.filter(s => s?.status === 'healthy').length;
        return (healthyChecks / serviceChecks.length) * 100;
    }

    /**
     * Get default performance metrics
     */
    private getDefaultPerformanceMetrics(): PerformanceMetrics {
        const memoryUsage = process.memoryUsage();
        return {
            responseTime: { avg: 0, p95: 0, p99: 0 },
            throughput: 0,
            errorRate: 1, // Assume 100% error rate if we can't get metrics
            memoryUsage: {
                used: memoryUsage.heapUsed,
                total: memoryUsage.heapTotal,
                percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
            },
        };
    }

    /**
     * Get health history
     */
    public getHealthHistory(limit: number = 50): HealthCheckResult[] {
        return this.healthHistory.slice(-limit);
    }

    /**
     * Get current system status
     */
    public async getCurrentStatus(): Promise<HealthCheckResult> {
        if (this.healthHistory.length === 0) {
            return await this.performHealthCheck();
        }
        return this.healthHistory[this.healthHistory.length - 1];
    }

    /**
     * Get service uptime statistics
     */
    public getUptimeStats(): Record<string, number> {
        const services = ['ai_service', 'database', 'storage'];
        const stats: Record<string, number> = {};

        for (const service of services) {
            stats[service] = this.calculateServiceUptime(service);
        }

        return stats;
    }

    /**
     * Export health data for external monitoring
     */
    public exportHealthData(): {
        current: HealthCheckResult | null;
        history: HealthCheckResult[];
        uptime: Record<string, number>;
        alerts: { rule: string; lastTriggered: number }[];
    } {
        return {
            current: this.healthHistory[this.healthHistory.length - 1] || null,
            history: this.healthHistory,
            uptime: this.getUptimeStats(),
            alerts: Array.from(this.alertHistory.entries()).map(([rule, lastTriggered]) => ({
                rule,
                lastTriggered,
            })),
        };
    }

    /**
     * Reset monitoring data
     */
    public reset(): void {
        this.healthHistory = [];
        this.alertHistory.clear();
        this.startTime = Date.now();
    }
}

// Singleton instance
export const wizardHealthMonitor = WizardHealthMonitor.getInstance();

// Utility functions for health checks
export async function getWizardHealth(): Promise<HealthCheckResult> {
    return await wizardHealthMonitor.performHealthCheck();
}

export function getWizardHealthHistory(limit?: number): HealthCheckResult[] {
    return wizardHealthMonitor.getHealthHistory(limit);
}

export async function getWizardStatus(): Promise<HealthCheckResult> {
    return await wizardHealthMonitor.getCurrentStatus();
}

export function getWizardUptimeStats(): Record<string, number> {
    return wizardHealthMonitor.getUptimeStats();
}

export function exportWizardHealthData() {
    return wizardHealthMonitor.exportHealthData();
}

// Health check middleware for API routes
export function createHealthCheckMiddleware() {
    return async (req: Request): Promise<Response | null> => {
        try {
            const health = await getWizardHealth();

            // If system is unhealthy, return 503
            if (health.status === 'unhealthy') {
                return new Response(JSON.stringify({
                    error: 'Service Unavailable',
                    health,
                }), {
                    status: 503,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Health-Status': health.status,
                        'X-Health-Timestamp': health.timestamp,
                        'X-Health-Uptime': health.uptime.toString(),
                    }
                });
            }

            // Return null to continue to next middleware
            return null;
        } catch (error) {
            return new Response(JSON.stringify({
                error: 'Health check failed',
                message: error instanceof Error ? error.message : 'Unknown error',
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        }
    };
}

export default wizardHealthMonitor;