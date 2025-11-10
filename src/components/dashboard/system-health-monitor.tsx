"use client";

import {
	Activity,
	AlertTriangle,
	Brain,
	CheckCircle,
	MapPin,
	RefreshCw,
	TrendingDown,
	TrendingUp,
	Upload,
	XCircle,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type ServiceHealth = {
	name: string;
	status: "healthy" | "degraded" | "down";
	responseTime: number;
	errorRate: number;
	uptime: number;
	lastCheck: Date;
	icon: React.ReactNode;
};

type SystemMetrics = {
	totalRequests: number;
	successfulRequests: number;
	failedRequests: number;
	averageResponseTime: number;
	peakResponseTime: number;
	uptimePercentage: number;
};

export function SystemHealthMonitor() {
	const [services, setServices] = useState<ServiceHealth[]>([]);
	const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
	const [autoRefresh, setAutoRefresh] = useState(true);

	const fetchHealthData = async () => {
		try {
			setError(null);

			const [healthRes, metricsRes] = await Promise.all([
				fetch("/api/analytics/wizard/health"),
				fetch("/api/analytics/wizard/metrics"),
			]);

			if (!healthRes.ok) {
				throw new Error("Failed to fetch health data");
			}

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

	useEffect(() => {
		fetchHealthData();

		if (autoRefresh) {
			const interval = setInterval(fetchHealthData, 30_000); // Refresh every 30 seconds
			return () => clearInterval(interval);
		}
	}, [autoRefresh, fetchHealthData]);

	const calculateUptime = (errorRate: number): number =>
		Math.max(0, 100 - errorRate);

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
		if (responseTime < 1000) {
			return "excellent";
		}
		if (responseTime < 3000) {
			return "good";
		}
		if (responseTime < 5000) {
			return "fair";
		}
		return "poor";
	};

	const getOverallHealth = () => {
		const healthyServices = services.filter(
			(s) => s.status === "healthy"
		).length;
		const totalServices = services.length;

		if (healthyServices === totalServices) {
			return "healthy";
		}
		if (healthyServices >= totalServices * 0.7) {
			return "degraded";
		}
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
						{[...new Array(3)].map((_, i) => (
							<div className="animate-pulse" key={i}>
								<div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
								<div className="h-2 w-full rounded bg-gray-200" />
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
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<h2 className="font-bold text-2xl">System Health</h2>
					<Badge
						className="flex items-center gap-1"
						variant={
							overallHealth === "healthy"
								? "default"
								: overallHealth === "degraded"
									? "secondary"
									: "destructive"
						}
					>
						{getStatusIcon(overallHealth)}
						{overallHealth.toUpperCase()}
					</Badge>
				</div>

				<div className="flex items-center gap-2">
					<span className="text-muted-foreground text-sm">
						Last updated: {lastUpdate.toLocaleTimeString()}
					</span>
					<Button
						className="flex items-center gap-1"
						disabled={loading}
						onClick={fetchHealthData}
						size="sm"
						variant="outline"
					>
						<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
						Refresh
					</Button>
					<Button
						onClick={() => setAutoRefresh(!autoRefresh)}
						size="sm"
						variant={autoRefresh ? "default" : "outline"}
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
			<div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
				{services.map((service) => (
					<Card
						className={`border-2 ${getStatusColor(service.status)}`}
						key={service.name}
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
							<div className="flex items-center justify-between">
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

							<div className="flex items-center justify-between">
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

							<div className="flex items-center justify-between">
								<span className="text-sm">Error Rate:</span>
								<span className="font-semibold">
									{service.errorRate.toFixed(1)}%
								</span>
							</div>

							<div className="space-y-1">
								<div className="flex items-center justify-between">
									<span className="text-sm">Uptime:</span>
									<span className="font-semibold">
										{service.uptime.toFixed(1)}%
									</span>
								</div>
								<Progress className="h-2" value={service.uptime} />
							</div>

							<div className="flex items-center justify-between text-muted-foreground text-xs">
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
						<div className="grid grid-cols-2 gap-4 lg:grid-cols-6 xl:grid-cols-3">
							<div className="text-center">
								<div className="font-bold text-2xl text-blue-600">
									{metrics.totalRequests.toLocaleString()}
								</div>
								<div className="text-muted-foreground text-sm">
									Total Requests
								</div>
							</div>

							<div className="text-center">
								<div className="font-bold text-2xl text-green-600">
									{metrics.successfulRequests.toLocaleString()}
								</div>
								<div className="text-muted-foreground text-sm">Successful</div>
							</div>

							<div className="text-center">
								<div className="font-bold text-2xl text-red-600">
									{metrics.failedRequests.toLocaleString()}
								</div>
								<div className="text-muted-foreground text-sm">Failed</div>
							</div>

							<div className="text-center">
								<div className="font-bold text-2xl text-purple-600">
									{metrics.averageResponseTime}ms
								</div>
								<div className="text-muted-foreground text-sm">
									Avg Response
								</div>
							</div>

							<div className="text-center">
								<div className="font-bold text-2xl text-orange-600">
									{metrics.peakResponseTime}ms
								</div>
								<div className="text-muted-foreground text-sm">
									Peak Response
								</div>
							</div>

							<div className="text-center">
								<div className="font-bold text-2xl text-teal-600">
									{metrics.uptimePercentage.toFixed(1)}%
								</div>
								<div className="text-muted-foreground text-sm">Uptime</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
