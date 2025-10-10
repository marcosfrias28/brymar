import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";
import { BlogContentStep } from "../steps/blog-content-step";
import { BlogWizardData } from "@/lib/schemas/blog-wizard-schemas";

// Mock the actions
jest.mock("@/lib/actions/blog-wizard-actions", () => ({
  generateBlogContent: jest.fn(),
}));

// Mock toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const TestWrapper = ({
  children,
  defaultValues = {},
}: {
  children: React.ReactNode;
  defaultValues?: Partial<BlogWizardData>;
}) => {
  const methods = useForm<BlogWizardData>({
    defaultValues: {
      title: "",
      content: "",
      author: "",
      category: "property-news",
      excerpt: "",
      ...defaultValues,
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("BlogContentStep", () => {
  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all form fields", () => {
    render(
      <TestWrapper>
        <BlogContentStep data={{}} onUpdate={mockOnUpdate} />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/autor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/categoría/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/extracto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contenido/i)).toBeInTheDocument();
  });

  it("displays word count and reading time", () => {
    const initialData = {
      content:
        "This is a test content with multiple words to test the word count functionality.",
    };

    render(
      <TestWrapper defaultValues={initialData}>
        <BlogContentStep data={initialData} onUpdate={mockOnUpdate} />
      </TestWrapper>
    );

    // Should display word count badge
    expect(screen.getByText(/palabras/)).toBeInTheDocument();
    expect(screen.getByText(/min lectura/)).toBeInTheDocument();
  });

  it("calls onUpdate when fields change", async () => {
    render(
      <TestWrapper>
        <BlogContentStep data={{}} onUpdate={mockOnUpdate} />
      </TestWrapper>
    );

    const titleInput = screen.getByLabelText(/título/i);
    fireEvent.change(titleInput, { target: { value: "New Title" } });

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({ title: "New Title" });
    });
  });

  it("shows generate content buttons", () => {
    render(
      <TestWrapper>
        <BlogContentStep data={{}} onUpdate={mockOnUpdate} />
      </TestWrapper>
    );

    // Should show generate buttons for title, content, and excerpt
    const generateButtons = screen.getAllByText("Generar");
    expect(generateButtons.length).toBeGreaterThan(0);
  });

  it("handles AI content generation", async () => {
    const mockGenerateContent =
      require("@/lib/actions/blog-wizard-actions").generateBlogContent;
    mockGenerateContent.mockResolvedValue({
      success: true,
      data: { content: "Generated content" },
    });

    render(
      <TestWrapper defaultValues={{ title: "Test Title" }}>
        <BlogContentStep
          data={{ title: "Test Title" }}
          onUpdate={mockOnUpdate}
        />
      </TestWrapper>
    );

    // Find and click a generate button (for content)
    const contentSection = screen.getByLabelText(/contenido/i).closest("div");
    const generateButton = contentSection?.querySelector("button");

    if (generateButton) {
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockGenerateContent).toHaveBeenCalledWith({
          title: "Test Title",
          category: "property-news",
          contentType: "content",
        });
      });
    }
  });

  it("toggles between edit and preview mode", async () => {
    const initialData = {
      content: "This is test content for preview mode.",
    };

    render(
      <TestWrapper defaultValues={initialData}>
        <BlogContentStep data={initialData} onUpdate={mockOnUpdate} />
      </TestWrapper>
    );

    // Find the preview toggle button
    const previewButton = screen.getByText(/vista previa/i);
    fireEvent.click(previewButton);

    // Should switch to preview mode
    await waitFor(() => {
      expect(screen.getByText(/editar/i)).toBeInTheDocument();
    });
  });

  it("validates required fields", () => {
    render(
      <TestWrapper>
        <BlogContentStep data={{}} onUpdate={mockOnUpdate} />
      </TestWrapper>
    );

    // Required fields should have proper validation attributes
    const titleInput = screen.getByLabelText(/título/i);
    const authorInput = screen.getByLabelText(/autor/i);
    const contentInput = screen.getByLabelText(/contenido/i);

    expect(titleInput).toBeRequired();
    expect(authorInput).toBeRequired();
    expect(contentInput).toBeRequired();
  });

  it("displays category options", async () => {
    render(
      <TestWrapper>
        <BlogContentStep data={{}} onUpdate={mockOnUpdate} />
      </TestWrapper>
    );

    // Find and click the category select
    const categorySelect = screen.getByRole("combobox");
    fireEvent.click(categorySelect);

    // Should show category options
    await waitFor(() => {
      expect(screen.getByText("Análisis de Mercado")).toBeInTheDocument();
      expect(screen.getByText("Consejos de Inversión")).toBeInTheDocument();
      expect(screen.getByText("Noticias Inmobiliarias")).toBeInTheDocument();
    });
  });

  it("handles errors in AI generation gracefully", async () => {
    const mockGenerateContent =
      require("@/lib/actions/blog-wizard-actions").generateBlogContent;
    mockGenerateContent.mockRejectedValue(new Error("Generation failed"));

    const { toast } = require("sonner");

    render(
      <TestWrapper defaultValues={{ title: "Test Title" }}>
        <BlogContentStep
          data={{ title: "Test Title" }}
          onUpdate={mockOnUpdate}
        />
      </TestWrapper>
    );

    // Trigger AI generation that will fail
    const generateButtons = screen.getAllByText("Generar");
    if (generateButtons.length > 0) {
      fireEvent.click(generateButtons[0]);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Error al generar contenido");
      });
    }
  });
});
