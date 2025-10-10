"use client";

import React from "react";
import { Wizard } from "@/components/wizard/core/wizard";
import { landWizardConfig } from "@/lib/wizard/land-wizard-config";
import { LandWizardData, defaultLandWizardData } from "@/types/land-wizard";
import {
  createLandFromWizard,
  updateLandFromWizard,
  saveLandDraft,
  loadLandDraft,
  deleteLandDraft,
} from "@/lib/actions/land-wizard-actions";

interface LandWizardProps {
  initialData?: Partial<LandWizardData>;
  landId?: string;
  draftId?: string;
  userId: string;
  onComplete?: (landId: string) => void;
  onCancel?: () => void;
}

export function LandWizard({
  initialData,
  landId,
  draftId,
  userId,
  onComplete,
  onCancel,
}: LandWizardProps) {
  // Handle completion
  const handleComplete = async (data: LandWizardData) => {
    try {
      let result;

      if (landId) {
        // Update existing land
        result = await updateLandFromWizard({ ...data, id: landId } as any);
      } else {
        // Create new land
        result = await createLandFromWizard(data as any);
      }

      if (result.success && (result.data as any)?.landId) {
        // Delete draft if it exists
        if (draftId) {
          await deleteLandDraft({ draftId, userId });
        }

        onComplete?.((result.data as any)?.landId);
      } else {
        throw new Error(result.message || "Error al guardar el terreno");
      }
    } catch (error) {
      console.error("Error completing land wizard:", error);
      throw error;
    }
  };

  // Handle draft saving
  const handleSaveDraft = async (
    data: Partial<LandWizardData>,
    step: string
  ) => {
    try {
      const stepIndex = landWizardConfig.steps.findIndex((s) => s.id === step);
      const completionPercentage = Math.round(
        ((stepIndex + 1) / landWizardConfig.steps.length) * 100
      );

      const result = await saveLandDraft({
        draftId,
        userId,
        formData: data as any,
        stepCompleted: stepIndex + 1,
        completionPercentage,
      });

      if (result.success) {
        return (result.data as any)?.draftId || draftId || "";
      } else {
        throw new Error(result.message || "Error al guardar borrador");
      }
    } catch (error) {
      console.error("Error saving land draft:", error);
      throw error;
    }
  };

  // Merge initial data with defaults
  const mergedInitialData = {
    ...defaultLandWizardData,
    ...initialData,
  };

  return (
    <Wizard<LandWizardData>
      config={landWizardConfig}
      initialData={mergedInitialData}
      draftId={draftId}
      onComplete={handleComplete}
      onSaveDraft={handleSaveDraft}
      onCancel={onCancel}
    />
  );
}
