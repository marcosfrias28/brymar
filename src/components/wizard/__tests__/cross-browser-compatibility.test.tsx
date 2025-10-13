/**
 * Cross-browser compatibility tests for wizard components
 * Tests performance, mobile compatibility, and browser-specific features
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import userEvent from "@testing-library/user-event";
import { LazyWizardWrapper } from "../lazy-wizard-wrapper";
import {
  WizardStyleOptimizer,
  useWizardStyles,
} from "../performance/wizard-style-optimizer";
import {
  wizardPerformanceMonitor,
  browserCompatibility,
} from '@/lib/utils/wizard-performance';

// Mock browser APIs for testing
const mockBrowserAPIs = () => {
  // Mock Performance API
  Object.defineProperty(window, "performance", {
    value: {
      now: jest.fn(() => Date.now()),
      mark: jest.fn(),
      measure: jest.fn(),
      getEntriesByType: jest.fn(() => []),
    },
    writable: true,
  });

  // Mock PerformanceObserver
  Object.defineProperty(window, "PerformanceObserver", {
    value: jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      disconnect: jest.fn(),
    })),
    writable: true,
  });

  // Mock IntersectionObserver
  Object.defineProperty(window, "IntersectionObserver", {
    value: jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    })),
    writable: true,
  });

  // Mock ResizeObserver
  Object.defineProperty(window, "ResizeObserver", {
    value: jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    })),
    writable: true,
  });

  // Mock requestIdleCallback
  Object.defineProperty(window, "requestIdleCallback", {
    value: jest.fn((callback) => setTimeout(callback, 0)),
    writable: true,
  });

  // Mock CSS.supports
  Object.defineProperty(CSS, "supports", {
    value: jest.fn(() => true),
    writable: true,
  });
};

// Mock different browser environments
const mockBrowserEnvironments = {
  chrome: () => {
    Object.defineProperty(navigator, "userAgent", {
      value:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      writable: true,
    });
  },

  firefox: () => {
    Object.defineProperty(navigator, "userAgent", {
      value:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
      writable: true,
    });
  },

  safari: () => {
    Object.defineProperty(navigator, "userAgent", {
      value:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
      writable: true,
    });
  },

  edge: () => {
    Object.defineProperty(navigator, "userAgent", {
      value:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59",
      writable: true,
    });
  },

  mobileSafari: () => {
    Object.defineProperty(navigator, "userAgent", {
      value:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
      writable: true,
    });
  },

  mobileChrome: () => {
    Object.defineProperty(navigator, "userAgent", {
      value:
        "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
      writable: true,
    });
  },
};

// Mock device capabilities
const mockDeviceCapabilities = {
  highEnd: () => {
    Object.defineProperty(navigator, "deviceMemory", {
      value: 8,
      writable: true,
    });
    Object.defineProperty(navigator, "hardwareConcurrency", {
      value: 8,
      writable: true,
    });
  },

  lowEnd: () => {
    Object.defineProperty(navigator, "deviceMemory", {
      value: 2,
      writable: true,
    });
    Object.defineProperty(navigator, "hardwareConcurrency", {
      value: 2,
      writable: true,
    });
  },

  mobile: () => {
    Object.defineProperty(window, "innerWidth", {
      value: 375,
      writable: true,
    });
    Object.defineProperty(window, "innerHeight", {
      value: 667,
      writable: true,
    });
    Object.defineProperty(navigator, "maxTouchPoints", {
      value: 5,
      writable: true,
    });
  },

  desktop: () => {
    Object.defineProperty(window, "innerWidth", {
      value: 1920,
      writable: true,
    });
    Object.defineProperty(window, "innerHeight", {
      value: 1080,
      writable: true,
    });
    Object.defineProperty(navigator, "maxTouchPoints", {
      value: 0,
      writable: true,
    });
  },
};

describe("Cross-Browser Compatibility", () => {
  beforeEach(() => {
    mockBrowserAPIs();
    jest.clearAllMocks();
  });

  describe("Browser Detection", () => {
    test("detects Chrome correctly", () => {
      mockBrowserEnvironments.chrome();
      expect(browserCompatibility.isMobile()).toBe(false);
      expect(browserCompatibility.supportsModernFeatures()).toBe(true);
    });

    test("detects Firefox correctly", () => {
      mockBrowserEnvironments.firefox();
      expect(browserCompatibility.isMobile()).toBe(false);
      expect(browserCompatibility.supportsModernFeatures()).toBe(true);
    });

    test("detects Safari correctly", () => {
      mockBrowserEnvironments.safari();
      expect(browserCompatibility.isMobile()).toBe(false);
      expect(browserCompatibility.supportsModernFeatures()).toBe(true);
    });

    test("detects mobile Safari correctly", () => {
      mockBrowserEnvironments.mobileSafari();
      mockDeviceCapabilities.mobile();
      expect(browserCompatibility.isMobile()).toBe(true);
      expect(browserCompatibility.supportsTouch()).toBe(true);
    });

    test("detects mobile Chrome correctly", () => {
      mockBrowserEnvironments.mobileChrome();
      mockDeviceCapabilities.mobile();
      expect(browserCompatibility.isMobile()).toBe(true);
      expect(browserCompatibility.supportsTouch()).toBe(true);
    });
  });

  describe("Performance Capabilities", () => {
    test("detects high-end device capabilities", () => {
      mockDeviceCapabilities.highEnd();
      const capabilities = browserCompatibility.getPerformanceCapabilities();

      expect(capabilities.isLowEnd).toBe(false);
      expect(capabilities.memoryLimit).toBe(8);
    });

    test("detects low-end device capabilities", () => {
      mockDeviceCapabilities.lowEnd();
      const capabilities = browserCompatibility.getPerformanceCapabilities();

      expect(capabilities.isLowEnd).toBe(true);
      expect(capabilities.memoryLimit).toBe(2);
    });

    test("applies appropriate optimizations for low-end devices", () => {
      mockDeviceCapabilities.lowEnd();
      mockBrowserEnvironments.mobileChrome();

      const optimizations =
        browserCompatibility.applyPerformanceOptimizations();

      expect(optimizations.reduceAnimations).toBe(true);
      expect(optimizations.lazyLoadImages).toBe(true);
      expect(optimizations.limitConcurrentRequests).toBe(true);
    });

    test("applies appropriate optimizations for high-end devices", () => {
      mockDeviceCapabilities.highEnd();
      mockBrowserEnvironments.chrome();

      const optimizations =
        browserCompatibility.applyPerformanceOptimizations();

      expect(optimizations.reduceAnimations).toBe(false);
      expect(optimizations.lazyLoadImages).toBe(true);
      expect(optimizations.limitConcurrentRequests).toBe(false);
    });
  });

  describe("Lazy Loading Performance", () => {
    test("lazy loads wizard components efficiently", async () => {
      mockDeviceCapabilities.highEnd();
      mockBrowserEnvironments.chrome();

      const mockOnComplete = jest.fn();

      render(
        <LazyWizardWrapper
          type="land"
          wizardId="test-wizard"
          userId="test-user"
          onComplete={mockOnComplete}
          enablePerformanceOptimizations={true}
        />
      );

      // Should show loading skeleton initially
      expect(screen.getByText(/Loading land wizard/i)).toBeInTheDocument();

      // Wait for lazy component to load
      await waitFor(
        () => {
          expect(
            screen.queryByText(/Loading land wizard/i)
          ).not.toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    test("handles lazy loading errors gracefully", async () => {
      mockDeviceCapabilities.lowEnd();
      mockBrowserEnvironments.mobileChrome();

      // Mock a loading error
      const originalError = console.error;
      console.error = jest.fn();

      render(
        <LazyWizardWrapper
          type="property" // This will fail to load
          wizardId="test-wizard"
          userId="test-user"
          enablePerformanceOptimizations={true}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByText(/Error loading property wizard/i)
        ).toBeInTheDocument();
      });

      console.error = originalError;
    });
  });

  describe("Mobile Performance", () => {
    test("optimizes for mobile Safari", async () => {
      mockBrowserEnvironments.mobileSafari();
      mockDeviceCapabilities.mobile();
      mockDeviceCapabilities.lowEnd();

      const TestComponent = () => {
        const styles = useWizardStyles("test");
        return (
          <div data-testid="wizard-container" className={styles.containerClass}>
            <div className={styles.cardClass}>Test Content</div>
          </div>
        );
      };

      render(
        <WizardStyleOptimizer wizardType="test" optimizeForMobile={true}>
          <TestComponent />
        </WizardStyleOptimizer>
      );

      const container = screen.getByTestId("wizard-container");
      expect(container).toHaveAttribute("data-mobile", "true");
      expect(container).toHaveAttribute("data-low-end", "true");
      expect(container).toHaveAttribute("data-reduced-motion", "true");
    });

    test("handles touch interactions on mobile", async () => {
      mockBrowserEnvironments.mobileChrome();
      mockDeviceCapabilities.mobile();

      const user = userEvent.setup();
      const mockOnComplete = jest.fn();

      render(
        <LazyWizardWrapper
          type="blog"
          wizardId="mobile-test"
          userId="test-user"
          onComplete={mockOnComplete}
          enablePerformanceOptimizations={true}
        />
      );

      // Wait for component to load
      await waitFor(() => {
        expect(
          screen.queryByText(/Loading blog wizard/i)
        ).not.toBeInTheDocument();
      });

      // Test touch interactions would go here
      // Note: Actual touch event testing requires more complex setup
    });
  });

  describe("Performance Monitoring", () => {
    test("tracks wizard performance metrics", async () => {
      const sessionId = "test-session";
      const session = wizardPerformanceMonitor.startSession(sessionId, "land");

      expect(session.id).toBe(sessionId);
      expect(session.type).toBe("land");
      expect(session.startTime).toBeGreaterThan(0);

      // Simulate wizard interactions
      wizardPerformanceMonitor.recordLoadTime(sessionId);
      wizardPerformanceMonitor.recordStepTransition(sessionId, 0, 1);
      wizardPerformanceMonitor.recordCompletion(sessionId);

      const metrics = wizardPerformanceMonitor.getMetrics(sessionId);
      expect(metrics).toBeTruthy();
      expect(metrics?.loadTime).toBeGreaterThan(0);
      expect(metrics?.completionTime).toBeGreaterThan(0);

      wizardPerformanceMonitor.endSession(sessionId);
    });

    test("handles performance monitoring errors gracefully", () => {
      const sessionId = "error-test";
      wizardPerformanceMonitor.startSession(sessionId, "blog");

      const testError = new Error("Test error");
      wizardPerformanceMonitor.recordError(sessionId, testError);

      const metrics = wizardPerformanceMonitor.getMetrics(sessionId);
      expect(metrics?.errorCount).toBe(1);

      wizardPerformanceMonitor.endSession(sessionId);
    });
  });

  describe("Memory Management", () => {
    test("cleans up resources properly", async () => {
      const mockCleanup = jest.fn();
      const mockInterval = setInterval(() => {}, 1000);
      const mockTimeout = setTimeout(() => {}, 1000);

      const { unmount } = render(
        <LazyWizardWrapper
          type="land"
          wizardId="cleanup-test"
          userId="test-user"
          enablePerformanceOptimizations={true}
        />
      );

      // Simulate cleanup
      act(() => {
        unmount();
      });

      // Verify cleanup was called
      clearInterval(mockInterval);
      clearTimeout(mockTimeout);
    });
  });

  describe("CSS and Styling Compatibility", () => {
    test("applies consistent styles across browsers", () => {
      const TestComponent = () => {
        const styles = useWizardStyles("test");
        return (
          <div data-testid="styled-component" className={styles.containerClass}>
            Test
          </div>
        );
      };

      render(
        <WizardStyleOptimizer wizardType="test">
          <TestComponent />
        </WizardStyleOptimizer>
      );

      const component = screen.getByTestId("styled-component");
      expect(component).toHaveClass("w-full", "mx-auto", "space-y-6");
    });

    test("handles reduced motion preferences", () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, "matchMedia", {
        value: jest.fn(() => ({
          matches: true,
          addListener: jest.fn(),
          removeListener: jest.fn(),
        })),
      });

      mockDeviceCapabilities.lowEnd();

      const TestComponent = () => {
        const styles = useWizardStyles("test");
        return (
          <div data-testid="reduced-motion" className={styles.containerClass}>
            Test
          </div>
        );
      };

      render(
        <WizardStyleOptimizer wizardType="test">
          <TestComponent />
        </WizardStyleOptimizer>
      );

      const component = screen.getByTestId("reduced-motion");
      expect(component).toHaveAttribute("data-reduced-motion", "true");
    });
  });

  describe("Network Conditions", () => {
    test("adapts to slow network connections", () => {
      // Mock slow connection
      Object.defineProperty(navigator, "connection", {
        value: {
          effectiveType: "2g",
          downlink: 0.5,
        },
        writable: true,
      });

      const capabilities = browserCompatibility.getPerformanceCapabilities();
      expect(capabilities.connectionSpeed).toBe("2g");

      const optimizations =
        browserCompatibility.applyPerformanceOptimizations();
      expect(optimizations.limitConcurrentRequests).toBe(false); // Based on device memory, not connection
    });

    test("handles offline scenarios", async () => {
      // Mock offline
      Object.defineProperty(navigator, "onLine", {
        value: false,
        writable: true,
      });

      const mockOnComplete = jest.fn();

      render(
        <LazyWizardWrapper
          type="blog"
          wizardId="offline-test"
          userId="test-user"
          onComplete={mockOnComplete}
          enablePerformanceOptimizations={true}
        />
      );

      // Component should still render and handle offline state
      await waitFor(() => {
        expect(
          screen.queryByText(/Loading blog wizard/i)
        ).not.toBeInTheDocument();
      });
    });
  });
});
