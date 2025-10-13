"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TestTube, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { ComprehensiveErrorRecovery } from '@/components/wizard/comprehensive-error-recovery';
import { NetworkAwareWizard } from '@/components/wizard/network-aware-wizard';
import {
  ErrorTestingPanel,
  useErrorTesting,
} from '@/components/wizard/error-testing-utils';
import { WizardFallbackUI } from '@/components/wizard/fallback-ui-states';
import { WizardError } from '@/lib/errors/wizard-errors';
import { toast } from "sonner";

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
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-xl font-semibold mb-2">Página no disponible</h2>
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TestTube className="w-8 h-8" />
            Pruebas de Manejo de Errores
          </h1>
          <p className="text-muted-foreground mt-2">
            Herramientas para probar y validar el sistema de recuperación de
            errores del asistente.
          </p>
        </div>
        <Badge variant="outline" className="bg-orange-100 text-orange-800">
          Solo Desarrollo
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Error Testing Panel */}
        <div className="space-y-4">
          <ErrorTestingPanel
            scenarios={scenarios}
            onScenarioTrigger={(scenario) => {
              try {
                scenario.trigger();
              } catch (error) {
                if (error instanceof WizardError) {
                  handleTriggerError(error);
                }
              }
            }}
          />

          {/* Automated Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
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
                  onClick={runAutomatedTests}
                  disabled={isRunning}
                  className="flex-1"
                >
                  {isRunning ? "Ejecutando..." : "Ejecutar Pruebas"}
                </Button>
                <Button
                  variant="outline"
                  onClick={clearScenarios}
                  disabled={isRunning}
                >
                  Limpiar
                </Button>
              </div>

              {results.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Resultados:</h4>
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
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
                  maxRetries={3}
                  onError={(error) => {
                    console.log("Error caught:", error);
                  }}
                  onRecovery={handleErrorRecovery}
                  fallbackComponent={({ error, onRetry }) => (
                    <WizardFallbackUI
                      error={error}
                      onRetry={onRetry}
                      onGoBack={clearCurrentError}
                      onGoHome={clearCurrentError}
                      showDetails={true}
                    />
                  )}
                >
                  <div className="p-4 border border-green-200 bg-green-50 rounded-lg text-center">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="font-medium text-green-900">
                      Sistema Funcionando
                    </p>
                    <p className="text-sm text-green-700">
                      No hay errores activos
                    </p>
                  </div>
                </ComprehensiveErrorRecovery>
              ) : (
                <NetworkAwareWizard
                  enableOfflineMode={true}
                  onNetworkError={(error) => {
                    toast.warning("Error de red detectado");
                  }}
                  onNetworkRecovery={() => {
                    toast.success("Red recuperada");
                  }}
                >
                  <div className="p-4 border border-green-200 bg-green-50 rounded-lg text-center">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="font-medium text-green-900">
                      Sistema Funcionando
                    </p>
                    <p className="text-sm text-green-700">
                      No hay errores activos
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCurrentError}
                      className="mt-2"
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
                <Button variant="ghost" size="sm" onClick={clearTestResults}>
                  Limpiar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay resultados de pruebas aún
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {testResults
                    .slice()
                    .reverse()
                    .map((result, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-2 border rounded text-sm"
                      >
                        {result.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{result.name}</div>
                          <div className="text-muted-foreground">
                            {result.message}
                          </div>
                          <div className="text-xs text-muted-foreground">
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
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              Esta página permite probar todos los mecanismos de recuperación de
              errores implementados en el sistema de asistentes.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Tipos de Error Soportados:</h4>
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
              <h4 className="font-medium mb-2">Mecanismos de Recuperación:</h4>
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
