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
import { PropertyWizard } from "../optimized-property-wizard";
import { LandWizard } from "../land/land-wizard";
import { BlogWizard } from "../blog/blog-wizard";
import {
  createMockPropertyData,
  createMockFile,
  measurePerformance,
  mockSlowNetwork,
  mockNetworkError,
  TEST_CONSTANTS,
} from "./test-utils";

// Mock all external dependencies
jest.mock("@/lib/actions/property-actions", () => ({
  createProperty: jest.fn().mockResolvedValue({
    success: true,
    id: "prop-123",
    url: "/properties/prop-123",
  }),
  saveDraft: jest
    .fn()
    .mockResolvedValue({ success: true, draftId: "draft-123" }),
  uploadImages: jest.fn().mockResolvedValue({
    success: true,
    urls: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  }),
  validateProperty: jest.fn().mockResolvedValue({ success: true, valid: true }),
}));

jest.mock("@/lib/actions/land-wizard-actions", () => ({
  createLand: jest.fn().mockResolvedValue({
    success: true,
    id: "land-123",
    url: "/lands/land-123",
  }),
  saveLandDraft: jest
    .fn()
    .mockResolvedValue({ success: true, draftId: "land-draft-123" }),
  uploadLandImages: jest.fn().mockResolvedValue({
    success: true,
    urls: ["https://example.com/land1.jpg"],
  }),
  validateLand: jest.fn().mockResolvedValue({ success: true, valid: true }),
}));

jest.mock("@/lib/actions/blog-wizard-actions", () => ({
  createBlogPost: jest.fn().mockResolvedValue({
    success: true,
    id: "blog-123",
    url: "/blog/blog-123",
  }),
  saveBlogDraft: jest
    .fn()
    .mockResolvedValue({ success: true, draftId: "blog-draft-123" }),
  uploadBlogImages: jest.fn().mockResolvedValue({
    success: true,
    urls: ["https://example.com/blog1.jpg"],
  }),
  validateBlogPost: jest.fn().mockResolvedValue({ success: true, valid: true }),
}));

jest.mock("@/lib/actions/ai-actions", () => ({
  generateDescription: jest.fn().mockResolvedValue({
    success: true,
    description:
      "AI-generated property description with detailed features and amenities",
  }),
  generateBlogContent: jest.fn().mockResolvedValue({
    success: true,
    content:
      "AI-generated blog content about real estate market trends and insights",
  }),
  generateSEOTitle: jest.fn().mockResolvedValue({
    success: true,
    title: "SEO Optimized Title for Real Estate Blog",
  }),
  generateMetaDescription: jest.fn().mockResolvedValue({
    success: true,
    description: "SEO meta description for better search engine visibility",
  }),
}));

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn().mockImplementation((success) => {
    success({
      coords: {
        latitude: 18.4861,
        longitude: -69.9312,
        accuracy: 10,
      },
    });
  }),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};

Object.defineProperty(navigator, "geolocation", {
  value: mockGeolocation,
});

// Mock file reader
const mockFileReader = {
  readAsDataURL: jest.fn(),
  result:
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
  onload: null,
  onerror: null,
};

global.FileReader = jest.fn(() => mockFileReader) as any;

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

describe("End-to-End Workflow Tests", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Complete Property Creation Workflow", () => {
    it("should complete full property creation with all features", async () => {
      const onComplete = jest.fn();
      const onSuccess = jest.fn();

      render(
        <TestWrapper>
          <PropertyWizard
            onComplete={onComplete}
            onSuccess={onSuccess}
            enableAI={true}
            enableDrafts={true}
          />
        </TestWrapper>
      );

      // Step 1: General Information
      await user.type(
        screen.getByLabelText(/title/i),
        "Luxury Villa in Punta Cana"
      );

      // Use AI to generate description
      const aiButton = screen.getByRole("button", {
        name: /generate description/i,
      });
      await user.click(aiButton);

      // Wait for AI generation
      await waitFor(() => {
        expect(
          screen.getByDisplayValue(/AI-generated property description/i)
        ).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/price/i), "450000");
      await user.type(screen.getByLabelText(/surface/i), "350");

      // Select property type
      await user.click(
        screen.getByRole("combobox", { name: /property type/i })
      );
      await user.click(screen.getByText("Villa"));

      await user.type(screen.getByLabelText(/bedrooms/i), "4");
      await user.type(screen.getByLabelText(/bathrooms/i), "3");

      // Verify auto-save triggered
      await act(async () => {
        fireEvent.blur(screen.getByLabelText(/title/i));
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText(/draft saved/i)).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /next/i }));

      // Step 2: Characteristics
      await waitFor(() => {
        expect(screen.getByText(/characteristics/i)).toBeInTheDocument();
      });

      // Select multiple characteristics
      const characteristics = [
        "Pool",
        "Garden",
        "Garage",
        "Security",
        "Ocean View",
      ];
      for (const char of characteristics) {
        const checkbox = screen.getByLabelText(new RegExp(char, "i"));
        await user.click(checkbox);
      }

      await user.click(screen.getByRole("button", { name: /next/i }));

      // Step 3: Location
      await waitFor(() => {
        expect(screen.getByText(/location/i)).toBeInTheDocument();
      });

      // Fill address
      await user.type(
        screen.getByLabelText(/street/i),
        "Playa Bavaro Avenue 123"
      );
      await user.type(screen.getByLabelText(/city/i), "Punta Cana");
      await user.type(screen.getByLabelText(/province/i), "La Altagracia");

      // Use current location
      const locationButton = screen.getByRole("button", {
        name: /use current location/i,
      });
      await user.click(locationButton);

      await waitFor(() => {
        expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
      });

      // Verify coordinates are set
      expect(screen.getByDisplayValue("18.4861")).toBeInTheDocument();
      expect(screen.getByDisplayValue("-69.9312")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /next/i }));

      // Step 4: Images
      await waitFor(() => {
        expect(screen.getByText(/images/i)).toBeInTheDocument();
      });

      // Upload multiple images
      const fileInput = screen.getByLabelText(/upload images/i);
      const files = [
        createMockFile("villa-exterior.jpg", 2048000),
        createMockFile("villa-interior.jpg", 1536000),
        createMockFile("villa-pool.jpg", 1792000),
      ];

      await user.upload(fileInput, files);

      // Wait for image processing
      await waitFor(() => {
        expect(screen.getAllByRole("img")).toHaveLength(3);
      });

      // Reorder images
      const firstImage = screen.getAllByRole("img")[0];
      const secondImage = screen.getAllByRole("img")[1];

      // Simulate drag and drop reordering
      fireEvent.dragStart(firstImage);
      fireEvent.dragOver(secondImage);
      fireEvent.drop(secondImage);

      await user.click(screen.getByRole("button", { name: /next/i }));

      // Step 5: Preview
      await waitFor(() => {
        expect(screen.getByText(/preview/i)).toBeInTheDocument();
      });

      // Verify all data is displayed correctly
      expect(
        screen.getByText("Luxury Villa in Punta Cana")
      ).toBeInTheDocument();
      expect(screen.getByText("$450,000")).toBeInTheDocument();
      expect(screen.getByText("350 m²")).toBeInTheDocument();
      expect(screen.getByText("4 bedrooms")).toBeInTheDocument();
      expect(screen.getByText("3 bathrooms")).toBeInTheDocument();
      expect(screen.getByText("Playa Bavaro Avenue 123")).toBeInTheDocument();

      // Verify characteristics are shown
      characteristics.forEach((char) => {
        expect(screen.getByText(char)).toBeInTheDocument();
      });

      // Verify images are displayed
      expect(screen.getAllByRole("img")).toHaveLength(3);

      // Submit property
      const submitButton = screen.getByRole("button", {
        name: /create property/i,
      });
      await user.click(submitButton);

      // Should show loading state
      expect(screen.getByText(/creating property/i)).toBeInTheDocument();

      // Wait for completion
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Luxury Villa in Punta Cana",
            price: 450000,
            surface: 350,
            propertyType: "villa",
            bedrooms: 4,
            bathrooms: 3,
          })
        );
      });

      // Should show success message
      expect(
        screen.getByText(/property created successfully/i)
      ).toBeInTheDocument();

      // Should provide navigation to created property
      const viewButton = screen.getByRole("button", { name: /view property/i });
      expect(viewButton).toBeInTheDocument();
    });

    it("should handle property creation with validation errors", async () => {
      const validateProperty =
        require("@/lib/actions/property-actions").validateProperty;
      validateProperty.mockResolvedValueOnce({
        success: false,
        errors: [
          { field: "price", message: "Price seems too low for this area" },
          { field: "surface", message: "Surface area should be verified" },
        ],
      });

      render(
        <TestWrapper>
          <PropertyWizard />
        </TestWrapper>
      );

      // Fill form with potentially problematic data
      await user.type(screen.getByLabelText(/title/i), "Cheap Villa");
      await user.type(screen.getByLabelText(/price/i), "50000");
      await user.type(screen.getByLabelText(/surface/i), "500");

      // Navigate through steps quickly
      for (let i = 0; i < 4; i++) {
        await user.click(screen.getByRole("button", { name: /next/i }));
        await waitFor(() => {});
      }

      // Try to submit
      await user.click(
        screen.getByRole("button", { name: /create property/i })
      );

      // Should show validation warnings
      await waitFor(() => {
        expect(screen.getByText(/price seems too low/i)).toBeInTheDocument();
        expect(
          screen.getByText(/surface area should be verified/i)
        ).toBeInTheDocument();
      });

      // Should offer options to proceed or fix
      expect(
        screen.getByRole("button", { name: /proceed anyway/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /fix issues/i })
      ).toBeInTheDocument();
    });

    it("should handle network errors during property creation", async () => {
      const createProperty =
        require("@/lib/actions/property-actions").createProperty;
      createProperty.mockRejectedValueOnce(new Error("Network timeout"));

      render(
        <TestWrapper>
          <PropertyWizard />
        </TestWrapper>
      );

      // Fill minimal data and submit
      await user.type(screen.getByLabelText(/title/i), "Network Test Property");
      await user.type(screen.getByLabelText(/price/i), "200000");

      // Navigate to final step
      for (let i = 0; i < 4; i++) {
        await user.click(screen.getByRole("button", { name: /next/i }));
        await waitFor(() => {});
      }

      await user.click(
        screen.getByRole("button", { name: /create property/i })
      );

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/network timeout/i)).toBeInTheDocument();
      });

      // Should offer retry and save draft options
      expect(
        screen.getByRole("button", { name: /retry/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /save as draft/i })
      ).toBeInTheDocument();

      // Test retry functionality
      createProperty.mockResolvedValueOnce({
        success: true,
        id: "prop-retry-123",
      });
      await user.click(screen.getByRole("button", { name: /retry/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/property created successfully/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Complete Land Creation Workflow", () => {
    it("should complete full land creation with AI assistance", async () => {
      const onComplete = jest.fn();

      render(
        <TestWrapper>
          <LandWizard onComplete={onComplete} enableAI={true} />
        </TestWrapper>
      );

      // Step 1: General Information
      await user.type(
        screen.getByLabelText(/name/i),
        "Beachfront Development Land"
      );

      // Generate AI description
      const aiButton = screen.getByRole("button", {
        name: /generate description/i,
      });
      await user.click(aiButton);

      await waitFor(() => {
        expect(
          screen.getByDisplayValue(/AI-generated property description/i)
        ).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/price/i), "150000");
      await user.type(screen.getByLabelText(/surface/i), "2500");

      // Select land type
      await user.click(screen.getByRole("combobox", { name: /land type/i }));
      await user.click(screen.getByText("Beachfront"));

      await user.click(screen.getByRole("button", { name: /next/i }));

      // Step 2: Location
      await waitFor(() => {
        expect(screen.getByText(/location/i)).toBeInTheDocument();
      });

      await user.type(
        screen.getByLabelText(/location/i),
        "Samaná Bay Coastline"
      );
      await user.type(
        screen.getByLabelText(/zoning/i),
        "Tourism Development Zone"
      );

      // Select utilities
      const utilities = ["Electricity", "Water", "Internet"];
      for (const utility of utilities) {
        const checkbox = screen.getByLabelText(new RegExp(utility, "i"));
        await user.click(checkbox);
      }

      // Set coordinates manually
      await user.type(screen.getByLabelText(/latitude/i), "19.2041");
      await user.type(screen.getByLabelText(/longitude/i), "-69.3370");

      await user.click(screen.getByRole("button", { name: /next/i }));

      // Step 3: Images
      await waitFor(() => {
        expect(screen.getByText(/images/i)).toBeInTheDocument();
      });

      const fileInput = screen.getByLabelText(/upload images/i);
      const files = [
        createMockFile("land-aerial.jpg", 3072000),
        createMockFile("land-beachfront.jpg", 2560000),
      ];

      await user.upload(fileInput, files);

      await waitFor(() => {
        expect(screen.getAllByRole("img")).toHaveLength(2);
      });

      await user.click(screen.getByRole("button", { name: /next/i }));

      // Step 4: Preview and Submit
      await waitFor(() => {
        expect(screen.getByText(/preview/i)).toBeInTheDocument();
      });

      // Verify data
      expect(
        screen.getByText("Beachfront Development Land")
      ).toBeInTheDocument();
      expect(screen.getByText("$150,000")).toBeInTheDocument();
      expect(screen.getByText("2,500 m²")).toBeInTheDocument();
      expect(screen.getByText("Samaná Bay Coastline")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /create land/i }));

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "Beachfront Development Land",
            price: 150000,
            surface: 2500,
            landType: "beachfront",
            location: "Samaná Bay Coastline",
          })
        );
      });
    });

    it("should handle land creation with environmental considerations", async () => {
      render(
        <TestWrapper>
          <LandWizard enableEnvironmentalCheck={true} />
        </TestWrapper>
      );

      // Fill land data
      await user.type(
        screen.getByLabelText(/name/i),
        "Protected Area Adjacent Land"
      );
      await user.type(screen.getByLabelText(/price/i), "80000");
      await user.type(screen.getByLabelText(/surface/i), "5000");

      // Select environmentally sensitive land type
      await user.click(screen.getByRole("combobox", { name: /land type/i }));
      await user.click(screen.getByText("Agricultural"));

      await user.click(screen.getByRole("button", { name: /next/i }));

      // Set coordinates near protected area
      await user.type(screen.getByLabelText(/latitude/i), "18.7357");
      await user.type(screen.getByLabelText(/longitude/i), "-68.9156");

      await user.click(screen.getByRole("button", { name: /next/i }));
      await user.click(screen.getByRole("button", { name: /next/i }));

      // Try to submit
      await user.click(screen.getByRole("button", { name: /create land/i }));

      // Should show environmental warning
      await waitFor(() => {
        expect(
          screen.getByText(/environmental considerations/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/protected area nearby/i)).toBeInTheDocument();
      });

      // Should require acknowledgment
      const acknowledgeCheckbox = screen.getByLabelText(
        /acknowledge environmental impact/i
      );
      await user.click(acknowledgeCheckbox);

      const proceedButton = screen.getByRole("button", {
        name: /proceed with creation/i,
      });
      await user.click(proceedButton);

      await waitFor(() => {
        expect(
          screen.getByText(/land created successfully/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Complete Blog Creation Workflow", () => {
    it("should complete full blog creation with rich content", async () => {
      const onComplete = jest.fn();

      render(
        <TestWrapper>
          <BlogWizard onComplete={onComplete} enableAI={true} />
        </TestWrapper>
      );

      // Step 1: Content
      await user.type(
        screen.getByLabelText(/title/i),
        "The Future of Real Estate in the Caribbean"
      );

      // Use rich text editor
      const contentEditor = screen.getByRole("textbox", { name: /content/i });
      await user.type(
        contentEditor,
        "The Caribbean real estate market is experiencing unprecedented growth..."
      );

      // Apply formatting
      const boldButton = screen.getByRole("button", { name: /bold/i });
      await user.click(boldButton);
      await user.type(contentEditor, "Key Market Trends:");

      // Add list
      const listButton = screen.getByRole("button", { name: /bullet list/i });
      await user.click(listButton);
      await user.type(
        contentEditor,
        "Increased foreign investment\nSustainable development focus\nTechnology integration"
      );

      await user.type(screen.getByLabelText(/author/i), "Maria Rodriguez");

      // Select category
      await user.click(screen.getByRole("combobox", { name: /category/i }));
      await user.click(screen.getByText("Market Analysis"));

      await user.click(screen.getByRole("button", { name: /next/i }));

      // Step 2: Media
      await waitFor(() => {
        expect(screen.getByText(/media/i)).toBeInTheDocument();
      });

      // Upload cover image
      const coverInput = screen.getByLabelText(/cover image/i);
      const coverFile = createMockFile("blog-cover.jpg", 1024000);
      await user.upload(coverInput, coverFile);

      // Upload additional images
      const additionalInput = screen.getByLabelText(/additional images/i);
      const additionalFiles = [
        createMockFile("chart1.png", 512000),
        createMockFile("chart2.png", 768000),
      ];
      await user.upload(additionalInput, additionalFiles);

      await waitFor(() => {
        expect(screen.getAllByRole("img")).toHaveLength(3);
      });

      await user.click(screen.getByRole("button", { name: /next/i }));

      // Step 3: SEO
      await waitFor(() => {
        expect(screen.getByText(/seo/i)).toBeInTheDocument();
      });

      // Generate SEO title
      const seoTitleButton = screen.getByRole("button", {
        name: /generate seo title/i,
      });
      await user.click(seoTitleButton);

      await waitFor(() => {
        expect(
          screen.getByDisplayValue(/SEO Optimized Title/i)
        ).toBeInTheDocument();
      });

      // Generate meta description
      const metaButton = screen.getByRole("button", {
        name: /generate meta description/i,
      });
      await user.click(metaButton);

      await waitFor(() => {
        expect(
          screen.getByDisplayValue(/SEO meta description/i)
        ).toBeInTheDocument();
      });

      // Add tags
      await user.type(
        screen.getByLabelText(/tags/i),
        "caribbean, real estate, market trends, investment"
      );

      // Set reading time
      const readingTimeField = screen.getByLabelText(/estimated reading time/i);
      expect(readingTimeField).toHaveValue("5"); // Auto-calculated

      await user.click(screen.getByRole("button", { name: /next/i }));

      // Step 4: Preview
      await waitFor(() => {
        expect(screen.getByText(/preview/i)).toBeInTheDocument();
      });

      // Verify content preview
      expect(
        screen.getByText("The Future of Real Estate in the Caribbean")
      ).toBeInTheDocument();
      expect(screen.getByText("Maria Rodriguez")).toBeInTheDocument();
      expect(screen.getByText("Market Analysis")).toBeInTheDocument();
      expect(screen.getByText("5 min read")).toBeInTheDocument();

      // Verify rich content is rendered
      expect(screen.getByText("Key Market Trends:")).toBeInTheDocument();
      expect(
        screen.getByText("Increased foreign investment")
      ).toBeInTheDocument();

      // Verify SEO preview
      expect(screen.getByText(/SEO Optimized Title/i)).toBeInTheDocument();
      expect(screen.getByText(/SEO meta description/i)).toBeInTheDocument();

      // Submit blog
      await user.click(screen.getByRole("button", { name: /publish blog/i }));

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "The Future of Real Estate in the Caribbean",
            author: "Maria Rodriguez",
            category: "Market Analysis",
            tags: expect.arrayContaining([
              "caribbean",
              "real estate",
              "market trends",
              "investment",
            ]),
          })
        );
      });

      // Should show success with social sharing options
      expect(
        screen.getByText(/blog published successfully/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /share on social media/i })
      ).toBeInTheDocument();
    });

    it("should handle blog creation with scheduling", async () => {
      render(
        <TestWrapper>
          <BlogWizard enableScheduling={true} />
        </TestWrapper>
      );

      // Fill basic content
      await user.type(screen.getByLabelText(/title/i), "Scheduled Blog Post");
      await user.type(
        screen.getByLabelText(/content/i),
        "This post will be published later"
      );

      // Navigate to final step
      for (let i = 0; i < 3; i++) {
        await user.click(screen.getByRole("button", { name: /next/i }));
        await waitFor(() => {});
      }

      // Choose to schedule instead of publish immediately
      const scheduleRadio = screen.getByLabelText(/schedule for later/i);
      await user.click(scheduleRadio);

      // Set future date
      const dateInput = screen.getByLabelText(/publish date/i);
      await user.type(dateInput, "2024-12-25");

      const timeInput = screen.getByLabelText(/publish time/i);
      await user.type(timeInput, "10:00");

      await user.click(screen.getByRole("button", { name: /schedule blog/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/blog scheduled successfully/i)
        ).toBeInTheDocument();
        expect(
          screen.getByText(/will be published on December 25, 2024/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Performance and Error Recovery", () => {
    it("should maintain performance standards during complete workflows", async () => {
      const performanceMetrics = {
        initialLoad: 0,
        stepTransitions: [] as number[],
        finalSubmission: 0,
      };

      // Measure initial load
      performanceMetrics.initialLoad = await measurePerformance(async () => {
        render(
          <TestWrapper>
            <PropertyWizard />
          </TestWrapper>
        );
      });

      expect(performanceMetrics.initialLoad).toBeLessThan(
        TEST_CONSTANTS.PERFORMANCE_BUDGETS.LOAD_TIME
      );

      // Fill minimal data
      await user.type(screen.getByLabelText(/title/i), "Performance Test");
      await user.type(screen.getByLabelText(/price/i), "100000");

      // Measure step transitions
      for (let i = 0; i < 4; i++) {
        const transitionTime = await measurePerformance(async () => {
          await user.click(screen.getByRole("button", { name: /next/i }));
          await waitFor(() => {
            expect(
              screen.getByText(new RegExp(`step ${i + 2}`, "i"))
            ).toBeInTheDocument();
          });
        });

        performanceMetrics.stepTransitions.push(transitionTime);
        expect(transitionTime).toBeLessThan(
          TEST_CONSTANTS.PERFORMANCE_BUDGETS.INTERACTION_TIME
        );
      }

      // Measure final submission
      performanceMetrics.finalSubmission = await measurePerformance(
        async () => {
          await user.click(
            screen.getByRole("button", { name: /create property/i })
          );
          await waitFor(() => {
            expect(
              screen.getByText(/property created successfully/i)
            ).toBeInTheDocument();
          });
        }
      );

      expect(performanceMetrics.finalSubmission).toBeLessThan(5000); // 5 seconds for submission

      console.log("Performance Metrics:", performanceMetrics);
    });

    it("should recover from errors during complete workflow", async () => {
      const restoreNetwork = mockNetworkError();

      render(
        <TestWrapper>
          <PropertyWizard />
        </TestWrapper>
      );

      // Fill form
      await user.type(screen.getByLabelText(/title/i), "Error Recovery Test");
      await user.type(screen.getByLabelText(/price/i), "150000");

      // Navigate to final step
      for (let i = 0; i < 4; i++) {
        await user.click(screen.getByRole("button", { name: /next/i }));
        await waitFor(() => {});
      }

      // Try to submit (will fail due to network error)
      await user.click(
        screen.getByRole("button", { name: /create property/i })
      );

      // Should show error and recovery options
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /save as draft/i })
        ).toBeInTheDocument();
      });

      // Save as draft
      await user.click(screen.getByRole("button", { name: /save as draft/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/draft saved successfully/i)
        ).toBeInTheDocument();
      });

      // Restore network and retry
      restoreNetwork();

      const retryButton = screen.getByRole("button", {
        name: /retry submission/i,
      });
      await user.click(retryButton);

      await waitFor(() => {
        expect(
          screen.getByText(/property created successfully/i)
        ).toBeInTheDocument();
      });
    });

    it("should handle slow network conditions gracefully", async () => {
      const restoreNetwork = mockSlowNetwork(3000);

      render(
        <TestWrapper>
          <PropertyWizard />
        </TestWrapper>
      );

      // Fill form and submit
      await user.type(screen.getByLabelText(/title/i), "Slow Network Test");
      await user.type(screen.getByLabelText(/price/i), "180000");

      // Navigate to final step
      for (let i = 0; i < 4; i++) {
        await user.click(screen.getByRole("button", { name: /next/i }));
        await waitFor(() => {});
      }

      await user.click(
        screen.getByRole("button", { name: /create property/i })
      );

      // Should show loading state
      expect(screen.getByText(/creating property/i)).toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toBeInTheDocument();

      // Should show progress updates
      await waitFor(
        () => {
          expect(screen.getByText(/uploading images/i)).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      await waitFor(
        () => {
          expect(screen.getByText(/saving property data/i)).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      // Should eventually complete
      await waitFor(
        () => {
          expect(
            screen.getByText(/property created successfully/i)
          ).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      restoreNetwork();
    });
  });

  describe("Cross-Wizard Workflow Consistency", () => {
    it("should maintain consistent user experience across all wizard types", async () => {
      const wizards = [
        {
          component: PropertyWizard,
          name: "Property",
          submitText: /create property/i,
        },
        { component: LandWizard, name: "Land", submitText: /create land/i },
        { component: BlogWizard, name: "Blog", submitText: /publish blog/i },
      ];

      for (const { component: WizardComponent, name, submitText } of wizards) {
        const { unmount } = render(
          <TestWrapper>
            <WizardComponent />
          </TestWrapper>
        );

        // Should have consistent navigation
        expect(
          screen.getByRole("button", { name: /next/i })
        ).toBeInTheDocument();
        expect(screen.getByText(/step 1/i)).toBeInTheDocument();
        expect(screen.getByRole("progressbar")).toBeInTheDocument();

        // Should have consistent help and support
        expect(
          screen.getByRole("button", { name: /help/i })
        ).toBeInTheDocument();

        // Fill minimal data and navigate to end
        const titleField = screen.getByLabelText(/title|name/i);
        await user.type(titleField, `Test ${name}`);

        // Navigate to final step
        let currentStep = 1;
        while (currentStep < 5) {
          try {
            await user.click(screen.getByRole("button", { name: /next/i }));
            currentStep++;
            await waitFor(() => {
              expect(
                screen.getByText(new RegExp(`step ${currentStep}`, "i"))
              ).toBeInTheDocument();
            });
          } catch {
            break; // Reached final step
          }
        }

        // Should have consistent submit button
        expect(
          screen.getByRole("button", { name: submitText })
        ).toBeInTheDocument();

        unmount();
      }
    });
  });
});
