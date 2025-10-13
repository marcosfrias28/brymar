/**
 * Visual Regression Tests for Wizard UI Components
 * Tests visual consistency and responsive design across different viewports
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

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

vi.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

// Import components after mocking
import { Wizard } from '@/components/wizard/core/wizard';
import { WizardNavigation } from '@/components/wizard/core/wizard-navigation';
import { WizardProgress } from '@/components/wizard/core/wizard-progress';
import { PropertyWizard } from '@/components/wizard/property/property-wizard';
import { LandWizard } from '@/components/wizard/land/land-wizard';
import { BlogWizard } from '@/components/wizard/blog/blog-wizard';
import type { WizardConfig, WizardData } from '@/types/wizard-core';
import { z } from "zod";

// Visual test utilities
class VisualTestUtils {
  static setViewport(width: number, height: number): void {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: height,
    });

    // Trigger resize event
    window.dispatchEvent(new Event("resize"));
  }

  static mockMatchMedia(query: string, matches: boolean): void {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((q) => ({
        matches: q === query ? matches : false,
        media: q,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  }

  static async takeSnapshot(
    container: HTMLElement,
    name: string
  ): Promise<void> {
    // In a real implementation, this would capture a screenshot
    // For testing purposes, we'll validate the DOM structure
    expect(container).toMatchSnapshot(name);
  }

  static validateLayout(element: HTMLElement): {
    isVisible: boolean;
    hasOverflow: boolean;
    isAccessible: boolean;
    hasProperSpacing: boolean;
  } {
    const styles = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    return {
      isVisible:
        rect.width > 0 && rect.height > 0 && styles.visibility !== "hidden",
      hasOverflow:
        element.scrollWidth > element.clientWidth ||
        element.scrollHeight > element.clientHeight,
      isAccessible: element.getAttribute("aria-hidden") !== "true",
      hasProperSpacing:
        parseInt(styles.padding) >= 8 && parseInt(styles.margin) >= 0,
    };
  }
}

// Test data
interface TestWizardData extends WizardData {
  name: string;
  email: string;
  description: string;
}

const createVisualTestConfig = (): WizardConfig<TestWizardData> => ({
  id: "visual-test-wizard",
  type: "test",
  title: "Visual Test Wizard",
  description: "A wizard for visual regression testing",
  steps: [
    {
      id: "step-1",
      title: "Basic Information",
      description: "Enter your basic details",
      component: ({ data, onUpdate, onNext, errors }: any) => (
        <div className="step-content">
          <h2>Basic Information</h2>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={data.name || ""}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className={errors.name ? "error" : ""}
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={data.email || ""}
              onChange={(e) => onUpdate({ email: e.target.value })}
              className={errors.email ? "error" : ""}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>
          <button onClick={onNext} className="next-button">
            Next Step
          </button>
        </div>
      ),
      validation: z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email"),
      }),
    },
    {
      id: "step-2",
      title: "Description",
      description: "Add a description",
      component: ({ data, onUpdate, onNext, onPrevious, errors }: any) => (
        <div className="step-content">
          <h2>Description</h2>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={data.description || ""}
              onChange={(e) => onUpdate({ description: e.target.value })}
              className={errors.description ? "error" : ""}
              rows={4}
            />
            {errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
          </div>
          <div className="button-group">
            <button onClick={onPrevious} className="prev-button">
              Previous
            </button>
            <button onClick={onNext} className="next-button">
              Complete
            </button>
          </div>
        </div>
      ),
      validation: z.object({
        description: z
          .string()
          .min(10, "Description must be at least 10 characters"),
      }),
    },
  ],
  validation: {
    stepSchemas: {
      "step-1": z.object({
        name: z.string().min(1),
        email: z.string().email(),
      }),
      "step-2": z.object({
        description: z.string().min(10),
      }),
    },
    finalSchema: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      description: z.string().min(10),
      status: z.enum(["draft", "published"]),
    }),
  },
});

describe("Wizard Visual Regression Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset viewport to default
    VisualTestUtils.setViewport(1024, 768);
  });

  afterEach(() => {
    // Clean up any viewport changes
    VisualTestUtils.setViewport(1024, 768);
  });

  describe("Desktop Layout", () => {
    it("should render wizard correctly on desktop", async () => {
      VisualTestUtils.setViewport(1920, 1080);

      const { container } = render(
        <Wizard config={createVisualTestConfig()} />
      );

      await waitFor(() => {
        expect(screen.getByText("Basic Information")).toBeInTheDocument();
      });

      // Validate layout
      const wizardContainer = container.querySelector(".wizard-container");
      expect(wizardContainer).toBeInTheDocument();

      const layout = VisualTestUtils.validateLayout(
        wizardContainer as HTMLElement
      );
      expect(layout.isVisible).toBe(true);
      expect(layout.isAccessible).toBe(true);

      // Take visual snapshot
      await VisualTestUtils.takeSnapshot(container, "wizard-desktop-initial");
    });

    it("should render progress indicator correctly on desktop", () => {
      VisualTestUtils.setViewport(1920, 1080);

      const { container } = render(
        <Wizard config={createVisualTestConfig()} showProgress={true} />
      );

      const progressContainer = container.querySelector(
        ".wizard-progress-container"
      );
      expect(progressContainer).toBeInTheDocument();

      const layout = VisualTestUtils.validateLayout(
        progressContainer as HTMLElement
      );
      expect(layout.isVisible).toBe(true);
      expect(layout.hasProperSpacing).toBe(true);
    });

    it("should render navigation correctly on desktop", () => {
      VisualTestUtils.setViewport(1920, 1080);

      const { container } = render(
        <Wizard config={createVisualTestConfig()} />
      );

      const navigationContainer = container.querySelector(
        ".wizard-navigation-container"
      );
      expect(navigationContainer).toBeInTheDocument();

      const layout = VisualTestUtils.validateLayout(
        navigationContainer as HTMLElement
      );
      expect(layout.isVisible).toBe(true);
      expect(layout.hasProperSpacing).toBe(true);
    });
  });

  describe("Tablet Layout", () => {
    it("should render wizard correctly on tablet", async () => {
      VisualTestUtils.setViewport(768, 1024);

      const { container } = render(
        <Wizard config={createVisualTestConfig()} />
      );

      await waitFor(() => {
        expect(screen.getByText("Basic Information")).toBeInTheDocument();
      });

      const wizardContainer = container.querySelector(".wizard-container");
      const layout = VisualTestUtils.validateLayout(
        wizardContainer as HTMLElement
      );
      expect(layout.isVisible).toBe(true);
      expect(layout.hasOverflow).toBe(false);

      await VisualTestUtils.takeSnapshot(container, "wizard-tablet-initial");
    });

    it("should adapt progress indicator for tablet", () => {
      VisualTestUtils.setViewport(768, 1024);

      const { container } = render(
        <Wizard config={createVisualTestConfig()} showProgress={true} />
      );

      const progressContainer = container.querySelector(
        ".wizard-progress-container"
      );
      expect(progressContainer).toBeInTheDocument();

      // Progress should be visible and not overflow
      const layout = VisualTestUtils.validateLayout(
        progressContainer as HTMLElement
      );
      expect(layout.isVisible).toBe(true);
      expect(layout.hasOverflow).toBe(false);
    });
  });

  describe("Mobile Layout", () => {
    beforeEach(() => {
      // Mock mobile hook
      vi.mocked(require("@/hooks/use-mobile").useIsMobile).mockReturnValue(
        true
      );
    });

    it("should render wizard correctly on mobile", async () => {
      VisualTestUtils.setViewport(375, 667); // iPhone SE

      const { container } = render(
        <Wizard config={createVisualTestConfig()} />
      );

      await waitFor(() => {
        expect(screen.getByText("Basic Information")).toBeInTheDocument();
      });

      const wizardContainer = container.querySelector(".wizard-container");
      expect(wizardContainer).toHaveClass("mobile-optimized");

      const layout = VisualTestUtils.validateLayout(
        wizardContainer as HTMLElement
      );
      expect(layout.isVisible).toBe(true);
      expect(layout.hasOverflow).toBe(false);

      await VisualTestUtils.takeSnapshot(container, "wizard-mobile-initial");
    });

    it("should render mobile-optimized progress", () => {
      VisualTestUtils.setViewport(375, 667);

      const { container } = render(
        <Wizard config={createVisualTestConfig()} showProgress={true} />
      );

      // Mobile progress should be compact
      const progressContainer = container.querySelector(
        ".wizard-progress-container"
      );
      expect(progressContainer).toBeInTheDocument();

      const layout = VisualTestUtils.validateLayout(
        progressContainer as HTMLElement
      );
      expect(layout.isVisible).toBe(true);
      expect(layout.hasOverflow).toBe(false);
    });

    it("should render mobile-optimized navigation", () => {
      VisualTestUtils.setViewport(375, 667);

      const { container } = render(
        <Wizard config={createVisualTestConfig()} />
      );

      const navigationContainer = container.querySelector(
        ".wizard-navigation-container"
      );
      expect(navigationContainer).toBeInTheDocument();

      // Navigation should be sticky on mobile
      const styles = window.getComputedStyle(navigationContainer as Element);
      expect(styles.position).toBe("sticky");

      const layout = VisualTestUtils.validateLayout(
        navigationContainer as HTMLElement
      );
      expect(layout.isVisible).toBe(true);
    });

    it("should handle very small screens", async () => {
      VisualTestUtils.setViewport(320, 568); // iPhone 5

      const { container } = render(
        <Wizard config={createVisualTestConfig()} />
      );

      await waitFor(() => {
        expect(screen.getByText("Basic Information")).toBeInTheDocument();
      });

      const wizardContainer = container.querySelector(".wizard-container");
      const layout = VisualTestUtils.validateLayout(
        wizardContainer as HTMLElement
      );
      expect(layout.isVisible).toBe(true);
      expect(layout.hasOverflow).toBe(false);
    });
  });

  describe("Step Transitions", () => {
    it("should maintain visual consistency during step transitions", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Wizard
          config={createVisualTestConfig()}
          initialData={{ name: "John", email: "john@example.com" }}
        />
      );

      // Initial state
      await VisualTestUtils.takeSnapshot(container, "wizard-step-1");

      // Navigate to next step
      await user.click(screen.getByRole("button", { name: /next step/i }));

      await waitFor(() => {
        expect(screen.getByText("Description")).toBeInTheDocument();
      });

      // Second step state
      await VisualTestUtils.takeSnapshot(container, "wizard-step-2");

      // Verify layout consistency
      const wizardContainer = container.querySelector(".wizard-container");
      const layout = VisualTestUtils.validateLayout(
        wizardContainer as HTMLElement
      );
      expect(layout.isVisible).toBe(true);
      expect(layout.hasProperSpacing).toBe(true);
    });

    it("should handle loading states visually", async () => {
      const { container } = render(
        <Wizard config={createVisualTestConfig()} />
      );

      // Simulate loading state
      const loadingElement = container.querySelector('[data-loading="true"]');
      if (loadingElement) {
        const layout = VisualTestUtils.validateLayout(
          loadingElement as HTMLElement
        );
        expect(layout.isVisible).toBe(true);
      }
    });
  });

  describe("Error States", () => {
    it("should display validation errors consistently", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Wizard config={createVisualTestConfig()} />
      );

      // Try to proceed without filling required fields
      await user.click(screen.getByRole("button", { name: /next step/i }));

      await waitFor(() => {
        expect(screen.getByText("Name is required")).toBeInTheDocument();
        expect(screen.getByText("Invalid email")).toBeInTheDocument();
      });

      // Verify error styling
      const errorMessages = container.querySelectorAll(".error-message");
      errorMessages.forEach((error) => {
        const layout = VisualTestUtils.validateLayout(error as HTMLElement);
        expect(layout.isVisible).toBe(true);
      });

      const errorInputs = container.querySelectorAll("input.error");
      expect(errorInputs.length).toBeGreaterThan(0);

      await VisualTestUtils.takeSnapshot(container, "wizard-validation-errors");
    });

    it("should handle network error states", async () => {
      const { container } = render(
        <Wizard
          config={createVisualTestConfig()}
          onSaveDraft={() => Promise.reject(new Error("Network error"))}
        />
      );

      // Simulate network error
      const errorContainer = container.querySelector(".wizard-error-container");
      if (errorContainer) {
        const layout = VisualTestUtils.validateLayout(
          errorContainer as HTMLElement
        );
        expect(layout.isVisible).toBe(true);
      }
    });
  });

  describe("Theme Variations", () => {
    it("should render correctly in dark mode", () => {
      VisualTestUtils.mockMatchMedia("(prefers-color-scheme: dark)", true);

      const { container } = render(
        <Wizard config={createVisualTestConfig()} />
      );

      const wizardContainer = container.querySelector(".wizard-container");
      const layout = VisualTestUtils.validateLayout(
        wizardContainer as HTMLElement
      );
      expect(layout.isVisible).toBe(true);
    });

    it("should render correctly in high contrast mode", () => {
      VisualTestUtils.mockMatchMedia("(prefers-contrast: high)", true);

      const { container } = render(
        <Wizard config={createVisualTestConfig()} />
      );

      const wizardContainer = container.querySelector(".wizard-container");
      const layout = VisualTestUtils.validateLayout(
        wizardContainer as HTMLElement
      );
      expect(layout.isVisible).toBe(true);
    });

    it("should respect reduced motion preferences", () => {
      VisualTestUtils.mockMatchMedia("(prefers-reduced-motion: reduce)", true);

      const { container } = render(
        <Wizard config={createVisualTestConfig()} />
      );

      // Animations should be disabled
      const animatedElements = container.querySelectorAll(
        '[data-animate="true"]'
      );
      animatedElements.forEach((element) => {
        const styles = window.getComputedStyle(element);
        expect(styles.animationDuration).toBe("0s");
      });
    });
  });

  describe("Specific Wizard Types", () => {
    it("should render PropertyWizard consistently", async () => {
      const { container } = render(<PropertyWizard />);

      await waitFor(() => {
        expect(screen.getByText("Información General")).toBeInTheDocument();
      });

      const wizardContainer = container.querySelector(".wizard-container");
      const layout = VisualTestUtils.validateLayout(
        wizardContainer as HTMLElement
      );
      expect(layout.isVisible).toBe(true);

      await VisualTestUtils.takeSnapshot(container, "property-wizard-initial");
    });

    it("should render LandWizard consistently", async () => {
      const { container } = render(<LandWizard />);

      await waitFor(() => {
        expect(screen.getByText("Información General")).toBeInTheDocument();
      });

      const wizardContainer = container.querySelector(".wizard-container");
      const layout = VisualTestUtils.validateLayout(
        wizardContainer as HTMLElement
      );
      expect(layout.isVisible).toBe(true);

      await VisualTestUtils.takeSnapshot(container, "land-wizard-initial");
    });

    it("should render BlogWizard consistently", async () => {
      const { container } = render(<BlogWizard />);

      await waitFor(() => {
        expect(screen.getByText("Contenido")).toBeInTheDocument();
      });

      const wizardContainer = container.querySelector(".wizard-container");
      const layout = VisualTestUtils.validateLayout(
        wizardContainer as HTMLElement
      );
      expect(layout.isVisible).toBe(true);

      await VisualTestUtils.takeSnapshot(container, "blog-wizard-initial");
    });
  });

  describe("Component Isolation", () => {
    it("should render WizardNavigation in isolation", () => {
      const { container } = render(
        <WizardNavigation
          canGoNext={true}
          canGoPrevious={true}
          canComplete={false}
          isFirstStep={false}
          isLastStep={false}
          onNext={vi.fn()}
          onPrevious={vi.fn()}
          onComplete={vi.fn()}
          onSaveDraft={vi.fn()}
          isLoading={false}
          isSaving={false}
          isMobile={false}
        />
      );

      const navigation = container.querySelector('[role="navigation"]');
      expect(navigation).toBeInTheDocument();

      const layout = VisualTestUtils.validateLayout(navigation as HTMLElement);
      expect(layout.isVisible).toBe(true);
      expect(layout.hasProperSpacing).toBe(true);
    });

    it("should render WizardProgress in isolation", () => {
      const mockSteps = [
        { id: "step1", title: "Step 1", component: () => null },
        { id: "step2", title: "Step 2", component: () => null },
        { id: "step3", title: "Step 3", component: () => null },
      ];

      const { container } = render(
        <WizardProgress
          steps={mockSteps}
          currentStep={1}
          showStepNumbers={true}
          isMobile={false}
        />
      );

      const progress = container.querySelector('[role="progressbar"]');
      expect(progress).toBeInTheDocument();

      const layout = VisualTestUtils.validateLayout(progress as HTMLElement);
      expect(layout.isVisible).toBe(true);
    });
  });

  describe("Cross-Browser Compatibility", () => {
    it("should render consistently across different user agents", () => {
      // Mock different user agents
      const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
      ];

      userAgents.forEach((userAgent) => {
        Object.defineProperty(navigator, "userAgent", {
          value: userAgent,
          configurable: true,
        });

        const { container } = render(
          <Wizard config={createVisualTestConfig()} />
        );

        const wizardContainer = container.querySelector(".wizard-container");
        const layout = VisualTestUtils.validateLayout(
          wizardContainer as HTMLElement
        );
        expect(layout.isVisible).toBe(true);
      });
    });
  });
});
