"use client";

// Responsive Wizard Progress Component

import React from "react";
import { Check, Circle, Dot, AlertCircle, Clock } from "lucide-react";
import { WizardProgressProps, WizardData } from '@/types/wizard-core';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export function WizardProgress<T extends WizardData>({
  steps,
  currentStep,
  showStepNumbers = true,
  isMobile,
  stepValidation,
  onStepClick,
}: WizardProgressProps<T> & {
  stepValidation?: Record<
    number,
    {
      isValid: boolean;
      hasErrors: boolean;
      hasWarnings: boolean;
      errorCount?: number;
    }
  >;
  onStepClick?: (stepIndex: number) => void;
}) {
  const progress =
    steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  // Mobile compact view with validation indicators
  if (isMobile) {
    const currentStepValidation = stepValidation?.[currentStep];

    return (
      <div
        className="wizard-progress-mobile"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span aria-label={`Paso ${currentStep + 1} de ${steps.length}`}>
              Paso {currentStep + 1} de {steps.length}
            </span>
            <span aria-label={`${Math.round(progress)} por ciento completado`}>
              {Math.round(progress)}%
            </span>
          </div>
          <Progress
            value={progress}
            className="h-2"
            aria-label="Progreso general del asistente"
          />
        </div>

        {/* Current step info with validation */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <h3 className="font-medium text-sm">{steps[currentStep]?.title}</h3>

            {/* Validation indicators */}
            {currentStepValidation?.hasErrors && (
              <div className="flex items-center gap-1">
                <AlertCircle
                  className="h-4 w-4 text-red-500"
                  aria-hidden="true"
                />
                {currentStepValidation.errorCount && (
                  <Badge variant="destructive" className="text-xs h-5">
                    {currentStepValidation.errorCount}
                  </Badge>
                )}
                <span className="sr-only">
                  Este paso tiene {currentStepValidation.errorCount || 1}{" "}
                  errores
                </span>
              </div>
            )}

            {currentStepValidation?.hasWarnings &&
              !currentStepValidation.hasErrors && (
                <div className="flex items-center gap-1">
                  <AlertCircle
                    className="h-4 w-4 text-yellow-500"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Este paso tiene advertencias</span>
                </div>
              )}

            {currentStepValidation?.isValid &&
              !currentStepValidation.hasErrors && (
                <div className="flex items-center gap-1">
                  <Check
                    className="h-4 w-4 text-green-500"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Este paso está completo</span>
                </div>
              )}
          </div>

          {steps[currentStep]?.description && (
            <p className="text-xs text-muted-foreground mt-1">
              {steps[currentStep].description}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Desktop full view with enhanced accessibility and validation
  return (
    <div
      className="wizard-progress-desktop"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Progress bar */}
      <div className="mb-6">
        <Progress
          value={progress}
          className="h-2"
          aria-label="Progreso general del asistente"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Progreso</span>
          <span aria-label={`${Math.round(progress)} por ciento completado`}>
            {Math.round(progress)}% completado
          </span>
        </div>
      </div>

      {/* Step indicators with navigation */}
      <div
        className="flex items-center justify-between relative"
        role="tablist"
        aria-label="Pasos del asistente"
      >
        {/* Connection line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-border -z-10">
          <div
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;
          const validation = stepValidation?.[index];
          const hasErrors = validation?.hasErrors;
          const hasWarnings = validation?.hasWarnings;
          const isValid = validation?.isValid;

          return (
            <div
              key={step.id}
              className={cn(
                "flex flex-col items-center relative",
                "min-w-0 flex-1",
                index === 0 && "items-start",
                index === steps.length - 1 && "items-end"
              )}
              role="tab"
              aria-selected={isCurrent}
              aria-controls={`step-${index}-panel`}
            >
              {/* Step circle with click handler */}
              <button
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200",
                  "bg-background relative z-10 focus:outline-none focus:ring-2 focus:ring-primary/20",
                  isCompleted &&
                    !hasErrors &&
                    "border-primary bg-primary text-primary-foreground",
                  isCurrent &&
                    "border-primary bg-background text-primary scale-110",
                  isUpcoming &&
                    "border-muted-foreground/30 text-muted-foreground",
                  hasErrors && "border-red-500 bg-red-50 text-red-700",
                  hasWarnings &&
                    !hasErrors &&
                    "border-yellow-500 bg-yellow-50 text-yellow-700",
                  onStepClick && "hover:scale-105 cursor-pointer",
                  !onStepClick && "cursor-default"
                )}
                onClick={() => onStepClick?.(index)}
                disabled={!onStepClick}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Paso ${index + 1}: ${step.title}${
                  hasErrors
                    ? " (con errores)"
                    : hasWarnings
                    ? " (con advertencias)"
                    : isCompleted
                    ? " (completado)"
                    : isCurrent
                    ? " (actual)"
                    : ""
                }`}
                title={`${step.title}${
                  step.description ? ` - ${step.description}` : ""
                }`}
              >
                {hasErrors ? (
                  <AlertCircle className="h-4 w-4" />
                ) : hasWarnings && !isCompleted ? (
                  <AlertCircle className="h-4 w-4" />
                ) : isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : showStepNumbers ? (
                  <span className="text-xs font-medium">{index + 1}</span>
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </button>

              {/* Step label */}
              <div
                className={cn(
                  "mt-2 text-center max-w-24",
                  index === 0 && "text-left",
                  index === steps.length - 1 && "text-right"
                )}
              >
                <div
                  className={cn(
                    "text-xs font-medium transition-colors",
                    hasErrors && "text-red-600",
                    hasWarnings && !hasErrors && "text-yellow-600",
                    isCompleted && !hasErrors && "text-primary",
                    isCurrent &&
                      !hasErrors &&
                      !hasWarnings &&
                      "text-foreground",
                    isUpcoming &&
                      !hasErrors &&
                      !hasWarnings &&
                      "text-muted-foreground"
                  )}
                >
                  {step.title}
                </div>

                {step.description && (
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {step.description}
                  </div>
                )}

                {/* Validation indicators */}
                {hasErrors && validation?.errorCount && (
                  <Badge variant="destructive" className="text-xs mt-1">
                    {validation.errorCount} errores
                  </Badge>
                )}

                {/* Optional/skippable indicator */}
                {(step.isOptional || step.canSkip) && (
                  <div className="text-xs text-muted-foreground mt-1">
                    <span className="inline-flex items-center gap-1">
                      <Dot className="h-3 w-3" />
                      {step.isOptional ? "Opcional" : "Omitible"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Compact progress indicator for tight spaces
export function WizardProgressCompact<T extends WizardData>({
  steps,
  currentStep,
  showStepNumbers = false,
}: Omit<WizardProgressProps<T>, "isMobile">) {
  const progress =
    steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  return (
    <div className="wizard-progress-compact flex items-center gap-3">
      <div className="flex items-center gap-1">
        {steps.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-200",
              index < currentStep && "bg-primary",
              index === currentStep && "bg-primary scale-125",
              index > currentStep && "bg-muted-foreground/30"
            )}
          />
        ))}
      </div>

      <div className="text-xs text-muted-foreground">
        {showStepNumbers
          ? `${currentStep + 1}/${steps.length}`
          : `${Math.round(progress)}%`}
      </div>
    </div>
  );
}

// Circular progress indicator
export function WizardProgressCircular<T extends WizardData>({
  steps,
  currentStep,
  size = 60,
}: Omit<WizardProgressProps<T>, "isMobile" | "showStepNumbers"> & {
  size?: number;
}) {
  const progress =
    steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;
  const circumference = 2 * Math.PI * (size / 2 - 4);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="wizard-progress-circular relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 4}
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-muted-foreground/20"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 4}
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-primary transition-all duration-300 ease-in-out"
          strokeLinecap="round"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xs font-medium">
            {currentStep + 1}/{steps.length}
          </div>
          <div className="text-xs text-muted-foreground">
            {Math.round(progress)}%
          </div>
        </div>
      </div>
    </div>
  );
}

// Progress hook for external components
export function useWizardProgress(currentStep: number, totalSteps: number) {
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
  const isComplete = currentStep >= totalSteps - 1;
  const stepsRemaining = Math.max(0, totalSteps - currentStep - 1);

  return {
    progress,
    isComplete,
    stepsRemaining,
    currentStep: currentStep + 1, // 1-based for display
    totalSteps,
  };
}
