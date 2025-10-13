import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropertyFormData, PropertyType } from '@/types/wizard';

// Mock providers for testing
const TestProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Custom render function with providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: TestProviders, ...options });

// Re-export everything
export * from "@testing-library/react";
export { customRender as render };

// Test data factories
export const createMockPropertyData = (
  overrides: Partial<PropertyFormData> = {}
): PropertyFormData => ({
  title: "Test Property",
  description:
    "A beautiful test property with all the amenities you need for comfortable living.",
  price: 150000,
  surface: 200,
  propertyType: PropertyType.HOUSE,
  bedrooms: 3,
  bathrooms: 2,
  characteristics: [
    { id: "1", name: "Pool", category: "amenity", selected: true },
    { id: "2", name: "Garden", category: "feature", selected: true },
    { id: "3", name: "Garage", category: "feature", selected: true },
  ],
  coordinates: { latitude: 18.5, longitude: -70.0 },
  address: {
    street: "Main Street 123",
    city: "Santo Domingo",
    province: "Distrito Nacional",
    country: "Dominican Republic",
    formattedAddress: "Main Street 123, Santo Domingo, Distrito Nacional",
  },
  images: [
    {
      id: "1",
      url: "https://example.com/image1.jpg",
      filename: "image1.jpg",
      size: 1024000,
      contentType: "image/jpeg",
      displayOrder: 0,
    },
    {
      id: "2",
      url: "https://example.com/image2.jpg",
      filename: "image2.jpg",
      size: 2048000,
      contentType: "image/jpeg",
      displayOrder: 1,
    },
  ],
  ...overrides,
});

export const createMockIncompletePropertyData = (
  overrides: Partial<PropertyFormData> = {}
): Partial<PropertyFormData> => ({
  title: "",
  description: "",
  price: 0,
  surface: 0,
  propertyType: undefined,
  bedrooms: undefined,
  bathrooms: undefined,
  characteristics: [],
  coordinates: undefined,
  address: undefined,
  images: [],
  ...overrides,
});

export const createMockFile = (
  name: string = "test-image.jpg",
  size: number = 1024000,
  type: string = "image/jpeg"
): File => {
  const file = new File(["test content"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

export const createMockFormData = (
  data: Record<string, any> = {}
): FormData => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        formData.append(`${key}[${index}]`, JSON.stringify(item));
      });
    } else if (typeof value === "object" && value !== null) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });
  return formData;
};

// Mock touch event helper
export const createTouchEvent = (
  type: string,
  touches: Array<{ clientX: number; clientY: number }>
): TouchEvent => {
  const touchEvent = new Event(type, { bubbles: true }) as TouchEvent;
  Object.defineProperty(touchEvent, "touches", {
    value: touches.map((touch, index) => ({
      ...touch,
      identifier: index,
      target: document.body,
      radiusX: 1,
      radiusY: 1,
      rotationAngle: 0,
      force: 1,
      pageX: touch.clientX,
      pageY: touch.clientY,
      screenX: touch.clientX,
      screenY: touch.clientY,
    })),
    writable: false,
  });
  return touchEvent;
};

// Performance testing utilities
export const measurePerformance = async (
  fn: () => Promise<void> | void
): Promise<number> => {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
};

export const measureMemoryUsage = (): number => {
  if ((performance as any).memory) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return 0;
};

// Mock network conditions
export const mockSlowNetwork = (delay: number = 2000) => {
  const originalFetch = global.fetch;
  global.fetch = jest
    .fn()
    .mockImplementation(
      (...args) =>
        new Promise((resolve) =>
          setTimeout(() => resolve(originalFetch(...args)), delay)
        )
    );
  return () => {
    global.fetch = originalFetch;
  };
};

export const mockNetworkError = () => {
  const originalFetch = global.fetch;
  global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));
  return () => {
    global.fetch = originalFetch;
  };
};

// Mock device conditions
export const mockMobileDevice = () => {
  const originalUserAgent = navigator.userAgent;
  Object.defineProperty(navigator, "userAgent", {
    value:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
    writable: true,
  });

  Object.defineProperty(window, "innerWidth", {
    value: 375,
    writable: true,
  });

  Object.defineProperty(window, "innerHeight", {
    value: 667,
    writable: true,
  });

  return () => {
    Object.defineProperty(navigator, "userAgent", {
      value: originalUserAgent,
      writable: true,
    });
  };
};

export const mockLowEndDevice = () => {
  Object.defineProperty(navigator, "hardwareConcurrency", {
    value: 2,
    writable: true,
  });

  if ((performance as any).memory) {
    (performance as any).memory = {
      usedJSHeapSize: 80 * 1024 * 1024, // 80MB
      totalJSHeapSize: 100 * 1024 * 1024, // 100MB
      jsHeapSizeLimit: 100 * 1024 * 1024, // 100MB
    };
  }
};

// Accessibility testing utilities
export const checkAccessibility = async (
  container: HTMLElement
): Promise<boolean> => {
  // Basic accessibility checks
  const issues: string[] = [];

  // Check for missing alt text on images
  const images = container.querySelectorAll("img");
  images.forEach((img, index) => {
    if (!img.getAttribute("alt")) {
      issues.push(`Image ${index + 1} missing alt text`);
    }
  });

  // Check for missing labels on form inputs
  const inputs = container.querySelectorAll("input, textarea, select");
  inputs.forEach((input, index) => {
    const id = input.getAttribute("id");
    const ariaLabel = input.getAttribute("aria-label");
    const ariaLabelledBy = input.getAttribute("aria-labelledby");

    if (id) {
      const label = container.querySelector(`label[for="${id}"]`);
      if (!label && !ariaLabel && !ariaLabelledBy) {
        issues.push(`Input ${index + 1} missing label`);
      }
    } else if (!ariaLabel && !ariaLabelledBy) {
      issues.push(`Input ${index + 1} missing label or id`);
    }
  });

  // Check for proper heading hierarchy
  const headings = container.querySelectorAll("h1, h2, h3, h4, h5, h6");
  let previousLevel = 0;
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));
    if (index === 0 && level !== 1) {
      issues.push("First heading should be h1");
    } else if (level > previousLevel + 1) {
      issues.push(`Heading level jumps from h${previousLevel} to h${level}`);
    }
    previousLevel = level;
  });

  // Check for keyboard accessibility
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  focusableElements.forEach((element, index) => {
    const tabIndex = element.getAttribute("tabindex");
    if (tabIndex && parseInt(tabIndex) > 0) {
      issues.push(`Element ${index + 1} has positive tabindex (${tabIndex})`);
    }
  });

  if (issues.length > 0) {
    console.warn("Accessibility issues found:", issues);
    return false;
  }

  return true;
};

// Visual regression testing utilities
export const captureScreenshot = async (
  element: HTMLElement
): Promise<string> => {
  // In a real implementation, this would use a tool like Playwright or Puppeteer
  // For testing purposes, we'll return a mock screenshot data
  return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
};

export const compareScreenshots = (
  screenshot1: string,
  screenshot2: string
): boolean => {
  // Mock implementation - in reality would use image comparison library
  return screenshot1 === screenshot2;
};

// Error simulation utilities
export const simulateError = (
  component: React.ComponentType,
  errorMessage: string = "Test error"
) => {
  const ErrorComponent = () => {
    throw new Error(errorMessage);
  };

  return ErrorComponent;
};

export const simulateAsyncError = (
  delay: number = 100,
  errorMessage: string = "Async test error"
) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), delay);
  });
};

// Test data validation utilities
export const validatePropertyData = (
  data: Partial<PropertyFormData>
): string[] => {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push("Title is required");
  }

  if (!data.price || data.price <= 0) {
    errors.push("Price must be greater than 0");
  }

  if (!data.surface || data.surface <= 0) {
    errors.push("Surface must be greater than 0");
  }

  if (!data.propertyType) {
    errors.push("Property type is required");
  }

  if (!data.coordinates) {
    errors.push("Coordinates are required");
  }

  if (!data.images || data.images.length === 0) {
    errors.push("At least one image is required");
  }

  return errors;
};

// Mock API responses
export const mockApiResponses = {
  success: {
    ok: true,
    json: () => Promise.resolve({ success: true, id: "test-123" }),
  },
  error: {
    ok: false,
    status: 500,
    json: () => Promise.resolve({ error: "Internal server error" }),
  },
  timeout: new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Request timeout")), 5000)
  ),
};

// Test environment setup
export const setupTestEnvironment = () => {
  // Mock console methods to reduce noise in tests
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = jest.fn((message) => {
    if (
      typeof message === "string" &&
      (message.includes("Warning:") ||
        message.includes("React does not recognize") ||
        message.includes("validateDOMNesting"))
    ) {
      return;
    }
    originalError(message);
  });

  console.warn = jest.fn((message) => {
    if (
      typeof message === "string" &&
      message.includes("componentWillReceiveProps")
    ) {
      return;
    }
    originalWarn(message);
  });

  return () => {
    console.error = originalError;
    console.warn = originalWarn;
  };
};

// Cleanup utilities
export const cleanupAfterTest = () => {
  // Clear all timers
  jest.clearAllTimers();

  // Clear all mocks
  jest.clearAllMocks();

  // Clean up DOM
  document.body.innerHTML = "";

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
};

// Export commonly used test constants
export const TEST_CONSTANTS = {
  PERFORMANCE_BUDGETS: {
    LOAD_TIME: 2000, // 2 seconds
    INTERACTION_TIME: 500, // 500ms
    MEMORY_USAGE: 50 * 1024 * 1024, // 50MB
  },

  VIEWPORT_SIZES: {
    MOBILE_SMALL: { width: 320, height: 568 },
    MOBILE_MEDIUM: { width: 375, height: 667 },
    MOBILE_LARGE: { width: 414, height: 896 },
    TABLET: { width: 768, height: 1024 },
    DESKTOP_SMALL: { width: 1024, height: 768 },
    DESKTOP_LARGE: { width: 1440, height: 900 },
  },

  NETWORK_CONDITIONS: {
    FAST_3G: {
      downloadThroughput: (1.5 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
      latency: 562.5,
    },
    SLOW_3G: {
      downloadThroughput: (500 * 1024) / 8,
      uploadThroughput: (500 * 1024) / 8,
      latency: 2000,
    },
    OFFLINE: { downloadThroughput: 0, uploadThroughput: 0, latency: 0 },
  },

  ACCESSIBILITY_STANDARDS: {
    MIN_CONTRAST_RATIO: 4.5,
    MIN_TOUCH_TARGET_SIZE: 44, // pixels
    MAX_TABINDEX: 0,
  },
};
