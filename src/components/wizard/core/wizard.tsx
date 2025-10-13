"use client";

// Main Wizard Component with TypeScript Generics Support

import React, { useEffect } from "react";
import { WizardData, WizardProps } from '@/types/wizard-core';
import { useWizard } from '@/hooks/wizard/use-wizard';
import { useIsMobile } from '@/hooks/use-mobile';
import { WizardErrorBoundary } from "./wizard-error-boundary";
import { WizardStepRenderer } from "./wizard-step-renderer";
import { WizardNavigation } from "./wizard-navigation";
import { WizardProgress } from "./wizard-progress";
import { cn } from '@/lib/utils';

export function Wizard<T extends WizardData>({
  config,
  initialData,
  draftId,
  onComplete,
  onSaveDraft,
  onCancel,
  className,
  showProgress = true,
  showStepNumbers = true,
  enableKeyboardNavigation = true,
  enableMobileOptimizations = true,
}: WizardProps<T>) {
  const isMobile = useIsMobile();

  const wizard = useWizard({
    config,
    initialData,
    draftId,
    onComplete,
    onSaveDraft,
  });

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboardNavigation) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't interfere with form inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (event.key) {
        case "ArrowRight":
        case "PageDown":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            wizard.nextStep();
          }
          break;
        case "ArrowLeft":
        case "PageUp":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            wizard.previousStep();
          }
          break;
        case "s":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            wizard.saveDraft();
          }
          break;
        case "Enter":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            if (wizard.canComplete) {
              wizard.complete();
            } else if (wizard.canGoNext) {
              wizard.nextStep();
            }
          }
          break;
        case "Escape":
          if (onCancel) {
            event.preventDefault();
            onCancel();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    enableKeyboardNavigation,
    wizard.nextStep,
    wizard.previousStep,
    wizard.saveDraft,
    wizard.complete,
    wizard.canGoNext,
    wizard.canComplete,
    onCancel,
  ]);

  // Mobile optimizations
  const mobileOptimizations = enableMobileOptimizations && isMobile;

  return (
    <WizardErrorBoundary
      onError={(error) => {
        console.error("Wizard error:", error);
      }}
    >
      <div
        className={cn(
          "wizard-container",
          "flex flex-col min-h-screen",
          mobileOptimizations && "mobile-optimized",
          className
        )}
        role="application"
        aria-label={`Asistente: ${config.title}`}
      >
        {/* Progress Indicator */}
        {showProgress && (
          <div
            className={cn(
              "wizard-progress-container",
              "sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
              "border-b border-border",
              (mobileOptimizations && "px-4 py-2") || "px-6 py-4"
            )}
          >
            <WizardProgress
              steps={config.steps}
              currentStep={wizard.currentStepIndex}
              showStepNumbers={showStepNumbers}
              isMobile={isMobile}
            />
          </div>
        )}

        {/* Main Content */}
        <div
          className={cn(
            "wizard-content",
            "flex-1 flex flex-col",
            (mobileOptimizations && "px-4 py-4") || "px-6 py-8"
          )}
        >
          {/* Step Content */}
          <div className="flex-1">
            <WizardStepRenderer
              step={config.steps[wizard.currentStepIndex]}
              data={wizard.data}
              onUpdate={wizard.updateData}
              onNext={wizard.nextStep}
              onPrevious={wizard.previousStep}
              errors={wizard.getStepErrors()}
              isLoading={wizard.isLoading || wizard.isValidating}
              isMobile={isMobile}
            />
          </div>

          {/* Navigation */}
          <div
            className={cn(
              "wizard-navigation-container",
              "mt-8 pt-6 border-t border-border",
              mobileOptimizations &&
                "sticky bottom-0 bg-background/95 backdrop-blur -mx-4 px-4 py-4"
            )}
          >
            <WizardNavigation
              canGoNext={wizard.canGoNext}
              canGoPrevious={wizard.canGoPrevious}
              canComplete={wizard.canComplete}
              isFirstStep={wizard.currentStepIndex === 0}
              isLastStep={wizard.currentStepIndex === config.steps.length - 1}
              onNext={async () => {
                await wizard.nextStep();
              }}
              onPrevious={() => {
                wizard.previousStep();
              }}
              onComplete={async () => {
                await wizard.complete();
              }}
              onSaveDraft={async () => {
                await wizard.saveDraft();
              }}
              onCancel={onCancel}
              isLoading={wizard.isLoading}
              isSaving={wizard.isSaving}
              isMobile={isMobile}
            />
          </div>
        </div>

        {/* Error Display */}
        {wizard.error && (
          <div
            className={cn(
              "wizard-error-container",
              "bg-destructive/10 border-t border-destructive/20 p-4",
              (mobileOptimizations && "px-4") || "px-6"
            )}
            role="alert"
            aria-live="polite"
          >
            <p className="text-sm text-destructive">{wizard.error}</p>
          </div>
        )}

        {/* Keyboard Shortcuts Help (Development) */}
        {process.env.NODE_ENV === "development" && enableKeyboardNavigation && (
          <div className="fixed bottom-4 right-4 z-50">
            <details className="bg-background border border-border rounded-lg shadow-lg">
              <summary className="p-2 text-xs cursor-pointer">
                Atajos de teclado
              </summary>
              <div className="p-3 text-xs space-y-1 min-w-48">
                <div>
                  <kbd>Ctrl/Cmd + →</kbd> Siguiente paso
                </div>
                <div>
                  <kbd>Ctrl/Cmd + ←</kbd> Paso anterior
                </div>
                <div>
                  <kbd>Ctrl/Cmd + S</kbd> Guardar borrador
                </div>
                <div>
                  <kbd>Ctrl/Cmd + Enter</kbd> Completar/Siguiente
                </div>
                <div>
                  <kbd>Esc</kbd> Cancelar
                </div>
              </div>
            </details>
          </div>
        )}
      </div>
    </WizardErrorBoundary>
  );
}

// Wizard wrapper with additional features
export function WizardWithFeatures<T extends WizardData>(
  props: WizardProps<T> & {
    enableAnalytics?: boolean;
    enableAutoSave?: boolean;
    enableOfflineSupport?: boolean;
  }
) {
  const {
    enableAnalytics = false,
    enableAutoSave = true,
    enableOfflineSupport = false,
    ...wizardProps
  } = props;

  // Analytics tracking
  useEffect(() => {
    if (enableAnalytics) {
      // Track wizard start
      console.log("Wizard started:", props.config.id);
    }
  }, [enableAnalytics, props.config.id]);

  // Offline support
  useEffect(() => {
    if (enableOfflineSupport) {
      const handleOnline = () => {
        console.log("Back online - syncing wizard data");
      };

      const handleOffline = () => {
        console.log("Gone offline - enabling offline mode");
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, [enableOfflineSupport]);

  return <Wizard {...wizardProps} />;
}

// Export default wizard component
export default Wizard;
