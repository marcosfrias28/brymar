import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UniversalWizard } from "../universal/universal-wizard";
import { PropertyWizard } from "../optimized-property-wizard";
import { LandWizard } from "../land/land-wizard";
import { BlogWizard } from "../blog/blog-wizard";
import {
  createMockPropertyData,
  createMockFile,
  measurePerformance,
  mockNetworkError,
  mockSlowNetwork,
  TEST_CONSTANTS,
} from "./test-utils";
import { PropertyType } from '@/types/wizard';
import { LandType } from '@/lib/schemas/land-wizard-schemas';

// Mock the actions
jest.mock("@/lib/actions/property-actions", () => ({
  createProperty: jest
    .fn()
    .mockResolvedValue({ success: true, id: "prop-123" }),
  saveDraft: jest
    .fn()
    .mockResolvedValue({ success: true, draftId: "draft-123" }),
  uploadImages: jest
    .fn()
    .mockResolvedValue({ success: true, urls: ["image1.jpg"] }),
}));

jest.mock("@/lib/actions/land-wizard-actions", () => ({
  createLand: jest.fn().mockResolvedValue({ success: true, id: "land-123" }),
  saveLandDraft: jest
    .fn()
    .mockResolvedValue({ success: true, draftId: "land-draft-123" }),
  uploadLandImages: jest
    .fn()
    .mockResolvedValue({ success: true, urls: ["land1.jpg"] }),
}));

jest.mock("@/lib/actions/blog-wizard-actions", () => ({
  createBlogPost: jest
    .fn()
    .mockResolvedValue({ success: true, id: "blog-123" }),
  saveBlogDraft: jest
    .fn()
    .mockResolvedValue({ success: true, draftId: "blog-draft-123" }),
  uploadBlogImages: jest
    .fn()
    .mockResolvedValue({ success: true, urls: ["blog1.jpg"] }),
}));

jest.mock("@/lib/actions/ai-actions", () => ({
  generateDescription: jest.fn().mockResolvedValue({
    success: true,
    description: "AI-generated description for testing",
  }),
  generateBlogContent: jest.fn().mockResolvedValue({
    success: true,
    content: "AI-generated blog content for testing",
  }),
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("Universal Wizard System Integration Tests", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
  });

  describe("Property Wizard Integration", () => {
    it("should complete full property creation workflow", async () => {
      const onComplete = jest.fn();
      const mockData = createMockPropertyData();

      render(
        <TestWrapper>
          <PropertyWizard onComplete={onComplete} />
        </TestWrapper>
      );

      // Step 1: General Information
      await user.type(screen.getByLabelText(/title/i), mockData.title);
      await user.type(
        screen.getByLabelText(/description/i),
        mockData.description
      );
      await user.type(
        screen.getByLabelText(/price/i),
        mockData.price.toString()
      );
      await user.type(
        screen.getByLabelText(/surface/i),
        mockData.surface.toString()
      );

      // Select property type
      await user.click(
        screen.getByRole("combobox", { name: /property type/i })
      );
      await user.click(screen.getByText("House"));

      // Add bedrooms and bathrooms
      await user.type(
        screen.getByLabelText(/bedrooms/i),
        mockData.bedrooms!.toString()
      );
      await user.type(
        screen.getByLabelText(/bathrooms/i),
        mockData.bathrooms!.toString()
      );

      // Navigate to next step
      await user.click(screen.getByRole("button", { name: /next/i }));

      // Step 2: Characteristics
      await waitFor(() => {
        expect(screen.getByText(/characteristics/i)).toBeInTheDocument();
      });

      // Select characteristics
      const poolCheckbox = screen.getByLabelText(/pool/i);
      const gardenCheckbox = screen.getByLabelText(/garden/i);
      await user.click(poolCheckbox);
      await user.click(gardenCheckbox);

      await user.click(screen.getByRole("button", { name: /next/i }));

      // Step 3: Location
      await waitFor(() => {
        expect(screen.getByText(/location/i)).toBeInTheDocument();
      });

      // Fill address
      await user.type(
        screen.getByLabelText(/street/i),
        mockData.address!.street
      );
      await user.type(screen.getByLabelText(/city/i), mockData.address!.city);
      await user.type(
        screen.getByLabelText(/province/i),
        mockData.address!.province
      );

      await user.click(screen.getByRole("button", { name: /next/i }));

      // Step 4: Images
      await waitFor(() => {
        expect(screen.getByText(/images/i)).toBeInTheDocument();
      });

      // Upload images
      const fileInput = screen.getByLabelText(/upload images/i);
      const file = createMockFile("property.jpg");
      await user.upload(fileInput, file);

      await user.click(screen.getByRole("button", { name: /next/i }));

      // Step 5: Preview and Submit
      await waitFor(() => {
        expect(screen.getByText(/preview/i)).toBeInTheDocument();
      });

      // Verify preview shows correct data
      expect(screen.getByText(mockData.title)).toBeInTheDocument();
      expect(screen.getByText(mockData.description)).toBeInTheDocument();
      expect(
        screen.getByText(`$${mockData.price.toLocaleString()}`)
      ).toBeInTheDocument();

      // Submit
      await user.click(
        screen.getByRole("button", { name: /create property/i })
      );

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            title: mockData.title,
            description: mockData.description,
            price: mockData.price,
          })
        );
      });
    });

    it("should handle validation errors correctly", async () => {
      render(
        <TestWrapper>
          <PropertyWizard />
        </TestWrapper>
      );

      // Try to navigate without filling required fields
      await user.click(screen.getByRole("button", { name: /next/i }));

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
        expect(
          screen.getByText(/price must be greater than 0/i)
        ).toBeInTheDocument();
      });

      // Should not navigate to next step
      expect(screen.queryByText(/characteristics/i)).not.toBeInTheDocument();
    });

    it("should save and restore drafts", async () => {
      const { rerender } = render(
        <TestWrapper>
          <PropertyWizard />
        </TestWrapper>
      );

      // Fill some data
      await user.type(screen.getByLabelText(/title/i), "Draft Property");
      await user.type(screen.getByLabelText(/price/i), "100000");

      // Trigger draft save (auto-save or manual)
      await act(async () => {
        // Simulate auto-save trigger
        fireEvent.blur(screen.getByLabelText(/title/i));
        await new Promise((resolve) => setTimeout(resolve, 1000));
      });

      // Simulate page reload with draft
      rerender(
        <TestWrapper>
          <PropertyWizard draftId="draft-123" />
        </TestWrapper>
      );

      // Should restore draft data
      await waitFor(() => {
        expect(screen.getByDisplayValue("Draft Property")).toBeInTheDocument();
        expect(screen.getByDisplayValue("100000")).toBeInTheDocument();
      });
    });
  });

  describe("Land Wizard Integration", () => {
    it("should complete full land creation workflow", async () => {
      const onComplete = jest.fn();

      render(
        <TestWrapper>
          <LandWizard onComplete={onComplete} />
        </TestWrapper>
      );

      // Step 1: General Information
      await user.type(screen.getByLabelText(/name/i), "Test Land");
      await user.type(
        screen.getByLabelText(/description/i),
        "Beautiful land for development"
      );
      await user.type(screen.getByLabelText(/price/i), "50000");
      await user.type(screen.getByLabelText(/surface/i), "1000");

      // Select land type
      await user.click(screen.getByRole("combobox", { name: /land type/i }));
      await user.click(screen.getByText("Residential"));

      await user.click(screen.getByRole("button", { name: /next/i }));

      // Step 2: Location
      await waitFor(() => {
        expect(screen.getByText(/location/i)).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/location/i), "Santo Domingo Este");
      await user.type(screen.getByLabelText(/zoning/i), "Residential");

      await user.click(screen.getByRole("button", { name: /next/i }));

      // Step 3: Images
      await waitFor(() => {
        expect(screen.getByText(/images/i)).toBeInTheDocument();
      });

      const fileInput = screen.getByLabelText(/upload images/i);
      const file = createMockFile("land.jpg");
      await user.upload(fileInput, file);

      await user.click(screen.getByRole("button", { name: /next/i }));

      // Step 4: Preview and Submit
      await waitFor(() => {
        expect(screen.getByText(/preview/i)).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /create land/i }));

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "Test Land",
            description: "Beautiful land for development",
            price: 50000,
          })
        );
      });
    });

    it("should integrate with AI description generation", async () => {
      render(
        <TestWrapper>
          <LandWizard />
        </TestWrapper>
      );

      // Fill basic info
      await user.type(screen.getByLabelText(/name/i), "Coastal Land");
      await user.type(screen.getByLabelText(/surface/i), "2000");

      // Click AI generate button
      const aiButton = screen.getByRole("button", {
        name: /generate description/i,
      });
      await user.click(aiButton);

      // Should show loading state
      expect(screen.getByText(/generating/i)).toBeInTheDocument();

      // Should populate description
      await waitFor(() => {
        expect(
          screen.getByDisplayValue(/AI-generated description/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Blog Wizard Integration", () => {
    it("should complete full blog creation workflow", async () => {
      const onComplete = jest.fn();

      render(
        <TestWrapper>
          <BlogWizard onComplete={onComplete} />
        </TestWrapper>
      );

      // Step 1: Content
      await user.type(
        screen.getByLabelText(/title/i),
        "Real Estate Market Trends"
      );
      await user.type(
        screen.getByLabelText(/content/i),
        "The real estate market is showing..."
      );
      await user.type(screen.getByLabelText(/author/i), "John Doe");

      // Select category
      await user.click(screen.getByRole("combobox", { name: /category/i }));
      await user.click(screen.getByText("Market Analysis"));

      await user.click(screen.getByRole("button", { name: /next/i }));

      // Step 2: Media
      await waitFor(() => {
        expect(screen.getByText(/media/i)).toBeInTheDocument();
      });

      const fileInput = screen.getByLabelText(/cover image/i);
      const file = createMockFile("blog-cover.jpg");
      await user.upload(fileInput, file);

      await user.click(screen.getByRole("button", { name: /next/i }));

      // Step 3: SEO
      await waitFor(() => {
        expect(screen.getByText(/seo/i)).toBeInTheDocument();
      });

      await user.type(
        screen.getByLabelText(/seo title/i),
        "Market Trends 2024"
      );
      await user.type(
        screen.getByLabelText(/meta description/i),
        "Latest trends in real estate"
      );
      await user.type(
        screen.getByLabelText(/tags/i),
        "market, trends, analysis"
      );

      await user.click(screen.getByRole("button", { name: /next/i }));

      // Step 4: Preview and Submit
      await waitFor(() => {
        expect(screen.getByText(/preview/i)).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /publish blog/i }));

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Real Estate Market Trends",
            content: "The real estate market is showing...",
            author: "John Doe",
          })
        );
      });
    });

    it("should handle rich text editor integration", async () => {
      render(
        <TestWrapper>
          <BlogWizard />
        </TestWrapper>
      );

      // Find rich text editor
      const editor = screen.getByRole("textbox", { name: /content/i });

      // Type content
      await user.type(
        editor,
        "This is **bold** text with *italic* formatting."
      );

      // Should preserve formatting
      expect(editor).toHaveValue(
        "This is **bold** text with *italic* formatting."
      );

      // Test toolbar buttons
      const boldButton = screen.getByRole("button", { name: /bold/i });
      await user.click(boldButton);

      // Should apply formatting
      expect(editor).toHaveClass("rich-text-editor");
    });
  });

  describe("Cross-Wizard Compatibility", () => {
    it("should maintain consistent navigation behavior", async () => {
      const wizards = [
        { component: PropertyWizard, name: "Property" },
        { component: LandWizard, name: "Land" },
        { component: BlogWizard, name: "Blog" },
      ];

      for (const { component: WizardComponent, name } of wizards) {
        const { unmount } = render(
          <TestWrapper>
            <WizardComponent />
          </TestWrapper>
        );

        // Should have consistent navigation elements
        expect(
          screen.getByRole("button", { name: /next/i })
        ).toBeInTheDocument();
        expect(screen.getByText(/step 1/i)).toBeInTheDocument();

        // Should have progress indicator
        expect(screen.getByRole("progressbar")).toBeInTheDocument();

        unmount();
      }
    });

    it("should use consistent validation patterns", async () => {
      const wizards = [
        { component: PropertyWizard, titleField: /title/i },
        { component: LandWizard, titleField: /name/i },
        { component: BlogWizard, titleField: /title/i },
      ];

      for (const { component: WizardComponent, titleField } of wizards) {
        const { unmount } = render(
          <TestWrapper>
            <WizardComponent />
          </TestWrapper>
        );

        // Try to navigate without required fields
        await user.click(screen.getByRole("button", { name: /next/i }));

        // Should show validation errors
        await waitFor(() => {
          expect(screen.getByText(/required/i)).toBeInTheDocument();
        });

        // Should not navigate
        expect(screen.getByText(/step 1/i)).toBeInTheDocument();

        unmount();
      }
    });

    it("should handle draft saving consistently", async () => {
      const wizards = [PropertyWizard, LandWizard, BlogWizard];

      for (const WizardComponent of wizards) {
        const { unmount } = render(
          <TestWrapper>
            <WizardComponent />
          </TestWrapper>
        );

        // Fill some data to trigger draft save
        const titleField = screen.getByLabelText(/title|name/i);
        await user.type(titleField, "Draft Test");

        // Trigger auto-save
        await act(async () => {
          fireEvent.blur(titleField);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        });

        // Should show draft saved indicator
        await waitFor(() => {
          expect(screen.getByText(/draft saved/i)).toBeInTheDocument();
        });

        unmount();
      }
    });
  });

  describe("Performance Integration", () => {
    it("should meet performance budgets for all wizards", async () => {
      const wizards = [PropertyWizard, LandWizard, BlogWizard];

      for (const WizardComponent of wizards) {
        const loadTime = await measurePerformance(async () => {
          render(
            <TestWrapper>
              <WizardComponent />
            </TestWrapper>
          );
        });

        expect(loadTime).toBeLessThan(
          TEST_CONSTANTS.PERFORMANCE_BUDGETS.LOAD_TIME
        );
      }
    });

    it("should handle step transitions efficiently", async () => {
      render(
        <TestWrapper>
          <PropertyWizard />
        </TestWrapper>
      );

      // Fill required fields
      await user.type(screen.getByLabelText(/title/i), "Performance Test");
      await user.type(screen.getByLabelText(/price/i), "100000");
      await user.type(screen.getByLabelText(/surface/i), "200");

      // Measure step transition time
      const transitionTime = await measurePerformance(async () => {
        await user.click(screen.getByRole("button", { name: /next/i }));
        await waitFor(() => {
          expect(screen.getByText(/characteristics/i)).toBeInTheDocument();
        });
      });

      expect(transitionTime).toBeLessThan(
        TEST_CONSTANTS.PERFORMANCE_BUDGETS.INTERACTION_TIME
      );
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle network errors gracefully", async () => {
      const restoreNetwork = mockNetworkError();

      render(
        <TestWrapper>
          <PropertyWizard />
        </TestWrapper>
      );

      // Fill form and try to submit
      await user.type(screen.getByLabelText(/title/i), "Network Error Test");
      await user.type(screen.getByLabelText(/price/i), "100000");

      // Navigate through steps quickly to final submission
      for (let i = 0; i < 4; i++) {
        await user.click(screen.getByRole("button", { name: /next/i }));
        await waitFor(() => {
          // Wait for step to load
        });
      }

      // Try to submit
      await user.click(
        screen.getByRole("button", { name: /create property/i })
      );

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      // Should offer retry option
      expect(
        screen.getByRole("button", { name: /retry/i })
      ).toBeInTheDocument();

      restoreNetwork();
    });

    it("should handle slow network conditions", async () => {
      const restoreNetwork = mockSlowNetwork(3000);

      render(
        <TestWrapper>
          <PropertyWizard />
        </TestWrapper>
      );

      // Fill form
      await user.type(screen.getByLabelText(/title/i), "Slow Network Test");

      // Trigger AI generation (which makes network request)
      const aiButton = screen.getByRole("button", {
        name: /generate description/i,
      });
      await user.click(aiButton);

      // Should show loading state
      expect(screen.getByText(/generating/i)).toBeInTheDocument();

      // Should eventually complete
      await waitFor(
        () => {
          expect(
            screen.getByDisplayValue(/AI-generated description/i)
          ).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      restoreNetwork();
    });

    it("should recover from component errors", async () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Create a component that throws an error
      const ErrorComponent = () => {
        throw new Error("Test component error");
      };

      render(
        <TestWrapper>
          <PropertyWizard />
        </TestWrapper>
      );

      // Should render error boundary
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Should offer recovery options
      expect(
        screen.getByRole("button", { name: /try again/i })
      ).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe("AI Integration Testing", () => {
    it("should integrate AI generation across all wizard types", async () => {
      const wizards = [
        { component: PropertyWizard, aiButton: /generate description/i },
        { component: LandWizard, aiButton: /generate description/i },
        { component: BlogWizard, aiButton: /generate content/i },
      ];

      for (const { component: WizardComponent, aiButton } of wizards) {
        const { unmount } = render(
          <TestWrapper>
            <WizardComponent />
          </TestWrapper>
        );

        // Should have AI generation button
        const button = screen.getByRole("button", { name: aiButton });
        expect(button).toBeInTheDocument();

        // Click AI button
        await user.click(button);

        // Should show loading state
        expect(screen.getByText(/generating/i)).toBeInTheDocument();

        // Should populate content
        await waitFor(() => {
          expect(screen.getByDisplayValue(/AI-generated/i)).toBeInTheDocument();
        });

        unmount();
      }
    });

    it("should handle AI generation failures gracefully", async () => {
      // Mock AI action to fail
      const aiActions = require("@/lib/actions/ai-actions");
      aiActions.generateDescription.mockRejectedValueOnce(
        new Error("AI service unavailable")
      );

      render(
        <TestWrapper>
          <PropertyWizard />
        </TestWrapper>
      );

      // Click AI generate button
      const aiButton = screen.getByRole("button", {
        name: /generate description/i,
      });
      await user.click(aiButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/AI service unavailable/i)).toBeInTheDocument();
      });

      // Should allow manual input
      const descriptionField = screen.getByLabelText(/description/i);
      expect(descriptionField).toBeEnabled();
      await user.type(descriptionField, "Manual description");
      expect(descriptionField).toHaveValue("Manual description");
    });
  });
});
