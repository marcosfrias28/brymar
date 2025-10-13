"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Brain,
  Upload,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface ServiceHealth {
  name: string;
  status: "healthy" | "degraded" | "down";
  responseTime: number;
  errorRate: number;
  uptime: number;
  lastCheck: Date;
  icon: React.ReactNode;
}

interface SystemMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  peakResponseTime: number;
  uptimePercentage: number;
}

export function SystemHealthMonitor() {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchHealthData();

    if (autoRefresh) {
      const interval = setInterval(fetchHealthData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchHealthData = async () => {
    try {
      setError(null);

      const [healthRes, metricsRes] = await Promise.all([
        fetch("/api/analytics/wizard/health"),
        fetch("/api/analytics/wizard/metrics"),
      ]);

      if (!healthRes.ok) throw new Error("Failed to fetch health data");

      const healthData = await healthRes.json();

      // Transform health data into service objects
      const serviceData: ServiceHealth[] = [
        {
          name: "HuggingFace API",
          status: healthData.huggingfaceStatus,
          responseTime: healthData.averageResponseTimes.huggingface,
          errorRate: healthData.errorRates.huggingface,
          uptime: calculateUptime(healthData.errorRates.huggingface),
          lastCheck: new Date(),
          icon: <Brain className="h-5 w-5" />,
        },
        {
          name: "Vercel Blob Storage",
          status: healthData.vercelBlobStatus,
          responseTime: healthData.averageResponseTimes.vercelBlob,
          errorRate: healthData.errorRates.vercelBlob,
          uptime: calculateUptime(healthData.errorRates.vercelBlob),
          lastCheck: new Date(),
          icon: <Upload className="h-5 w-5" />,
        },
        {
          name: "Geocoding Service",
          status: healthData.geocodingStatus,
          responseTime: healthData.averageResponseTimes.geocoding,
          errorRate: healthData.errorRates.geocoding,
          uptime: calculateUptime(healthData.errorRates.geocoding),
          lastCheck: new Date(),
          icon: <MapPin className="h-5 w-5" />,
        },
      ];

      setServices(serviceData);

      // Fetch metrics if available
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }

      setLastUpdate(new Date());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch health data"
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateUptime = (errorRate: number): number => {
    return Math.max(0, 100 - errorRate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-50 border-green-200";
      case "degraded":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "down":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4" />;
      case "degraded":
        return <AlertTriangle className="h-4 w-4" />;
      case "down":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getResponseTimeStatus = (responseTime: number) => {
    if (responseTime < 1000) return "excellent";
    if (responseTime < 3000) return "good";
    if (responseTime < 5000) return "fair";
    return "poor";
  };

  const getOverallHealth = () => {
    const healthyServices = services.filter(
      (s) => s.status === "healthy"
    ).length;
    const totalServices = services.length;

    if (healthyServices === totalServices) return "healthy";
    if (healthyServices >= totalServices * 0.7) return "degraded";
    return "critical";
  };

  if (loading && services.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 animate-spin" />
            System Health Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const overallHealth = getOverallHealth();

  return (
    <div className="space-y-6">
      {/* Header with overall status */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">System Health</h2>
          <Badge
            variant={
              overallHealth === "healthy"
                ? "default"
                : overallHealth === "degraded"
                ? "secondary"
                : "destructive"
            }
            className="flex items-center gap-1"
          >
            {getStatusIcon(overallHealth)}
            {overallHealth.toUpperCase()}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHealthData}
            disabled={loading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            Auto-refresh {autoRefresh ? "ON" : "OFF"}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Service Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {services.map((service) => (
          <Card
            key={service.name}
            className={`border-2 ${getStatusColor(service.status)}`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  {service.icon}
                  {service.name}
                </div>
                <div className="flex items-center gap-1">
                  {getStatusIcon(service.status)}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Status:</span>
                <Badge
                  variant={
                    service.status === "healthy"
                      ? "default"
                      : service.status === "degraded"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {service.status.toUpperCase()}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Response Time:</span>
                <div className="flex items-center gap-1">
                  <span className="font-semibold">
                    {service.responseTime}ms
                  </span>
                  {getResponseTimeStatus(service.responseTime) ===
                    "excellent" && (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  )}
                  {getResponseTimeStatus(service.responseTime) === "poor" && (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Error Rate:</span>
                <span className="font-semibold">
                  {service.errorRate.toFixed(1)}%
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Uptime:</span>
                  <span className="font-semibold">
                    {service.uptime.toFixed(1)}%
                  </span>
                </div>
                <Progress value={service.uptime} className="h-2" />
              </div>

              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Last check:</span>
                <span>{service.lastCheck.toLocaleTimeString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Metrics */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>System Metrics (Last 24 Hours)</CardTitle>
            <CardDescription>
              Overall system performance and usage statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.totalRequests.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Requests
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {metrics.successfulRequests.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {metrics.failedRequests.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {metrics.averageResponseTime}ms
                </div>
                <div className="text-sm text-muted-foreground">
                  Avg Response
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {metrics.peakResponseTime}ms
                </div>
                <div className="text-sm text-muted-foreground">
                  Peak Response
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">
                  {metrics.uptimePercentage.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
