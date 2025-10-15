import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/presentation/hooks/use-user";
import NewBlogPage from "../page";
import { toast } from "sonner";

// Mock dependencies
jest.mock("next/navigation");
jest.mock("@/presentation/hooks/use-user");
jest.mock("sonner");
jest.mock("@/lib/actions/blog-wizard-actions");
jest.mock("@/components/wizard/blog/blog-wizard", () => ({
  BlogWizard: ({ onComplete, onUpdate, onCancel }: any) => (
    <div data-testid="blog-wizard">
      <button onClick={() => onComplete({ title: "Test Blog" })}>
        Complete
      </button>
      <button onClick={() => onUpdate({ title: "Draft Update" })}>
        Update
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
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

describe("NewBlogPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    (useUser as jest.Mock).mockReturnValue({ user: mockUser });
    (toast.success as jest.Mock).mockImplementation(() => {});
    (toast.error as jest.Mock).mockImplementation(() => {});
  });

  describe("Basic Rendering", () => {
    it("renders new blog page without draft", async () => {
      mockSearchParams.get.mockReturnValue(null);

      render(<NewBlogPage />);

      await waitFor(() => {
        expect(screen.getByText("Nuevo Artículo")).toBeInTheDocument();
        expect(
          screen.getByText(
            "Crea un nuevo artículo usando el asistente inteligente"
          )
        ).toBeInTheDocument();
        expect(screen.getByTestId("blog-wizard")).toBeInTheDocument();
      });
    });

    it("renders loading state when loading draft", async () => {
      mockSearchParams.get.mockReturnValue("draft-123");

      render(<NewBlogPage />);

      expect(screen.getByText("Cargando...")).toBeInTheDocument();
      expect(
        screen.getByText("Preparando el asistente con tus datos guardados")
      ).toBeInTheDocument();
    });

    it("renders error state when user is not authenticated", async () => {
      (useUser as jest.Mock).mockReturnValue({ user: null });

      render(<NewBlogPage />);

      await waitFor(() => {
        expect(screen.getByText("Error de autenticación")).toBeInTheDocument();
        expect(
          screen.getByText("No se pudo verificar tu identidad")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Draft Loading", () => {
    it("loads draft successfully", async () => {
      mockSearchParams.get.mockReturnValue("draft-123");

      const mockLoadBlogDraft = jest.fn().mockResolvedValue({
        success: true,
        data: {
          formData: {
            title: "Draft Title",
            content: "Draft content",
          },
        },
      });

      jest.doMock("@/lib/actions/blog-wizard-actions", () => ({
        loadBlogDraft: mockLoadBlogDraft,
      }));

      render(<NewBlogPage />);

      await waitFor(() => {
        expect(mockLoadBlogDraft).toHaveBeenCalledWith({
          draftId: "draft-123",
          userId: "user-123",
        });
        expect(toast.success).toHaveBeenCalledWith(
          "Borrador cargado exitosamente"
        );
        expect(screen.getByText("Continuar Borrador")).toBeInTheDocument();
      });
    });

    it("handles draft loading failure", async () => {
      mockSearchParams.get.mockReturnValue("draft-123");

      const mockLoadBlogDraft = jest.fn().mockResolvedValue({
        success: false,
        message: "Draft not found",
      });

      jest.doMock("@/lib/actions/blog-wizard-actions", () => ({
        loadBlogDraft: mockLoadBlogDraft,
      }));

      render(<NewBlogPage />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Draft not found");
        expect(mockRouter.replace).toHaveBeenCalledWith("/dashboard/blog/new");
      });
    });

    it("handles draft loading error", async () => {
      mockSearchParams.get.mockReturnValue("draft-123");

      const mockLoadBlogDraft = jest
        .fn()
        .mockRejectedValue(new Error("Network error"));

      jest.doMock("@/lib/actions/blog-wizard-actions", () => ({
        loadBlogDraft: mockLoadBlogDraft,
      }));

      render(<NewBlogPage />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Error inesperado al cargar el borrador"
        );
        expect(mockRouter.replace).toHaveBeenCalledWith("/dashboard/blog/new");
      });
    });
  });

  describe("Wizard Interactions", () => {
    it("handles wizard completion", async () => {
      mockSearchParams.get.mockReturnValue(null);

      render(<NewBlogPage />);

      await waitFor(() => {
        expect(screen.getByTestId("blog-wizard")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Complete"));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "¡Artículo creado exitosamente!"
        );
        expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/blog");
      });
    });

    it("handles wizard update", async () => {
      mockSearchParams.get.mockReturnValue(null);
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      render(<NewBlogPage />);

      await waitFor(() => {
        expect(screen.getByTestId("blog-wizard")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Update"));

      expect(consoleSpy).toHaveBeenCalledWith("Blog data updated:", {
        title: "Draft Update",
      });

      consoleSpy.mockRestore();
    });

    it("handles wizard cancellation", async () => {
      mockSearchParams.get.mockReturnValue(null);

      render(<NewBlogPage />);

      await waitFor(() => {
        expect(screen.getByTestId("blog-wizard")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Cancel"));

      expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/blog");
    });
  });

  describe("Breadcrumbs", () => {
    it("generates correct breadcrumbs for new blog", async () => {
      mockSearchParams.get.mockReturnValue(null);

      render(<NewBlogPage />);

      await waitFor(() => {
        // Breadcrumbs should be generated for blog creation
        expect(screen.getByText("Nuevo Artículo")).toBeInTheDocument();
      });
    });

    it("generates correct breadcrumbs for draft continuation", async () => {
      mockSearchParams.get.mockReturnValue("draft-123");

      const mockLoadBlogDraft = jest.fn().mockResolvedValue({
        success: true,
        data: {
          formData: {
            title: "Draft Title",
          },
        },
      });

      jest.doMock("@/lib/actions/blog-wizard-actions", () => ({
        loadBlogDraft: mockLoadBlogDraft,
      }));

      render(<NewBlogPage />);

      await waitFor(() => {
        expect(screen.getByText("Continuar Borrador")).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("handles wizard completion error", async () => {
      mockSearchParams.get.mockReturnValue(null);
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // Mock the completion handler to throw an error
      jest.doMock("@/components/wizard/blog/blog-wizard", () => ({
        BlogWizard: ({ onComplete }: any) => (
          <div data-testid="blog-wizard">
            <button
              onClick={() => {
                throw new Error("Completion error");
              }}
            >
              Complete with Error
            </button>
          </div>
        ),
      }));

      render(<NewBlogPage />);

      await waitFor(() => {
        expect(screen.getByTestId("blog-wizard")).toBeInTheDocument();
      });

      // This would be caught by error boundary in real scenario
      expect(() => {
        fireEvent.click(screen.getByText("Complete with Error"));
      }).toThrow("Completion error");

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels and roles", async () => {
      mockSearchParams.get.mockReturnValue(null);

      render(<NewBlogPage />);

      await waitFor(() => {
        // Check for proper semantic structure
        expect(screen.getByRole("main")).toBeInTheDocument();
      });
    });

    it("supports keyboard navigation", async () => {
      mockSearchParams.get.mockReturnValue(null);

      render(<NewBlogPage />);

      await waitFor(() => {
        const wizard = screen.getByTestId("blog-wizard");
        expect(wizard).toBeInTheDocument();

        // Check that buttons are focusable
        const completeButton = screen.getByText("Complete");
        expect(completeButton).toBeVisible();
        completeButton.focus();
        expect(completeButton).toHaveFocus();
      });
    });
  });

  describe("Responsive Behavior", () => {
    it("renders properly on mobile", async () => {
      // Mock mobile viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      mockSearchParams.get.mockReturnValue(null);

      render(<NewBlogPage />);

      await waitFor(() => {
        const container = screen.getByTestId("blog-wizard").parentElement;
        expect(container).toHaveClass("max-w-6xl", "mx-auto");
      });
    });

    it("renders properly on desktop", async () => {
      // Mock desktop viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1920,
      });

      mockSearchParams.get.mockReturnValue(null);

      render(<NewBlogPage />);

      await waitFor(() => {
        const container = screen.getByTestId("blog-wizard").parentElement;
        expect(container).toHaveClass("max-w-6xl", "mx-auto");
      });
    });
  });
});
