/**
 * Performance Tests for Wizard Framework
 * Tests rendering performance, memory usage, and optimization goals
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
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock performance APIs
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(() => []),
  getEntriesByName: vi.fn(() => []),
};

Object.defineProperty(global, "performance", {
  value: mockPerformance,
  writable: true,
});

// Mock React DevTools Profiler
const mockProfiler = {
  onRender: vi.fn(),
};

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
import { Wizard } from '@/components/wizard/core/wizard';
import { PropertyWizard } from '@/components/wizard/property/property-wizard';
import { useWizard } from '@/hooks/wizard/use-wizard';
import { WizardPersistence } from '@/lib/wizard/wizard-persistence';
import type { WizardConfig, WizardData } from '@/types/wizard-core';
import { z } from "zod";

// Performance measurement utilities
class PerformanceMeasurer {
  private measurements: Map<string, number[]> = new Map();

  start(label: string): void {
    performance.mark(`${label}-start`);
  }

  end(label: string): number {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);

    const entries = performance.getEntriesByName(label);
    const duration = entries[entries.length - 1]?.duration || 0;

    if (!this.measurements.has(label)) {
      this.measurements.set(label, []);
    }
    this.measurements.get(label)!.push(duration);

    return duration;
  }

  getAverage(label: string): number {
    const measurements = this.measurements.get(label) || [];
    return (
      measurements.reduce((sum, val) => sum + val, 0) / measurements.length
    );
  }

  getMedian(label: string): number {
    const measurements = [...(this.measurements.get(label) || [])].sort(
      (a, b) => a - b
    );
    const mid = Math.floor(measurements.length / 2);
    return measurements.length % 2 === 0
      ? (measurements[mid - 1] + measurements[mid]) / 2
      : measurements[mid];
  }

  getP95(label: string): number {
    const measurements = [...(this.measurements.get(label) || [])].sort(
      (a, b) => a - b
    );
    const index = Math.ceil(measurements.length * 0.95) - 1;
    return measurements[index] || 0;
  }

  clear(): void {
    this.measurements.clear();
  }
}

// Memory usage tracker
class MemoryTracker {
  private initialMemory: number = 0;
  private measurements: { label: string; memory: number; timestamp: number }[] =
    [];

  start(): void {
    if (typeof window !== "undefined" && (window as any).performance?.memory) {
      this.initialMemory = (window as any).performance.memory.usedJSHeapSize;
    }
  }

  measure(label: string): void {
    if (typeof window !== "undefined" && (window as any).performance?.memory) {
      const currentMemory = (window as any).performance.memory.usedJSHeapSize;
      this.measurements.push({
        label,
        memory: currentMemory - this.initialMemory,
        timestamp: Date.now(),
      });
    }
  }

  getMemoryUsage(label: string): number {
    const measurement = this.measurements.find((m) => m.label === label);
    return measurement ? measurement.memory : 0;
  }

  getMemoryGrowth(): number {
    if (this.measurements.length < 2) return 0;
    const first = this.measurements[0];
    const last = this.measurements[this.measurements.length - 1];
    return last.memory - first.memory;
  }

  clear(): void {
    this.measurements = [];
    this.initialMemory = 0;
  }
}

// Test data and configuration
interface TestWizardData extends WizardData {
  name: string;
  email: string;
  preferences: string[];
}

const createLargeWizardConfig = (
  stepCount: number
): WizardConfig<TestWizardData> => ({
  id: "performance-test-wizard",
  type: "test",
  title: "Performance Test Wizard",
  description: "A wizard with many steps for performance testing",
  steps: Array.from({ length: stepCount }, (_, i) => ({
    id: `step-${i}`,
    title: `Step ${i + 1}`,
    description: `Description for step ${i + 1}`,
    component: ({ data, onUpdate, onNext, onPrevious }: any) => (
      <div data-testid={`step-${i}`}>
        <input
          data-testid={`input-${i}`}
          value={data[`field-${i}`] || ""}
          onChange={(e) => onUpdate({ [`field-${i}`]: e.target.value })}
          placeholder={`Field ${i}`}
        />
        {i > 0 && (
          <button data-testid={`prev-${i}`} onClick={onPrevious}>
            Previous
          </button>
        )}
        {i < stepCount - 1 && (
          <button data-testid={`next-${i}`} onClick={onNext}>
            Next
          </button>
        )}
      </div>
    ),
    validation: z.object({
      [`field-${i}`]: z.string().optional(),
    }),
  })),
  validation: {
    stepSchemas: Object.fromEntries(
      Array.from({ length: stepCount }, (_, i) => [
        `step-${i}`,
        z.object({ [`field-${i}`]: z.string().optional() }),
      ])
    ),
    finalSchema: z.object({
      status: z.enum(["draft", "published"]),
    }),
  },
});

describe("Wizard Performance Tests", () => {
  let performanceMeasurer: PerformanceMeasurer;
  let memoryTracker: MemoryTracker;

  beforeEach(() => {
    performanceMeasurer = new PerformanceMeasurer();
    memoryTracker = new MemoryTracker();
    vi.clearAllMocks();
  });

  afterEach(() => {
    performanceMeasurer.clear();
    memoryTracker.clear();
  });

  describe("Initial Rendering Performance", () => {
    it("should render wizard within 200ms performance budget", async () => {
      const config = createLargeWizardConfig(5);

      performanceMeasurer.start("wizard-initial-render");

      render(<Wizard config={config} />);

      await waitFor(() => {
        expect(screen.getByTestId("step-0")).toBeInTheDocument();
      });

      const renderTime = performanceMeasurer.end("wizard-initial-render");

      // Performance budget: 200ms for initial render
      expect(renderTime).toBeLessThan(200);
    });

    it("should handle large wizard configurations efficiently", async () => {
      const config = createLargeWizardConfig(20); // Large wizard with 20 steps

      performanceMeasurer.start("large-wizard-render");
      memoryTracker.start();

      render(<Wizard config={config} />);

      await waitFor(() => {
        expect(screen.getByTestId("step-0")).toBeInTheDocument();
      });

      const renderTime = performanceMeasurer.end("large-wizard-render");
      memoryTracker.measure("large-wizard-rendered");

      // Should still render within reasonable time even with many steps
      expect(renderTime).toBeLessThan(500);

      // Memory usage should be reasonable (less than 10MB for 20 steps)
      const memoryUsage = memoryTracker.getMemoryUsage("large-wizard-rendered");
      expect(memoryUsage).toBeLessThan(10 * 1024 * 1024); // 10MB
    });

    it("should lazy load step components", async () => {
      const config = createLargeWizardConfig(10);

      render(<Wizard config={config} />);

      // Only first step should be rendered initially
      expect(screen.getByTestId("step-0")).toBeInTheDocument();
      expect(screen.queryByTestId("step-1")).not.toBeInTheDocument();
      expect(screen.queryByTestId("step-9")).not.toBeInTheDocument();
    });
  });

  describe("Navigation Performance", () => {
    it("should navigate between steps within 100ms", async () => {
      const user = userEvent.setup();
      const config = createLargeWizardConfig(5);

      render(<Wizard config={config} />);

      // Measure navigation performance
      const navigationTimes: number[] = [];

      for (let i = 0; i < 4; i++) {
        performanceMeasurer.start(`navigation-${i}`);

        await user.click(screen.getByTestId(`next-${i}`));

        await waitFor(() => {
          expect(screen.getByTestId(`step-${i + 1}`)).toBeInTheDocument();
        });

        const navTime = performanceMeasurer.end(`navigation-${i}`);
        navigationTimes.push(navTime);
      }

      // All navigation should be under 100ms
      navigationTimes.forEach((time, index) => {
        expect(time).toBeLessThan(100);
      });

      // Average navigation time should be under 50ms
      const avgTime =
        navigationTimes.reduce((sum, time) => sum + time, 0) /
        navigationTimes.length;
      expect(avgTime).toBeLessThan(50);
    });

    it("should handle rapid navigation without performance degradation", async () => {
      const user = userEvent.setup();
      const config = createLargeWizardConfig(10);

      render(<Wizard config={config} />);

      memoryTracker.start();

      // Rapidly navigate through all steps
      for (let i = 0; i < 9; i++) {
        await user.click(screen.getByTestId(`next-${i}`));
        await waitFor(() => {
          expect(screen.getByTestId(`step-${i + 1}`)).toBeInTheDocument();
        });
      }

      memoryTracker.measure("rapid-navigation-complete");

      // Memory growth should be minimal during navigation
      const memoryGrowth = memoryTracker.getMemoryGrowth();
      expect(memoryGrowth).toBeLessThan(5 * 1024 * 1024); // Less than 5MB growth
    });
  });

  describe("Data Update Performance", () => {
    it("should handle frequent data updates efficiently", async () => {
      const user = userEvent.setup();
      const config = createLargeWizardConfig(3);

      render(<Wizard config={config} />);

      const input = screen.getByTestId("input-0");

      performanceMeasurer.start("data-updates");

      // Simulate rapid typing
      const testString = "This is a test string for performance measurement";
      for (const char of testString) {
        await user.type(input, char);
      }

      const updateTime = performanceMeasurer.end("data-updates");

      // Should handle all updates within reasonable time
      expect(updateTime).toBeLessThan(1000); // 1 second for all updates

      // Verify final value
      expect(input).toHaveValue(testString);
    });

    it("should debounce auto-save operations", async () => {
      const user = userEvent.setup();
      const autoSaveSpy = vi
        .spyOn(WizardPersistence, "autoSaveDraft")
        .mockResolvedValue({
          success: true,
          data: { draftId: "test-draft" },
        });

      const config = {
        ...createLargeWizardConfig(3),
        persistence: {
          autoSave: true,
          autoSaveInterval: 100, // Very short interval for testing
        },
      };

      render(<Wizard config={config} />);

      const input = screen.getByTestId("input-0");

      // Rapid typing should debounce auto-save
      await user.type(input, "rapid");

      // Wait for debounce
      await waitFor(
        () => {
          expect(autoSaveSpy).toHaveBeenCalledTimes(1);
        },
        { timeout: 500 }
      );
    });
  });

  describe("Memory Management", () => {
    it("should clean up resources on unmount", async () => {
      const config = createLargeWizardConfig(5);

      memoryTracker.start();

      const { unmount } = render(<Wizard config={config} />);

      memoryTracker.measure("wizard-mounted");

      // Unmount component
      unmount();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      memoryTracker.measure("wizard-unmounted");

      // Memory should not grow significantly after unmount
      const memoryGrowth = memoryTracker.getMemoryGrowth();
      expect(memoryGrowth).toBeLessThan(1024 * 1024); // Less than 1MB growth
    });

    it("should handle memory pressure gracefully", async () => {
      // Simulate memory pressure by creating many wizard instances
      const configs = Array.from({ length: 10 }, (_, i) =>
        createLargeWizardConfig(5)
      );

      memoryTracker.start();

      const wizards = configs.map((config, i) => (
        <div key={i}>
          <Wizard config={config} />
        </div>
      ));

      render(<div>{wizards}</div>);

      memoryTracker.measure("multiple-wizards");

      // Memory usage should scale linearly, not exponentially
      const memoryUsage = memoryTracker.getMemoryUsage("multiple-wizards");
      expect(memoryUsage).toBeLessThan(50 * 1024 * 1024); // Less than 50MB for 10 wizards
    });
  });

  describe("Validation Performance", () => {
    it("should validate large forms efficiently", async () => {
      const user = userEvent.setup();

      // Create wizard with complex validation
      const complexSchema = z.object({
        email: z.string().email(),
        phone: z.string().regex(/^\+?[\d\s-()]+$/),
        age: z.number().min(18).max(120),
        preferences: z.array(z.string()).min(1),
        terms: z.boolean().refine((val) => val === true),
      });

      const config: WizardConfig<any> = {
        id: "validation-test",
        type: "test",
        title: "Validation Test",
        steps: [
          {
            id: "complex-step",
            title: "Complex Validation",
            component: ({ data, onUpdate }: any) => (
              <div>
                <input
                  data-testid="email"
                  value={data.email || ""}
                  onChange={(e) => onUpdate({ email: e.target.value })}
                />
                <input
                  data-testid="phone"
                  value={data.phone || ""}
                  onChange={(e) => onUpdate({ phone: e.target.value })}
                />
                <input
                  data-testid="age"
                  type="number"
                  value={data.age || ""}
                  onChange={(e) => onUpdate({ age: parseInt(e.target.value) })}
                />
              </div>
            ),
            validation: complexSchema,
          },
        ],
        validation: {
          stepSchemas: { "complex-step": complexSchema },
          finalSchema: complexSchema,
        },
      };

      render(<Wizard config={config} />);

      performanceMeasurer.start("complex-validation");

      // Fill form with valid data
      await user.type(screen.getByTestId("email"), "test@example.com");
      await user.type(screen.getByTestId("phone"), "+1-555-123-4567");
      await user.type(screen.getByTestId("age"), "25");

      const validationTime = performanceMeasurer.end("complex-validation");

      // Complex validation should complete within 50ms
      expect(validationTime).toBeLessThan(50);
    });

    it("should handle validation errors efficiently", async () => {
      const user = userEvent.setup();
      const config = createLargeWizardConfig(1);

      render(<Wizard config={config} />);

      performanceMeasurer.start("validation-errors");

      // Trigger validation with invalid data
      const input = screen.getByTestId("input-0");
      await user.type(input, "invalid data that will cause validation errors");

      const errorTime = performanceMeasurer.end("validation-errors");

      // Error handling should be fast
      expect(errorTime).toBeLessThan(100);
    });
  });

  describe("Persistence Performance", () => {
    it("should save drafts within performance budget", async () => {
      const saveDraftSpy = vi
        .spyOn(WizardPersistence, "saveDraft")
        .mockImplementation(async () => {
          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 50));
          return { success: true, data: { draftId: "test-draft" } };
        });

      const user = userEvent.setup();
      const config = createLargeWizardConfig(3);

      render(<Wizard config={config} />);

      // Fill some data
      await user.type(screen.getByTestId("input-0"), "test data");

      performanceMeasurer.start("save-draft");

      // Trigger save
      await user.click(
        screen.getByRole("button", { name: /guardar borrador/i })
      );

      await waitFor(() => {
        expect(saveDraftSpy).toHaveBeenCalled();
      });

      const saveTime = performanceMeasurer.end("save-draft");

      // Save operation should complete within 200ms (including network simulation)
      expect(saveTime).toBeLessThan(200);
    });

    it("should load drafts efficiently", async () => {
      const loadDraftSpy = vi
        .spyOn(WizardPersistence, "loadDraft")
        .mockImplementation(async () => {
          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 30));
          return {
            success: true,
            data: {
              data: { "field-0": "loaded data" },
              currentStep: "step-0",
              stepProgress: {},
              completionPercentage: 25,
            },
          };
        });

      const config = createLargeWizardConfig(3);

      performanceMeasurer.start("load-draft");

      render(<Wizard config={config} draftId="test-draft" />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("loaded data")).toBeInTheDocument();
      });

      const loadTime = performanceMeasurer.end("load-draft");

      // Load operation should complete within 100ms (including network simulation)
      expect(loadTime).toBeLessThan(100);
    });
  });

  describe("Stress Testing", () => {
    it("should handle stress test with many rapid operations", async () => {
      const user = userEvent.setup();
      const config = createLargeWizardConfig(5);

      render(<Wizard config={config} />);

      memoryTracker.start();
      performanceMeasurer.start("stress-test");

      // Perform many rapid operations
      for (let i = 0; i < 100; i++) {
        const input = screen.getByTestId("input-0");
        await user.clear(input);
        await user.type(input, `stress test ${i}`);

        if (i % 10 === 0) {
          memoryTracker.measure(`stress-${i}`);
        }
      }

      const stressTime = performanceMeasurer.end("stress-test");

      // Should handle stress test within reasonable time
      expect(stressTime).toBeLessThan(5000); // 5 seconds for 100 operations

      // Memory should not grow excessively
      const memoryGrowth = memoryTracker.getMemoryGrowth();
      expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024); // Less than 10MB growth
    });

    it("should maintain performance with concurrent wizards", async () => {
      const configs = Array.from({ length: 5 }, () =>
        createLargeWizardConfig(3)
      );

      performanceMeasurer.start("concurrent-wizards");
      memoryTracker.start();

      // Render multiple wizards simultaneously
      const { container } = render(
        <div>
          {configs.map((config, i) => (
            <Wizard key={i} config={config} />
          ))}
        </div>
      );

      await waitFor(() => {
        const steps = container.querySelectorAll('[data-testid^="step-"]');
        expect(steps).toHaveLength(5); // One step per wizard
      });

      const renderTime = performanceMeasurer.end("concurrent-wizards");
      memoryTracker.measure("concurrent-complete");

      // Should render all wizards within reasonable time
      expect(renderTime).toBeLessThan(1000);

      // Memory usage should be reasonable for multiple wizards
      const memoryUsage = memoryTracker.getMemoryUsage("concurrent-complete");
      expect(memoryUsage).toBeLessThan(25 * 1024 * 1024); // Less than 25MB for 5 wizards
    });
  });
});
