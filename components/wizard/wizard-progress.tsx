"use client";

import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, AlertCircle, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
// Removed translations import

interface WizardProgressProps {
  currentStep: number;
  stepValidation: Record<number, boolean>;
  stepCompletion: Record<number, number>;
  onStepClick?: (step: number) => void;
  className?: string;
  variant?: "default" | "compact" | "detailed";
}

export function WizardProgress({
  currentStep,
  stepValidation,
  stepCompletion,
  onStepClick,
  className,
  variant = "default",
}: WizardProgressProps) {
  // Static Spanish text instead of translations
  const stepTitles = {
    1: "Información General",
    2: "Ubicación",
    3: "Fotos y Videos",
    4: "Vista Previa",
  };

  const stepDescriptions = {
    1: "Información General",
    2: "Ubicación",
    3: "Fotos y Videos",
    4: "Vista Previa",
  };

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const totalSteps = 4;
    const completedSteps = Object.values(stepCompletion).reduce(
      (sum, completion) => sum + completion / 100,
      0
    );
    return Math.min((completedSteps / totalSteps) * 100, 100);
  }, [stepCompletion]);

  // Get step status
  const getStepStatus = (step: number) => {
    if (stepValidation[step]) return "completed";
    if (stepCompletion[step] > 0) return "in-progress";
    if (step <= currentStep) return "current";
    return "pending";
  };

  // Get step icon
  const getStepIcon = (step: number) => {
    const status = getStepStatus(step);
    const isCurrentStep = step === currentStep;

    switch (status) {
      case "completed":
        return <Check className="w-4 h-4" />;
      case "in-progress":
        return isCurrentStep ? (
          <div className="w-4 h-4 rounded-full border-2 border-current animate-pulse" />
        ) : (
          <AlertCircle className="w-4 h-4" />
        );
      case "current":
        return <Clock className="w-4 h-4" />;
      default:
        return <span className="text-xs font-medium">{step}</span>;
    }
  };

  if (variant === "compact") {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Paso {currentStep} / 4</span>
          <Badge variant="outline" className="text-xs">
            {Math.round(overallProgress)}%
          </Badge>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <Card className={className}>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Progreso del Asistente</h3>
            <Badge variant="outline">
              {Math.round(overallProgress)}% completado
            </Badge>
          </div>

          <Progress value={overallProgress} className="h-2" />

          <div className="space-y-3">
            {[1, 2, 3, 4].map((step) => {
              const status = getStepStatus(step);
              const isCurrentStep = step === currentStep;
              const completion = stepCompletion[step] || 0;
              const isClickable =
                onStepClick &&
                (step <= currentStep || stepValidation[step - 1]);

              return (
                <div
                  key={step}
                  className={cn(
                    "flex items-center space-x-3 p-2 rounded-lg transition-colors",
                    isClickable && "cursor-pointer hover:bg-muted/50",
                    isCurrentStep && "bg-primary/10 border border-primary/20"
                  )}
                  onClick={() => isClickable && onStepClick(step)}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors",
                      status === "completed" &&
                        "border-green-600 bg-green-600 text-white",
                      status === "in-progress" &&
                        "border-yellow-500 bg-yellow-50 text-yellow-700",
                      status === "current" &&
                        "border-primary bg-primary text-primary-foreground",
                      status === "pending" &&
                        "border-muted-foreground text-muted-foreground"
                    )}
                  >
                    {getStepIcon(step)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">
                        {stepTitles[step as keyof typeof stepTitles]}
                      </p>
                      {isClickable && (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {stepDescriptions[step as keyof typeof stepDescriptions]}
                    </p>

                    {completion > 0 && completion < 100 && (
                      <div className="mt-1">
                        <Progress value={completion} className="h-1" />
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {completion}%
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant - breadcrumb style
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold">Progreso del Asistente</h2>
          <Badge variant="outline">Paso {currentStep} / 4</Badge>
        </div>
        <Badge variant="secondary">
          {Math.round(overallProgress)}% completado
        </Badge>
      </div>

      <Progress value={overallProgress} className="h-2" />

      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((step, index) => {
          const status = getStepStatus(step);
          const isCurrentStep = step === currentStep;
          const completion = stepCompletion[step] || 0;
          const isClickable =
            onStepClick && (step <= currentStep || stepValidation[step - 1]);

          return (
            <div key={step} className="flex items-center">
              <button
                onClick={() => isClickable && onStepClick(step)}
                disabled={!isClickable}
                className={cn(
                  "flex flex-col items-center space-y-2 p-2 rounded-lg transition-all",
                  isClickable &&
                    "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
                  isCurrentStep && "bg-primary/10 text-primary",
                  !isClickable && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="relative">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors",
                      status === "completed" &&
                        "border-green-600 bg-green-600 text-white",
                      status === "in-progress" &&
                        "border-yellow-500 bg-yellow-50 text-yellow-700",
                      status === "current" &&
                        "border-primary bg-primary text-primary-foreground",
                      status === "pending" &&
                        "border-muted-foreground text-muted-foreground"
                    )}
                  >
                    {getStepIcon(step)}
                  </div>

                  {/* Completion indicator */}
                  {completion > 0 && completion < 100 && (
                    <div className="absolute -bottom-1 -right-1">
                      <div className="w-4 h-4 rounded-full bg-background border border-muted-foreground flex items-center justify-center">
                        <div
                          className="w-2 h-2 rounded-full bg-yellow-500 transition-transform"
                          style={{
                            transform: `scale(${completion / 100})`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <span className="text-xs font-medium block max-w-20 truncate">
                    {stepDescriptions[step as keyof typeof stepDescriptions]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {completion}%
                  </span>
                </div>
              </button>

              {/* Connector line */}
              {index < 3 && <div className="flex-1 h-px bg-border mx-2" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
