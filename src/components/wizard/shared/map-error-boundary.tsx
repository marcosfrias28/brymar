"use client";

import { AlertTriangle, MapPin, RefreshCw } from "lucide-react";
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

type MapErrorBoundaryState = {
	hasError: boolean;
	error?: Error;
};

type MapErrorBoundaryProps = {
	children: React.ReactNode;
	fallback?: React.ComponentType<{
		error?: Error;
		onRetry: () => void;
		onUseSimple: () => void;
	}>;
	onUseSimple: () => void;
};

export class MapErrorBoundary extends React.Component<
	MapErrorBoundaryProps,
	MapErrorBoundaryState
> {
	constructor(props: MapErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): MapErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {}

	handleRetry = () => {
		this.setState({ hasError: false, error: undefined });
	};

	render() {
		if (this.state.hasError) {
			const FallbackComponent = this.props.fallback || DefaultMapErrorFallback;
			return (
				<FallbackComponent
					error={this.state.error}
					onRetry={this.handleRetry}
					onUseSimple={this.props.onUseSimple}
				/>
			);
		}

		return this.props.children;
	}
}

function DefaultMapErrorFallback({
	error,
	onRetry,
	onUseSimple,
}: {
	error?: Error;
	onRetry: () => void;
	onUseSimple: () => void;
}) {
	return (
		<Card className="border-orange-200 bg-orange-50">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-orange-800">
					<AlertTriangle className="h-5 w-5" />
					Problema con el Mapa Interactivo
				</CardTitle>
				<CardDescription className="text-orange-700">
					No se pudo cargar el mapa interactivo. Puedes intentar de nuevo o usar
					el formulario simple.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{process.env.NODE_ENV === "development" && error && (
					<Alert variant="destructive">
						<AlertDescription className="font-mono text-xs">
							{error.message}
						</AlertDescription>
					</Alert>
				)}

				<div className="flex flex-col gap-3 sm:flex-row">
					<Button
						className="flex items-center gap-2"
						onClick={onRetry}
						variant="outline"
					>
						<RefreshCw className="h-4 w-4" />
						Intentar de nuevo
					</Button>

					<Button className="flex items-center gap-2" onClick={onUseSimple}>
						<MapPin className="h-4 w-4" />
						Usar formulario simple
					</Button>
				</div>

				<div className="rounded-lg bg-orange-100 p-3 text-orange-700 text-sm">
					<p className="mb-1 font-medium">¿Por qué puede fallar el mapa?</p>
					<ul className="list-inside list-disc space-y-1 text-xs">
						<li>Conexión a internet lenta o inestable</li>
						<li>Bloqueador de anuncios activo</li>
						<li>JavaScript deshabilitado</li>
						<li>Navegador no compatible</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
}
