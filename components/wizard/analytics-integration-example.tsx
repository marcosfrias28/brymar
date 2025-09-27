"use client";

import React, { useEffect, useState } from "react";
import { useWizardAnalytics } from "@/hooks/use-wizard-analytics";
import { AnalyticsWrapper } from "./analytics-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Example component showing how to integrate analytics into wizard steps
 * This demonstrates the complete analytics integration pattern
 */
export function AnalyticsIntegrationExample() {
  const analytics = useWizardAnalytics({
    enabled: true,
    trackPerformance: true,
    trackUserBehavior: true,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
  });
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Track step start when component mounts or step changes
  useEffect(() => {
    analytics.trackStepStart(currentStep, {
      formData: Object.keys(formData).filter(
        (key) => formData[key as keyof typeof formData]
      ).length,
      timestamp: Date.now(),
    });
  }, [currentStep, analytics]);

  // Example: Track field interactions
  const handleFieldFocus = (fieldName: string) => {
    analytics.trackFieldFocus(fieldName);
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    analytics.trackFieldChange(fieldName, value.length, false);
  };

  // Example: Track AI generation
  const handleAIGeneration = async (type: "title" | "description") => {
    const startTime = Date.now();

    try {
      setIsGeneratingAI(true);

      // Track AI generation request
      analytics.trackAIGenerationRequest(type, {
        propertyType: "house",
        currentContent: formData[type],
        userInput: formData,
      });

      // Simulate AI API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const generatedContent = `AI Generated ${type}: Beautiful property with amazing features`;
      const responseTime = Date.now() - startTime;

      // Track successful AI generation
      analytics.trackAIGenerationResult(type, {
        model: "huggingface/gpt2",
        inputTokens: 50,
        outputTokens: 25,
        responseTime,
        success: true,
      });

      // Track external service call
      analytics.trackExternalServiceCall("huggingface", true, responseTime);

      // Update form with AI content
      setFormData((prev) => ({ ...prev, [type]: generatedContent }));
      analytics.trackFieldChange(type, generatedContent.length, true);
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Track AI generation failure
      analytics.trackAIGenerationResult(type, {
        model: "huggingface/gpt2",
        inputTokens: 50,
        outputTokens: 0,
        responseTime,
        success: false,
        errorType: error instanceof Error ? error.message : "Unknown error",
      });

      // Track external service error
      analytics.trackExternalServiceCall(
        "huggingface",
        false,
        responseTime,
        "API_ERROR"
      );

      // Track error
      analytics.trackError(
        error instanceof Error ? error : new Error("AI generation failed"),
        {
          component: "AnalyticsIntegrationExample",
          step: currentStep,
          generationType: type,
        }
      );
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Example: Track file upload
  const handleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0);

    // Track upload start
    analytics.trackUploadStart(fileArray.length, totalSize);

    for (const file of fileArray) {
      const startTime = Date.now();

      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 20) {
          setUploadProgress(progress);
          analytics.trackUploadProgress(
            file.name,
            progress,
            (file.size * progress) / 100
          );
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        const uploadTime = Date.now() - startTime;

        // Track successful upload
        analytics.trackUploadResult({
          fileSize: file.size,
          fileType: file.type,
          uploadTime,
          success: true,
        });

        // Track external service call for blob storage
        analytics.trackExternalServiceCall("vercel_blob", true, uploadTime);
      } catch (error) {
        const uploadTime = Date.now() - startTime;

        // Track failed upload
        analytics.trackUploadResult({
          fileSize: file.size,
          fileType: file.type,
          uploadTime,
          success: false,
          errorType: error instanceof Error ? error.message : "Upload failed",
        });

        // Track external service error
        analytics.trackExternalServiceCall(
          "vercel_blob",
          false,
          uploadTime,
          "UPLOAD_ERROR"
        );

        analytics.trackError(
          error instanceof Error ? error : new Error("Upload failed"),
          {
            component: "AnalyticsIntegrationExample",
            step: currentStep,
            fileName: file.name,
            fileSize: file.size,
          }
        );
      }
    }
  };

  // Example: Track step navigation
  const handleNextStep = () => {
    // Validate current step
    const errors: Record<string, string[]> = {};

    if (currentStep === 1) {
      if (!formData.title) errors.title = ["Title is required"];
      if (!formData.price) errors.price = ["Price is required"];
    }

    if (Object.keys(errors).length > 0) {
      // Track validation failure
      analytics.trackStepValidationFailed(currentStep, errors);
      return;
    }

    // Track successful step completion
    analytics.trackStepComplete(currentStep, {
      formData: formData,
      validationPassed: true,
    });

    // Track navigation attempt
    analytics.trackNavigationAttempt(currentStep, currentStep + 1, true);

    setCurrentStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => {
    analytics.trackNavigationAttempt(currentStep, currentStep - 1, true);
    setCurrentStep((prev) => prev - 1);
  };

  // Example: Track wizard completion
  const handleWizardComplete = () => {
    analytics.trackWizardComplete({
      propertyData: formData,
      totalSteps: 3,
      completionMethod: "manual",
    });
  };

  // Example: Track draft save
  const handleSaveDraft = () => {
    const completionPercentage =
      (Object.values(formData).filter(Boolean).length / 3) * 100;

    analytics.trackDraftSaved("draft-123", completionPercentage, currentStep);
  };

  // Performance measurement example
  const measureRenderPerformance = analytics.measurePerformance("step_render");

  useEffect(() => {
    // End performance measurement when component updates
    return measureRenderPerformance;
  }, [currentStep, measureRenderPerformance]);

  return (
    <AnalyticsWrapper
      componentName="AnalyticsIntegrationExample"
      stepNumber={currentStep}
      trackInteractions={true}
      trackPerformance={true}
    >
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              Analytics Integration Example - Step {currentStep}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentStep === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Property Title
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    onFocus={() => handleFieldFocus("title")}
                    placeholder="Enter property title"
                  />
                  <Button
                    onClick={() => handleAIGeneration("title")}
                    disabled={isGeneratingAI}
                    className="mt-2"
                    size="sm"
                  >
                    {isGeneratingAI ? "Generating..." : "Generate with AI"}
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleFieldChange("description", e.target.value)
                    }
                    onFocus={() => handleFieldFocus("description")}
                    placeholder="Enter property description"
                    className="w-full p-2 border rounded-md"
                    rows={4}
                  />
                  <Button
                    onClick={() => handleAIGeneration("description")}
                    disabled={isGeneratingAI}
                    className="mt-2"
                    size="sm"
                  >
                    {isGeneratingAI ? "Generating..." : "Generate with AI"}
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Price
                  </label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleFieldChange("price", e.target.value)}
                    onFocus={() => handleFieldFocus("price")}
                    placeholder="Enter price"
                  />
                </div>
              </>
            )}

            {currentStep === 2 && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files && handleFileUpload(e.target.files)
                  }
                  className="w-full p-2 border rounded-md"
                />
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Uploading: {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Preview & Publish
                </h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium">
                    {formData.title || "No title"}
                  </h4>
                  <p className="text-gray-600 mt-2">
                    {formData.description || "No description"}
                  </p>
                  <p className="text-lg font-semibold mt-2">
                    ${formData.price || "0"}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <div className="space-x-2">
                {currentStep > 1 && (
                  <Button variant="outline" onClick={handlePreviousStep}>
                    Previous
                  </Button>
                )}
                <Button variant="outline" onClick={handleSaveDraft}>
                  Save Draft
                </Button>
              </div>

              <div>
                {currentStep < 3 ? (
                  <Button onClick={handleNextStep}>Next</Button>
                ) : (
                  <Button onClick={handleWizardComplete}>
                    Publish Property
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Session Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-3 rounded-md overflow-auto">
              {JSON.stringify(analytics.getSessionSummary(), null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </AnalyticsWrapper>
  );
}
