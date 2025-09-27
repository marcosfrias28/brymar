"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Eye,
  Check,
  AlertCircle,
  Clock,
  Undo2,
  Redo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
// Removed translations import
import { KeyboardShortcutsHelp } from "./keyboard-shortcuts-help";
import { useResponsive } from "@/hooks/use-mobile-responsive";
import { mobileClasses } from "@/lib/utils/mobile-utils";
import type { PropertyFormData, WizardState } from "@/types/wizard";

interface WizardNavigationProps {
  wizardState: WizardState;
  onStepChange: (step: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSaveDraft: () => Promise<void>;
  onComplete: () => Promise<void>;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  stepValidation: Record<number, boolean>;
  stepCompletion: Record<number, number>; // Percentage completion for each step
  keyboardShortcuts?: {
    navigation: Array<{ key: string; description: string }>;
    actions: Array<{ key: string; description: string }>;
    general: Array<{ key: string; description: string }>;
  };
}

export function WizardNavigation({
  wizardState,
  onStepChange,
  onNext,
  onPrevious,
  onSaveDraft,
  onComplete,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  stepValidation,
  stepCompletion,
  keyboardShortcuts,
}: WizardNavigationProps) {
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
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Mobile responsiveness
  const { isMobile, isTablet } = useResponsive();

  // Calculate overall progress
  const calculateOverallProgress = useCallback(() => {
    const totalSteps = 4;
    const completedSteps = Object.values(stepCompletion).reduce(
      (sum, completion) => sum + completion / 100,
      0
    );
    return Math.min((completedSteps / totalSteps) * 100, 100);
  }, [stepCompletion]);

  // Handle step navigation with validation
  const handleStepNavigation = useCallback(
    (targetStep: number) => {
      const currentStep = wizardState.currentStep;

      // Allow navigation to previous steps or current step
      if (targetStep <= currentStep) {
        onStepChange(targetStep);
        return;
      }

      // For forward navigation, check if all intermediate steps are valid
      let canNavigate = true;
      for (let step = currentStep; step < targetStep; step++) {
        if (!stepValidation[step]) {
          canNavigate = false;
          break;
        }
      }

      if (canNavigate) {
        onStepChange(targetStep);
      }
    },
    [wizardState.currentStep, stepValidation, onStepChange]
  );

  // Auto-save with visual feedback
  const handleAutoSave = useCallback(async () => {
    setIsAutoSaving(true);
    try {
      await onSaveDraft();
    } finally {
      setIsAutoSaving(false);
    }
  }, [onSaveDraft]);

  const overallProgress = calculateOverallProgress();
  const currentStepValid = stepValidation[wizardState.currentStep];
  const isLastStep = wizardState.currentStep === 4;

  return (
    <div className={cn(isMobile ? "space-y-3" : "space-y-6")}>
      {/* Header with progress and undo/redo */}
      <div className={cn(isMobile ? "space-y-2" : "space-y-4")}>
        <div
          className={cn(
            isMobile
              ? "flex flex-col space-y-2"
              : "flex items-center justify-between"
          )}
        >
          <div className="flex-1">
            <div
              className={cn(
                "mb-2",
                isMobile
                  ? "flex flex-col space-y-2"
                  : "flex items-center justify-between"
              )}
            >
              <h1
                className={cn("font-bold", isMobile ? "text-xl" : "text-3xl")}
              >
                Asistente de Propiedades
              </h1>

              {/* Undo/Redo controls - Hidden on mobile to save space */}
              {!isMobile && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onUndo}
                    disabled={!canUndo || wizardState.isLoading}
                    title="Deshacer"
                  >
                    <Undo2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRedo}
                    disabled={!canRedo || wizardState.isLoading}
                    title="Rehacer"
                  >
                    <Redo2 className="w-4 h-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAutoSave}
                    disabled={wizardState.isLoading || !wizardState.isDirty}
                    className={cn(isAutoSaving && "animate-pulse")}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isAutoSaving ? "Guardando..." : "Guardar"}
                  </Button>
                  {keyboardShortcuts && (
                    <>
                      <Separator orientation="vertical" className="h-6" />
                      <KeyboardShortcutsHelp shortcuts={keyboardShortcuts} />
                    </>
                  )}
                </div>
              )}
            </div>

            <div
              className={cn(
                "flex items-center",
                isMobile ? "space-x-2" : "space-x-4"
              )}
            >
              <p
                className={cn(
                  "text-muted-foreground",
                  isMobile ? "text-xs" : "text-sm"
                )}
              >
                Paso {wizardState.currentStep} de 4:{" "}
                {stepTitles[wizardState.currentStep as keyof typeof stepTitles]}
              </p>

              {/* Auto-save indicator */}
              {wizardState.isDirty && (
                <div
                  className={cn(
                    "flex items-center space-x-1 text-yellow-600",
                    isMobile ? "text-xs" : "text-sm"
                  )}
                >
                  <Clock className={cn(isMobile ? "w-2 h-2" : "w-3 h-3")} />
                  <span>Cambios sin guardar</span>
                </div>
              )}
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn(isMobile ? "text-xs" : "text-sm ml-4")}
          >
            {Math.round(overallProgress)}% completado
          </Badge>
        </div>

        {/* Overall progress bar */}
        <Progress
          value={overallProgress}
          className={cn("w-full", isMobile ? "h-1" : "h-2")}
        />

        {/* Breadcrumb navigation */}
        <div
          className={cn(
            isMobile
              ? "grid grid-cols-4 gap-1"
              : "flex items-center justify-between"
          )}
        >
          {[1, 2, 3, 4].map((step) => {
            const isCurrentStep = wizardState.currentStep === step;
            const isCompleted = stepValidation[step];
            const isAccessible =
              step <= wizardState.currentStep || stepValidation[step - 1];
            const completion = stepCompletion[step] || 0;

            return (
              <button
                key={step}
                onClick={() => handleStepNavigation(step)}
                disabled={!isAccessible || wizardState.isLoading}
                className={cn(
                  "flex flex-col items-center rounded-lg transition-all duration-200",
                  "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
                  isMobile ? "space-y-1 p-2 min-h-[60px]" : "space-y-2 p-3",
                  isCurrentStep &&
                    "bg-primary/10 text-primary ring-2 ring-primary/20",
                  isCompleted && !isCurrentStep && "text-green-600",
                  !isAccessible && "opacity-50 cursor-not-allowed",
                  isMobile && mobileClasses.touchButton
                )}
              >
                <div className="relative">
                  <div
                    className={cn(
                      "rounded-full border-2 flex items-center justify-center font-medium transition-all",
                      isMobile ? "w-6 h-6 text-xs" : "w-10 h-10 text-sm",
                      isCurrentStep &&
                        "border-primary bg-primary text-primary-foreground",
                      isCompleted &&
                        !isCurrentStep &&
                        "border-green-600 bg-green-600 text-white",
                      !isCurrentStep &&
                        !isCompleted &&
                        "border-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className={cn(isMobile ? "w-3 h-3" : "w-5 h-5")} />
                    ) : completion > 0 && !isCurrentStep ? (
                      <AlertCircle
                        className={cn(isMobile ? "w-3 h-3" : "w-5 h-5")}
                      />
                    ) : (
                      step
                    )}
                  </div>

                  {/* Step completion indicator - Hidden on mobile to save space */}
                  {!isMobile && completion > 0 && completion < 100 && (
                    <div className="absolute -bottom-1 -right-1">
                      <div className="w-4 h-4 rounded-full bg-background border border-muted-foreground flex items-center justify-center">
                        <div
                          className="w-2 h-2 rounded-full bg-yellow-500"
                          style={{
                            transform: `scale(${completion / 100})`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <span
                    className={cn(
                      "font-medium block",
                      isMobile ? "text-xs" : "text-xs"
                    )}
                  >
                    {isMobile
                      ? `${step}`
                      : stepDescriptions[step as keyof typeof stepDescriptions]}
                  </span>
                  {!isMobile && (
                    <span className="text-xs text-muted-foreground">
                      {completion}% completo
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation footer */}
      <div
        className={cn(
          "pt-4 border-t",
          isMobile
            ? "flex flex-col space-y-2"
            : "flex items-center justify-between"
        )}
      >
        {/* Mobile: Save draft button at top */}
        {isMobile && (
          <Button
            variant="outline"
            onClick={onSaveDraft}
            disabled={wizardState.isLoading || !wizardState.isDirty}
            className={cn(
              mobileClasses.touchButton,
              "w-full min-h-[44px] text-sm"
            )}
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar Borrador
          </Button>
        )}

        {/* Navigation buttons */}
        <div
          className={cn(
            isMobile
              ? "flex space-x-2"
              : "flex items-center justify-between w-full"
          )}
        >
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={wizardState.currentStep === 1 || wizardState.isLoading}
            className={cn(
              isMobile &&
                `${mobileClasses.touchButton} flex-1 min-h-[48px] text-base`
            )}
          >
            <ChevronLeft
              className={cn("mr-2", isMobile ? "w-5 h-5" : "w-4 h-4")}
            />
            Anterior
          </Button>

          {/* Desktop: Save draft button in middle */}
          {!isMobile && (
            <Button
              variant="outline"
              onClick={onSaveDraft}
              disabled={wizardState.isLoading || !wizardState.isDirty}
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Borrador
            </Button>
          )}

          {!isLastStep ? (
            <Button
              onClick={onNext}
              disabled={!currentStepValid || wizardState.isLoading}
              className={cn(
                isMobile &&
                  `${mobileClasses.touchButton} flex-1 min-h-[48px] text-base`
              )}
            >
              Siguiente
              <ChevronRight
                className={cn("ml-2", isMobile ? "w-5 h-5" : "w-4 h-4")}
              />
            </Button>
          ) : (
            <Button
              onClick={onComplete}
              disabled={
                wizardState.isLoading ||
                !Object.values(stepValidation).every(Boolean)
              }
              className={cn(
                "bg-green-600 hover:bg-green-700",
                isMobile &&
                  `${mobileClasses.touchButton} flex-1 min-h-[48px] text-base`
              )}
            >
              <Eye className={cn("mr-2", isMobile ? "w-5 h-5" : "w-4 h-4")} />
              Publicar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
