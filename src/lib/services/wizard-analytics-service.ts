/**
 * Wizard Analytics Service
 * Tracks user behavior, performance metrics, and system health for the property wizard
 */

export interface WizardAnalyticsEvent {
	id: string;
	sessionId: string;
	userId?: string;
	eventType: WizardEventType;
	stepNumber?: number;
	timestamp: Date;
	data: Record<string, any>;
	userAgent?: string;
	ipAddress?: string;
}

export enum WizardEventType {
	// Step completion tracking
	STEP_STARTED = "step_started",
	STEP_COMPLETED = "step_completed",
	STEP_VALIDATION_FAILED = "step_validation_failed",
	WIZARD_COMPLETED = "wizard_completed",
	WIZARD_ABANDONED = "wizard_abandoned",

	// AI generation events
	AI_GENERATION_REQUESTED = "ai_generation_requested",
	AI_GENERATION_SUCCESS = "ai_generation_success",
	AI_GENERATION_FAILED = "ai_generation_failed",
	AI_GENERATION_RETRY = "ai_generation_retry",

	// Upload events
	UPLOAD_STARTED = "upload_started",
	UPLOAD_SUCCESS = "upload_success",
	UPLOAD_FAILED = "upload_failed",
	UPLOAD_PROGRESS = "upload_progress",

	// User behavior
	FIELD_FOCUSED = "field_focused",
	FIELD_CHANGED = "field_changed",
	NAVIGATION_ATTEMPTED = "navigation_attempted",
	DRAFT_SAVED = "draft_saved",
	DRAFT_LOADED = "draft_loaded",

	// Performance
	PERFORMANCE_METRIC = "performance_metric",
	ERROR_OCCURRED = "error_occurred",

	// System health
	EXTERNAL_SERVICE_CALL = "external_service_call",
	EXTERNAL_SERVICE_ERROR = "external_service_error",
}

export interface PerformanceMetric {
	metricName: string;
	value: number;
	unit: "ms" | "bytes" | "count" | "percentage";
	context?: Record<string, any>;
}

export interface AIGenerationMetrics {
	model: string;
	inputTokens: number;
	outputTokens: number;
	responseTime: number;
	success: boolean;
	errorType?: string;
}

export interface UploadMetrics {
	fileSize: number;
	fileType: string;
	uploadTime: number;
	success: boolean;
	errorType?: string;
}

class WizardAnalyticsService {
	private sessionId: string;
	private userId?: string;
	private events: WizardAnalyticsEvent[] = [];
	private performanceObserver?: PerformanceObserver;
	private isEnabled: boolean = true;

	constructor() {
		this.sessionId = this.generateSessionId();
		this.initializePerformanceMonitoring();
	}

	private generateSessionId(): string {
		return `wizard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	private initializePerformanceMonitoring(): void {
		if (typeof window !== "undefined" && "PerformanceObserver" in window) {
			this.performanceObserver = new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) {
					this.trackPerformanceMetric({
						metricName: entry.name,
						value: entry.duration,
						unit: "ms",
						context: {
							entryType: entry.entryType,
							startTime: entry.startTime,
						},
					});
				}
			});

			this.performanceObserver.observe({
				entryTypes: ["measure", "navigation", "resource"],
			});
		}
	}

	setUserId(userId: string): void {
		this.userId = userId;
	}

	setEnabled(enabled: boolean): void {
		this.isEnabled = enabled;
	}

	trackEvent(
		eventType: WizardEventType,
		data: Record<string, any> = {},
		stepNumber?: number,
	): void {
		if (!this.isEnabled) return;

		const event: WizardAnalyticsEvent = {
			id: this.generateEventId(),
			sessionId: this.sessionId,
			userId: this.userId,
			eventType,
			stepNumber,
			timestamp: new Date(),
			data,
			userAgent:
				typeof window !== "undefined" ? window.navigator.userAgent : undefined,
		};

		this.events.push(event);
		this.sendEventToServer(event);
	}

	trackStepCompletion(
		stepNumber: number,
		timeSpent: number,
		data: Record<string, any> = {},
	): void {
		this.trackEvent(
			WizardEventType.STEP_COMPLETED,
			{
				timeSpent,
				...data,
			},
			stepNumber,
		);
	}

	trackAIGeneration(
		type: "title" | "description" | "tags",
		metrics: AIGenerationMetrics,
	): void {
		const eventType = metrics.success
			? WizardEventType.AI_GENERATION_SUCCESS
			: WizardEventType.AI_GENERATION_FAILED;

		this.trackEvent(eventType, {
			generationType: type,
			...metrics,
		});
	}

	trackUpload(metrics: UploadMetrics): void {
		const eventType = metrics.success
			? WizardEventType.UPLOAD_SUCCESS
			: WizardEventType.UPLOAD_FAILED;

		this.trackEvent(eventType, metrics);
	}

	trackPerformanceMetric(metric: PerformanceMetric): void {
		this.trackEvent(WizardEventType.PERFORMANCE_METRIC, metric);
	}

	trackExternalServiceCall(
		service: "huggingface" | "vercel_blob" | "geocoding",
		success: boolean,
		responseTime: number,
		errorType?: string,
	): void {
		const eventType = success
			? WizardEventType.EXTERNAL_SERVICE_CALL
			: WizardEventType.EXTERNAL_SERVICE_ERROR;

		this.trackEvent(eventType, {
			service,
			responseTime,
			errorType,
		});
	}

	trackError(error: Error, context: Record<string, any> = {}): void {
		this.trackEvent(WizardEventType.ERROR_OCCURRED, {
			errorMessage: error.message,
			errorStack: error.stack,
			errorName: error.name,
			...context,
		});
	}

	private generateEventId(): string {
		return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	private async sendEventToServer(event: WizardAnalyticsEvent): Promise<void> {
		try {
			// Send to analytics endpoint
			await fetch("/api/analytics/wizard", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(event),
			});
		} catch (error) {
			console.warn("Failed to send analytics event:", error);
		}
	}

	// Get analytics summary for current session
	getSessionSummary(): {
		sessionId: string;
		userId?: string;
		totalEvents: number;
		stepsCompleted: number;
		aiGenerationsAttempted: number;
		aiGenerationsSuccessful: number;
		uploadsAttempted: number;
		uploadsSuccessful: number;
		errors: number;
		sessionDuration: number;
	} {
		const stepCompletions = this.events.filter(
			(e) => e.eventType === WizardEventType.STEP_COMPLETED,
		);
		const aiAttempts = this.events.filter(
			(e) => e.eventType === WizardEventType.AI_GENERATION_REQUESTED,
		);
		const aiSuccesses = this.events.filter(
			(e) => e.eventType === WizardEventType.AI_GENERATION_SUCCESS,
		);
		const uploadAttempts = this.events.filter(
			(e) => e.eventType === WizardEventType.UPLOAD_STARTED,
		);
		const uploadSuccesses = this.events.filter(
			(e) => e.eventType === WizardEventType.UPLOAD_SUCCESS,
		);
		const errors = this.events.filter(
			(e) => e.eventType === WizardEventType.ERROR_OCCURRED,
		);

		const firstEvent = this.events[0];
		const lastEvent = this.events[this.events.length - 1];
		const sessionDuration =
			firstEvent && lastEvent
				? lastEvent.timestamp.getTime() - firstEvent.timestamp.getTime()
				: 0;

		return {
			sessionId: this.sessionId,
			userId: this.userId,
			totalEvents: this.events.length,
			stepsCompleted: stepCompletions.length,
			aiGenerationsAttempted: aiAttempts.length,
			aiGenerationsSuccessful: aiSuccesses.length,
			uploadsAttempted: uploadAttempts.length,
			uploadsSuccessful: uploadSuccesses.length,
			errors: errors.length,
			sessionDuration,
		};
	}

	// Clear events (useful for testing or privacy)
	clearEvents(): void {
		this.events = [];
	}

	// Export events for debugging
	exportEvents(): WizardAnalyticsEvent[] {
		return [...this.events];
	}
}

// Singleton instance
export const wizardAnalytics = new WizardAnalyticsService();
