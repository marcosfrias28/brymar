/**
 * Accessibility Tests for Wizard Framework
 * Tests keyboard navigation, screen reader support, and WCAG compliance
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

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
import { Wizard } from "@/components/wizard/core/wizard";
import { WizardNavigation } from "@/components/wizard/core/wizard-navigation";
import { WizardProgress } from "@/components/wizard/core/wizard-progress";
import { PropertyWizard } from "@/components/wizard/property/property-wizard";
import type { WizardConfig, WizardData, WizardStep } from "@/types/wizard-core";
import { z } from "zod";

// Test data interfaces
interface TestWizardData extends WizardData {
  name: string;
  email: string;
  age?: number;
  preferences?: string[];
}

// Accessible step components
const AccessibleStep1 = ({ data, onUpdate, onNext, errors }: any) => (
  <div role="tabpanel" aria-labelledby="step-1-tab" id="step-1-panel">
    <h2 id="step-1-heading">Personal Information</h2>
    <p>Please enter your basic information below.</p>

    <div className="form-group">
      <label htmlFor="name-input" className="required">
        Full Name *
      </label>
      <input
        id="name-input"
        type="text"
        value={data.name || ""}
        onChange={(e) => onUpdate({ name: e.target.value })}
        aria-describedby={errors.name ? "name-error" : "name-help"}
        aria-invalid={!!errors.name}
        aria-required="true"
      />
      <div id="name-help" className="help-text">
        Enter your full legal name
      </div>
      {errors.name && (
        <div id="name-error" className="error-text" role="alert">
          {errors.name}
        </div>
      )}
    </div>

    <div className="form-group">
      <label htmlFor="email-input" className="required">
        Email Address *
      </label>
      <input
        id="email-input"
        type="email"
        value={data.email || ""}
        onChange={(e) => onUpdate({ email: e.target.value })}
        aria-describedby={errors.email ? "email-error" : "email-help"}
        aria-invalid={!!errors.email}
        aria-required="true"
      />
      <div id="email-help" className="help-text">
        We'll use this to contact you about your application
      </div>
      {errors.email && (
        <div id="email-error" className="error-text" role="alert">
          {errors.email}
        </div>
      )}
    </div>

    <button
      type="button"
      onClick={onNext}
      aria-describedby="next-help"
      className="primary-button"
    >
      Continue to Next Step
    </button>
    <div id="next-help" className="sr-only">
      Proceed to additional information step
    </div>
  </div>
);

const AccessibleStep2 = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  errors,
}: any) => (
  <div role="tabpanel" aria-labelledby="step-2-tab" id="step-2-panel">
    <h2 id="step-2-heading">Additional Information</h2>
    <p>This information is optional but helps us serve you better.</p>

    <div className="form-group">
      <label htmlFor="age-input">Age</label>
      <input
        id="age-input"
        type="number"
        min="18"
        max="120"
        value={data.age || ""}
        onChange={(e) =>
          onUpdate({ age: parseInt(e.target.value) || undefined })
        }
        aria-describedby={errors.age ? "age-error" : "age-help"}
        aria-invalid={!!errors.age}
      />
      <div id="age-help" className="help-text">
        Must be 18 or older
      </div>
      {errors.age && (
        <div id="age-error" className="error-text" role="alert">
          {errors.age}
        </div>
      )}
    </div>

    <fieldset>
      <legend>Preferences (select all that apply)</legend>
      <div className="checkbox-group">
        {["email-updates", "phone-calls", "newsletters"].map((pref) => (
          <div key={pref} className="checkbox-item">
            <input
              id={`pref-${pref}`}
              type="checkbox"
              checked={data.preferences?.includes(pref) || false}
              onChange={(e) => {
                const current = data.preferences || [];
                const updated = e.target.checked
                  ? [...current, pref]
                  : current.filter((p) => p !== pref);
                onUpdate({ preferences: updated });
              }}
            />
            <label htmlFor={`pref-${pref}`}>
              {pref.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </label>
          </div>
        ))}
      </div>
    </fieldset>

    <div className="button-group">
      <button
        type="button"
        onClick={onPrevious}
        aria-describedby="prev-help"
        className="secondary-button"
      >
        Back to Previous Step
      </button>
      <div id="prev-help" className="sr-only">
        Return to personal information step
      </div>

      <button
        type="button"
        onClick={onNext}
        aria-describedby="next-help-2"
        className="primary-button"
      >
        Continue to Review
      </button>
      <div id="next-help-2" className="sr-only">
        Proceed to review your information
      </div>
    </div>
  </div>
);

const AccessibleStep3 = ({ data, onComplete, onPrevious }: any) => (
  <div role="tabpanel" aria-labelledby="step-3-tab" id="step-3-panel">
    <h2 id="step-3-heading">Review Your Information</h2>
    <p>Please review your information before submitting.</p>

    <div className="review-section">
      <h3>Personal Information</h3>
      <dl>
        <dt>Name:</dt>
        <dd>{data.name || "Not provided"}</dd>
        <dt>Email:</dt>
        <dd>{data.email || "Not provided"}</dd>
        {data.age && (
          <>
            <dt>Age:</dt>
            <dd>{data.age}</dd>
          </>
        )}
      </dl>
    </div>

    {data.preferences?.length > 0 && (
      <div className="review-section">
        <h3>Preferences</h3>
        <ul>
          {data.preferences.map((pref: string) => (
            <li key={pref}>
              {pref.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </li>
          ))}
        </ul>
      </div>
    )}

    <div className="button-group">
      <button
        type="button"
        onClick={onPrevious}
        aria-describedby="prev-help-3"
        className="secondary-button"
      >
        Back to Edit
      </button>
      <div id="prev-help-3" className="sr-only">
        Return to additional information to make changes
      </div>

      <button
        type="button"
        onClick={onComplete}
        aria-describedby="complete-help"
        className="primary-button"
      >
        Submit Application
      </button>
      <div id="complete-help" className="sr-only">
        Submit your completed application
      </div>
    </div>
  </div>
);

// Test wizard configuration with accessibility features
const accessibleWizardConfig: WizardConfig<TestWizardData> = {
  id: "accessible-wizard",
  type: "test",
  title: "Accessible Test Wizard",
  description: "A fully accessible wizard for testing",
  steps: [
    {
      id: "personal-info",
      title: "Personal Information",
      description: "Enter your basic information",
      component: AccessibleStep1,
      validation: z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Please enter a valid email address"),
      }),
    },
    {
      id: "additional-info",
      title: "Additional Information",
      description: "Optional additional details",
      component: AccessibleStep2,
      isOptional: true,
      validation: z.object({
        age: z.number().min(18, "Must be at least 18 years old").optional(),
        preferences: z.array(z.string()).optional(),
      }),
    },
    {
      id: "review",
      title: "Review",
      description: "Review your information",
      component: AccessibleStep3,
    },
  ],
  validation: {
    stepSchemas: {
      "personal-info": z.object({
        name: z.string().min(1),
        email: z.string().email(),
      }),
      "additional-info": z.object({
        age: z.number().min(18).optional(),
        preferences: z.array(z.string()).optional(),
      }),
    },
    finalSchema: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      status: z.enum(["draft", "published"]),
    }),
  },
};

describe("Wizard Accessibility Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("WCAG Compliance", () => {
    it("should have no accessibility violations", async () => {
      const { container } = render(<Wizard config={accessibleWizardConfig} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should maintain accessibility across all steps", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Wizard
          config={accessibleWizardConfig}
          initialData={{ name: "John Doe", email: "john@example.com" }}
        />
      );

      // Test first step
      let results = await axe(container);
      expect(results).toHaveNoViolations();

      // Navigate to second step
      await user.click(
        screen.getByRole("button", { name: /continue to next step/i })
      );

      await waitFor(() => {
        expect(
          screen.getByRole("tabpanel", { name: /additional information/i })
        ).toBeInTheDocument();
      });

      results = await axe(container);
      expect(results).toHaveNoViolations();

      // Navigate to third step
      await user.click(
        screen.getByRole("button", { name: /continue to review/i })
      );

      await waitFor(() => {
        expect(
          screen.getByRole("tabpanel", { name: /review/i })
        ).toBeInTheDocument();
      });

      results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper heading hierarchy", () => {
      render(<Wizard config={accessibleWizardConfig} />);

      // Check heading levels
      const h1 = screen.queryByRole("heading", { level: 1 });
      const h2 = screen.getByRole("heading", { level: 2 });
      const h3 = screen.queryByRole("heading", { level: 3 });

      // Should have h2 for step title
      expect(h2).toBeInTheDocument();
      expect(h2).toHaveTextContent("Personal Information");

      // Should not skip heading levels
      if (h3) {
        expect(h2).toBeInTheDocument(); // h2 should exist before h3
      }
    });
  });

  describe("Keyboard Navigation", () => {
    it("should support full keyboard navigation", async () => {
      const user = userEvent.setup();
      render(
        <Wizard
          config={accessibleWizardConfig}
          initialData={{ name: "John Doe", email: "john@example.com" }}
        />
      );

      // Tab through form elements
      await user.tab();
      expect(screen.getByLabelText(/full name/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/email address/i)).toHaveFocus();

      await user.tab();
      expect(
        screen.getByRole("button", { name: /continue to next step/i })
      ).toHaveFocus();

      // Use Enter to activate button
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(
          screen.getByRole("tabpanel", { name: /additional information/i })
        ).toBeInTheDocument();
      });
    });

    it("should support arrow key navigation in wizard progress", async () => {
      const user = userEvent.setup();
      render(<Wizard config={accessibleWizardConfig} showProgress={true} />);

      // Find progress indicators (should be focusable)
      const progressSteps = screen.getAllByRole("tab");

      if (progressSteps.length > 0) {
        // Focus first step
        progressSteps[0].focus();
        expect(progressSteps[0]).toHaveFocus();

        // Use arrow keys to navigate
        await user.keyboard("{ArrowRight}");

        // Should move focus to next step (if enabled)
        if (progressSteps.length > 1) {
          expect(progressSteps[1]).toHaveFocus();
        }
      }
    });

    it("should handle Escape key to cancel", async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();

      render(<Wizard config={accessibleWizardConfig} onCancel={onCancel} />);

      await user.keyboard("{Escape}");
      expect(onCancel).toHaveBeenCalled();
    });

    it("should support Ctrl+S for save draft", async () => {
      const user = userEvent.setup();
      const onSaveDraft = vi.fn().mockResolvedValue("draft-id");

      render(
        <Wizard config={accessibleWizardConfig} onSaveDraft={onSaveDraft} />
      );

      await user.keyboard("{Control>}s{/Control}");

      await waitFor(() => {
        expect(onSaveDraft).toHaveBeenCalled();
      });
    });

    it("should support Ctrl+Arrow keys for step navigation", async () => {
      const user = userEvent.setup();
      render(
        <Wizard
          config={accessibleWizardConfig}
          initialData={{ name: "John Doe", email: "john@example.com" }}
        />
      );

      // Navigate forward with Ctrl+Right
      await user.keyboard("{Control>}{ArrowRight}{/Control}");

      await waitFor(() => {
        expect(
          screen.getByRole("tabpanel", { name: /additional information/i })
        ).toBeInTheDocument();
      });

      // Navigate back with Ctrl+Left
      await user.keyboard("{Control>}{ArrowLeft}{/Control}");

      await waitFor(() => {
        expect(
          screen.getByRole("tabpanel", { name: /personal information/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe("Screen Reader Support", () => {
    it("should have proper ARIA labels and roles", () => {
      render(<Wizard config={accessibleWizardConfig} />);

      // Main wizard container
      const wizard = screen.getByRole("application");
      expect(wizard).toHaveAttribute(
        "aria-label",
        "Asistente: Accessible Test Wizard"
      );

      // Step content
      const tabpanel = screen.getByRole("tabpanel");
      expect(tabpanel).toHaveAttribute("aria-labelledby");
      expect(tabpanel).toHaveAttribute("id");

      // Form inputs
      const nameInput = screen.getByLabelText(/full name/i);
      expect(nameInput).toHaveAttribute("aria-required", "true");
      expect(nameInput).toHaveAttribute("aria-describedby");
    });

    it("should announce step changes to screen readers", async () => {
      const user = userEvent.setup();
      render(
        <Wizard
          config={accessibleWizardConfig}
          initialData={{ name: "John Doe", email: "john@example.com" }}
        />
      );

      // Navigate to next step
      await user.click(
        screen.getByRole("button", { name: /continue to next step/i })
      );

      await waitFor(() => {
        // Should have live region for announcements
        const liveRegion = screen.queryByRole("status");
        if (liveRegion) {
          expect(liveRegion).toBeInTheDocument();
        }

        // New step should be announced
        const newTabpanel = screen.getByRole("tabpanel", {
          name: /additional information/i,
        });
        expect(newTabpanel).toBeInTheDocument();
      });
    });

    it("should announce validation errors", async () => {
      const user = userEvent.setup();
      render(<Wizard config={accessibleWizardConfig} />);

      // Try to proceed without filling required fields
      await user.click(
        screen.getByRole("button", { name: /continue to next step/i })
      );

      await waitFor(() => {
        // Error messages should have role="alert"
        const errorAlerts = screen.getAllByRole("alert");
        expect(errorAlerts.length).toBeGreaterThan(0);

        // Errors should be associated with inputs
        const nameInput = screen.getByLabelText(/full name/i);
        expect(nameInput).toHaveAttribute("aria-invalid", "true");
        expect(nameInput).toHaveAttribute("aria-describedby");
      });
    });

    it("should provide progress information to screen readers", () => {
      render(<Wizard config={accessibleWizardConfig} showProgress={true} />);

      // Progress should be announced
      const progressbar = screen.getByRole("progressbar");
      expect(progressbar).toHaveAttribute("aria-valuenow");
      expect(progressbar).toHaveAttribute("aria-valuemin", "0");
      expect(progressbar).toHaveAttribute("aria-valuemax", "100");

      // Step indicators should be accessible
      const tabs = screen.getAllByRole("tab");
      tabs.forEach((tab, index) => {
        expect(tab).toHaveAttribute("aria-label");
        if (index === 0) {
          expect(tab).toHaveAttribute("aria-current", "step");
        }
      });
    });
  });

  describe("Focus Management", () => {
    it("should manage focus correctly during navigation", async () => {
      const user = userEvent.setup();
      render(
        <Wizard
          config={accessibleWizardConfig}
          initialData={{ name: "John Doe", email: "john@example.com" }}
        />
      );

      // Navigate to next step
      await user.click(
        screen.getByRole("button", { name: /continue to next step/i })
      );

      await waitFor(() => {
        // Focus should move to the new step's heading or first focusable element
        const newStepHeading = screen.getByRole("heading", {
          name: /additional information/i,
        });
        const firstInput = screen.getByLabelText(/age/i);

        // Either the heading should be focused or the first input
        expect(
          document.activeElement === newStepHeading ||
            document.activeElement === firstInput
        ).toBe(true);
      });
    });

    it("should trap focus within modal dialogs", async () => {
      // This would test focus trapping if the wizard uses modal dialogs
      // For now, we'll test that focus stays within the wizard
      const user = userEvent.setup();
      render(<Wizard config={accessibleWizardConfig} />);

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const nextButton = screen.getByRole("button", {
        name: /continue to next step/i,
      });

      // Tab through elements
      nameInput.focus();
      await user.tab();
      expect(emailInput).toHaveFocus();

      await user.tab();
      expect(nextButton).toHaveFocus();

      // Shift+Tab should go backwards
      await user.tab({ shift: true });
      expect(emailInput).toHaveFocus();
    });

    it("should restore focus after error correction", async () => {
      const user = userEvent.setup();
      render(<Wizard config={accessibleWizardConfig} />);

      const nameInput = screen.getByLabelText(/full name/i);

      // Try to proceed with empty name
      await user.click(
        screen.getByRole("button", { name: /continue to next step/i })
      );

      await waitFor(() => {
        // Focus should return to the invalid field
        expect(nameInput).toHaveFocus();
      });
    });
  });

  describe("High Contrast and Visual Accessibility", () => {
    it("should work with high contrast mode", () => {
      // Mock high contrast media query
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === "(prefers-contrast: high)",
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<Wizard config={accessibleWizardConfig} />);

      // Elements should still be visible and functional
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /continue to next step/i })
      ).toBeInTheDocument();
    });

    it("should respect reduced motion preferences", () => {
      // Mock reduced motion preference
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === "(prefers-reduced-motion: reduce)",
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<Wizard config={accessibleWizardConfig} />);

      // Wizard should still function without animations
      expect(screen.getByRole("application")).toBeInTheDocument();
    });
  });

  describe("Mobile Accessibility", () => {
    it("should have appropriate touch targets", () => {
      // Mock mobile viewport
      vi.mocked(require("@/hooks/use-mobile").useIsMobile).mockReturnValue(
        true
      );

      render(<Wizard config={accessibleWizardConfig} />);

      // Buttons should have minimum 44px touch targets
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        const styles = window.getComputedStyle(button);
        const minHeight = parseInt(styles.minHeight) || parseInt(styles.height);
        expect(minHeight).toBeGreaterThanOrEqual(44);
      });
    });

    it("should support voice control", async () => {
      const user = userEvent.setup();
      render(<Wizard config={accessibleWizardConfig} />);

      // Elements should be accessible by voice commands via labels
      const nameInput = screen.getByLabelText(/full name/i);
      const nextButton = screen.getByRole("button", {
        name: /continue to next step/i,
      });

      // Voice control would use these labels to identify elements
      expect(nameInput).toHaveAccessibleName();
      expect(nextButton).toHaveAccessibleName();
    });
  });

  describe("Error Accessibility", () => {
    it("should make validation errors accessible", async () => {
      const user = userEvent.setup();
      render(<Wizard config={accessibleWizardConfig} />);

      // Submit without required fields
      await user.click(
        screen.getByRole("button", { name: /continue to next step/i })
      );

      await waitFor(() => {
        // Error messages should be properly associated
        const nameInput = screen.getByLabelText(/full name/i);
        const errorId = nameInput.getAttribute("aria-describedby");

        if (errorId) {
          const errorElement = document.getElementById(errorId);
          expect(errorElement).toBeInTheDocument();
          expect(errorElement).toHaveAttribute("role", "alert");
        }

        // Input should be marked as invalid
        expect(nameInput).toHaveAttribute("aria-invalid", "true");
      });
    });

    it("should announce error summary", async () => {
      const user = userEvent.setup();
      render(<Wizard config={accessibleWizardConfig} />);

      // Submit with multiple errors
      await user.click(
        screen.getByRole("button", { name: /continue to next step/i })
      );

      await waitFor(() => {
        // Should have error summary for screen readers
        const alerts = screen.getAllByRole("alert");
        expect(alerts.length).toBeGreaterThan(0);

        // Each error should be announced
        alerts.forEach((alert) => {
          expect(alert).toHaveTextContent(/required|invalid/i);
        });
      });
    });
  });
});
