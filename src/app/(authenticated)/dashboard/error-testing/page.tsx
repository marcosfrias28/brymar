"use client";

import { AlertTriangle, CheckCircle, TestTube, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ComprehensiveErrorRecovery } from "@/components/wizard/comprehensive-error-recovery";
import {
	ErrorTestingPanel,
	useErrorTesting,
} from "@/components/wizard/error-testing-utils";
import { WizardFallbackUI } from "@/components/wizard/fallback-ui-states";
import { NetworkAwareWizard } from "@/components/wizard/network-aware-wizard";
import { WizardError } from "@/lib/errors/wizard-errors";

// This page should only be available in development
export default function ErrorTestingPage() {
	const [currentError, setCurrentError] = useState<WizardError | null>(null);
	const [testResults, setTestResults] = useState<
		Array<{
			name: string;
			success: boolean;
			message: string;
			timestamp: Date;
		}>
	>([]);

	const {
		addScenario,
		runAllScenarios,
		clearScenarios,
		isRunning,
		results,
		scenarios,
	} = useErrorTesting();

	// Don't render in production
	if (process.env.NODE_ENV === "production") {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card>
					<CardContent className="p-6 text-center">
						<AlertTriangle className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
						<h2 className="mb-2 font-semibold text-xl">Página no disponible</h2>
						<p className="text-muted-foreground">
							Esta página solo está disponible en modo de desarrollo.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	const handleTriggerError = (error: WizardError) => {
		setCurrentError(error);

		// Add to test results
		setTestResults((prev) => [
			...prev,
			{
				name: `${error.code}: ${error.userMessage}`,
				success: true,
				message: "Error triggered successfully",
				timestamp: new Date(),
			},
		]);

		toast.info("Error simulado", {
			description: `Tipo: ${error.code}`,
		});
	};

	const handleErrorRecovery = (error: WizardError) => {
		setTestResults((prev) => [
			...prev,
			{
				name: `Recovery: ${error.code}`,
				success: true,
				message: "Error recovered successfully",
				timestamp: new Date(),
			},
		]);

		toast.success("Error recuperado", {
			description: "El sistema se recuperó exitosamente",
		});
	};

	const clearCurrentError = () => {
		setCurrentError(null);
	};

	const clearTestResults = () => {
		setTestResults([]);
		clearScenarios();
	};

	const runAutomatedTests = async () => {
		// Add some common scenarios
		addScenario({
			id: "network-error",
			name: "Network Error",
			description: "Simula un error de conexión de red",
			type: "network",
			severity: "high",
			trigger: () => {
				throw new WizardError(
					"Network failure",
					"NETWORK_ERROR",
					true,
					"Error de red"
				);
			},
		});

		addScenario({
			id: "server-error",
			name: "Server Error",
			description: "Simula un error del servidor",
			type: "network",
			severity: "critical",
			trigger: () => {
				throw new WizardError(
					"Server failure",
					"SERVER_ERROR",
					true,
					"Error del servidor"
				);
			},
		});

		addScenario({
			id: "permission-error",
			name: "Permission Error",
			description: "Simula un error de permisos",
			type: "permission",
			severity: "critical",
			trigger: () => {
				throw new WizardError(
					"Access denied",
					"PERMISSION_DENIED",
					false,
					"Acceso denegado"
				);
			},
		});

		await runAllScenarios();
	};

	return (
		<div className="container mx-auto space-y-6 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="flex items-center gap-2 font-bold text-3xl">
						<TestTube className="h-8 w-8" />
						Pruebas de Manejo de Errores
					</h1>
					<p className="mt-2 text-muted-foreground">
						Herramientas para probar y validar el sistema de recuperación de
						errores del asistente.
					</p>
				</div>
				<Badge className="bg-orange-100 text-orange-800" variant="outline">
					Solo Desarrollo
				</Badge>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{/* Error Testing Panel */}
				<div className="space-y-4">
					<ErrorTestingPanel
						onScenarioTrigger={(scenario) => {
							try {
								scenario.trigger();
							} catch (error) {
								if (error instanceof WizardError) {
									handleTriggerError(error);
								}
							}
						}}
						scenarios={scenarios}
					/>

					{/* Automated Testing */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<TestTube className="h-5 w-5" />
								Pruebas Automatizadas
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<span className="text-sm">Escenarios: {scenarios.length}</span>
								<span className="text-sm">Resultados: {results.length}</span>
							</div>

							<div className="flex gap-2">
								<Button
									className="flex-1"
									disabled={isRunning}
									onClick={runAutomatedTests}
								>
									{isRunning ? "Ejecutando..." : "Ejecutar Pruebas"}
								</Button>
								<Button
									disabled={isRunning}
									onClick={clearScenarios}
									variant="outline"
								>
									Limpiar
								</Button>
							</div>

							{results.length > 0 && (
								<div className="space-y-2">
									<h4 className="font-medium text-sm">Resultados:</h4>
									{results.map((result) => (
										<div
											className="flex items-center gap-2 text-sm"
											key={`${result.scenario}-${result.success}`}
										>
											{result.success ? (
												<CheckCircle className="h-4 w-4 text-green-500" />
											) : (
												<XCircle className="h-4 w-4 text-red-500" />
											)}
											<span className="flex-1">{result.scenario}</span>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Error Display Area */}
				<div className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Estado Actual del Sistema</CardTitle>
						</CardHeader>
						<CardContent>
							{currentError ? (
								<ComprehensiveErrorRecovery
									enableAutoRetry={true}
									enableOfflineMode={true}
									fallbackComponent={({ error, onRetry }) => (
										<WizardFallbackUI
											error={error}
											onGoBack={clearCurrentError}
											onGoHome={clearCurrentError}
											onRetry={onRetry}
											showDetails={true}
										/>
									)}
									maxRetries={3}
									onRecovery={handleErrorRecovery}
								>
									<div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
										<CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-600" />
										<p className="font-medium text-green-900">
											Sistema Funcionando
										</p>
										<p className="text-green-700 text-sm">
											No hay errores activos
										</p>
									</div>
								</ComprehensiveErrorRecovery>
							) : (
								<NetworkAwareWizard
									enableOfflineMode={true}
									onNetworkError={(_error) => {
										toast.warning("Error de red detectado");
									}}
									onNetworkRecovery={() => {
										toast.success("Red recuperada");
									}}
								>
									<div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
										<CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-600" />
										<p className="font-medium text-green-900">
											Sistema Funcionando
										</p>
										<p className="text-green-700 text-sm">
											No hay errores activos
										</p>
										<Button
											className="mt-2"
											onClick={clearCurrentError}
											size="sm"
											variant="outline"
										>
											Limpiar Estado
										</Button>
									</div>
								</NetworkAwareWizard>
							)}
						</CardContent>
					</Card>

					{/* Test Results */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								Historial de Pruebas
								<Button onClick={clearTestResults} size="sm" variant="ghost">
									Limpiar
								</Button>
							</CardTitle>
						</CardHeader>
						<CardContent>
							{testResults.length === 0 ? (
								<p className="py-4 text-center text-muted-foreground text-sm">
									No hay resultados de pruebas aún
								</p>
							) : (
								<div className="max-h-64 space-y-2 overflow-y-auto">
									{testResults
										.slice()
										.reverse()
										.map((result) => (
											<div
												className="flex items-start gap-2 rounded border p-2 text-sm"
												key={`${result.name}-${result.timestamp.getTime()}`}
											>
												{result.success ? (
													<CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
												) : (
													<XCircle className="mt-0.5 h-4 w-4 text-red-500" />
												)}
												<div className="flex-1">
													<div className="font-medium">{result.name}</div>
													<div className="text-muted-foreground">
														{result.message}
													</div>
													<div className="text-muted-foreground text-xs">
														{result.timestamp.toLocaleTimeString()}
													</div>
												</div>
											</div>
										))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			<Separator />

			{/* Documentation */}
			<Card>
				<CardHeader>
					<CardTitle>Documentación de Pruebas</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<Alert>
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>
							Esta página permite probar todos los mecanismos de recuperación de
							errores implementados en el sistema de asistentes.
						</AlertDescription>
					</Alert>

					<div className="grid grid-cols-1 gap-4 text-sm xl:grid-cols-2">
						<div>
							<h4 className="mb-2 font-medium">Tipos de Error Soportados:</h4>
							<ul className="space-y-1 text-muted-foreground">
								<li>• Errores de red y conectividad</li>
								<li>• Errores del servidor (5xx)</li>
								<li>• Errores de servicios de IA</li>
								<li>• Errores de subida de archivos</li>
								<li>• Errores de validación</li>
								<li>• Errores de permisos</li>
								<li>• Errores de borradores</li>
							</ul>
						</div>

						<div>
							<h4 className="mb-2 font-medium">Mecanismos de Recuperación:</h4>
							<ul className="space-y-1 text-muted-foreground">
								<li>• Reintentos automáticos con backoff exponencial</li>
								<li>• Modo sin conexión con cola de operaciones</li>
								<li>• Degradación elegante a modo básico</li>
								<li>• Interfaces de usuario de respaldo específicas</li>
								<li>• Recuperación contextual basada en tipo de error</li>
								<li>• Notificaciones y guías de usuario</li>
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
