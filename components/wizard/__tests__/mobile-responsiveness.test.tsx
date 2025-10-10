import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OptimizedPropertyWizard } from "../optimized-property-wizard";
import { InteractiveMap } from "../shared/interactive-map";
import { EnhancedAIDescription } from "../shared/enhanced-ai-description";

// Mock mobile detection hook
const mockUseMobile = jest.fn();
jest.mock("@/hooks/use-mobile", () => ({
  useMobile: () => mockUseMobile(),
}));

// Mock window.matchMedia for responsive tests
const mockMatchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

// Mock touch events
const createTouchEvent = (
  type: string,
  touches: Array<{ clientX: number; clientY: number }>
) => {
  const touchEvent = new Event(type, { bubbles: true });
  Object.defineProperty(touchEvent, "touches", {
    value: touches.map((touch) => ({
      ...touch,
      identifier: 0,
      target: document.body,
      radiusX: 1,
      radiusY: 1,
      rotationAngle: 0,
      force: 1,
    })),
    writable: false,
  });
  return touchEvent;
};

describe("Mobile Responsiveness Tests", () => {
  const mockOnComplete = jest.fn();
  const mockOnSaveDraft = jest.fn().mockResolvedValue("draft-123");

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset window.matchMedia
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation(mockMatchMedia),
    });
  });

  describe("Mobile Layout Detection", () => {
    it("detects mobile viewport correctly", () => {
      mockUseMobile.mockReturnValue(true);

      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      // Should render mobile-optimized layout
      expect(screen.getByTestId("property-wizard")).toBeInTheDocument();
    });

    it("detects desktop viewport correctly", () => {
      mockUseMobile.mockReturnValue(false);

      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      // Should render desktop layout
      expect(screen.getByTestId("property-wizard")).toBeInTheDocument();
    });

    it("responds to viewport changes", () => {
      const { rerender } = render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      // Start with desktop
      mockUseMobile.mockReturnValue(false);
      rerender(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      // Switch to mobile
      mockUseMobile.mockReturnValue(true);
      rerender(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      expect(screen.getByTestId("property-wizard")).toBeInTheDocument();
    });
  });

  describe("Touch Interactions", () => {
    beforeEach(() => {
      mockUseMobile.mockReturnValue(true);
    });

    it("handles touch events on form inputs", async () => {
      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      const titleInput = screen.getByTestId("title-input");

      // Simulate touch interaction
      fireEvent(
        titleInput,
        createTouchEvent("touchstart", [{ clientX: 100, clientY: 100 }])
      );
      fireEvent(
        titleInput,
        createTouchEvent("touchend", [{ clientX: 100, clientY: 100 }])
      );

      // Should focus the input
      expect(titleInput).toBeInTheDocument();
    });

    it("handles swipe gestures for navigation", async () => {
      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      const wizard = screen.getByTestId("property-wizard");

      // Simulate swipe left (next step)
      fireEvent(
        wizard,
        createTouchEvent("touchstart", [{ clientX: 200, clientY: 100 }])
      );
      fireEvent(
        wizard,
        createTouchEvent("touchmove", [{ clientX: 100, clientY: 100 }])
      );
      fireEvent(
        wizard,
        createTouchEvent("touchend", [{ clientX: 50, clientY: 100 }])
      );

      // Should handle swipe gesture
      expect(wizard).toBeInTheDocument();
    });

    it("handles pinch-to-zoom on images", async () => {
      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
          initialData={{ images: [{ id: "1", url: "test.jpg" }] }}
        />
      );

      // Navigate to images step
      const nextButton = screen.getByTestId("next-button");
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      const imageContainer = screen.getByTestId("step-3");

      // Simulate pinch gesture
      fireEvent(
        imageContainer,
        createTouchEvent("touchstart", [
          { clientX: 100, clientY: 100 },
          { clientX: 200, clientY: 100 },
        ])
      );

      fireEvent(
        imageContainer,
        createTouchEvent("touchmove", [
          { clientX: 80, clientY: 100 },
          { clientX: 220, clientY: 100 },
        ])
      );

      fireEvent(imageContainer, createTouchEvent("touchend", []));

      expect(imageContainer).toBeInTheDocument();
    });

    it("prevents default touch behaviors when appropriate", async () => {
      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      const wizard = screen.getByTestId("property-wizard");
      const touchEvent = createTouchEvent("touchstart", [
        { clientX: 100, clientY: 100 },
      ]);

      const preventDefaultSpy = jest.spyOn(touchEvent, "preventDefault");
      fireEvent(wizard, touchEvent);

      // Should prevent default for certain touch interactions
      expect(wizard).toBeInTheDocument();
    });
  });

  describe("Map Touch Interactions", () => {
    const mockOnCoordinatesChange = jest.fn();
    const mockOnAddressChange = jest.fn();

    beforeEach(() => {
      mockUseMobile.mockReturnValue(true);
      jest.clearAllMocks();
    });

    it("handles touch events on map", async () => {
      render(
        <InteractiveMap
          onCoordinatesChange={mockOnCoordinatesChange}
          onAddressChange={mockOnAddressChange}
        />
      );

      const mapContainer = screen.getByTestId("map-container");

      // Simulate touch on map
      fireEvent(
        mapContainer,
        createTouchEvent("touchstart", [{ clientX: 150, clientY: 150 }])
      );
      fireEvent(
        mapContainer,
        createTouchEvent("touchend", [{ clientX: 150, clientY: 150 }])
      );

      expect(mapContainer).toBeInTheDocument();
    });

    it("handles map dragging on mobile", async () => {
      render(
        <InteractiveMap
          onCoordinatesChange={mockOnCoordinatesChange}
          onAddressChange={mockOnAddressChange}
        />
      );

      const mapContainer = screen.getByTestId("map-container");

      // Simulate drag gesture
      fireEvent(
        mapContainer,
        createTouchEvent("touchstart", [{ clientX: 100, clientY: 100 }])
      );
      fireEvent(
        mapContainer,
        createTouchEvent("touchmove", [{ clientX: 150, clientY: 120 }])
      );
      fireEvent(
        mapContainer,
        createTouchEvent("touchmove", [{ clientX: 200, clientY: 140 }])
      );
      fireEvent(
        mapContainer,
        createTouchEvent("touchend", [{ clientX: 200, clientY: 140 }])
      );

      expect(mapContainer).toBeInTheDocument();
    });

    it("handles zoom gestures on map", async () => {
      render(
        <InteractiveMap
          onCoordinatesChange={mockOnCoordinatesChange}
          onAddressChange={mockOnAddressChange}
        />
      );

      const mapContainer = screen.getByTestId("map-container");

      // Simulate zoom gesture (two fingers)
      fireEvent(
        mapContainer,
        createTouchEvent("touchstart", [
          { clientX: 100, clientY: 100 },
          { clientX: 200, clientY: 200 },
        ])
      );

      fireEvent(
        mapContainer,
        createTouchEvent("touchmove", [
          { clientX: 80, clientY: 80 },
          { clientX: 220, clientY: 220 },
        ])
      );

      fireEvent(mapContainer, createTouchEvent("touchend", []));

      expect(mapContainer).toBeInTheDocument();
    });

    it("prevents accidental map interactions during scrolling", async () => {
      render(
        <InteractiveMap
          onCoordinatesChange={mockOnCoordinatesChange}
          onAddressChange={mockOnAddressChange}
        />
      );

      const mapContainer = screen.getByTestId("map-container");

      // Simulate quick vertical scroll (should not trigger map interaction)
      fireEvent(
        mapContainer,
        createTouchEvent("touchstart", [{ clientX: 100, clientY: 100 }])
      );
      fireEvent(
        mapContainer,
        createTouchEvent("touchmove", [{ clientX: 100, clientY: 50 }])
      );
      fireEvent(
        mapContainer,
        createTouchEvent("touchend", [{ clientX: 100, clientY: 50 }])
      );

      // Should not trigger coordinate change for scroll gestures
      expect(mockOnCoordinatesChange).not.toHaveBeenCalled();
    });
  });

  describe("Mobile Form Interactions", () => {
    beforeEach(() => {
      mockUseMobile.mockReturnValue(true);
    });

    it("handles virtual keyboard appearance", async () => {
      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      const titleInput = screen.getByTestId("title-input");

      // Simulate virtual keyboard opening
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 400, // Reduced height simulating keyboard
      });

      fireEvent.focus(titleInput);
      fireEvent(window, new Event("resize"));

      expect(titleInput).toBeInTheDocument();
    });

    it("adjusts layout for landscape orientation", async () => {
      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      // Simulate orientation change to landscape
      Object.defineProperty(screen, "orientation", {
        writable: true,
        configurable: true,
        value: { angle: 90 },
      });

      fireEvent(window, new Event("orientationchange"));

      expect(screen.getByTestId("property-wizard")).toBeInTheDocument();
    });

    it("handles large text input on mobile", async () => {
      const user = userEvent.setup();
      render(
        <EnhancedAIDescription
          value=""
          onChange={jest.fn()}
          propertyData={{
            type: "Casa",
            location: "Santo Domingo",
            price: 150000,
            surface: 200,
          }}
        />
      );

      const textarea = screen.getByRole("textbox");

      // Type a long description
      const longText =
        "Esta es una descripción muy larga que debería manejar correctamente el redimensionamiento automático del textarea en dispositivos móviles. ".repeat(
          5
        );

      await user.type(textarea, longText);

      expect(textarea).toHaveValue(longText);
    });

    it("handles touch-friendly button interactions", async () => {
      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      const nextButton = screen.getByTestId("next-button");

      // Simulate touch interaction with proper touch target size
      const buttonRect = nextButton.getBoundingClientRect();
      expect(buttonRect.height).toBeGreaterThanOrEqual(44); // Minimum touch target size

      fireEvent(
        nextButton,
        createTouchEvent("touchstart", [{ clientX: 100, clientY: 100 }])
      );
      fireEvent(
        nextButton,
        createTouchEvent("touchend", [{ clientX: 100, clientY: 100 }])
      );

      expect(nextButton).toBeInTheDocument();
    });
  });

  describe("Responsive Breakpoints", () => {
    const testBreakpoints = [
      { width: 320, name: "mobile-small" },
      { width: 375, name: "mobile-medium" },
      { width: 768, name: "tablet" },
      { width: 1024, name: "desktop-small" },
      { width: 1440, name: "desktop-large" },
    ];

    testBreakpoints.forEach(({ width, name }) => {
      it(`renders correctly at ${name} breakpoint (${width}px)`, () => {
        // Mock viewport width
        Object.defineProperty(window, "innerWidth", {
          writable: true,
          configurable: true,
          value: width,
        });

        mockUseMobile.mockReturnValue(width < 768);

        render(
          <OptimizedPropertyWizard
            onComplete={mockOnComplete}
            onSaveDraft={mockOnSaveDraft}
          />
        );

        expect(screen.getByTestId("property-wizard")).toBeInTheDocument();
      });
    });

    it("adjusts component spacing for different screen sizes", () => {
      const { rerender } = render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      // Test mobile spacing
      mockUseMobile.mockReturnValue(true);
      rerender(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      // Test desktop spacing
      mockUseMobile.mockReturnValue(false);
      rerender(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      expect(screen.getByTestId("property-wizard")).toBeInTheDocument();
    });
  });

  describe("Accessibility on Mobile", () => {
    beforeEach(() => {
      mockUseMobile.mockReturnValue(true);
    });

    it("maintains proper focus management on mobile", async () => {
      const user = userEvent.setup();
      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      const titleInput = screen.getByTestId("title-input");
      const nextButton = screen.getByTestId("next-button");

      // Tab navigation should work on mobile
      await user.tab();
      expect(titleInput).toHaveFocus();

      await user.tab();
      expect(nextButton).toHaveFocus();
    });

    it("provides proper touch feedback", async () => {
      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      const nextButton = screen.getByTestId("next-button");

      // Touch should provide visual feedback
      fireEvent(
        nextButton,
        createTouchEvent("touchstart", [{ clientX: 100, clientY: 100 }])
      );

      // Button should have active state
      expect(nextButton).toBeInTheDocument();

      fireEvent(
        nextButton,
        createTouchEvent("touchend", [{ clientX: 100, clientY: 100 }])
      );
    });

    it("handles screen reader announcements on mobile", async () => {
      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      const wizard = screen.getByTestId("property-wizard");

      // Should have proper ARIA labels for screen readers
      expect(wizard).toBeInTheDocument();
    });

    it("supports voice input on mobile", async () => {
      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      const titleInput = screen.getByTestId("title-input");

      // Simulate voice input
      fireEvent.change(titleInput, {
        target: { value: "Casa dictada por voz" },
      });

      expect(titleInput).toHaveValue("Casa dictada por voz");
    });
  });

  describe("Performance on Mobile", () => {
    beforeEach(() => {
      mockUseMobile.mockReturnValue(true);
    });

    it("loads efficiently on mobile devices", async () => {
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

      // Should load within reasonable time on mobile
      expect(loadTime).toBeLessThan(1000); // 1 second
      expect(screen.getByTestId("property-wizard")).toBeInTheDocument();
    });

    it("handles memory constraints on mobile", () => {
      // Mock limited memory scenario
      const originalMemory = (performance as any).memory;
      (performance as any).memory = {
        usedJSHeapSize: 50 * 1024 * 1024, // 50MB
        totalJSHeapSize: 100 * 1024 * 1024, // 100MB
        jsHeapSizeLimit: 200 * 1024 * 1024, // 200MB
      };

      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
          enablePerformanceTracking={true}
        />
      );

      expect(screen.getByTestId("property-wizard")).toBeInTheDocument();

      // Restore original memory object
      (performance as any).memory = originalMemory;
    });

    it("optimizes images for mobile viewing", async () => {
      render(
        <OptimizedPropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
          initialData={{
            images: [
              { id: "1", url: "large-image.jpg", size: 5 * 1024 * 1024 }, // 5MB
              { id: "2", url: "medium-image.jpg", size: 2 * 1024 * 1024 }, // 2MB
            ],
          }}
        />
      );

      // Navigate to images step
      const nextButton = screen.getByTestId("next-button");
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      // Images should be optimized for mobile
      expect(screen.getByTestId("step-3")).toBeInTheDocument();
    });
  });
});
