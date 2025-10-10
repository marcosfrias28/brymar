/**
 * Comprehensive Unit Tests for Core Wizard Framework Components
 * Tests all core wizard functionality including hooks, validation, and persistence
 */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi, Mock } from "vitest";

// Mock external dependencies
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

vi.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

// Import components after mocking
import { useWizard } from "@/hooks/wizard/use-wizard";
import { WizardValidator } from "@/lib/wizard/wizard-validator";
import { WizardPersistence } from "@/lib/wizard/wizard-persistence";
import { Wizard } from "@/components/wizard/core/wizard";
import { WizardNavigation } from "@/components/wizard/core/wizard-navigation";
import { WizardProgress } from "@/components/wizard/core/wizard-progress";
import { WizardStepRenderer } from "@/components/wizard/core/wizard-step-renderer";
import type { WizardConfig, WizardData, WizardStep } from "@/types/wizard-core";
import { z } from "zod";

// Test data interfaces
interface TestWizardData extends WizardData {
  name: string;
  email: string;
  age?: number;
  preferences?: string[];
}

// Test schemas
const TestStepSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be at least 18").optional(),
});

const TestFinalSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  status: z.enum(["draft", "published"]),
});

// Mock step components
const MockStep1 = ({ data, onUpdate, onNext }: any) => (
  <div data-testid="step-1">
    <input
      data-testid="name-input"
      value={data.name || ""}
      onChange={(e) => onUpdate({ name: e.target.value })}
      placeholder="Name"
    />
    <input
      data-testid="email-input"
      value={data.email || ""}
      onChange={(e) => onUpdate({ email: e.target.value })}
      placeholder="Email"
    />
    <button data-testid="next-button" onClick={onNext}>
      Next
    </button>
  </div>
);

const MockStep2 = ({ data, onUpdate, onNext, onPrevious }: any) => (
  <div data-testid="step-2">
    <input
      data-testid="age-input"
      type="number"
      value={data.age || ""}
      onChange={(e) => onUpdate({ age: parseInt(e.target.value) })}
      placeholder="Age"
    />
    <button data-testid="previous-button" onClick={onPrevious}>
      Previous
    </button>
    <button data-testid="next-button" onClick={onNext}>
      Next
    </button>
  </div>
);

const MockStep3 = ({ data, onComplete, onPrevious }: any) => (
  <div data-testid="step-3">
    <div data-testid="preview-name">{data.name}</div>
    <div data-testid="preview-email">{data.email}</div>
    <button data-testid="previous-button" onClick={onPrevious}>
      Previous
    </button>
    <button data-testid="complete-button" onClick={onComplete}>
      Complete
    </button>
  </div>
);

// Test wizard configuration
const testWizardConfig: WizardConfig<TestWizardData> = {
  id: "test-wizard",
  type: "test",
  title: "Test Wizard",
  description: "A test wizard for unit testing",
  steps: [
    {
      id: "personal-info",
      title: "Personal Information",
      description: "Enter your basic information",
      component: MockStep1,
      validation: TestStepSchema,
    },
    {
      id: "additional-info",
      title: "Additional Information",
      description: "Optional additional details",
      component: MockStep2,
      isOptional: true,
    },
    {
      id: "preview",
      title: "Preview",
      description: "Review your information",
      component: MockStep3,
    },
  ],
  validation: {
    stepSchemas: {
      "personal-info": TestStepSchema,
      "additional-info": z.object({
        age: z.number().min(18).optional(),
      }),
    },
    finalSchema: TestFinalSchema,
  },
  persistence: {
    autoSave: true,
    autoSaveInterval: 1000,
  },
};

describe("useWizard Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock WizardPersistence methods
    vi.spyOn(WizardPersistence, "saveDraft").mockResolvedValue({
      success: true,
      data: { draftId: "test-draft-id" },
    });
    vi.spyOn(WizardPersistence, "loadDraft").mockResolvedValue({
      success: true,
      data: {
        data: { name: "John", email: "john@example.com" },
        currentStep: "personal-info",
        stepProgress: {},
        completionPercentage: 50,
      },
    });
    vi.spyOn(WizardPersistence, "deleteDraft").mockResolvedValue({
      success: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() =>
        useWizard({
          config: testWizardConfig,
        })
      );

      expect(result.current.currentStep).toBe("personal-info");
      expect(result.current.currentStepIndex).toBe(0);
      expect(result.current.totalSteps).toBe(3);
      expect(result.current.progress).toBe(33.33333333333333);
      expect(result.current.canGoPrevious).toBe(false);
      expect(result.current.canGoNext).toBe(false);
      expect(result.current.canComplete).toBe(false);
    });

    it("should initialize with initial data", () => {
      const initialData = { name: "Jane", email: "jane@example.com" };
      const { result } = renderHook(() =>
        useWizard({
          config: testWizardConfig,
          initialData,
        })
      );

      expect(result.current.data).toEqual(initialData);
      expect(result.current.canGoNext).toBe(true);
    });
  });

  describe("Data Management", () => {
    it("should update data correctly", () => {
      const { result } = renderHook(() =>
        useWizard({
          config: testWizardConfig,
        })
      );

      act(() => {
        result.current.updateData({ name: "John" });
      });

      expect(result.current.data.name).toBe("John");
    });

    it("should merge data updates", () => {
      const { result } = renderHook(() =>
        useWizard({
          config: testWizardConfig,
          initialData: { name: "John" },
        })
      );

      act(() => {
        result.current.updateData({ email: "john@example.com" });
      });

      expect(result.current.data).toEqual({
        name: "John",
        email: "john@example.com",
      });
    });

    it("should reset data to initial state", () => {
      const initialData = { name: "Jane" };
      const { result } = renderHook(() =>
        useWizard({
          config: testWizardConfig,
          initialData,
        })
      );

      act(() => {
        result.current.updateData({ email: "jane@example.com" });
      });

      act(() => {
        result.current.resetData();
      });

      expect(result.current.data).toEqual(initialData);
      expect(result.current.currentStepIndex).toBe(0);
    });
  });

  describe("Navigation", () => {
    it("should navigate to next step when validation passes", async () => {
      const { result } = renderHook(() =>
        useWizard({
          config: testWizardConfig,
          initialData: { name: "John", email: "john@example.com" },
        })
      );

      expect(result.current.canGoNext).toBe(true);

      await act(async () => {
        const success = await result.current.nextStep();
        expect(success).toBe(true);
      });

      expect(result.current.currentStepIndex).toBe(1);
      expect(result.current.currentStep).toBe("additional-info");
    });

    it("should prevent navigation when validation fails", async () => {
      const { result } = renderHook(() =>
        useWizard({
          config: testWizardConfig,
          initialData: { name: "", email: "invalid-email" },
        })
      );

      expect(result.current.canGoNext).toBe(false);

      await act(async () => {
        const success = await result.current.nextStep();
        expect(success).toBe(false);
      });

      expect(result.current.currentStepIndex).toBe(0);
    });

    it("should navigate to previous step", () => {
      const { result } = renderHook(() =>
        useWizard({
          config: testWizardConfig,
          initialData: { name: "John", email: "john@example.com" },
        })
      );

      // Move to step 2 first
      act(() => {
        result.current.nextStep();
      });

      expect(result.current.currentStepIndex).toBe(1);
      expect(result.current.canGoPrevious).toBe(true);

      act(() => {
        const success = result.current.previousStep();
        expect(success).toBe(true);
      });

      expect(result.current.currentStepIndex).toBe(0);
    });

    it("should navigate to specific step by ID", () => {
      const { result } = renderHook(() =>
        useWizard({
          config: testWizardConfig,
          initialData: { name: "John", email: "john@example.com" },
        })
      );

      act(() => {
        const success = result.current.goToStep("preview");
        expect(success).toBe(true);
      });

      expect(result.current.currentStep).toBe("preview");
      expect(result.current.currentStepIndex).toBe(2);
    });

    it("should prevent jumping to invalid step", () => {
      const { result } = renderHook(() =>
        useWizard({
          config: testWizardConfig,
        })
      );

      act(() => {
        const success = result.current.goToStep("non-existent");
        expect(success).toBe(false);
      });

      expect(result.current.currentStepIndex).toBe(0);
    });
  });

  describe("Validation", () => {
    it("should validate current step", () => {
      const { result } = renderHook(() =>
        useWizard({
          config: testWizardConfig,
          initialData: { name: "John", email: "john@example.com" },
        })
      );

      const isValid = result.current.validateCurrentStep();
      expect(isValid).toBe(true);
    });

    it("should validate all steps", () => {
      const { result } = renderHook(() =>
        useWizard({
          config: testWizardConfig,
          initialData: {
            name: "John",
            email: "john@example.com",
            status: "draft",
          },
        })
      );

      const isValid = result.current.validateAllSteps();
      expect(isValid).toBe(true);
    });

    it("should get step errors", () => {
      const { result } = renderHook(() =>
        useWizard({
          config: testWizardConfig,
          initialData: { name: "", email: "invalid" },
        })
      );

      const errors = result.current.getStepErrors("personal-info");
      expect(Object.keys(errors).length).toBeGreaterThan(0);
    });

    it("should clear errors", () => {
      const { result } = renderHook(() =>
        useWizard({
          config: testWizardConfig,
          initialData: { name: "", email: "invalid" },
        })
      );

      // Trigger validation to set errors
      result.current.validateCurrentStep();

      act(() => {
        result.current.clearErrors();
      });

      const errors = result.current.getStepErrors();
      expect(Object.keys(errors).length).toBe(0);
    });
  });

  describe("Persistence", () => {
    it("should save draft", async () => {
      const onSaveDraft = vi.fn().mockResolvedValue("draft-id");
      const { result } = renderHook(() =>
        useWizard({
          config: testWizardConfig,
          initialData: { name: "John" },
          onSaveDraft,
        })
      );

      await act(async () => {
        const draftId = await result.current.saveDraft();
        expect(draftId).toBe("draft-id");
      });

      expect(onSaveDraft).toHaveBeenCalledWith(
        { name: "John" },
        "personal-info"
      );
    });

    it("should load draft", async () => {
      const { result } = renderHook(() =>
        useWizard({
          config: testWizardConfig,
        })
      );

      await act(async () => {
        const success = await result.current.loadDraft("test-draft-id");
        expect(success).toBe(true);
      });

      expect(result.current.data.name).toBe("John");
      expect(result.current.data.email).toBe("john@example.com");
    });

    it("should delete draft", async () => {
      const { result } = renderHook(() =>
        useWizard({
          config: testWizardConfig,
        })
      );

      await act(async () => {
        const success = await result.current.deleteDraft("test-draft-id");
        expect(success).toBe(true);
      });

      expect(WizardPersistence.deleteDraft).toHaveBeenCalledWith(
        "test-draft-id"
      );
    });
  });

  describe("Completion", () => {
    it("should complete wizard when all validation passes", async () => {
      const onComplete = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useWizard({
          config: testWizardConfig,
          initialData: {
            name: "John",
            email: "john@example.com",
            status: "published",
          },
          onComplete,
        })
      );

      expect(result.current.canComplete).toBe(true);

      await act(async () => {
        const success = await result.current.complete();
        expect(success).toBe(true);
      });

      expect(onComplete).toHaveBeenCalledWith({
        name: "John",
        email: "john@example.com",
        status: "published",
      });
    });

    it("should prevent completion when validation fails", async () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() =>
        useWizard({
          config: testWizardConfig,
          initialData: { name: "", email: "invalid" },
          onComplete,
        })
      );

      expect(result.current.canComplete).toBe(false);

      await act(async () => {
        const success = await result.current.complete();
        expect(success).toBe(false);
      });

      expect(onComplete).not.toHaveBeenCalled();
    });
  });
});

describe("WizardValidator", () => {
  describe("Step Validation", () => {
    it("should validate step data successfully", () => {
      const data = {
        name: "John Doe",
        email: "john@example.com",
      };

      const result = WizardValidator.validateStep(
        "test-step",
        data,
        TestStepSchema
      );

      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it("should return validation errors for invalid data", () => {
      const data = {
        name: "",
        email: "invalid-email",
      };

      const result = WizardValidator.validateStep(
        "test-step",
        data,
        TestStepSchema
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty("name");
      expect(result.errors).toHaveProperty("email");
    });

    it("should handle optional fields correctly", () => {
      const data = {
        name: "John Doe",
        email: "john@example.com",
        // age is optional
      };

      const result = WizardValidator.validateStep(
        "test-step",
        data,
        TestStepSchema
      );

      expect(result.isValid).toBe(true);
    });
  });

  describe("All Steps Validation", () => {
    it("should validate all steps successfully", () => {
      const data = {
        name: "John Doe",
        email: "john@example.com",
        status: "draft" as const,
      };

      const result = WizardValidator.validateAllSteps(data, testWizardConfig);

      expect(result.isValid).toBe(true);
    });

    it("should return errors from multiple steps", () => {
      const data = {
        name: "",
        email: "invalid",
        status: "draft" as const,
      };

      const result = WizardValidator.validateAllSteps(data, testWizardConfig);

      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });
  });

  describe("Navigation Validation", () => {
    it("should allow proceeding with valid data", () => {
      const data = {
        name: "John Doe",
        email: "john@example.com",
      };

      const canProceed = WizardValidator.canProceedToNextStep(
        "personal-info",
        data,
        testWizardConfig
      );

      expect(canProceed).toBe(true);
    });

    it("should prevent proceeding with invalid data", () => {
      const data = {
        name: "",
        email: "invalid",
      };

      const canProceed = WizardValidator.canProceedToNextStep(
        "personal-info",
        data,
        testWizardConfig
      );

      expect(canProceed).toBe(false);
    });

    it("should allow proceeding for optional steps", () => {
      const data = {
        age: 15, // Invalid age but step is optional
      };

      const canProceed = WizardValidator.canProceedToNextStep(
        "additional-info",
        data,
        testWizardConfig
      );

      expect(canProceed).toBe(true); // Optional step can be skipped
    });
  });

  describe("Completion Validation", () => {
    it("should allow completion with valid final data", () => {
      const data = {
        name: "John Doe",
        email: "john@example.com",
        status: "published" as const,
      };

      const canComplete = WizardValidator.canComplete(data, testWizardConfig);

      expect(canComplete).toBe(true);
    });

    it("should prevent completion with invalid final data", () => {
      const data = {
        name: "John Doe",
        email: "john@example.com",
        // Missing required status field
      };

      const canComplete = WizardValidator.canComplete(data, testWizardConfig);

      expect(canComplete).toBe(false);
    });
  });

  describe("Error Formatting", () => {
    it("should format error messages to user-friendly Spanish", () => {
      const formatted = WizardValidator.formatErrorMessage(
        "email",
        "String must contain at least 1 character(s)"
      );

      expect(formatted).toBe("Este campo es requerido");
    });

    it("should format email validation errors", () => {
      const formatted = WizardValidator.formatErrorMessage(
        "email",
        "Invalid email"
      );

      expect(formatted).toBe("Correo electrónico inválido");
    });

    it("should format number validation errors", () => {
      const formatted = WizardValidator.formatErrorMessage(
        "age",
        "Number must be greater than 18"
      );

      expect(formatted).toBe("Debe ser un número válido");
    });
  });
});

describe("Wizard Component", () => {
  const defaultProps = {
    config: testWizardConfig,
    onComplete: vi.fn(),
    onSaveDraft: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render wizard with progress and navigation", () => {
    render(<Wizard {...defaultProps} />);

    expect(screen.getByRole("application")).toBeInTheDocument();
    expect(screen.getByLabelText("Asistente: Test Wizard")).toBeInTheDocument();
  });

  it("should render current step content", () => {
    render(<Wizard {...defaultProps} />);

    expect(screen.getByTestId("step-1")).toBeInTheDocument();
    expect(screen.getByTestId("name-input")).toBeInTheDocument();
    expect(screen.getByTestId("email-input")).toBeInTheDocument();
  });

  it("should handle step navigation", async () => {
    const user = userEvent.setup();
    render(
      <Wizard
        {...defaultProps}
        initialData={{ name: "John", email: "john@example.com" }}
      />
    );

    // Fill in first step and navigate
    const nextButton = screen.getByTestId("next-button");
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByTestId("step-2")).toBeInTheDocument();
    });
  });

  it("should handle keyboard navigation", async () => {
    const user = userEvent.setup();
    render(
      <Wizard
        {...defaultProps}
        initialData={{ name: "John", email: "john@example.com" }}
      />
    );

    // Test Ctrl+Right Arrow for next
    await user.keyboard("{Control>}{ArrowRight}{/Control}");

    await waitFor(() => {
      expect(screen.getByTestId("step-2")).toBeInTheDocument();
    });
  });

  it("should show error when validation fails", async () => {
    const user = userEvent.setup();
    render(<Wizard {...defaultProps} />);

    // Try to navigate without filling required fields
    const nextButton = screen.getByTestId("next-button");
    await user.click(nextButton);

    // Should stay on first step
    expect(screen.getByTestId("step-1")).toBeInTheDocument();
  });

  it("should handle wizard completion", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(
      <Wizard
        {...defaultProps}
        onComplete={onComplete}
        initialData={{
          name: "John",
          email: "john@example.com",
          status: "published",
        }}
      />
    );

    // Navigate to last step
    await user.keyboard("{Control>}{ArrowRight}{/Control}");
    await user.keyboard("{Control>}{ArrowRight}{/Control}");

    await waitFor(() => {
      expect(screen.getByTestId("step-3")).toBeInTheDocument();
    });

    // Complete wizard
    const completeButton = screen.getByTestId("complete-button");
    await user.click(completeButton);

    expect(onComplete).toHaveBeenCalled();
  });
});
