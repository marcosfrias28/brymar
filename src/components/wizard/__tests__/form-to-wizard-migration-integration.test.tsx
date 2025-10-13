import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from '@/hooks/use-user';
import { toast } from "sonner";

// Import the actual page components
import NewBlogPage from "@/app/(dashboard)/dashboard/blog/new/page";
import NewLandPage from "@/app/(dashboard)/dashboard/lands/new/page";

// Mock all dependencies
jest.mock("next/navigation");
jest.mock("@/hooks/use-user");
jest.mock("sonner");
jest.mock("@/lib/actions/blog-wizard-actions");
jest.mock("@/lib/actions/land-wizard-actions");

// Mock wizard components with more realistic behavior
jest.mock("@/components/wizard/blog/blog-wizard", () => ({
  BlogWizard: ({ initialData, onComplete, onUpdate, onCancel }: any) => {
    const [currentStep, setCurrentStep] = React.useState(1);
    const [formData, setFormData] = React.useState(initialData || {});

    return (
      <div data-testid="blog-wizard" data-current-step={currentStep}>
        <div data-testid="wizard-progress">Step {currentStep} of 4</div>

        <div data-testid="wizard-content">
          {currentStep === 1 && (
            <div data-testid="step-basic-info">
              <input
                data-testid="blog-title"
                placeholder="Blog Title"
                value={formData.title || ""}
                onChange={(e) => {
                  const newData = { ...formData, title: e.target.value };
                  setFormData(newData);
                  onUpdate(newData);
                }}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div data-testid="step-content">
              <textarea
                data-testid="blog-content"
                placeholder="Blog Content"
                value={formData.content || ""}
                onChange={(e) => {
                  const newData = { ...formData, content: e.target.value };
                  setFormData(newData);
                  onUpdate(newData);
                }}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div data-testid="step-seo">
              <input
                data-testid="blog-meta-description"
                placeholder="Meta Description"
                value={formData.metaDescription || ""}
                onChange={(e) => {
                  const newData = {
                    ...formData,
                    metaDescription: e.target.value,
                  };
                  setFormData(newData);
                  onUpdate(newData);
                }}
              />
            </div>
          )}

          {currentStep === 4 && (
            <div data-testid="step-review">
              <div>Review: {formData.title}</div>
              <div>Content: {formData.content}</div>
            </div>
          )}
        </div>

        <div data-testid="wizard-navigation">
          {currentStep > 1 && (
            <button
              data-testid="prev-step"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Previous
            </button>
          )}

          {currentStep < 4 && (
            <button
              data-testid="next-step"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Next
            </button>
          )}

          {currentStep === 4 && (
            <button
              data-testid="complete-wizard"
              onClick={() => onComplete(formData)}
            >
              Complete
            </button>
          )}

          <button data-testid="cancel-wizard" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    );
  },
}));

jest.mock("@/components/wizard/land/land-wizard", () => ({
  LandWizard: ({ initialData, onComplete, onCancel }: any) => {
    const [currentStep, setCurrentStep] = React.useState(1);
    const [formData, setFormData] = React.useState(initialData || {});

    return (
      <div data-testid="land-wizard" data-current-step={currentStep}>
        <div data-testid="wizard-progress">Step {currentStep} of 4</div>

        <div data-testid="wizard-content">
          {currentStep === 1 && (
            <div data-testid="step-basic-info">
              <input
                data-testid="land-title"
                placeholder="Land Title"
                value={formData.title || ""}
                onChange={(e) => {
                  const newData = { ...formData, title: e.target.value };
                  setFormData(newData);
                }}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div data-testid="step-details">
              <input
                data-testid="land-area"
                placeholder="Area (m²)"
                type="number"
                value={formData.area || ""}
                onChange={(e) => {
                  const newData = { ...formData, area: e.target.value };
                  setFormData(newData);
                }}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div data-testid="step-location">
              <input
                data-testid="land-location"
                placeholder="Location"
                value={formData.location || ""}
                onChange={(e) => {
                  const newData = { ...formData, location: e.target.value };
                  setFormData(newData);
                }}
              />
            </div>
          )}

          {currentStep === 4 && (
            <div data-testid="step-review">
              <div>Review: {formData.title}</div>
              <div>Area: {formData.area} m²</div>
              <div>Location: {formData.location}</div>
            </div>
          )}
        </div>

        <div data-testid="wizard-navigation">
          {currentStep > 1 && (
            <button
              data-testid="prev-step"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Previous
            </button>
          )}

          {currentStep < 4 && (
            <button
              data-testid="next-step"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Next
            </button>
          )}

          {currentStep === 4 && (
            <button
              data-testid="complete-wizard"
              onClick={() => onComplete("land-123")}
            >
              Complete
            </button>
          )}

          <button data-testid="cancel-wizard" onClick={onCancel}>
            Cancel
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

describe("Form to Wizard Migration - Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    (useUser as jest.Mock).mockReturnValue({ user: mockUser });
    (toast.success as jest.Mock).mockImplementation(() => {});
    (toast.error as jest.Mock).mockImplementation(() => {});
  });

  describe("Blog Wizard Complete Workflow", () => {
    it("completes full blog creation workflow", async () => {
      mockSearchParams.get.mockReturnValue(null);
      const user = userEvent.setup();

      render(<NewBlogPage />);

      // Wait for wizard to load
      await waitFor(() => {
        expect(screen.getByTestId("blog-wizard")).toBeInTheDocument();
      });

      // Step 1: Basic Info
      expect(screen.getByTestId("step-basic-info")).toBeInTheDocument();
      expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();

      await user.type(screen.getByTestId("blog-title"), "My Test Blog Post");
      await user.click(screen.getByTestId("next-step"));

      // Step 2: Content
      await waitFor(() => {
        expect(screen.getByTestId("step-content")).toBeInTheDocument();
        expect(screen.getByText("Step 2 of 4")).toBeInTheDocument();
      });

      await user.type(
        screen.getByTestId("blog-content"),
        "This is the content of my blog post."
      );
      await user.click(screen.getByTestId("next-step"));

      // Step 3: SEO
      await waitFor(() => {
        expect(screen.getByTestId("step-seo")).toBeInTheDocument();
        expect(screen.getByText("Step 3 of 4")).toBeInTheDocument();
      });

      await user.type(
        screen.getByTestId("blog-meta-description"),
        "This is a test blog post"
      );
      await user.click(screen.getByTestId("next-step"));

      // Step 4: Review
      await waitFor(() => {
        expect(screen.getByTestId("step-review")).toBeInTheDocument();
        expect(screen.getByText("Step 4 of 4")).toBeInTheDocument();
        expect(
          screen.getByText("Review: My Test Blog Post")
        ).toBeInTheDocument();
      });

      // Complete the wizard
      await user.click(screen.getByTestId("complete-wizard"));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "¡Artículo creado exitosamente!"
        );
        expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/blog");
      });
    });

    it("handles blog wizard navigation back and forth", async () => {
      mockSearchParams.get.mockReturnValue(null);
      const user = userEvent.setup();

      render(<NewBlogPage />);

      await waitFor(() => {
        expect(screen.getByTestId("blog-wizard")).toBeInTheDocument();
      });

      // Go to step 2
      await user.click(screen.getByTestId("next-step"));
      expect(screen.getByText("Step 2 of 4")).toBeInTheDocument();

      // Go to step 3
      await user.click(screen.getByTestId("next-step"));
      expect(screen.getByText("Step 3 of 4")).toBeInTheDocument();

      // Go back to step 2
      await user.click(screen.getByTestId("prev-step"));
      expect(screen.getByText("Step 2 of 4")).toBeInTheDocument();

      // Go back to step 1
      await user.click(screen.getByTestId("prev-step"));
      expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
    });

    it("handles blog wizard cancellation", async () => {
      mockSearchParams.get.mockReturnValue(null);
      const user = userEvent.setup();

      render(<NewBlogPage />);

      await waitFor(() => {
        expect(screen.getByTestId("blog-wizard")).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("cancel-wizard"));

      expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/blog");
    });
  });

  describe("Land Wizard Complete Workflow", () => {
    it("completes full land creation workflow", async () => {
      mockSearchParams.get.mockReturnValue(null);
      const user = userEvent.setup();

      render(<NewLandPage />);

      // Wait for wizard to load
      await waitFor(() => {
        expect(screen.getByTestId("land-wizard")).toBeInTheDocument();
      });

      // Step 1: Basic Info
      expect(screen.getByTestId("step-basic-info")).toBeInTheDocument();
      expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();

      await user.type(screen.getByTestId("land-title"), "Prime Land Plot");
      await user.click(screen.getByTestId("next-step"));

      // Step 2: Details
      await waitFor(() => {
        expect(screen.getByTestId("step-details")).toBeInTheDocument();
        expect(screen.getByText("Step 2 of 4")).toBeInTheDocument();
      });

      await user.type(screen.getByTestId("land-area"), "5000");
      await user.click(screen.getByTestId("next-step"));

      // Step 3: Location
      await waitFor(() => {
        expect(screen.getByTestId("step-location")).toBeInTheDocument();
        expect(screen.getByText("Step 3 of 4")).toBeInTheDocument();
      });

      await user.type(screen.getByTestId("land-location"), "Downtown Area");
      await user.click(screen.getByTestId("next-step"));

      // Step 4: Review
      await waitFor(() => {
        expect(screen.getByTestId("step-review")).toBeInTheDocument();
        expect(screen.getByText("Step 4 of 4")).toBeInTheDocument();
        expect(screen.getByText("Review: Prime Land Plot")).toBeInTheDocument();
        expect(screen.getByText("Area: 5000 m²")).toBeInTheDocument();
      });

      // Complete the wizard
      await user.click(screen.getByTestId("complete-wizard"));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "¡Terreno creado exitosamente!"
        );
        expect(mockRouter.push).toHaveBeenCalledWith(
          "/dashboard/lands/land-123"
        );
      });
    });

    it("handles land wizard navigation back and forth", async () => {
      mockSearchParams.get.mockReturnValue(null);
      const user = userEvent.setup();

      render(<NewLandPage />);

      await waitFor(() => {
        expect(screen.getByTestId("land-wizard")).toBeInTheDocument();
      });

      // Go to step 2
      await user.click(screen.getByTestId("next-step"));
      expect(screen.getByText("Step 2 of 4")).toBeInTheDocument();

      // Go to step 3
      await user.click(screen.getByTestId("next-step"));
      expect(screen.getByText("Step 3 of 4")).toBeInTheDocument();

      // Go back to step 2
      await user.click(screen.getByTestId("prev-step"));
      expect(screen.getByText("Step 2 of 4")).toBeInTheDocument();

      // Go back to step 1
      await user.click(screen.getByTestId("prev-step"));
      expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
    });

    it("handles land wizard cancellation", async () => {
      mockSearchParams.get.mockReturnValue(null);
      const user = userEvent.setup();

      render(<NewLandPage />);

      await waitFor(() => {
        expect(screen.getByTestId("land-wizard")).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("cancel-wizard"));

      expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/lands");
    });
  });

  describe("Draft Loading and Saving", () => {
    it("loads blog draft and continues workflow", async () => {
      mockSearchParams.get.mockReturnValue("blog-draft-123");

      const mockLoadBlogDraft = jest.fn().mockResolvedValue({
        success: true,
        data: {
          formData: {
            title: "Draft Blog Title",
            content: "Draft content",
            metaDescription: "Draft meta",
          },
        },
      });

      jest.doMock("@/lib/actions/blog-wizard-actions", () => ({
        loadBlogDraft: mockLoadBlogDraft,
      }));

      const user = userEvent.setup();

      render(<NewBlogPage />);

      // Wait for draft to load
      await waitFor(() => {
        expect(mockLoadBlogDraft).toHaveBeenCalledWith({
          draftId: "blog-draft-123",
          userId: "user-123",
        });
        expect(screen.getByTestId("blog-wizard")).toBeInTheDocument();
      });

      // Verify draft data is loaded
      expect(screen.getByDisplayValue("Draft Blog Title")).toBeInTheDocument();

      // Continue with workflow
      await user.click(screen.getByTestId("next-step"));
      expect(screen.getByDisplayValue("Draft content")).toBeInTheDocument();
    });

    it("loads land draft and continues workflow", async () => {
      mockSearchParams.get.mockReturnValue("land-draft-123");

      const mockLoadLandDraft = jest.fn().mockResolvedValue({
        success: true,
        data: {
          formData: {
            title: "Draft Land Title",
            area: "3000",
            location: "Draft Location",
          },
        },
      });

      jest.doMock("@/lib/actions/land-wizard-actions", () => ({
        loadLandDraft: mockLoadLandDraft,
      }));

      const user = userEvent.setup();

      render(<NewLandPage />);

      // Wait for draft to load
      await waitFor(() => {
        expect(mockLoadLandDraft).toHaveBeenCalledWith({
          draftId: "land-draft-123",
          userId: "user-123",
        });
        expect(screen.getByTestId("land-wizard")).toBeInTheDocument();
      });

      // Verify draft data is loaded
      expect(screen.getByDisplayValue("Draft Land Title")).toBeInTheDocument();

      // Continue with workflow
      await user.click(screen.getByTestId("next-step"));
      expect(screen.getByDisplayValue("3000")).toBeInTheDocument();
    });
  });

  describe("Error Handling and Recovery", () => {
    it("handles network errors gracefully", async () => {
      mockSearchParams.get.mockReturnValue("invalid-draft");

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

    it("handles invalid draft gracefully", async () => {
      mockSearchParams.get.mockReturnValue("invalid-draft");

      const mockLoadLandDraft = jest.fn().mockResolvedValue({
        success: false,
        message: "Draft not found",
      });

      jest.doMock("@/lib/actions/land-wizard-actions", () => ({
        loadLandDraft: mockLoadLandDraft,
      }));

      render(<NewLandPage />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Draft not found");
        expect(mockRouter.replace).toHaveBeenCalledWith("/dashboard/lands/new");
      });
    });
  });

  describe("Consistency Across Wizards", () => {
    it("has consistent navigation patterns", async () => {
      mockSearchParams.get.mockReturnValue(null);

      const { rerender } = render(<NewBlogPage />);

      await waitFor(() => {
        expect(screen.getByTestId("blog-wizard")).toBeInTheDocument();
      });

      // Check blog wizard navigation
      expect(screen.getByTestId("next-step")).toBeInTheDocument();
      expect(screen.getByTestId("cancel-wizard")).toBeInTheDocument();

      // Switch to land wizard
      rerender(<NewLandPage />);

      await waitFor(() => {
        expect(screen.getByTestId("land-wizard")).toBeInTheDocument();
      });

      // Check land wizard has same navigation elements
      expect(screen.getByTestId("next-step")).toBeInTheDocument();
      expect(screen.getByTestId("cancel-wizard")).toBeInTheDocument();
    });

    it("has consistent progress indicators", async () => {
      mockSearchParams.get.mockReturnValue(null);

      const { rerender } = render(<NewBlogPage />);

      await waitFor(() => {
        expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
      });

      rerender(<NewLandPage />);

      await waitFor(() => {
        expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
      });
    });

    it("has consistent error handling", async () => {
      mockSearchParams.get.mockReturnValue("invalid-draft");

      const mockLoadBlogDraft = jest.fn().mockResolvedValue({
        success: false,
        message: "Draft error",
      });

      const mockLoadLandDraft = jest.fn().mockResolvedValue({
        success: false,
        message: "Draft error",
      });

      jest.doMock("@/lib/actions/blog-wizard-actions", () => ({
        loadBlogDraft: mockLoadBlogDraft,
      }));

      jest.doMock("@/lib/actions/land-wizard-actions", () => ({
        loadLandDraft: mockLoadLandDraft,
      }));

      const { rerender } = render(<NewBlogPage />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Draft error");
      });

      jest.clearAllMocks();

      rerender(<NewLandPage />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Draft error");
      });
    });
  });
});
