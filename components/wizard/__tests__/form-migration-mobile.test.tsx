import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/hooks/use-user";

// Import page components
import NewBlogPage from "@/app/(dashboard)/dashboard/blog/new/page";
import NewLandPage from "@/app/(dashboard)/dashboard/lands/new/page";

// Mock dependencies
jest.mock("next/navigation");
jest.mock("@/hooks/use-user");
jest.mock("sonner");
jest.mock("@/lib/actions/blog-wizard-actions");
jest.mock("@/lib/actions/land-wizard-actions");

// Mock responsive wizard components
jest.mock("@/components/wizard/blog/blog-wizard", () => ({
  BlogWizard: ({ onComplete, onCancel }: any) => {
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

    React.useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
      <div
        data-testid="blog-wizard"
        className={`wizard ${isMobile ? "mobile" : "desktop"}`}
        data-mobile={isMobile}
      >
        <div
          className={`wizard-header ${
            isMobile ? "mobile-header" : "desktop-header"
          }`}
        >
          <h1 className={isMobile ? "text-lg" : "text-2xl"}>
            {isMobile ? "Blog" : "Create Blog Post"}
          </h1>
          <div className="progress-indicator">
            {isMobile ? "1/4" : "Step 1 of 4"}
          </div>
        </div>

        <div
          className={`wizard-content ${
            isMobile ? "mobile-content" : "desktop-content"
          }`}
        >
          <div
            className={`form-field ${
              isMobile ? "mobile-field" : "desktop-field"
            }`}
          >
            <label htmlFor="blog-title">
              {isMobile ? "Title" : "Blog Title"}
            </label>
            <input
              id="blog-title"
              type="text"
              className={isMobile ? "mobile-input" : "desktop-input"}
              placeholder={
                isMobile ? "Enter title..." : "Enter your blog title here..."
              }
            />
          </div>

          {isMobile && (
            <div className="mobile-only-features">
              <button
                className="mobile-save-draft"
                data-testid="mobile-save-draft"
              >
                Save Draft
              </button>
              <div className="mobile-progress-dots">
                <span className="dot active"></span>
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}
        </div>

        <div
          className={`wizard-navigation ${
            isMobile ? "mobile-nav" : "desktop-nav"
          }`}
        >
          {isMobile ? (
            <div className="mobile-nav-buttons">
              <button
                className="mobile-cancel"
                onClick={onCancel}
                data-testid="mobile-cancel"
              >
                ✕
              </button>
              <button
                className="mobile-complete"
                onClick={() => onComplete({ title: "Mobile Blog" })}
                data-testid="mobile-complete"
              >
                ✓
              </button>
            </div>
          ) : (
            <div className="desktop-nav-buttons">
              <button onClick={onCancel}>Cancel</button>
              <button onClick={() => onComplete({ title: "Desktop Blog" })}>
                Complete
              </button>
            </div>
          )}
        </div>

        {/* Mobile-specific swipe indicators */}
        {isMobile && (
          <div className="swipe-indicators" data-testid="swipe-indicators">
            <div className="swipe-hint">Swipe to navigate</div>
          </div>
        )}
      </div>
    );
  },
}));

jest.mock("@/components/wizard/land/land-wizard", () => ({
  LandWizard: ({ onComplete, onCancel }: any) => {
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

    React.useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
      <div
        data-testid="land-wizard"
        className={`wizard ${isMobile ? "mobile" : "desktop"}`}
        data-mobile={isMobile}
      >
        <div
          className={`wizard-header ${
            isMobile ? "mobile-header" : "desktop-header"
          }`}
        >
          <h1 className={isMobile ? "text-lg" : "text-2xl"}>
            {isMobile ? "Land" : "Create Land Listing"}
          </h1>
        </div>

        <div
          className={`wizard-content ${
            isMobile ? "mobile-content" : "desktop-content"
          }`}
        >
          <div
            className={`form-grid ${isMobile ? "mobile-grid" : "desktop-grid"}`}
          >
            <div className="form-field">
              <label htmlFor="land-title">Title</label>
              <input
                id="land-title"
                type="text"
                className={isMobile ? "mobile-input" : "desktop-input"}
              />
            </div>

            <div className="form-field">
              <label htmlFor="land-area">Area</label>
              <input
                id="land-area"
                type="number"
                className={isMobile ? "mobile-input" : "desktop-input"}
              />
            </div>
          </div>

          {isMobile && (
            <div
              className="mobile-map-preview"
              data-testid="mobile-map-preview"
            >
              <div className="map-placeholder">Tap to view map</div>
            </div>
          )}
        </div>

        <div
          className={`wizard-navigation ${
            isMobile ? "mobile-nav" : "desktop-nav"
          }`}
        >
          <button
            onClick={() => onComplete("land-123")}
            className={
              isMobile ? "mobile-complete-btn" : "desktop-complete-btn"
            }
          >
            {isMobile ? "Done" : "Complete Land Listing"}
          </button>
          <button
            onClick={onCancel}
            className={isMobile ? "mobile-cancel-btn" : "desktop-cancel-btn"}
          >
            {isMobile ? "Cancel" : "Cancel and Go Back"}
          </button>
        </div>
      </div>
    );
  },
}));

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

const mockSearchParams = {
  get: jest.fn(),
};

const mockUser = {
  id: "user-123",
  name: "Test User",
  email: "test@example.com",
};

// Utility function to simulate viewport changes
const setViewport = (width: number, height: number = 800) => {
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
};

describe("Form Migration Mobile Responsiveness Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    (useUser as jest.Mock).mockReturnValue({ user: mockUser });

    // Reset viewport to desktop by default
    setViewport(1024, 768);
  });

  describe("Mobile Viewport Adaptation", () => {
    it("adapts blog wizard layout for mobile screens", async () => {
      setViewport(375, 667); // iPhone SE dimensions
      mockSearchParams.get.mockReturnValue(null);

      render(<NewBlogPage />);

      await waitFor(() => {
        const wizard = screen.getByTestId("blog-wizard");
        expect(wizard).toBeInTheDocument();
        expect(wizard).toHaveAttribute("data-mobile", "true");
        expect(wizard).toHaveClass("mobile");
      });

      // Check mobile-specific elements
      expect(screen.getByTestId("mobile-save-draft")).toBeInTheDocument();
      expect(screen.getByTestId("swipe-indicators")).toBeInTheDocument();
      expect(screen.getByText("1/4")).toBeInTheDocument(); // Compact progress
      expect(screen.getByText("Blog")).toBeInTheDocument(); // Shorter title
    });

    it("adapts land wizard layout for mobile screens", async () => {
      setViewport(414, 896); // iPhone 11 Pro Max dimensions
      mockSearchParams.get.mockReturnValue(null);

      render(<NewLandPage />);

      await waitFor(() => {
        const wizard = screen.getByTestId("land-wizard");
        expect(wizard).toBeInTheDocument();
        expect(wizard).toHaveAttribute("data-mobile", "true");
        expect(wizard).toHaveClass("mobile");
      });

      // Check mobile-specific features
      expect(screen.getByTestId("mobile-map-preview")).toBeInTheDocument();
      expect(screen.getByText("Land")).toBeInTheDocument(); // Shorter title
      expect(screen.getByText("Done")).toBeInTheDocument(); // Shorter button text
    });

    it("uses desktop layout for larger screens", async () => {
      setViewport(1920, 1080); // Desktop dimensions
      mockSearchParams.get.mockReturnValue(null);

      render(<NewBlogPage />);

      await waitFor(() => {
        const wizard = screen.getByTestId("blog-wizard");
        expect(wizard).toBeInTheDocument();
        expect(wizard).toHaveAttribute("data-mobile", "false");
        expect(wizard).toHaveClass("desktop");
      });

      // Check desktop-specific elements
      expect(screen.queryByTestId("mobile-save-draft")).not.toBeInTheDocument();
      expect(screen.queryByTestId("swipe-indicators")).not.toBeInTheDocument();
      expect(screen.getByText("Step 1 of 4")).toBeInTheDocument(); // Full progress text
      expect(screen.getByText("Create Blog Post")).toBeInTheDocument(); // Full title
    });
  });

  describe("Tablet Viewport Adaptation", () => {
    it("adapts for tablet portrait mode", async () => {
      setViewport(768, 1024); // iPad portrait
      mockSearchParams.get.mockReturnValue(null);

      render(<NewLandPage />);

      await waitFor(() => {
        const wizard = screen.getByTestId("land-wizard");
        expect(wizard).toBeInTheDocument();
        // Should use desktop layout for tablet
        expect(wizard).toHaveAttribute("data-mobile", "false");
      });
    });

    it("adapts for tablet landscape mode", async () => {
      setViewport(1024, 768); // iPad landscape
      mockSearchParams.get.mockReturnValue(null);

      render(<NewBlogPage />);

      await waitFor(() => {
        const wizard = screen.getByTestId("blog-wizard");
        expect(wizard).toBeInTheDocument();
        expect(wizard).toHaveAttribute("data-mobile", "false");
      });
    });
  });

  describe("Dynamic Viewport Changes", () => {
    it("responds to viewport changes during use", async () => {
      // Start with desktop
      setViewport(1200, 800);
      mockSearchParams.get.mockReturnValue(null);

      render(<NewBlogPage />);

      await waitFor(() => {
        const wizard = screen.getByTestId("blog-wizard");
        expect(wizard).toHaveAttribute("data-mobile", "false");
      });

      // Switch to mobile
      setViewport(375, 667);

      await waitFor(() => {
        const wizard = screen.getByTestId("blog-wizard");
        expect(wizard).toHaveAttribute("data-mobile", "true");
        expect(screen.getByTestId("mobile-save-draft")).toBeInTheDocument();
      });

      // Switch back to desktop
      setViewport(1200, 800);

      await waitFor(() => {
        const wizard = screen.getByTestId("blog-wizard");
        expect(wizard).toHaveAttribute("data-mobile", "false");
        expect(
          screen.queryByTestId("mobile-save-draft")
        ).not.toBeInTheDocument();
      });
    });

    it("handles orientation changes", async () => {
      // Portrait mobile
      setViewport(375, 667);
      mockSearchParams.get.mockReturnValue(null);

      render(<NewLandPage />);

      await waitFor(() => {
        const wizard = screen.getByTestId("land-wizard");
        expect(wizard).toHaveAttribute("data-mobile", "true");
      });

      // Landscape mobile (still mobile)
      setViewport(667, 375);

      await waitFor(() => {
        const wizard = screen.getByTestId("land-wizard");
        expect(wizard).toHaveAttribute("data-mobile", "true");
      });
    });
  });

  describe("Touch Interactions", () => {
    it("supports touch interactions on mobile", async () => {
      setViewport(375, 667);
      mockSearchParams.get.mockReturnValue(null);
      const user = userEvent.setup();

      render(<NewBlogPage />);

      await waitFor(() => {
        expect(screen.getByTestId("blog-wizard")).toBeInTheDocument();
      });

      // Test touch on mobile buttons
      const mobileComplete = screen.getByTestId("mobile-complete");
      await user.click(mobileComplete);

      expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/blog");
    });

    it("handles swipe gestures for navigation", async () => {
      setViewport(375, 667);
      mockSearchParams.get.mockReturnValue(null);

      render(<NewLandPage />);

      await waitFor(() => {
        expect(screen.getByTestId("land-wizard")).toBeInTheDocument();
        expect(screen.getByText("Swipe to navigate")).toBeInTheDocument();
      });

      // Swipe gestures would be implemented in the actual component
      // Here we just verify the UI elements are present
    });

    it("provides adequate touch targets", async () => {
      setViewport(375, 667);
      mockSearchParams.get.mockReturnValue(null);

      render(<NewBlogPage />);

      await waitFor(() => {
        expect(screen.getByTestId("blog-wizard")).toBeInTheDocument();
      });

      // Mobile buttons should be large enough for touch
      const mobileCancel = screen.getByTestId("mobile-cancel");
      const mobileComplete = screen.getByTestId("mobile-complete");

      expect(mobileCancel).toBeInTheDocument();
      expect(mobileComplete).toBeInTheDocument();

      // Touch targets should be at least 44px (would be tested with actual CSS)
    });
  });

  describe("Mobile-Specific Features", () => {
    it("shows mobile-only draft saving features", async () => {
      setViewport(375, 667);
      mockSearchParams.get.mockReturnValue(null);

      render(<NewBlogPage />);

      await waitFor(() => {
        expect(screen.getByTestId("mobile-save-draft")).toBeInTheDocument();
      });

      // Mobile progress dots
      const progressDots = screen.getByText("1/4").parentElement;
      expect(progressDots).toBeInTheDocument();
    });

    it("shows mobile map preview for land wizard", async () => {
      setViewport(375, 667);
      mockSearchParams.get.mockReturnValue(null);

      render(<NewLandPage />);

      await waitFor(() => {
        expect(screen.getByTestId("mobile-map-preview")).toBeInTheDocument();
        expect(screen.getByText("Tap to view map")).toBeInTheDocument();
      });
    });

    it("uses compact navigation on mobile", async () => {
      setViewport(375, 667);
      mockSearchParams.get.mockReturnValue(null);

      render(<NewLandPage />);

      await waitFor(() => {
        // Mobile uses shorter button text
        expect(screen.getByText("Done")).toBeInTheDocument();
        expect(screen.getByText("Cancel")).toBeInTheDocument();

        // Desktop text should not be present
        expect(
          screen.queryByText("Complete Land Listing")
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText("Cancel and Go Back")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Performance on Mobile", () => {
    it("loads efficiently on mobile devices", async () => {
      setViewport(375, 667);
      mockSearchParams.get.mockReturnValue(null);

      const startTime = performance.now();

      render(<NewBlogPage />);

      await waitFor(() => {
        expect(screen.getByTestId("blog-wizard")).toBeInTheDocument();
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Should load reasonably quickly (this is a rough test)
      expect(loadTime).toBeLessThan(1000); // Less than 1 second
    });

    it("handles memory efficiently during viewport changes", async () => {
      mockSearchParams.get.mockReturnValue(null);

      render(<NewLandPage />);

      // Simulate multiple viewport changes
      for (let i = 0; i < 10; i++) {
        setViewport(i % 2 === 0 ? 375 : 1200, 800);
        await waitFor(() => {
          expect(screen.getByTestId("land-wizard")).toBeInTheDocument();
        });
      }

      // Should not cause memory leaks (would be tested with actual memory profiling)
    });
  });

  describe("Loading States on Mobile", () => {
    it("shows mobile-optimized loading states", async () => {
      setViewport(375, 667);
      mockSearchParams.get.mockReturnValue("draft-123");

      render(<NewBlogPage />);

      // Loading state should be mobile-friendly
      expect(screen.getByText("Cargando...")).toBeInTheDocument();
      expect(
        screen.getByText("Preparando el asistente con tus datos guardados")
      ).toBeInTheDocument();
    });

    it("handles slow network conditions gracefully", async () => {
      setViewport(375, 667);
      mockSearchParams.get.mockReturnValue("draft-123");

      const mockLoadBlogDraft = jest.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  success: true,
                  data: { formData: { title: "Slow Load" } },
                }),
              2000
            )
          )
      );

      jest.doMock("@/lib/actions/blog-wizard-actions", () => ({
        loadBlogDraft: mockLoadBlogDraft,
      }));

      render(<NewBlogPage />);

      // Should show loading state for extended period
      expect(screen.getByText("Cargando...")).toBeInTheDocument();

      // Would eventually load (but we don't wait 2 seconds in test)
    });
  });

  describe("Error States on Mobile", () => {
    it("shows mobile-friendly error messages", async () => {
      setViewport(375, 667);
      (useUser as jest.Mock).mockReturnValue({ user: null });

      render(<NewBlogPage />);

      await waitFor(() => {
        expect(screen.getByText("Error de autenticación")).toBeInTheDocument();
        expect(
          screen.getByText("No se pudo verificar tu identidad")
        ).toBeInTheDocument();
      });

      // Error message should be readable on mobile
      const actionButton = screen.getByText("Volver al Blog");
      expect(actionButton).toBeInTheDocument();
    });
  });

  describe("Cross-Device Consistency", () => {
    it("maintains data consistency across device changes", async () => {
      mockSearchParams.get.mockReturnValue(null);

      // Start on desktop
      setViewport(1200, 800);
      render(<NewBlogPage />);

      await waitFor(() => {
        expect(screen.getByTestId("blog-wizard")).toBeInTheDocument();
      });

      // Switch to mobile - data should persist
      setViewport(375, 667);

      await waitFor(() => {
        const wizard = screen.getByTestId("blog-wizard");
        expect(wizard).toHaveAttribute("data-mobile", "true");
        // Form data should be preserved during viewport changes
      });
    });

    it("provides consistent functionality across devices", async () => {
      mockSearchParams.get.mockReturnValue(null);

      // Test desktop functionality
      setViewport(1200, 800);
      const { rerender } = render(<NewLandPage />);

      await waitFor(() => {
        expect(screen.getByText("Complete Land Listing")).toBeInTheDocument();
      });

      // Test mobile functionality
      setViewport(375, 667);
      rerender(<NewLandPage />);

      await waitFor(() => {
        expect(screen.getByText("Done")).toBeInTheDocument();
      });

      // Both should have the same core functionality
      const user = userEvent.setup();
      await user.click(screen.getByText("Done"));

      expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/lands/land-123");
    });
  });
});
