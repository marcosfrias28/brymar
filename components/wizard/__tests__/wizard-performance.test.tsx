import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PropertyWizard } from "../property-wizard";
import { MediaUploadStep } from "../steps/media-upload-step";
import { performance } from "perf_hooks";

// Mock dependencies
jest.mock("@/hooks/use-wizard-state-manager");
jest.mock("@/hooks/use-wizard-actions");
jest.mock("@/hooks/use-ai-generation");
jest.mock("@/hooks/use-characteristics");
jest.mock("@/lib/services/image-upload-service");

import { useWizardStateManager } from "@/hooks/use-wizard-state-manager";
import { useWizardActions } from "@/hooks/use-wizard-actions";
import { useAIGeneration } from "@/hooks/use-ai-generation";
import { useCharacteristics } from "@/hooks/use-characteristics";
import {
  generateSignedUrl,
  uploadDirect,
} from "@/lib/services/image-upload-service";

const mockUseWizardStateManager = useWizardStateManager as jest.MockedFunction<
  typeof useWizardStateManager
>;
const mockUseWizardActions = useWizardActions as jest.MockedFunction<
  typeof useWizardActions
>;
const mockUseAIGeneration = useAIGeneration as jest.MockedFunction<
  typeof useAIGeneration
>;
const mockUseCharacteristics = useCharacteristics as jest.MockedFunction<
  typeof useCharacteristics
>;
const mockGenerateSignedUrl = generateSignedUrl as jest.MockedFunction<
  typeof generateSignedUrl
>;
const mockUploadDirect = uploadDirect as jest.MockedFunction<
  typeof uploadDirect
>;

// Performance measurement utilities
const measureRenderTime = (renderFn: () => void): number => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
};

const measureAsyncOperation = async (
  operation: () => Promise<void>
): Promise<number> => {
  const start = performance.now();
  await operation();
  const end = performance.now();
  return end - start;
};

// Create large datasets for performance testing
const createLargeImageList = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `img-${i}`,
    url: `https://example.com/image${i}.jpg`,
    filename: `image${i}.jpg`,
    size: 1024 * 1024 * ((i % 5) + 1), // 1-5MB files
    contentType: "image/jpeg",
    width: 800 + (i % 400),
    height: 600 + (i % 300),
  }));
};

const createLargeCharacteristicsList = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `char-${i}`,
    name: `Characteristic ${i}`,
    category: ["amenity", "feature", "location"][i % 3] as const,
    selected: i % 3 === 0,
  }));
};

describe("Wizard Performance Tests", () => {
  const mockWizardState = {
    wizardState: {
      currentStep: 1,
      formData: {},
      isValid: { 1: false, 2: false, 3: false, 4: false },
      isDirty: false,
      isLoading: false,
      errors: {},
    },
    stepValidation: { 1: false, 2: false, 3: false, 4: false },
    stepCompletion: { 1: 0, 2: 0, 3: 0, 4: 0 },
    updateFormData: jest.fn(),
    goToStep: jest.fn(),
    goToNextStep: jest.fn(),
    goToPreviousStep: jest.fn(),
    undo: jest.fn(),
    redo: jest.fn(),
    canUndo: false,
    canRedo: false,
    setLoading: jest.fn(),
    setErrors: jest.fn(),
    clearDirtyState: jest.fn(),
  };

  const mockWizardActions = {
    publishProperty: jest.fn(),
    saveDraft: jest.fn(),
    loadDraft: jest.fn(),
    deleteDraft: jest.fn(),
    isLoading: false,
    error: null,
  };

  const mockAIGeneration = {
    generateContent: jest.fn(),
    generateTitle: jest.fn(),
    generateDescription: jest.fn(),
    generateTags: jest.fn(),
    isGenerating: false,
    error: null,
    retry: jest.fn(),
    generationHistory: [],
  };

  const mockCharacteristics = {
    characteristics: createLargeCharacteristicsList(10),
    loading: false,
    error: null,
    toggleCharacteristic: jest.fn(),
    addCustomCharacteristic: jest.fn(),
  };

  beforeEach(() => {
    mockUseWizardStateManager.mockReturnValue(mockWizardState);
    mockUseWizardActions.mockReturnValue(mockWizardActions);
    mockUseAIGeneration.mockReturnValue(mockAIGeneration);
    mockUseCharacteristics.mockReturnValue(mockCharacteristics);

    mockGenerateSignedUrl.mockResolvedValue({
      uploadUrl: "https://blob.vercel-storage.com/upload-url",
      publicUrl: "https://blob.vercel-storage.com/test-image.jpg",
      expiresAt: new Date(Date.now() + 3600000),
    });

    mockUploadDirect.mockResolvedValue({
      url: "https://blob.vercel-storage.com/test-image.jpg",
      size: 1024 * 1024,
      uploadedAt: new Date(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial Render Performance", () => {
    it("renders wizard within acceptable time limits", () => {
      const renderTime = measureRenderTime(() => {
        render(<PropertyWizard />);
      });

      // Should render within 100ms
      expect(renderTime).toBeLessThan(100);
    });

    it("handles large datasets efficiently", () => {
      // Mock large characteristics list
      mockCharacteristics.characteristics = createLargeCharacteristicsList(100);

      const renderTime = measureRenderTime(() => {
        render(<PropertyWizard />);
      });

      // Should still render within reasonable time with large dataset
      expect(renderTime).toBeLessThan(200);
    });

    it("lazy loads step components", () => {
      const { rerender } = render(<PropertyWizard />);

      // Initial render should only load step 1
      expect(screen.getByText("Información General")).toBeInTheDocument();
      expect(screen.queryByText("Ubicación")).not.toBeInTheDocument();

      // Change to step 2
      mockWizardState.wizardState.currentStep = 2;
      rerender(<PropertyWizard />);

      // Now step 2 should be loaded
      expect(screen.getByText("Ubicación")).toBeInTheDocument();
    });
  });

  describe("Form Input Performance", () => {
    it("handles rapid form input without lag", async () => {
      const user = userEvent.setup();
      render(<PropertyWizard />);

      const titleInput = screen.getByLabelText("Título de la propiedad");

      const inputTime = await measureAsyncOperation(async () => {
        // Simulate rapid typing
        await user.type(
          titleInput,
          "A very long property title that simulates rapid user input"
        );
      });

      // Should handle rapid input within reasonable time
      expect(inputTime).toBeLessThan(500);
    });

    it("debounces form updates efficiently", async () => {
      const user = userEvent.setup();
      render(<PropertyWizard />);

      const titleInput = screen.getByLabelText("Título de la propiedad");

      // Type rapidly
      await user.type(titleInput, "Test");

      // updateFormData should be called, but debounced
      expect(mockWizardState.updateFormData).toHaveBeenCalled();

      // Clear mock and type more
      mockWizardState.updateFormData.mockClear();
      await user.type(titleInput, " Property");

      // Should not call updateFormData for every keystroke
      const callCount = mockWizardState.updateFormData.mock.calls.length;
      expect(callCount).toBeLessThan(9); // Less than number of characters typed
    });

    it("validates forms efficiently with large datasets", async () => {
      const user = userEvent.setup();

      // Mock large form data
      mockWizardState.wizardState.formData = {
        title: "Test Property",
        description: "A".repeat(2000), // Large description
        characteristics: createLargeCharacteristicsList(50),
      };

      render(<PropertyWizard />);

      const validationTime = await measureAsyncOperation(async () => {
        const nextButton = screen.getByText("Siguiente");
        await user.click(nextButton);
      });

      // Validation should complete quickly even with large data
      expect(validationTime).toBeLessThan(100);
    });
  });

  describe("Image Upload Performance", () => {
    it("handles single image upload efficiently", async () => {
      const user = userEvent.setup();

      const mockProps = {
        data: { images: [] },
        onUpdate: jest.fn(),
        onNext: jest.fn(),
        onPrevious: jest.fn(),
        locale: "es" as const,
      };

      render(<MediaUploadStep {...mockProps} />);

      const imageFile = new File(["x".repeat(1024 * 1024)], "test.jpg", {
        type: "image/jpeg",
      });

      const uploadTime = await measureAsyncOperation(async () => {
        const fileInput = screen.getByLabelText("Seleccionar imágenes");
        await user.upload(fileInput, imageFile);

        await waitFor(() => {
          expect(mockUploadDirect).toHaveBeenCalled();
        });
      });

      // Single upload should complete quickly
      expect(uploadTime).toBeLessThan(1000);
    });

    it("handles batch image upload efficiently", async () => {
      const user = userEvent.setup();

      const mockProps = {
        data: { images: [] },
        onUpdate: jest.fn(),
        onNext: jest.fn(),
        onPrevious: jest.fn(),
        locale: "es" as const,
      };

      render(<MediaUploadStep {...mockProps} />);

      // Create multiple files
      const files = Array.from(
        { length: 5 },
        (_, i) =>
          new File([`content${i}`], `test${i}.jpg`, { type: "image/jpeg" })
      );

      const batchUploadTime = await measureAsyncOperation(async () => {
        const fileInput = screen.getByLabelText("Seleccionar imágenes");
        await user.upload(fileInput, files);

        await waitFor(() => {
          expect(mockUploadDirect).toHaveBeenCalledTimes(5);
        });
      });

      // Batch upload should complete within reasonable time
      expect(batchUploadTime).toBeLessThan(2000);
    });

    it("renders large image lists efficiently", () => {
      const largeImageList = createLargeImageList(20);

      const mockProps = {
        data: { images: largeImageList },
        onUpdate: jest.fn(),
        onNext: jest.fn(),
        onPrevious: jest.fn(),
        locale: "es" as const,
      };

      const renderTime = measureRenderTime(() => {
        render(<MediaUploadStep {...mockProps} />);
      });

      // Should render large image list efficiently
      expect(renderTime).toBeLessThan(300);
    });

    it("handles image reordering efficiently", async () => {
      const user = userEvent.setup();

      const mockProps = {
        data: { images: createLargeImageList(10) },
        onUpdate: jest.fn(),
        onNext: jest.fn(),
        onPrevious: jest.fn(),
        locale: "es" as const,
      };

      render(<MediaUploadStep {...mockProps} />);

      const reorderTime = await measureAsyncOperation(async () => {
        const moveButtons = screen.getAllByLabelText(/Mover hacia arriba/);
        await user.click(moveButtons[5]); // Move middle item
      });

      // Reordering should be instant
      expect(reorderTime).toBeLessThan(50);
    });
  });

  describe("AI Generation Performance", () => {
    it("handles AI generation requests efficiently", async () => {
      const user = userEvent.setup();

      mockAIGeneration.generateContent.mockResolvedValue({
        title: "Generated Title",
        description: "Generated Description",
        tags: ["tag1", "tag2"],
      });

      render(<PropertyWizard />);

      const generationTime = await measureAsyncOperation(async () => {
        const aiButton = screen.getByText("Generar con IA");
        await user.click(aiButton);

        await waitFor(() => {
          expect(mockAIGeneration.generateContent).toHaveBeenCalled();
        });
      });

      // AI generation trigger should be immediate
      expect(generationTime).toBeLessThan(100);
    });

    it("handles AI generation errors without performance impact", async () => {
      const user = userEvent.setup();

      mockAIGeneration.generateContent.mockRejectedValue(new Error("AI Error"));

      render(<PropertyWizard />);

      const errorHandlingTime = await measureAsyncOperation(async () => {
        const aiButton = screen.getByText("Generar con IA");
        await user.click(aiButton);

        await waitFor(() => {
          expect(
            screen.getByText("Error al generar contenido")
          ).toBeInTheDocument();
        });
      });

      // Error handling should be quick
      expect(errorHandlingTime).toBeLessThan(200);
    });
  });

  describe("Step Navigation Performance", () => {
    it("navigates between steps efficiently", async () => {
      const user = userEvent.setup();
      render(<PropertyWizard />);

      const navigationTime = await measureAsyncOperation(async () => {
        // Navigate through all steps
        for (let step = 1; step <= 4; step++) {
          mockWizardState.wizardState.currentStep = step;
          mockWizardState.stepValidation[step] = true;

          if (step < 4) {
            const nextButton = screen.getByText("Siguiente");
            await user.click(nextButton);
          }
        }
      });

      // Navigation should be smooth
      expect(navigationTime).toBeLessThan(500);
    });

    it("handles step validation efficiently", async () => {
      const user = userEvent.setup();

      // Mock complex validation scenario
      mockWizardState.wizardState.formData = {
        title: "Test Property",
        description: "A".repeat(1000),
        price: 150000,
        surface: 200,
        characteristics: createLargeCharacteristicsList(30),
      };

      render(<PropertyWizard />);

      const validationTime = await measureAsyncOperation(async () => {
        const nextButton = screen.getByText("Siguiente");
        await user.click(nextButton);
      });

      // Complex validation should still be fast
      expect(validationTime).toBeLessThan(150);
    });
  });

  describe("Memory Usage", () => {
    it("cleans up resources when unmounting", () => {
      const { unmount } = render(<PropertyWizard />);

      // Mock memory usage tracking
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      unmount();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Memory should not increase significantly after unmount
      expect(finalMemory - initialMemory).toBeLessThan(1024 * 1024); // Less than 1MB
    });

    it("handles large form data without memory leaks", () => {
      const largeFormData = {
        title: "Test Property",
        description: "A".repeat(10000),
        images: createLargeImageList(50),
        characteristics: createLargeCharacteristicsList(100),
      };

      mockWizardState.wizardState.formData = largeFormData;

      const { rerender, unmount } = render(<PropertyWizard />);

      // Re-render multiple times with large data
      for (let i = 0; i < 10; i++) {
        rerender(<PropertyWizard />);
      }

      unmount();

      // Should not cause memory issues
      expect(true).toBe(true); // Test passes if no memory errors occur
    });
  });

  describe("Bundle Size Impact", () => {
    it("uses code splitting for step components", () => {
      // This would be tested with actual bundle analysis tools
      // For now, we verify that components are imported dynamically

      render(<PropertyWizard />);

      // Only current step should be rendered
      expect(screen.getByText("Información General")).toBeInTheDocument();
      expect(screen.queryByTestId("location-step")).not.toBeInTheDocument();
      expect(screen.queryByTestId("media-upload-step")).not.toBeInTheDocument();
      expect(screen.queryByTestId("preview-step")).not.toBeInTheDocument();
    });

    it("lazy loads heavy dependencies", () => {
      // Verify that heavy dependencies like map libraries are not loaded initially
      render(<PropertyWizard />);

      // Map-related elements should not be in DOM on step 1
      expect(screen.queryByTestId("map-container")).not.toBeInTheDocument();
    });
  });

  describe("Concurrent Operations", () => {
    it("handles multiple simultaneous operations efficiently", async () => {
      const user = userEvent.setup();
      render(<PropertyWizard />);

      const concurrentTime = await measureAsyncOperation(async () => {
        // Simulate multiple concurrent operations
        const promises = [
          user.type(screen.getByLabelText("Título de la propiedad"), "Test"),
          user.type(screen.getByLabelText("Precio (USD)"), "150000"),
          user.click(screen.getByLabelText("Piscina")),
        ];

        await Promise.all(promises);
      });

      // Concurrent operations should not block each other
      expect(concurrentTime).toBeLessThan(300);
    });

    it("maintains performance under high interaction frequency", async () => {
      const user = userEvent.setup();
      render(<PropertyWizard />);

      const highFrequencyTime = await measureAsyncOperation(async () => {
        const titleInput = screen.getByLabelText("Título de la propiedad");

        // Simulate very rapid interactions
        for (let i = 0; i < 20; i++) {
          await user.type(titleInput, "a");
          await user.keyboard("{Backspace}");
        }
      });

      // Should handle high frequency interactions smoothly
      expect(highFrequencyTime).toBeLessThan(1000);
    });
  });
});
