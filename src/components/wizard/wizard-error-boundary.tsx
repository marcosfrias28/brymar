/**
 * Wizard Error Boundary Component
 *
 * Provides error boundary functionality for wizard components
 * with customizable fallback UI and error recovery options.
 */

import { Component, type ReactNode } from "react";

type WizardError = {
	type: string;
	message: string;
	stack?: string;
};

type WizardErrorBoundaryProps = {
	children: ReactNode;
	fallback?: (error: WizardError, recovery: { retry: () => void }) => ReactNode;
	onError?: (error: WizardError) => void;
};

type WizardErrorBoundaryState = {
	hasError: boolean;
	error: WizardError | null;
};

export class WizardErrorBoundary extends Component<
	WizardErrorBoundaryProps,
	WizardErrorBoundaryState
> {
	constructor(props: WizardErrorBoundaryProps) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
		};
	}

	static getDerivedStateFromError(error: Error): WizardErrorBoundaryState {
		return {
			hasError: true,
			error: {
				type: error.name || "Error",
				message: error.message,
				stack: error.stack,
			},
		};
	}

	componentDidCatch(error: Error) {
		this.props.onError?.({
			type: error.name || "Error",
			message: error.message,
			stack: error.stack,
		});
	}

	retry = () => {
		this.setState({
			hasError: false,
			error: null,
		});
	};

	render() {
		if (this.state.hasError && this.state.error) {
			return this.props.fallback?.(this.state.error, { retry: this.retry });
		}

		return this.props.children;
	}
}
