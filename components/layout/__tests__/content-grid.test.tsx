import React from "react";
import { render, screen } from "@testing-library/react";
import { ContentGrid } from "../content-grid";

// Mock dependencies
jest.mock("@/hooks/use-responsive", () => ({
  useResponsive: jest.fn(() => ({
    isMobile: false,
    isTablet: false,
    isMobileOrTablet: false,
  })),
}));

const { useResponsive } = require("@/hooks/use-responsive");

describe("ContentGrid", () => {
  const defaultProps = {
    children: <div>Test Content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to default responsive state
    useResponsive.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isMobileOrTablet: false,
    });
  });

  describe("Basic Rendering", () => {
    it("renders children content", () => {
      render(<ContentGrid {...defaultProps} />);

      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });

    it("applies custom className when provided", () => {
      const { container } = render(
        <ContentGrid {...defaultProps} className="custom-grid-class" />
      );

      expect(container.firstChild).toHaveClass("custom-grid-class");
    });
  });

  describe("Layout Variants", () => {
    it("renders single column layout by default", () => {
      const { container } = render(<ContentGrid {...defaultProps} />);

      expect(container.firstChild).toHaveClass("space-y-6");
    });

    it("renders single column layout when explicitly set", () => {
      const { container } = render(
        <ContentGrid {...defaultProps} layout="single" />
      );

      expect(container.firstChild).toHaveClass("space-y-6");
    });

    it("renders two-column layout without sidebar", () => {
      const { container } = render(
        <ContentGrid {...defaultProps} layout="two-column" />
      );

      expect(container.firstChild).toHaveClass(
        "grid",
        "grid-cols-1",
        "md:grid-cols-2"
      );
    });

    it("renders three-column layout", () => {
      const { container } = render(
        <ContentGrid {...defaultProps} layout="three-column" />
      );

      expect(container.firstChild).toHaveClass(
        "grid",
        "grid-cols-1",
        "sm:grid-cols-2",
        "lg:grid-cols-3"
      );
    });

    it("renders grid layout", () => {
      const { container } = render(
        <ContentGrid {...defaultProps} layout="grid" />
      );

      expect(container.firstChild).toHaveClass(
        "grid",
        "grid-cols-1",
        "sm:grid-cols-2",
        "md:grid-cols-3",
        "lg:grid-cols-4",
        "xl:grid-cols-5"
      );
    });
  });

  describe("Sidebar Integration", () => {
    const sidebar = <div>Test Sidebar</div>;

    it("renders sidebar when provided with single layout", () => {
      render(
        <ContentGrid {...defaultProps} layout="single" sidebar={sidebar} />
      );

      expect(screen.getByText("Test Content")).toBeInTheDocument();
      expect(screen.getByText("Test Sidebar")).toBeInTheDocument();
    });

    it("renders sidebar when provided with two-column layout", () => {
      render(
        <ContentGrid {...defaultProps} layout="two-column" sidebar={sidebar} />
      );

      expect(screen.getByText("Test Content")).toBeInTheDocument();
      expect(screen.getByText("Test Sidebar")).toBeInTheDocument();
    });

    it("applies correct grid column classes with sidebar", () => {
      const { container } = render(
        <ContentGrid {...defaultProps} layout="single" sidebar={sidebar} />
      );

      const gridContainer = container.firstChild;
      expect(gridContainer).toHaveClass(
        "grid",
        "grid-cols-1",
        "lg:grid-cols-4"
      );

      // Check main content area
      const mainContent = container.querySelector(".lg\\:col-span-3");
      expect(mainContent).toBeInTheDocument();

      // Check sidebar area
      const sidebarArea = container.querySelector(".lg\\:col-span-1");
      expect(sidebarArea).toBeInTheDocument();
    });
  });

  describe("Responsive Behavior", () => {
    it("applies mobile spacing when on mobile", () => {
      useResponsive.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isMobileOrTablet: true,
      });

      const { container } = render(<ContentGrid {...defaultProps} />);

      expect(container.firstChild).toHaveClass("space-y-3");
    });

    it("applies tablet spacing when on tablet", () => {
      useResponsive.mockReturnValue({
        isMobile: false,
        isTablet: true,
        isMobileOrTablet: true,
      });

      const { container } = render(<ContentGrid {...defaultProps} />);

      expect(container.firstChild).toHaveClass("space-y-4");
    });

    it("applies desktop spacing when on desktop", () => {
      useResponsive.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isMobileOrTablet: false,
      });

      const { container } = render(<ContentGrid {...defaultProps} />);

      expect(container.firstChild).toHaveClass("space-y-6");
    });

    it("applies mobile gap classes in grid layouts", () => {
      useResponsive.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isMobileOrTablet: true,
      });

      const { container } = render(
        <ContentGrid {...defaultProps} layout="grid" />
      );

      expect(container.firstChild).toHaveClass("gap-3");
    });

    it("applies tablet gap classes in grid layouts", () => {
      useResponsive.mockReturnValue({
        isMobile: false,
        isTablet: true,
        isMobileOrTablet: true,
      });

      const { container } = render(
        <ContentGrid {...defaultProps} layout="grid" />
      );

      expect(container.firstChild).toHaveClass("gap-4");
    });

    it("applies desktop gap classes in grid layouts", () => {
      useResponsive.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isMobileOrTablet: false,
      });

      const { container } = render(
        <ContentGrid {...defaultProps} layout="grid" />
      );

      expect(container.firstChild).toHaveClass("gap-6");
    });
  });

  describe("Sidebar Responsive Behavior", () => {
    const sidebar = <div>Test Sidebar</div>;

    it("reorders sidebar on mobile/tablet", () => {
      useResponsive.mockReturnValue({
        isMobile: false,
        isTablet: true,
        isMobileOrTablet: true,
      });

      const { container } = render(
        <ContentGrid {...defaultProps} sidebar={sidebar} />
      );

      const sidebarArea = container.querySelector(".lg\\:col-span-1");
      expect(sidebarArea).toHaveClass(
        "order-last",
        "mt-4",
        "lg:mt-0",
        "lg:order-none"
      );
    });

    it("does not apply sticky positioning on mobile/tablet", () => {
      useResponsive.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isMobileOrTablet: true,
      });

      const { container } = render(
        <ContentGrid {...defaultProps} sidebar={sidebar} />
      );

      const stickyContainer = container.querySelector(".sticky");
      expect(stickyContainer).not.toBeInTheDocument();
    });

    it("applies sticky positioning on desktop", () => {
      useResponsive.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isMobileOrTablet: false,
      });

      const { container } = render(
        <ContentGrid {...defaultProps} sidebar={sidebar} />
      );

      const stickyContainer = container.querySelector(".sticky");
      expect(stickyContainer).toBeInTheDocument();
      expect(stickyContainer).toHaveClass("top-6");
    });
  });
});
