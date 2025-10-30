"use client";

import {
	Activity,
	AlertTriangle,
	Brain,
	CheckCircle,
	MapPin,
	TrendingUp,
	Upload,
	Users,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AnalyticsSummary = {
	totalSessions: number;
	completedWizards: number;
	averageCompletionTime: number;
	completionRate: number;
	aiGenerationSuccessRate: number;
	uploadSuccessRate: number;
	mostCommonDropoffStep: number;
	activeUsers: number;
};

type StepAnalytics = {
	step: number;
	stepName: string;
	started: number;
	completed: number;
	averageTime: number;
	dropoffRate: number;
};

type AIAnalytics = {
	type: string;
	attempts: number;
	successes: number;
	failures: number;
	averageResponseTime: number;
	successRate: number;
};

type UploadAnalytics = {
	totalUploads: number;
	successfulUploads: number;
	failedUploads: number;
	averageUploadTime: number;
	averageFileSize: number;
	successRate: number;
};

type SystemHealthMetrics = {
	huggingfaceStatus: "healthy" | "degraded" | "down";
	vercelBlobStatus: "healthy" | "degraded" | "down";
	geocodingStatus: "healthy" | "degraded" | "down";
	averageResponseTimes: {
		huggingface: number;
		vercelBlob: number;
		geocoding: number;
	};
	errorRates: {
		huggingface: number;
		vercelBlob: number;
		geocoding: number;
	};
};

export function WizardAnalyticsDashboard() {
	const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
	const [stepAnalytics, setStepAnalytics] = useState<StepAnalytics[]>([]);
	const [aiAnalytics, setAiAnalytics] = useState<AIAnalytics[]>([]);
	const [uploadAnalytics, setUploadAnalytics] =
		useState<UploadAnalytics | null>(null);
	const [systemHealth, setSystemHealth] = useState<SystemHealthMetrics | null>(
		null
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");

	const fetchAnalytics = async () => {
		try {
			setLoading(true);
			setError(null);

			const [summaryRes, stepsRes, aiRes, uploadRes, healthRes] =
				await Promise.all([
					fetch(`/api/analytics/wizard/summary?timeRange=${timeRange}`),
					fetch(`/api/analytics/wizard/steps?timeRange=${timeRange}`),
					fetch(`/api/analytics/wizard/ai?timeRange=${timeRange}`),
					fetch(`/api/analytics/wizard/uploads?timeRange=${timeRange}`),
					fetch("/api/analytics/wizard/health"),
				]);

			if (!summaryRes.ok) {
				throw new Error("Failed to fetch summary");
			}
			if (!stepsRes.ok) {
				throw new Error("Failed to fetch step analytics");
			}
			if (!aiRes.ok) {
				throw new Error("Failed to fetch AI analytics");
			}
			if (!uploadRes.ok) {
				throw new Error("Failed to fetch upload analytics");
			}
			if (!healthRes.ok) {
				throw new Error("Failed to fetch system health");
			}

			const [summaryData, stepsData, aiData, uploadData, healthData] =
				await Promise.all([
					summaryRes.json(),
					stepsRes.json(),
					aiRes.json(),
					uploadRes.json(),
					healthRes.json(),
				]);

			setSummary(summaryData);
			setStepAnalytics(stepsData);
			setAiAnalytics(aiData);
			setUploadAnalytics(uploadData);
			setSystemHealth(healthData);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to fetch analytics"
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAnalytics();
	}, [fetchAnalytics]);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "healthy":
				return "text-green-600";
			case "degraded":
				return "text-yellow-600";
			case "down":
				return "text-red-600";
			default:
				return "text-gray-600";
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

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					{[...new Array(4)].map((_, i) => (
						<Card key={i}>
							<CardHeader className="animate-pulse">
								<div className="h-4 w-3/4 rounded bg-gray-200" />
								<div className="h-8 w-1/2 rounded bg-gray-200" />
							</CardHeader>
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertTriangle className="h-4 w-4" />
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="space-y-6">
			{/* Time Range Selector */}
			<div className="flex items-center justify-between">
				<h2 className="font-bold text-2xl">Wizard Analytics</h2>
				<div className="flex gap-2">
					{(["24h", "7d", "30d"] as const).map((range) => (
						<Button
							key={range}
							onClick={() => setTimeRange(range)}
							size="sm"
							variant={timeRange === range ? "default" : "outline"}
						>
							{range === "24h"
								? "24 Hours"
								: range === "7d"
									? "7 Days"
									: "30 Days"}
						</Button>
					))}
				</div>
			</div>

			{/* Summary Cards */}
			{summary && (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">
								Total Sessions
							</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">{summary.totalSessions}</div>
							<p className="text-muted-foreground text-xs">
								{summary.activeUsers} active users
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">
								Completion Rate
							</CardTitle>
							<TrendingUp className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">
								{summary.completionRate.toFixed(1)}%
							</div>
							<Progress className="mt-2" value={summary.completionRate} />
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">
								AI Success Rate
							</CardTitle>
							<Brain className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">
								{summary.aiGenerationSuccessRate.toFixed(1)}%
							</div>
							<Progress
								className="mt-2"
								value={summary.aiGenerationSuccessRate}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="font-medium text-sm">
								Upload Success Rate
							</CardTitle>
							<Upload className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="font-bold text-2xl">
								{summary.uploadSuccessRate.toFixed(1)}%
							</div>
							<Progress className="mt-2" value={summary.uploadSuccessRate} />
						</CardContent>
					</Card>
				</div>
			)}

			<Tabs className="space-y-4" defaultValue="steps">
				<TabsList>
					<TabsTrigger value="steps">Step Analysis</TabsTrigger>
					<TabsTrigger value="ai">AI Performance</TabsTrigger>
					<TabsTrigger value="uploads">Upload Metrics</TabsTrigger>
					<TabsTrigger value="health">System Health</TabsTrigger>
				</TabsList>

				<TabsContent className="space-y-4" value="steps">
					<Card>
						<CardHeader>
							<CardTitle>Step Completion Analysis</CardTitle>
							<CardDescription>
								User progression through wizard steps
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer height={300} width="100%">
								<BarChart data={stepAnalytics}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="stepName" />
									<YAxis />
									<Tooltip />
									<Bar dataKey="started" fill="#8884d8" name="Started" />
									<Bar dataKey="completed" fill="#82ca9d" name="Completed" />
								</BarChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{stepAnalytics.map((step) => (
							<Card key={step.step}>
								<CardHeader>
									<CardTitle className="text-lg">
										Step {step.step}: {step.stepName}
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
									<div className="flex justify-between">
										<span>Started:</span>
										<span className="font-semibold">{step.started}</span>
									</div>
									<div className="flex justify-between">
										<span>Completed:</span>
										<span className="font-semibold">{step.completed}</span>
									</div>
									<div className="flex justify-between">
										<span>Completion Rate:</span>
										<span className="font-semibold">
											{((step.completed / step.started) * 100).toFixed(1)}%
										</span>
									</div>
									<div className="flex justify-between">
										<span>Avg Time:</span>
										<span className="font-semibold">
											{Math.round(step.averageTime / 1000)}s
										</span>
									</div>
									<Progress
										className="mt-2"
										value={(step.completed / step.started) * 100}
									/>
								</CardContent>
							</Card>
						))}
					</div>
				</TabsContent>

				<TabsContent className="space-y-4" value="ai">
					<Card>
						<CardHeader>
							<CardTitle>AI Generation Performance</CardTitle>
							<CardDescription>
								Success rates and response times for AI content generation
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
								{aiAnalytics.map((ai) => (
									<Card key={ai.type}>
										<CardHeader>
											<CardTitle className="text-lg capitalize">
												{ai.type}
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-2">
											<div className="flex justify-between">
												<span>Attempts:</span>
												<span className="font-semibold">{ai.attempts}</span>
											</div>
											<div className="flex justify-between">
												<span>Successes:</span>
												<span className="font-semibold text-green-600">
													{ai.successes}
												</span>
											</div>
											<div className="flex justify-between">
												<span>Failures:</span>
												<span className="font-semibold text-red-600">
													{ai.failures}
												</span>
											</div>
											<div className="flex justify-between">
												<span>Success Rate:</span>
												<Badge
													variant={
														ai.successRate > 90
															? "default"
															: ai.successRate > 70
																? "secondary"
																: "destructive"
													}
												>
													{ai.successRate.toFixed(1)}%
												</Badge>
											</div>
											<div className="flex justify-between">
												<span>Avg Response:</span>
												<span className="font-semibold">
													{ai.averageResponseTime}ms
												</span>
											</div>
											<Progress className="mt-2" value={ai.successRate} />
										</CardContent>
									</Card>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent className="space-y-4" value="uploads">
					{uploadAnalytics && (
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<Card>
								<CardHeader>
									<CardTitle>Upload Statistics</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex justify-between">
										<span>Total Uploads:</span>
										<span className="font-semibold">
											{uploadAnalytics.totalUploads}
										</span>
									</div>
									<div className="flex justify-between">
										<span>Successful:</span>
										<span className="font-semibold text-green-600">
											{uploadAnalytics.successfulUploads}
										</span>
									</div>
									<div className="flex justify-between">
										<span>Failed:</span>
										<span className="font-semibold text-red-600">
											{uploadAnalytics.failedUploads}
										</span>
									</div>
									<div className="flex justify-between">
										<span>Success Rate:</span>
										<Badge
											variant={
												uploadAnalytics.successRate > 95
													? "default"
													: "secondary"
											}
										>
											{uploadAnalytics.successRate.toFixed(1)}%
										</Badge>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Performance Metrics</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex justify-between">
										<span>Avg Upload Time:</span>
										<span className="font-semibold">
											{uploadAnalytics.averageUploadTime}ms
										</span>
									</div>
									<div className="flex justify-between">
										<span>Avg File Size:</span>
										<span className="font-semibold">
											{(uploadAnalytics.averageFileSize / 1024 / 1024).toFixed(
												1
											)}
											MB
										</span>
									</div>
									<Progress
										className="mt-4"
										value={uploadAnalytics.successRate}
									/>
								</CardContent>
							</Card>
						</div>
					)}
				</TabsContent>

				<TabsContent className="space-y-4" value="health">
					{systemHealth && (
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Brain className="h-5 w-5" />
										HuggingFace API
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div
										className={`flex items-center gap-2 ${getStatusColor(
											systemHealth.huggingfaceStatus
										)}`}
									>
										{getStatusIcon(systemHealth.huggingfaceStatus)}
										<span className="font-semibold capitalize">
											{systemHealth.huggingfaceStatus}
										</span>
									</div>
									<div className="mt-4 space-y-2">
										<div className="flex justify-between">
											<span>Avg Response:</span>
											<span>
												{systemHealth.averageResponseTimes.huggingface}ms
											</span>
										</div>
										<div className="flex justify-between">
											<span>Error Rate:</span>
											<span>
												{systemHealth.errorRates.huggingface.toFixed(1)}%
											</span>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Upload className="h-5 w-5" />
										Vercel Blob
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div
										className={`flex items-center gap-2 ${getStatusColor(
											systemHealth.vercelBlobStatus
										)}`}
									>
										{getStatusIcon(systemHealth.vercelBlobStatus)}
										<span className="font-semibold capitalize">
											{systemHealth.vercelBlobStatus}
										</span>
									</div>
									<div className="mt-4 space-y-2">
										<div className="flex justify-between">
											<span>Avg Response:</span>
											<span>
												{systemHealth.averageResponseTimes.vercelBlob}ms
											</span>
										</div>
										<div className="flex justify-between">
											<span>Error Rate:</span>
											<span>
												{systemHealth.errorRates.vercelBlob.toFixed(1)}%
											</span>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<MapPin className="h-5 w-5" />
										Geocoding API
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div
										className={`flex items-center gap-2 ${getStatusColor(
											systemHealth.geocodingStatus
										)}`}
									>
										{getStatusIcon(systemHealth.geocodingStatus)}
										<span className="font-semibold capitalize">
											{systemHealth.geocodingStatus}
										</span>
									</div>
									<div className="mt-4 space-y-2">
										<div className="flex justify-between">
											<span>Avg Response:</span>
											<span>
												{systemHealth.averageResponseTimes.geocoding}ms
											</span>
										</div>
										<div className="flex justify-between">
											<span>Error Rate:</span>
											<span>
												{systemHealth.errorRates.geocoding.toFixed(1)}%
											</span>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
