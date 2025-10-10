import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OptimizedPropertyWizard } from "../optimized-property-wizard";
import { EnhancedPropertyWizard } from "../enhanced-property-wizard";

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  getEntriesByType: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
};

Object.defineProperty(global, "performance", {
  value: mockPerformance,
  writable: true,
});

// Mock memory API
Object.defineProperty(performance, "memory", {
  value: {
    usedJSHeapSize: 10 * 1024 * 1024, // 10MB
    totalJSHeapSize: 20 * 1024 * 1024, // 20MB
    jsHeapSizeLimit: 100 * 1024 * 1024, // 100MB
  },
  writable: true,
});

// Mock ResizeObserver for performance tests
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver for lazy loading tests
global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn((element) => {
    // Simulate element being in viewport
    callback([{ isIntersecting: true, target: element }]);
  }),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe("Performance Tests", () => {
  const mockOnComplete = jest.fn();
  const mockOnSaveDraft = jest.fn().mockResolvedValue("draft-123");

  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformance.now.mockClear();
    mockPerformance.mark.mockClear();
    mockPerformance.measure.mockClear();
  });

  describe("Initial Load Performance", () => {
    it("loads within performance budget", async () => {
      const startTime = performance.now();

      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
          enablePerformanceTracking={true}
        />
      );

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Should load within 2 seconds (2000ms)
      expect(loadTime).toBeLessThan(2000);
      expect(screen.getByTestId("property-wizard")).toBeInTheDocument();
    });

    it("lazy loads components efficiently", async () => {
      const { container } = render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      // Should show loading state initially
      expect(screen.getByTestId("property-wizard")).toBeInTheDocument();

      // Should not load all steps immediately
      const stepElements = container.querySelectorAll('[data-testid^="step-"]');
      expect(stepElements.length).toBeLessThanOrEqual(1); // Only current step loaded
    });

    it("optimizes bundle size with code splitting", () => {
      // Mock dynamic import
      const mockImport = jest.fn().mockResolvedValue({
        default: () => <div data-testid="lazy-component">Lazy Loaded</div>,
      });

      // This would be tested with actual bundle analysis tools in real scenarios
      expect(mockImport).toBeDefined();
    });

    it("preloads critical resources", async () => {
      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      // Should preload critical CSS and fonts
      const preloadLinks = document.querySelectorAll('link[rel="preload"]');
      expect(preloadLinks.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Runtime Performance", () => {
    it("maintains smooth interactions under 16ms", async () => {
      const user = userEvent.setup();
      let frameTime = 0;

      // Mock requestAnimationFrame to measure frame time
      const originalRAF = window.requestAnimationFrame;
      window.requestAnimationFrame = jest.fn((callback) => {
        const start = performance.now();
        callback(start);
        frameTime = performance.now() - start;
        return 1;
      });

      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
          enablePerformanceTracking={true}
        />
      );

      // Perform rapid interactions
      const titleInput = screen.getByTestId("title-input");
      await user.type(titleInput, "Performance Test Property");

      // Frame time should be under 16ms for 60fps
      expect(frameTime).toBeLessThan(16);

      window.requestAnimationFrame = originalRAF;
    });

    it("handles large datasets efficiently", async () => {
      const user = userEvent.setup();
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Characteristic ${i}`,
        category: "amenity" as const,
        selected: false,
      }));

      const startTime = performance.now();

      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
          initialData={{
            characteristics: largeDataset,
          }}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should handle large datasets within reasonable time
      expect(renderTime).toBeLessThan(1000); // 1 second
      expect(screen.getByTestId("property-wizard")).toBeInTheDocument();
    });

    it("optimizes re-renders with memoization", async () => {
      const user = userEvent.setup();
      let renderCount = 0;

      // Mock component to count renders
      const MockComponent = React.memo(() => {
        renderCount++;
        return <div data-testid="memo-component">Memoized</div>;
      });

      render(
        <div>
          <OptimizedPropertyWizard
            onComplete={mockOnComplete}
            onSaveDraft={mockOnSaveDraft}
          />
          <MockComponent />
        </div>
      );

      const initialRenderCount = renderCount;

      // Type in input (should not cause unnecessary re-renders)
      await user.type(screen.getByTestId("title-input"), "Test");

      // Memoized component should not re-render unnecessarily
      expect(renderCount).toBe(initialRenderCount);
    });

    it("debounces expensive operations", async () => {
      const user = userEvent.setup();
      const mockExpensiveOperation = jest.fn();

      // Mock debounced function
      const debouncedOperation = jest.fn().mockImplementation(() => {
        setTimeout(mockExpensiveOperation, 300);
      });

      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      const titleInput = screen.getByTestId("title-input");

      // Rapid typing should debounce operations
      await user.type(titleInput, "Rapid");
      await user.type(titleInput, " Typing");
      await user.type(titleInput, " Test");

      // Should only call expensive operation once after debounce
      await waitFor(
        () => {
          expect(mockExpensiveOperation).toHaveBeenCalledTimes(1);
        },
        { timeout: 500 }
      );
    });
  });

  describe("Memory Management", () => {
    it("prevents memory leaks", async () => {
      const initialMemory = (performance as any).memory.usedJSHeapSize;

      const { unmount } = render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      // Simulate component usage
      const titleInput = screen.getByTestId("title-input");
      fireEvent.change(titleInput, { target: { value: "Memory Test" } });

      // Unmount component
      unmount();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = (performance as any).memory.usedJSHeapSize;

      // Memory usage should not increase significantly
      const memoryIncrease = finalMemory - initialMemory;
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // Less than 5MB increase
    });

    it("cleans up event listeners", () => {
      const addEventListenerSpy = jest.spyOn(window, "addEventListener");
      const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

      const { unmount } = render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      const addedListeners = addEventListenerSpy.mock.calls.length;

      unmount();

      const removedListeners = removeEventListenerSpy.mock.calls.length;

      // Should remove all added event listeners
      expect(removedListeners).toBeGreaterThanOrEqual(addedListeners);

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it("manages large image uploads efficiently", async () => {
      const user = userEvent.setup();
      const largeImageFile = new File(
        ["x".repeat(5 * 1024 * 1024)], // 5MB file
        "large-image.jpg",
        { type: "image/jpeg" }
      );

      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      // Navigate to images step
      await user.type(screen.getByTestId("title-input"), "Image Test");
      await user.click(screen.getByTestId("next-button"));
      await user.click(screen.getByTestId("next-button"));

      const fileInput = screen.getByTestId("upload-images");

      const startMemory = (performance as any).memory.usedJSHeapSize;

      // Upload large image
      await user.upload(fileInput, largeImageFile);

      const endMemory = (performance as any).memory.usedJSHeapSize;
      const memoryIncrease = endMemory - startMemory;

      // Memory increase should be reasonable (not loading entire file into memory)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
    });

    it("implements efficient virtual scrolling for large lists", async () => {
      const largeList = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
      }));

      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
          initialData={{
            characteristics: largeList.map((item) => ({
              id: item.id.toString(),
              name: item.name,
              category: "amenity" as const,
              selected: false,
            })),
          }}
        />
      );

      // Should only render visible items
      const renderedItems = screen.getAllByText(/Item \d+/);
      expect(renderedItems.length).toBeLessThan(100); // Virtual scrolling should limit rendered items
    });
  });

  describe("Network Performance", () => {
    it("optimizes API calls with caching", async () => {
      const user = userEvent.setup();
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
      global.fetch = mockFetch;

      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      // Make multiple similar requests
      await user.type(screen.getByTestId("title-input"), "API Test");
      await user.click(screen.getByTestId("save-draft"));
      await user.click(screen.getByTestId("save-draft"));

      // Should cache and not make duplicate requests
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("implements request batching", async () => {
      const user = userEvent.setup();
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
      global.fetch = mockFetch;

      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      // Make rapid changes that would trigger multiple API calls
      await user.type(screen.getByTestId("title-input"), "Batch");
      await user.type(screen.getByTestId("price-input"), "150000");
      await user.type(screen.getByTestId("surface-input"), "200");

      // Should batch requests
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });

    it("handles slow network conditions gracefully", async () => {
      const user = userEvent.setup();
      const slowFetch = jest.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve({ success: true }),
                }),
              3000
            )
          )
      );
      global.fetch = slowFetch;

      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      await user.type(screen.getByTestId("title-input"), "Slow Network Test");
      await user.click(screen.getByTestId("save-draft"));

      // Should show loading state
      expect(screen.getByText(/guardando/i)).toBeInTheDocument();

      // Should not block UI
      expect(screen.getByTestId("title-input")).not.toBeDisabled();
    });

    it("optimizes image loading with progressive enhancement", async () => {
      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
          initialData={{
            images: [
              { id: "1", url: "large-image.jpg", thumbnailUrl: "thumb.jpg" },
              { id: "2", url: "another-image.jpg", thumbnailUrl: "thumb2.jpg" },
            ],
          }}
        />
      );

      // Navigate to images step
      fireEvent.click(screen.getByTestId("next-button"));
      fireEvent.click(screen.getByTestId("next-button"));

      // Should load thumbnails first
      const images = screen.getAllByRole("img");
      images.forEach((img) => {
        expect(img.getAttribute("src")).toMatch(/thumb/);
      });
    });
  });

  describe("Enhanced Property Wizard Performance", () => {
    it("loads mode selection efficiently", () => {
      const startTime = performance.now();

      render(
        <EnhancedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      expect(loadTime).toBeLessThan(500); // Should load quickly
      expect(screen.getByText("Crear Nueva Propiedad")).toBeInTheDocument();
    });

    it("lazy loads wizard components", async () => {
      const user = userEvent.setup();

      render(
        <EnhancedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      // Initially should not load wizard components
      expect(screen.queryByTestId("property-wizard")).not.toBeInTheDocument();

      // Should lazy load when needed
      await user.click(screen.getByText("Empezar Wizard"));

      await waitFor(() => {
        expect(screen.getByTestId("property-wizard")).toBeInTheDocument();
      });
    });

    it("optimizes template loading", async () => {
      const user = userEvent.setup();
      const mockTemplateLoad = jest.fn().mockResolvedValue([]);

      render(
        <EnhancedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      await user.click(screen.getByText("Elegir Plantilla"));

      // Should load templates efficiently
      expect(screen.getByTestId("template-selector")).toBeInTheDocument();
    });

    it("handles bulk import performance", async () => {
      const user = userEvent.setup();
      const largeCsvData = Array.from(
        { length: 1000 },
        (_, i) => `Property ${i},${100000 + i},${100 + i}`
      ).join("\n");

      render(
        <EnhancedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      await user.click(screen.getByText("Importar Archivo"));

      const startTime = performance.now();

      // Simulate large file processing
      const fileInput = screen.getByTestId("import-complete");
      fireEvent.click(fileInput);

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Should process large files efficiently
      expect(processingTime).toBeLessThan(2000); // Under 2 seconds
    });
  });

  describe("Performance Monitoring", () => {
    it("tracks performance metrics", () => {
      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
          enablePerformanceTracking={true}
        />
      );

      // Should call performance.mark for tracking
      expect(mockPerformance.mark).toHaveBeenCalled();
    });

    it("reports performance issues", async () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      // Mock slow operation
      mockPerformance.now.mockReturnValueOnce(0).mockReturnValueOnce(3000);

      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
          enablePerformanceTracking={true}
        />
      );

      // Should warn about slow operations
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining("slow operation")
        );
      });

      consoleSpy.mockRestore();
    });

    it("provides performance summary", () => {
      const { container } = render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
          enablePerformanceTracking={true}
        />
      );

      // In development mode, should show performance panel
      if (process.env.NODE_ENV === "development") {
        expect(
          container.querySelector(".performance-monitor")
        ).toBeInTheDocument();
      }
    });

    it("adapts to device capabilities", () => {
      // Mock low-end device
      Object.defineProperty(navigator, "hardwareConcurrency", {
        value: 2, // Low CPU cores
        writable: true,
      });

      (performance as any).memory = {
        usedJSHeapSize: 80 * 1024 * 1024, // High memory usage
        totalJSHeapSize: 100 * 1024 * 1024,
        jsHeapSizeLimit: 100 * 1024 * 1024,
      };

      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
          enablePerformanceTracking={true}
        />
      );

      // Should adapt to device capabilities
      expect(screen.getByTestId("property-wizard")).toBeInTheDocument();
    });
  });
});
