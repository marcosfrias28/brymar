"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorState } from "@/components/ui/error-states";

type Props = {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
	showDetails?: boolean;
	variant?: "default" | "network" | "server" | "permission" | "notFound";
	title?: string;
	description?: string;
};

type State = {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
};

export class EnhancedErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
		error: null,
		errorInfo: null,
	};

	public static getDerivedStateFromError(error: Error): State {
		return {
			hasError: true,
			error,
			errorInfo: null,
		};
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		this.setState({
			error,
			errorInfo,
		});

		// Call custom error handler
		if (this.props.onError) {
			this.props.onError(error, errorInfo);
		}

		// Log error in development
		if (process.env.NODE_ENV === "development") {
		}

		// Report to error tracking service in production
		if (process.env.NODE_ENV === "production") {
			// Example: Sentry.captureException(error, { extra: errorInfo });
		}
	}

	private readonly handleRetry = () => {
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		});
	};

	private readonly determineErrorVariant = (
		error: Error
	): "default" | "network" | "server" | "permission" | "notFound" => {
		const message = error.message.toLowerCase();

		if (message.includes("network") || message.includes("fetch")) {
			return "network";
		}
		if (message.includes("server") || message.includes("500")) {
			return "server";
		}
		if (
			message.includes("permission") ||
			message.includes("unauthorized") ||
			message.includes("403")
		) {
			return "permission";
		}
		if (message.includes("not found") || message.includes("404")) {
			return "notFound";
		}

		return "default";
	};

	public render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			const variant =
				this.props.variant || this.determineErrorVariant(this.state.error!);

			return (
				<div className="flex min-h-[400px] items-center justify-center">
					<ErrorState
						description={this.props.description}
						error={this.state.error || undefined}
						onRetry={this.handleRetry}
						showDetails={
							this.props.showDetails || process.env.NODE_ENV === "development"
						}
						title={this.props.title}
						variant={variant}
					/>
				</div>
			);
		}

		return this.props.children;
	}
}

/**
 * Hook-based error handler for functional components
 */
export function useErrorHandler() {
	return React.useCallback((_error: Error, _errorInfo?: ErrorInfo) => {
		// Report to error tracking service
		if (process.env.NODE_ENV === "production") {
			// Example: Sentry.captureException(error, { extra: errorInfo });
		}
	}, []);
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
	Component: React.ComponentType<P>,
	errorBoundaryProps?: Omit<Props, "children">
) {
	const WrappedComponent = (props: P) => (
		<EnhancedErrorBoundary {...errorBoundaryProps}>
			<Component {...props} />
		</EnhancedErrorBoundary>
	);

	WrappedComponent.displayName = `withErrorBoundary(${
		Component.displayName || Component.name
	})`;

	return WrappedComponent;
}

/**
 * Async error boundary for handling promise rejections
 */
export function AsyncErrorBoundary({
	children,
	onError,
}: {
	children: ReactNode;
	onError?: (error: Error) => void;
}) {
	React.useEffect(() => {
		const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
			const error = new Error(
				event.reason?.message || "Unhandled promise rejection"
			);

			if (onError) {
				onError(error);
			}
		};

		window.addEventListener("unhandledrejection", handleUnhandledRejection);

		return () => {
			window.removeEventListener(
				"unhandledrejection",
				handleUnhandledRejection
			);
		};
	}, [onError]);

	return <>{children}</>;
}
