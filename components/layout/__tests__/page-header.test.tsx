import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PageHeader } from "../page-header";
import { BreadcrumbItem } from "@/types/layout";

// Mock dependencies
jest.mock("@/lib/utils/animations", () => ({
  formAnimations: {
    input: "form-input-animation",
  },
  hoverAnimations: {
    gentle: "hover-animation",
  },
}));

jest.mock("@/components/ui/breadcrumb", () => ({
  Breadcrumb: ({ items }: any) => (
    <nav data-testid="breadcrumb">
      {items.map((item: any, index: number) => (
        <span key={index}>{item.label}</span>
      ))}
    </nav>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));

describe("PageHeader", () => {
  const defaultProps = {
    title: "Test Page Title",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders with required title prop", () => {
      render(<PageHeader {...defaultProps} />);

      expect(screen.getByText("Test Page Title")).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("renders description when provided", () => {
      render(
        <PageHeader
          {...defaultProps}
          description="This is a test description"
        />
      );

      expect(
        screen.getByText("This is a test description")
      ).toBeInTheDocument();
    });

    it("does not render description when not provided", () => {
      render(<PageHeader {...defaultProps} />);

      expect(
        screen.queryByText("This is a test description")
      ).not.toBeInTheDocument();
    });
  });

  describe("Breadcrumbs", () => {
    it("renders breadcrumbs when provided", () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { label: "Home", href: "/" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "Current Page" },
      ];

      render(<PageHeader {...defaultProps} breadcrumbs={breadcrumbs} />);

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Current Page")).toBeInTheDocument();
    });

    it("does not render breadcrumbs when not provided", () => {
      render(<PageHeader {...defaultProps} />);

      // Should not find breadcrumb navigation
      expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    });

    it("does not render breadcrumbs when empty array provided", () => {
      render(<PageHeader {...defaultProps} breadcrumbs={[]} />);

      expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("renders search input when showSearch is true", () => {
      render(<PageHeader {...defaultProps} showSearch={true} />);

      const searchInput = screen.getByPlaceholderText("Buscar...");
      expect(searchInput).toBeInTheDocument();
    });

    it("uses custom search placeholder when provided", () => {
      render(
        <PageHeader
          {...defaultProps}
          showSearch={true}
          searchPlaceholder="Search properties..."
        />
      );

      expect(
        screen.getByPlaceholderText("Search properties...")
      ).toBeInTheDocument();
    });

    it("does not render search input when showSearch is false", () => {
      render(<PageHeader {...defaultProps} showSearch={false} />);

      expect(
        screen.queryByPlaceholderText("Buscar...")
      ).not.toBeInTheDocument();
    });

    it("renders search icon with search input", () => {
      render(<PageHeader {...defaultProps} showSearch={true} />);

      // Check for search icon (lucide-react Search component)
      const searchIcon = document.querySelector("svg");
      expect(searchIcon).toBeInTheDocument();
    });
  });

  describe("Actions", () => {
    it("renders actions when provided", () => {
      const actions = (
        <div>
          <button type="button">Edit</button>
          <button type="button">Delete</button>
        </div>
      );

      render(<PageHeader {...defaultProps} actions={actions} />);

      expect(screen.getByText("Edit")).toBeInTheDocument();
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    it("does not render actions section when not provided", () => {
      render(<PageHeader {...defaultProps} />);

      expect(screen.queryByText("Edit")).not.toBeInTheDocument();
      expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });
  });

  describe("CSS Classes and Styling", () => {
    it("applies custom className when provided", () => {
      const { container } = render(
        <PageHeader {...defaultProps} className="custom-header-class" />
      );

      expect(container.firstChild).toHaveClass("custom-header-class");
    });

    it("applies correct typography classes to title", () => {
      render(<PageHeader {...defaultProps} />);

      const title = screen.getByRole("heading", { level: 1 });
      expect(title).toHaveClass("text-3xl", "font-bold", "font-serif");
    });

    it("applies correct styling to description", () => {
      render(<PageHeader {...defaultProps} description="Test description" />);

      const description = screen.getByText("Test description");
      expect(description).toHaveClass("text-muted-foreground");
    });
  });

  describe("Responsive Layout", () => {
    it("has responsive flex layout classes", () => {
      const { container } = render(<PageHeader {...defaultProps} />);

      const headerContent = container.querySelector(".flex.flex-col.gap-4");
      expect(headerContent).toBeInTheDocument();
      expect(headerContent).toHaveClass(
        "sm:flex-row",
        "sm:items-start",
        "sm:justify-between"
      );
    });

    it("has responsive search input width", () => {
      render(<PageHeader {...defaultProps} showSearch={true} />);

      const searchInput = screen.getByPlaceholderText("Buscar...");
      expect(searchInput).toHaveClass("w-full", "sm:w-64");
    });
  });

  describe("Animation Classes", () => {
    it("applies animation classes to elements", () => {
      render(<PageHeader {...defaultProps} description="Test description" />);

      const title = screen.getByRole("heading", { level: 1 });
      expect(title.parentElement).toHaveClass("animate-fade-in");
    });
  });
});
