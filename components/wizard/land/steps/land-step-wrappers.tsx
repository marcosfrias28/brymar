"use client";

import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type WizardStepProps } from "@/types/universal-wizard";
import {
  type LandFormData,
  LandFormDataSchema,
} from "@/lib/schemas/land-wizard-schemas";
import { LandGeneralStep } from "./land-general-step";
import { LandLocationStep } from "./land-location-step";
import { LandMediaStep } from "./land-media-step";
import { LandPreviewStep } from "./land-preview-step";

// Wrapper for General Step
export function LandGeneralStepWrapper({
  data,
  onUpdate,
  onNext,
  onPrevious,
  errors,
  isLoading,
}: WizardStepProps<LandFormData>) {
  const methods = useForm<LandFormData>({
    resolver: zodResolver(LandFormDataSchema.partial()),
    defaultValues: data,
    mode: "onChange",
  });

  React.useEffect(() => {
    const subscription = methods.watch((value) => {
      onUpdate(value as Partial<LandFormData>);
    });
    return () => subscription.unsubscribe();
  }, [methods, onUpdate]);

  return (
    <FormProvider {...methods}>
      <LandGeneralStep
        data={data}
        onUpdate={onUpdate}
        onNext={onNext}
        onPrevious={onPrevious}
        errors={errors || {}}
        isLoading={isLoading || false}
        isMobile={false}
      />
    </FormProvider>
  );
}

// Wrapper for Location Step
export function LandLocationStepWrapper({
  data,
  onUpdate,
  onNext,
  onPrevious,
  errors,
  isLoading,
}: WizardStepProps<LandFormData>) {
  const methods = useForm<LandFormData>({
    resolver: zodResolver(LandFormDataSchema.partial()),
    defaultValues: data,
    mode: "onChange",
  });

  React.useEffect(() => {
    const subscription = methods.watch((value) => {
      onUpdate(value as Partial<LandFormData>);
    });
    return () => subscription.unsubscribe();
  }, [methods, onUpdate]);

  return (
    <FormProvider {...methods}>
      <LandLocationStep
        data={data}
        onUpdate={onUpdate}
        onNext={onNext}
        onPrevious={onPrevious}
        errors={errors || {}}
        isLoading={isLoading || false}
        isMobile={false}
      />
    </FormProvider>
  );
}

// Wrapper for Media Step
export function LandMediaStepWrapper({
  data,
  onUpdate,
  onNext,
  onPrevious,
  errors,
  isLoading,
}: WizardStepProps<LandFormData>) {
  const methods = useForm<LandFormData>({
    resolver: zodResolver(LandFormDataSchema.partial()),
    defaultValues: data,
    mode: "onChange",
  });

  React.useEffect(() => {
    const subscription = methods.watch((value) => {
      onUpdate(value as Partial<LandFormData>);
    });
    return () => subscription.unsubscribe();
  }, [methods, onUpdate]);

  return (
    <FormProvider {...methods}>
      <LandMediaStep
        data={data}
        onUpdate={onUpdate}
        onNext={onNext}
        onPrevious={onPrevious}
        errors={errors || {}}
        isLoading={isLoading || false}
        isMobile={false}
      />
    </FormProvider>
  );
}

// Wrapper for Preview Step
export function LandPreviewStepWrapper({
  data,
  onUpdate,
  onNext,
  onPrevious,
  errors,
  isLoading,
}: WizardStepProps<LandFormData>) {
  // Ensure required fields have default values for preview step
  const defaultValues = {
    ...data,
    status: data.status || ("draft" as const),
    aiGenerated: data.aiGenerated || {
      name: false,
      description: false,
      characteristics: false,
    },
  };

  const methods = useForm<LandFormData>({
    resolver: zodResolver(LandFormDataSchema.partial()),
    defaultValues,
    mode: "onChange",
  });

  React.useEffect(() => {
    const subscription = methods.watch((value) => {
      // Ensure required fields are always present when updating
      const updatedValue = {
        ...value,
        status: value.status || ("draft" as const),
        aiGenerated: value.aiGenerated || {
          name: false,
          description: false,
          characteristics: false,
        },
      };
      onUpdate(updatedValue as Partial<LandFormData>);
    });
    return () => subscription.unsubscribe();
  }, [methods, onUpdate]);

  const handleSubmit = () => {
    // Ensure required fields are set before submission
    const currentData = methods.getValues();
    const finalData = {
      ...currentData,
      status: currentData.status || ("draft" as const),
      aiGenerated: currentData.aiGenerated || {
        name: false,
        description: false,
        characteristics: false,
      },
    };

    // Update the form with final data
    onUpdate(finalData as Partial<LandFormData>);

    // Proceed with submission
    onNext();
  };

  const handleEditStep = (step: number) => {
    // This functionality would need to be passed down from the universal wizard
    console.log("Edit step:", step);
  };

  return (
    <FormProvider {...methods}>
      <LandPreviewStep
        data={data}
        onUpdate={onUpdate}
        onNext={onNext}
        onPrevious={onPrevious}
        errors={errors || {}}
        isLoading={isLoading || false}
        isMobile={false}
      />
    </FormProvider>
  );
}
