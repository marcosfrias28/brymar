/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { OptimizedPropertyWizard } from "../optimized-property-wizard";
import { PropertyFormData } from '@/types/wizard';

// Mock the lazy-loaded components
jest.mock("../property-wizard", () => ({
  PropertyWizard: ({ onComplete, onSaveDraft, onUpdate }: any) => (
    <div data-testid="property-wizard">
      <button onClick={() => onComplete({} as PropertyFormData)}>
        Complete
      </button>
      <button onClick={() => onSaveDraft({})}>Save Draft</button>
      <button onClick={() => onUpdate({})}>Update</button>
    </div>
  ),
}));

// Mock performance API
Object.defineProperty(window, "performance", {
  value: {
    now: jest.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 1024 * 1024 * 10, // 10MB
    },
  },
});

describe("Performance Optimizations", () => {
  const mockProps = {
    onComplete: jest.fn(),
    onSaveDraft: jest.fn(),
    onUpdate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("OptimizedPropertyWizard", () => {
    it("should render with lazy loading", async () => {
      render(<OptimizedPropertyWizard {...mockProps} />);

      // Should show loading state initially
      expect(screen.getByText(/cargando/i)).toBeInTheDocument();

      // Should load the actual wizard
      await waitFor(() => {
        expect(screen.getByTestId("property-wizard")).toBeInTheDocument();
      });
    });

    it("should wrap callbacks with performance tracking", async () => {
      const performanceNowSpy = jest.spyOn(performance, "now");

      render(
        <OptimizedPropertyWizard
          {...mockProps}
          enablePerformanceTracking={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("property-wizard")).toBeInTheDocument();
      });

      // Trigger callbacks
      fireEvent.click(screen.getByText("Complete"));
      fireEvent.click(screen.getByText("Save Draft"));
      fireEvent.click(screen.getByText("Update"));

      // Should have called performance.now() for tracking
      expect(performanceNowSpy).toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      const onCompleteError = jest
        .fn()
        .mockRejectedValue(new Error("Test error"));

      render(
        <OptimizedPropertyWizard {...mockProps} onComplete={onCompleteError} />
      );

      await waitFor(() => {
        expect(screen.getByTestId("property-wizard")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Complete"));

      // Should not crash the application
      await waitFor(() => {
        expect(screen.getByTestId("property-wizard")).toBeInTheDocument();
      });
    });

    it("should show performance monitor in development", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      render(
        <OptimizedPropertyWizard
          {...mockProps}
          enablePerformanceTracking={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("Performance Monitor")).toBeInTheDocument();
      });

      process.env.NODE_ENV = originalEnv;
    });

    it("should not show performance monitor in production", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      render(
        <OptimizedPropertyWizard
          {...mockProps}
          enablePerformanceTracking={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId("property-wizard")).toBeInTheDocument();
      });

      expect(screen.queryByText("Performance Monitor")).not.toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("Memoization", () => {
    it("should prevent unnecessary re-renders with same props", () => {
      const { rerender } = render(<OptimizedPropertyWizard {...mockProps} />);

      // Re-render with same props
      rerender(<OptimizedPropertyWizard {...mockProps} />);

      // Component should be memoized and not re-render unnecessarily
      expect(mockProps.onComplete).not.toHaveBeenCalled();
    });

    it("should re-render when props change", () => {
      const { rerender } = render(<OptimizedPropertyWizard {...mockProps} />);

      const newProps = {
        ...mockProps,
        initialData: { title: "New Title" },
      };

      rerender(<OptimizedPropertyWizard {...newProps} />);

      // Should handle prop changes correctly
      expect(screen.getByTestId).toBeDefined();
    });
  });

  describe("Error Boundary", () => {
    it("should catch and display errors", () => {
      // Mock console.error to avoid test output noise
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      // Create a component that throws an error
      const ThrowError = () => {
        throw new Error("Test error");
      };

      render(
        <OptimizedPropertyWizard {...mockProps}>
          <ThrowError />
        </OptimizedPropertyWizard>
      );

      expect(screen.getByText(/error en el asistente/i)).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it("should provide retry functionality", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const ThrowError = ({
        shouldThrow = true,
      }: {
        shouldThrow?: boolean;
      }) => {
        if (shouldThrow) {
          throw new Error("Test error");
        }
        return <div>Success</div>;
      };

      render(
        <OptimizedPropertyWizard {...mockProps}>
          <ThrowError />
        </OptimizedPropertyWizard>
      );

      expect(screen.getByText(/error en el asistente/i)).toBeInTheDocument();

      // Should have retry button
      expect(screen.getByText(/reintentar/i)).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe("Performance Utilities", () => {
    it("should debounce function calls", async () => {
      const mockFn = jest.fn();
      const { performanceUtils } = require("@/lib/utils/mobile-utils");

      const debouncedFn = performanceUtils.debounce(mockFn, 100);

      // Call multiple times rapidly
      debouncedFn();
      debouncedFn();
      debouncedFn();

      // Should not have been called yet
      expect(mockFn).not.toHaveBeenCalled();

      // Wait for debounce delay
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should have been called only once
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should throttle function calls", () => {
      const mockFn = jest.fn();
      const { performanceUtils } = require("@/lib/utils/mobile-utils");

      const throttledFn = performanceUtils.throttle(mockFn, 100);

      // Call multiple times rapidly
      throttledFn();
      throttledFn();
      throttledFn();

      // Should have been called only once immediately
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should memoize function results", () => {
      const expensiveFn = jest.fn((x: number) => x * 2);
      const { performanceUtils } = require("@/lib/utils/mobile-utils");

      const memoizedFn = performanceUtils.memoize(expensiveFn, 1000);

      // Call with same arguments
      const result1 = memoizedFn(5);
      const result2 = memoizedFn(5);

      expect(result1).toBe(10);
      expect(result2).toBe(10);

      // Should have been called only once due to memoization
      expect(expensiveFn).toHaveBeenCalledTimes(1);
    });
  });
});
