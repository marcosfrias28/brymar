/**
 * Error Testing Utilities
 *
 * Provides utilities for testing error scenarios in wizard components.
 * This is primarily used for development and testing purposes.
 */

import React, { useState, useCallback } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Bug, Zap, Wifi, Shield } from "lucide-react";

export interface ErrorScenario {
  id: string;
  name: string;
  description: string;
  type: "validation" | "network" | "storage" | "permission";
  severity: "low" | "medium" | "high" | "critical";
  trigger: () => Promise<void> | void;
}

interface ErrorTestingPanelProps {
  scenarios: ErrorScenario[];
  onScenarioTrigger?: (scenario: ErrorScenario) => void;
  className?: string;
}

export function ErrorTestingPanel({
  scenarios,
  onScenarioTrigger,
  className,
}: ErrorTestingPanelProps) {
  const [selectedScenario, setSelectedScenario] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);

  const handleTriggerScenario = useCallback(async () => {
    const scenario = scenarios.find((s) => s.id === selectedScenario);
    if (!scenario) return;

    setIsRunning(true);
    try {
      await scenario.trigger();
      onScenarioTrigger?.(scenario);
    } catch (error) {
      console.error("Error triggering scenario:", error);
    } finally {
      setIsRunning(false);
    }
  }, [selectedScenario, scenarios, onScenarioTrigger]);

  const getTypeIcon = (type: ErrorScenario["type"]) => {
    switch (type) {
      case "validation":
        return <AlertTriangle className="h-4 w-4" />;
      case "network":
        return <Wifi className="h-4 w-4" />;
      case "storage":
        return <Bug className="h-4 w-4" />;
      case "permission":
        return <Shield className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: ErrorScenario["severity"]) => {
    switch (severity) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bug className="h-5 w-5" />
          <span>Panel de Pruebas de Errores</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Escenario de Error</label>
          <Select value={selectedScenario} onValueChange={setSelectedScenario}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un escenario de error" />
            </SelectTrigger>
            <SelectContent>
              {scenarios.map((scenario) => (
                <SelectItem key={scenario.id} value={scenario.id}>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(scenario.type)}
                    <span>{scenario.name}</span>
                    <Badge className={getSeverityColor(scenario.severity)}>
                      {scenario.severity}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedScenario && (
          <div className="space-y-2">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                {scenarios.find((s) => s.id === selectedScenario)?.description}
              </p>
            </div>
            <Button
              onClick={handleTriggerScenario}
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? "Ejecutando..." : "Ejecutar Escenario"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ErrorScenarioRunner() {
  const [activeScenarios, setActiveScenarios] = useState<ErrorScenario[]>([]);

  const defaultScenarios: ErrorScenario[] = [
    {
      id: "validation-error",
      name: "Error de Validación",
      description: "Simula un error de validación en el formulario",
      type: "validation",
      severity: "medium",
      trigger: () => {
        throw new Error("Validation failed: Required field is missing");
      },
    },
    {
      id: "network-error",
      name: "Error de Red",
      description: "Simula un error de conexión de red",
      type: "network",
      severity: "high",
      trigger: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        throw new Error("Network error: Failed to connect to server");
      },
    },
    {
      id: "storage-error",
      name: "Error de Almacenamiento",
      description: "Simula un error al guardar datos localmente",
      type: "storage",
      severity: "medium",
      trigger: () => {
        throw new Error("Storage error: LocalStorage quota exceeded");
      },
    },
    {
      id: "permission-error",
      name: "Error de Permisos",
      description: "Simula un error de permisos de usuario",
      type: "permission",
      severity: "critical",
      trigger: () => {
        throw new Error("Permission error: User not authorized");
      },
    },
  ];

  const handleScenarioTrigger = useCallback((scenario: ErrorScenario) => {
    setActiveScenarios((prev) => [...prev, scenario]);
    console.log("Triggered scenario:", scenario);
  }, []);

  return (
    <div className="space-y-4">
      <ErrorTestingPanel
        scenarios={defaultScenarios}
        onScenarioTrigger={handleScenarioTrigger}
      />

      {activeScenarios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Escenarios Ejecutados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeScenarios.map((scenario, index) => (
                <div
                  key={`${scenario.id}-${index}`}
                  className="flex items-center justify-between p-2 bg-muted rounded"
                >
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(scenario.type)}
                    <span className="text-sm">{scenario.name}</span>
                  </div>
                  <Badge className={getSeverityColor(scenario.severity)}>
                    {scenario.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Hook for error testing functionality
export function useErrorTesting() {
  const [errors, setErrors] = useState<Error[]>([]);
  const [isTestingMode, setIsTestingMode] = useState(false);
  const [scenarios, setScenarios] = useState<ErrorScenario[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const triggerError = useCallback(
    (error: Error) => {
      setErrors((prev) => [...prev, error]);
      if (isTestingMode) {
        console.error("Test error triggered:", error);
      } else {
        throw error;
      }
    },
    [isTestingMode]
  );

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const enableTestingMode = useCallback(() => {
    setIsTestingMode(true);
  }, []);

  const disableTestingMode = useCallback(() => {
    setIsTestingMode(false);
    clearErrors();
  }, [clearErrors]);

  const addScenario = useCallback((scenario: ErrorScenario) => {
    setScenarios((prev) => [...prev, scenario]);
  }, []);

  const runAllScenarios = useCallback(async () => {
    setIsRunning(true);
    try {
      for (const scenario of scenarios) {
        await scenario.trigger();
      }
    } catch (error) {
      console.error("Error running scenarios:", error);
    } finally {
      setIsRunning(false);
    }
  }, [scenarios]);

  const clearScenarios = useCallback(() => {
    setScenarios([]);
  }, []);

  return {
    errors,
    isTestingMode,
    scenarios,
    isRunning,
    results,
    triggerError,
    clearErrors,
    enableTestingMode,
    disableTestingMode,
    addScenario,
    runAllScenarios,
    clearScenarios,
  };
}

// Helper function to get type icon (used by both components)
function getTypeIcon(type: ErrorScenario["type"]) {
  switch (type) {
    case "validation":
      return <AlertTriangle className="h-4 w-4" />;
    case "network":
      return <Wifi className="h-4 w-4" />;
    case "storage":
      return <Bug className="h-4 w-4" />;
    case "permission":
      return <Shield className="h-4 w-4" />;
    default:
      return <Zap className="h-4 w-4" />;
  }
}

// Helper function to get severity color (used by both components)
function getSeverityColor(severity: ErrorScenario["severity"]) {
  switch (severity) {
    case "low":
      return "bg-green-100 text-green-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "high":
      return "bg-orange-100 text-orange-800";
    case "critical":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
