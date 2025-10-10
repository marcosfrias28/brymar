"use client";

import React from "react";
import { Wizard } from "@/components/wizard/core/wizard";
import { blogWizardConfig } from "@/lib/wizard/blog-wizard-config";
import { BlogWizardData, defaultBlogWizardData } from "@/types/blog-wizard";
import {
  createBlogFromWizard,
  updateBlogFromWizard,
  saveBlogDraft,
  deleteBlogDraft,
  loadBlogDraft,
} from "@/lib/actions/blog-wizard-actions";

interface BlogWizardProps {
  initialData?: Partial<BlogWizardData>;
  draftId?: string;
  blogId?: string;
  userId: string;
  onComplete?: (data: BlogWizardData) => void;
  onUpdate?: (data: Partial<BlogWizardData>) => void;
  onCancel?: () => void;
}

export function BlogWizard({
  initialData,
  draftId,
  blogId,
  userId,
  onComplete,
  onUpdate,
  onCancel,
}: BlogWizardProps) {
  // Handle completion
  const handleComplete = async (data: BlogWizardData) => {
    try {
      let result;
      if (blogId) {
        result = await updateBlogFromWizard({ ...data, id: blogId });
      } else {
        result = await createBlogFromWizard(data as any);
      }

      if (result.success) {
        // Delete draft if it exists
        if (draftId) {
          await deleteBlogDraft({ draftId, userId });
        }
        onComplete?.(data);
      } else {
        throw new Error(result.message || "Error al guardar el artículo");
      }
    } catch (error) {
      console.error("Error completing blog wizard:", error);
      throw error;
    }
  };

  // Handle draft saving
  const handleSaveDraft = async (
    data: Partial<BlogWizardData>,
    step: string
  ) => {
    try {
      const stepIndex = blogWizardConfig.steps.findIndex((s) => s.id === step);
      const completionPercentage = Math.round(
        ((stepIndex + 1) / blogWizardConfig.steps.length) * 100
      );

      const result = await saveBlogDraft({
        ...data,
        draftId,
        userId,
        stepCompleted: stepIndex + 1,
        completionPercentage,
      } as any);

      if (result.success && result.data) {
        return result.data.draftId;
      } else {
        throw new Error(result.message || "Error al guardar el borrador");
      }
    } catch (error) {
      console.error("Error saving blog draft:", error);
      throw error;
    }
  };

  // Merge initial data with defaults
  const mergedInitialData = {
    ...defaultBlogWizardData,
    ...initialData,
  };

  return (
    <Wizard<BlogWizardData>
      config={blogWizardConfig}
      initialData={mergedInitialData}
      draftId={draftId}
      onComplete={handleComplete}
      onSaveDraft={handleSaveDraft}
      onCancel={onCancel}
    />
  );
}
