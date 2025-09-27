"use client";

import { useCallback, useEffect } from "react";
import { PropertyWizardProps, PropertyFormData } from "@/types/wizard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Removed language switcher and translations
import { useWizardStateManager } from "@/hooks/use-wizard-state-manager";
import { useWizardKeyboardNavigation } from "@/hooks/use-wizard-keyboard-navigation";
import {
  useResponsive,
  useMobileKeyboard,
} from "@/hooks/use-mobile-responsive";
import { mobileClasses } from "@/lib/utils/mobile-utils";
import { WizardNavigation } from "./wizard-navigation";
import { WizardProgress } from "./wizard-progress";
import { cn } from "@/lib/utils";

// Step components
import { GeneralInfoStep } from "./steps/general-info-step";
import { LocationStep } from "./steps/location-step";
import { MediaUploadStep } from "./steps/media-upload-step";
import { PreviewStep } from "./steps/preview-step";

export function PropertyWizard({
  initialData = {},
  draftId,
  onComplete,
  onSaveDraft,
  onUpdate,
}: PropertyWizardProps & {
  onUpdate?: (data: Partial<PropertyFormData>) => void;
}) {
  // Static Spanish text instead of translations
  const stepTitles = {
    1: "Información General",
    2: "Ubicación",
    3: "Fotos y Videos",
    4: "Vista Previa",
  };

  // Mobile responsiveness
  const { isMobile, isTablet, isKeyboardOpen, breakpoint } = useResponsive({
    trackKeyboard: true,
  });
  const { keyboardHeight } = useMobileKeyboard();

  // Initialize wizard state manager with auto-save
  const {
    wizardState,
    stepValidation,
    stepCompletion,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    updateFormData,
    undo,
    redo,
    canUndo,
    canRedo,
    setLoading,
    setErrors,
    clearDirtyState,
  } = useWizardStateManager(initialData, {
    maxHistorySize: 50,
    autoSaveInterval: 0, // Deshabilitar auto-save temporalmente
    onAutoSave: async (data) => {
      // await onSaveDraft(data);
    },
    onUpdate: onUpdate,
  });

  // Save as draft
  const handleSaveDraft = useCallback(async () => {
    setLoading(true);

    try {
      const draftId = await onSaveDraft(wizardState.formData);
      clearDirtyState();
      console.log("Draft saved successfully:", draftId);
    } catch (error) {
      setErrors({ general: "Error al guardar el borrador" });
      console.error("Error saving draft:", error);
    } finally {
      setLoading(false);
    }
  }, [
    wizardState.formData,
    onSaveDraft,
    setLoading,
    setErrors,
    clearDirtyState,
  ]);

  // Complete wizard (publish)
  const handleComplete = useCallback(async () => {
    // Validate all steps before completing
    const allStepsValid = Object.values(stepValidation).every(Boolean);

    if (!allStepsValid) {
      setErrors({ general: "Por favor completa todos los pasos requeridos" });
      return;
    }

    setLoading(true);

    try {
      // Ensure status is set to published for final submission
      const completeData = {
        ...wizardState.formData,
        status: "published" as const,
        language: wizardState.formData.language || ("es" as const),
        aiGenerated: wizardState.formData.aiGenerated || {
          title: false,
          description: false,
          tags: false,
        },
      } as PropertyFormData;

      await onComplete(completeData);
      clearDirtyState();
    } catch (error) {
      setErrors({ general: "Error al publicar la propiedad" });
      console.error("Error completing wizard:", error);
    } finally {
      setLoading(false);
    }
  }, [
    wizardState.formData,
    onComplete,
    stepValidation,
    setLoading,
    setErrors,
    clearDirtyState,
  ]);

  // Enable keyboard navigation
  const { keyboardShortcuts } = useWizardKeyboardNavigation({
    currentStep: wizardState.currentStep,
    maxStep: 4,
    canGoNext: stepValidation[wizardState.currentStep] || false,
    canGoPrevious: wizardState.currentStep > 1,
    canUndo,
    canRedo,
    onNext: goToNextStep,
    onPrevious: goToPreviousStep,
    onUndo: undo,
    onRedo: redo,
    onSave: handleSaveDraft,
    onGoToStep: goToStep,
    isLoading: wizardState.isLoading,
  });

  return (
    <div
      className={cn(
        "w-full mx-auto transition-all duration-300",
        isMobile ? "px-4 py-2 space-y-4" : "max-w-4xl px-6 py-6 space-y-6",
        isKeyboardOpen && isMobile && "pb-4"
      )}
      style={{
        paddingBottom:
          isKeyboardOpen && isMobile ? `${keyboardHeight + 16}px` : undefined,
      }}
    >
      {/* Header with language switcher */}
      <div
        className={cn(
          "flex items-center justify-between",
          isMobile ? "mb-4" : "mb-6"
        )}
      >
        <h1
          className={cn(
            "font-bold",
            isMobile ? "text-xl sm:text-2xl" : "text-3xl"
          )}
        >
          Asistente de Propiedades
        </h1>
      </div>

      {/* Enhanced navigation with progress and undo/redo */}
      <WizardNavigation
        wizardState={wizardState}
        onStepChange={goToStep}
        onNext={goToNextStep}
        onPrevious={goToPreviousStep}
        onSaveDraft={handleSaveDraft}
        onComplete={handleComplete}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        stepValidation={stepValidation}
        stepCompletion={stepCompletion}
        keyboardShortcuts={keyboardShortcuts}
      />

      {/* Error display */}
      {Object.keys(wizardState.errors).length > 0 && (
        <Card className="border-destructive">
          <CardContent className={cn(isMobile ? "pt-4 px-4" : "pt-6")}>
            <div className={cn(isMobile ? "space-y-1" : "space-y-2")}>
              {Object.entries(wizardState.errors).map(([field, error]) => (
                <p
                  key={field}
                  className={cn(
                    "text-destructive",
                    isMobile ? "text-xs" : "text-sm"
                  )}
                >
                  {error}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step content */}
      <Card className={cn(isMobile && "border-0 shadow-none bg-transparent")}>
        <CardHeader className={cn(isMobile ? "px-0 pb-4" : "")}>
          <CardTitle className={cn(isMobile ? "text-lg" : "text-xl")}>
            {stepTitles[wizardState.currentStep as keyof typeof stepTitles]}
          </CardTitle>
        </CardHeader>
        <CardContent className={cn(isMobile ? "px-0" : "")}>
          {wizardState.currentStep === 1 && (
            <GeneralInfoStep
              data={wizardState.formData}
              onUpdate={updateFormData}
              onNext={goToNextStep}
              isLoading={wizardState.isLoading}
              isMobile={isMobile}
            />
          )}

          {wizardState.currentStep === 2 && (
            <LocationStep
              data={wizardState.formData}
              onUpdate={updateFormData}
              onNext={goToNextStep}
              onPrevious={goToPreviousStep}
              isLoading={wizardState.isLoading}
              isMobile={isMobile}
            />
          )}

          {wizardState.currentStep === 3 && (
            <MediaUploadStep
              data={wizardState.formData}
              onUpdate={updateFormData}
              onNext={goToNextStep}
              onPrevious={goToPreviousStep}
              isLoading={wizardState.isLoading}
              isMobile={isMobile}
            />
          )}

          {wizardState.currentStep === 4 && (
            <PreviewStep
              data={wizardState.formData as PropertyFormData}
              onPublish={handleComplete}
              onSaveDraft={handleSaveDraft}
              onEdit={goToStep}
              isLoading={wizardState.isLoading}
              isMobile={isMobile}
            />
          )}
        </CardContent>
      </Card>

      {/* Dirty state indicator */}
      {wizardState.isDirty && (
        <div
          className={cn(
            "fixed bg-yellow-100 border border-yellow-300 rounded-lg shadow-lg z-50",
            isMobile ? "bottom-2 left-2 right-2 p-2" : "bottom-4 right-4 p-3"
          )}
        >
          <p
            className={cn(
              "text-yellow-800",
              isMobile ? "text-xs text-center" : "text-sm"
            )}
          >
            Tienes cambios sin guardar
          </p>
        </div>
      )}
    </div>
  );
}
