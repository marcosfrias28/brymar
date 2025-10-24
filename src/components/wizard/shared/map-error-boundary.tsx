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

interface MapErrorBoundaryState {
	hasError: boolean;
	error?: Error;
}

interface MapErrorBoundaryProps {
	children: React.ReactNode;
	fallback?: React.ComponentType<{
		error?: Error;
		onRetry: () => void;
		onUseSimple: () => void;
	}>;
	onUseSimple: () => void;
}

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

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("Map component error:", error, errorInfo);
	}

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
						<AlertDescription className="text-xs font-mono">
							{error.message}
						</AlertDescription>
					</Alert>
				)}

				<div className="flex flex-col sm:flex-row gap-3">
					<Button
						onClick={onRetry}
						variant="outline"
						className="flex items-center gap-2"
					>
						<RefreshCw className="h-4 w-4" />
						Intentar de nuevo
					</Button>

					<Button onClick={onUseSimple} className="flex items-center gap-2">
						<MapPin className="h-4 w-4" />
						Usar formulario simple
					</Button>
				</div>

				<div className="text-sm text-orange-700 bg-orange-100 p-3 rounded-lg">
					<p className="font-medium mb-1">¿Por qué puede fallar el mapa?</p>
					<ul className="text-xs space-y-1 list-disc list-inside">
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
