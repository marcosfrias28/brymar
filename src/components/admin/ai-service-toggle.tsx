"use client";

import { AlertCircle, CheckCircle, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface AIServiceStatus {
	enabled: boolean;
	healthy: boolean;
	message: string;
	lastChecked?: string;
}

export function AIServiceToggle() {
	const [status, setStatus] = useState<AIServiceStatus>({
		enabled: false,
		healthy: false,
		message: "Checking...",
	});
	const [isLoading, setIsLoading] = useState(false);

	const checkAIHealth = async () => {
		try {
			const response = await fetch("/api/ai-health");
			const data = await response.json();

			setStatus((prev) => ({
				...prev,
				healthy: data.healthy,
				message: data.message,
				lastChecked: new Date().toLocaleTimeString(),
			}));
		} catch (_error) {
			setStatus((prev) => ({
				...prev,
				healthy: false,
				message: "Health check failed",
				lastChecked: new Date().toLocaleTimeString(),
			}));
		}
	};

	const testAIService = async () => {
		setIsLoading(true);
		try {
			const response = await fetch("/api/ai-health", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: "microsoft/DialoGPT-medium",
					prompt: "Test prompt for AI service",
				}),
			});

			const data = await response.json();

			if (data.success) {
				setStatus((prev) => ({
					...prev,
					healthy: true,
					message: `Test successful (${data.responseTime}ms)`,
					lastChecked: new Date().toLocaleTimeString(),
				}));
			} else {
				setStatus((prev) => ({
					...prev,
					healthy: false,
					message: `Test failed: ${data.error}`,
					lastChecked: new Date().toLocaleTimeString(),
				}));
			}
		} catch (_error) {
			setStatus((prev) => ({
				...prev,
				healthy: false,
				message: "Test request failed",
				lastChecked: new Date().toLocaleTimeString(),
			}));
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		checkAIHealth();

		// Check AI health every 5 minutes
		const interval = setInterval(checkAIHealth, 5 * 60 * 1000);

		return () => clearInterval(interval);
	}, [checkAIHealth]);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Settings className="h-5 w-5" />
					AI Service Configuration
				</CardTitle>
				<CardDescription>
					Manage AI-powered content generation settings
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<p className="text-sm font-medium">AI Generation</p>
						<p className="text-xs text-muted-foreground">
							Enable AI-powered content generation for properties and lands
						</p>
					</div>
					<Switch
						checked={status.enabled}
						onCheckedChange={(checked) => {
							setStatus((prev) => ({ ...prev, enabled: checked }));
							// In a real implementation, this would update the environment variable
							// or a database setting that controls AI service usage
						}}
					/>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium">Service Status</span>
						<Badge variant={status.healthy ? "default" : "destructive"}>
							{status.healthy ? (
								<CheckCircle className="h-3 w-3 mr-1" />
							) : (
								<AlertCircle className="h-3 w-3 mr-1" />
							)}
							{status.healthy ? "Healthy" : "Unhealthy"}
						</Badge>
					</div>

					<p className="text-xs text-muted-foreground">{status.message}</p>

					{status.lastChecked && (
						<p className="text-xs text-muted-foreground">
							Last checked: {status.lastChecked}
						</p>
					)}
				</div>

				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={checkAIHealth}
						disabled={isLoading}
					>
						Check Health
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={testAIService}
						disabled={isLoading}
					>
						{isLoading ? "Testing..." : "Test Service"}
					</Button>
				</div>

				<div className="rounded-lg bg-muted p-3">
					<h4 className="text-sm font-medium mb-2">Current Behavior</h4>
					<ul className="text-xs text-muted-foreground space-y-1">
						<li>• AI generation is currently disabled for reliability</li>
						<li>• High-quality template content is used instead</li>
						<li>• Users experience no interruptions or errors</li>
						<li>• Enable AI when service is stable</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
}
