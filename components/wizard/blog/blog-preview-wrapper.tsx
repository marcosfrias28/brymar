"use client";

import React from "react";
import { BlogPreviewStep } from "./steps/blog-preview-step";
import type { BlogWizardData } from "@/types/blog-wizard";

interface BlogPreviewWrapperProps {
  data: BlogWizardData;
}

export function BlogPreviewWrapper({ data }: BlogPreviewWrapperProps) {
  const handleUpdate = () => {
    // Preview component doesn't need to update data
  };

  return (
    <BlogPreviewStep
      data={data}
      onUpdate={handleUpdate}
      onNext={() => {}}
      onPrevious={() => {}}
      errors={{}}
      isLoading={false}
      isMobile={false}
    />
  );
}
