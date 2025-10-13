import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropertyCard } from '@/components/properties/property-card';
import { LandCard } from '@/components/lands/land-card';
import { BlogCard } from '@/components/blog/blog-card';
import { PropertyWizard } from "../optimized-property-wizard";
import { LandWizard } from "../land/land-wizard";
import { BlogWizard } from "../blog/blog-wizard";
import { createMockPropertyData, createMockFile } from "./test-utils";
import { PropertyType } from '@/types/wizard';
import userEvent from "@testing-library/user-event";

// Mock the preview components to verify they receive correct data
jest.mock("@/components/properties/property-card", () => ({
  PropertyCard: jest.fn(({ property }) => (
    <div data-testid="property-card">
      <h3>{property.title}</h3>
      <p>{property.description}</p>
      <span>${property.price}</span>
      <span>{property.surface} m²</span>
      <span>{property.propertyType}</span>
      {property.images?.map((img: any, idx: number) => (
        <img key={idx} src={img.url} alt={img.filename} />
      ))}
    </div>
  )),
}));

jest.mock("@/components/lands/land-card", () => ({
  LandCard: jest.fn(({ land }) => (
    <div data-testid="land-card">
      <h3>{land.name}</h3>
      <p>{land.description}</p>
      <span>${land.price}</span>
      <span>{land.surface} m²</span>
      <span>{land.landType}</span>
      <span>{land.location}</span>
    </div>
  )),
}));

jest.mock("@/components/blog/blog-card", () => ({
  BlogCard: jest.fn(({ post }) => (
    <div data-testid="blog-card">
      <h3>{post.title}</h3>
      <p>{post.content}</p>
      <span>{post.author}</span>
      <span>{post.category}</span>
      {post.coverImage && <img src={post.coverImage} alt="Cover" />}
      <div>{post.tags?.join(", ")}</div>
    </div>
  )),
}));

// Mock actions
jest.mock("@/lib/actions/property-actions", () => ({
  createProperty: jest
    .fn()
    .mockResolvedValue({ success: true, id: "prop-123" }),
}));

jest.mock("@/lib/actions/land-wizard-actions", () => ({
  createLand: jest.fn().mockResolvedValue({ success: true, id: "land-123" }),
}));

jest.mock("@/lib/actions/blog-wizard-actions", () => ({
  createBlogPost: jest
    .fn()
    .mockResolvedValue({ success: true, id: "blog-123" }),
}));

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

describe("Preview Component Compatibility Tests", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
  });

  describe("Property Wizard to Property Card Compatibility", () => {
    it("should generate data compatible with PropertyCard component", async () => {
      const mockData = createMockPropertyData();
      let capturedData: any = null;

      const onComplete = jest.fn((data) => {
        capturedData = data;
      });

      render(
        <TestWrapper>
          <PropertyWizard onComplete={onComplete} />
        </TestWrapper>
      );

      // Complete the wizard with test data
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

      // Navigate through all steps
      for (let i = 0; i < 4; i++) {
        await user.click(screen.getByRole("button", { name: /next/i }));
        await waitFor(() => {
          // Wait for step transition
        });
      }

      // Submit
      await user.click(
        screen.getByRole("button", { name: /create property/i })
      );

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });

      // Verify the data structure is compatible with PropertyCard
      expect(capturedData).toMatchObject({
        title: expect.any(String),
        description: expect.any(String),
        price: expect.any(Number),
        surface: expect.any(Number),
        propertyType: expect.any(String),
      });

      // Test that PropertyCard can render the data
      render(<PropertyCard property={capturedData} />);

      expect(screen.getByTestId("property-card")).toBeInTheDocument();
      expect(screen.getByText(mockData.title)).toBeInTheDocument();
      expect(screen.getByText(mockData.description)).toBeInTheDocument();
    });

    it("should maintain image data structure compatibility", async () => {
      let capturedData: any = null;

      const onComplete = jest.fn((data) => {
        capturedData = data;
      });

      render(
        <TestWrapper>
          <PropertyWizard onComplete={onComplete} />
        </TestWrapper>
      );

      // Fill minimal required data
      await user.type(screen.getByLabelText(/title/i), "Test Property");
      await user.type(screen.getByLabelText(/price/i), "100000");
      await user.type(screen.getByLabelText(/surface/i), "200");

      // Navigate to images step
      for (let i = 0; i < 3; i++) {
        await user.click(screen.getByRole("button", { name: /next/i }));
        await waitFor(() => {
          // Wait for step transition
        });
      }

      // Upload image
      const fileInput = screen.getByLabelText(/upload images/i);
      const file = createMockFile("test.jpg");
      await user.upload(fileInput, file);

      // Complete wizard
      await user.click(screen.getByRole("button", { name: /next/i }));
      await user.click(
        screen.getByRole("button", { name: /create property/i })
      );

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });

      // Verify image data structure
      expect(capturedData.images).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            url: expect.any(String),
            filename: expect.any(String),
            size: expect.any(Number),
            contentType: expect.any(String),
          }),
        ])
      );

      // Test PropertyCard can render images
      render(<PropertyCard property={capturedData} />);

      const images = screen.getAllByRole("img");
      expect(images.length).toBeGreaterThan(0);
    });

    it("should handle characteristics data compatibility", async () => {
      let capturedData: any = null;

      const onComplete = jest.fn((data) => {
        capturedData = data;
      });

      render(
        <TestWrapper>
          <PropertyWizard onComplete={onComplete} />
        </TestWrapper>
      );

      // Fill basic data and navigate to characteristics
      await user.type(screen.getByLabelText(/title/i), "Test Property");
      await user.type(screen.getByLabelText(/price/i), "100000");
      await user.click(screen.getByRole("button", { name: /next/i }));

      // Select characteristics
      await waitFor(() => {
        expect(screen.getByText(/characteristics/i)).toBeInTheDocument();
      });

      const poolCheckbox = screen.getByLabelText(/pool/i);
      const gardenCheckbox = screen.getByLabelText(/garden/i);
      await user.click(poolCheckbox);
      await user.click(gardenCheckbox);

      // Complete wizard
      for (let i = 0; i < 3; i++) {
        await user.click(screen.getByRole("button", { name: /next/i }));
        await waitFor(() => {
          // Wait for step transition
        });
      }

      await user.click(
        screen.getByRole("button", { name: /create property/i })
      );

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });

      // Verify characteristics structure
      expect(capturedData.characteristics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            selected: true,
          }),
        ])
      );
    });
  });

  describe("Land Wizard to Land Card Compatibility", () => {
    it("should generate data compatible with LandCard component", async () => {
      let capturedData: any = null;

      const onComplete = jest.fn((data) => {
        capturedData = data;
      });

      render(
        <TestWrapper>
          <LandWizard onComplete={onComplete} />
        </TestWrapper>
      );

      // Fill land data
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

      // Navigate to location step
      await user.click(screen.getByRole("button", { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText(/location/i)).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/location/i), "Santo Domingo Este");

      // Complete wizard
      for (let i = 0; i < 2; i++) {
        await user.click(screen.getByRole("button", { name: /next/i }));
        await waitFor(() => {
          // Wait for step transition
        });
      }

      await user.click(screen.getByRole("button", { name: /create land/i }));

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });

      // Verify data structure compatibility
      expect(capturedData).toMatchObject({
        name: "Test Land",
        description: "Beautiful land for development",
        price: 50000,
        surface: 1000,
        landType: "residential",
        location: "Santo Domingo Este",
      });

      // Test LandCard can render the data
      render(<LandCard land={capturedData} />);

      expect(screen.getByTestId("land-card")).toBeInTheDocument();
      expect(screen.getByText("Test Land")).toBeInTheDocument();
      expect(
        screen.getByText("Beautiful land for development")
      ).toBeInTheDocument();
      expect(screen.getByText("$50000")).toBeInTheDocument();
    });

    it("should handle land-specific fields correctly", async () => {
      let capturedData: any = null;

      const onComplete = jest.fn((data) => {
        capturedData = data;
      });

      render(
        <TestWrapper>
          <LandWizard onComplete={onComplete} />
        </TestWrapper>
      );

      // Fill land data with specific fields
      await user.type(screen.getByLabelText(/name/i), "Commercial Land");
      await user.type(screen.getByLabelText(/price/i), "100000");
      await user.type(screen.getByLabelText(/surface/i), "2000");

      // Select commercial land type
      await user.click(screen.getByRole("combobox", { name: /land type/i }));
      await user.click(screen.getByText("Commercial"));

      // Navigate to location and add zoning
      await user.click(screen.getByRole("button", { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/zoning/i)).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/zoning/i), "Commercial Zone C1");

      // Add utilities
      const utilitiesCheckbox = screen.getByLabelText(/electricity/i);
      await user.click(utilitiesCheckbox);

      // Complete wizard
      for (let i = 0; i < 2; i++) {
        await user.click(screen.getByRole("button", { name: /next/i }));
        await waitFor(() => {
          // Wait for step transition
        });
      }

      await user.click(screen.getByRole("button", { name: /create land/i }));

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });

      // Verify land-specific fields
      expect(capturedData).toMatchObject({
        landType: "commercial",
        zoning: "Commercial Zone C1",
        utilities: expect.arrayContaining(["electricity"]),
      });
    });
  });

  describe("Blog Wizard to Blog Card Compatibility", () => {
    it("should generate data compatible with BlogCard component", async () => {
      let capturedData: any = null;

      const onComplete = jest.fn((data) => {
        capturedData = data;
      });

      render(
        <TestWrapper>
          <BlogWizard onComplete={onComplete} />
        </TestWrapper>
      );

      // Fill blog data
      await user.type(
        screen.getByLabelText(/title/i),
        "Real Estate Market Trends"
      );
      await user.type(
        screen.getByLabelText(/content/i),
        "The real estate market is showing interesting trends..."
      );
      await user.type(screen.getByLabelText(/author/i), "John Doe");

      // Select category
      await user.click(screen.getByRole("combobox", { name: /category/i }));
      await user.click(screen.getByText("Market Analysis"));

      // Navigate through steps
      for (let i = 0; i < 3; i++) {
        await user.click(screen.getByRole("button", { name: /next/i }));
        await waitFor(() => {
          // Wait for step transition
        });
      }

      // Add tags in SEO step
      await user.type(
        screen.getByLabelText(/tags/i),
        "market, trends, analysis"
      );

      // Complete wizard
      await user.click(screen.getByRole("button", { name: /next/i }));
      await user.click(screen.getByRole("button", { name: /publish blog/i }));

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });

      // Verify data structure compatibility
      expect(capturedData).toMatchObject({
        title: "Real Estate Market Trends",
        content: "The real estate market is showing interesting trends...",
        author: "John Doe",
        category: "Market Analysis",
        tags: expect.arrayContaining(["market", "trends", "analysis"]),
      });

      // Test BlogCard can render the data
      render(<BlogCard post={capturedData} />);

      expect(screen.getByTestId("blog-card")).toBeInTheDocument();
      expect(screen.getByText("Real Estate Market Trends")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("market, trends, analysis")).toBeInTheDocument();
    });

    it("should handle SEO fields correctly", async () => {
      let capturedData: any = null;

      const onComplete = jest.fn((data) => {
        capturedData = data;
      });

      render(
        <TestWrapper>
          <BlogWizard onComplete={onComplete} />
        </TestWrapper>
      );

      // Fill basic blog data
      await user.type(screen.getByLabelText(/title/i), "SEO Test Blog");
      await user.type(
        screen.getByLabelText(/content/i),
        "Content for SEO testing"
      );
      await user.type(screen.getByLabelText(/author/i), "SEO Tester");

      // Navigate to SEO step
      for (let i = 0; i < 2; i++) {
        await user.click(screen.getByRole("button", { name: /next/i }));
        await waitFor(() => {
          // Wait for step transition
        });
      }

      // Fill SEO fields
      await user.type(
        screen.getByLabelText(/seo title/i),
        "SEO Optimized Title"
      );
      await user.type(
        screen.getByLabelText(/meta description/i),
        "This is a meta description for SEO"
      );
      await user.type(
        screen.getByLabelText(/tags/i),
        "seo, optimization, blog"
      );

      // Complete wizard
      await user.click(screen.getByRole("button", { name: /next/i }));
      await user.click(screen.getByRole("button", { name: /publish blog/i }));

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });

      // Verify SEO fields
      expect(capturedData).toMatchObject({
        seoTitle: "SEO Optimized Title",
        seoDescription: "This is a meta description for SEO",
        tags: expect.arrayContaining(["seo", "optimization", "blog"]),
      });
    });

    it("should handle cover image compatibility", async () => {
      let capturedData: any = null;

      const onComplete = jest.fn((data) => {
        capturedData = data;
      });

      render(
        <TestWrapper>
          <BlogWizard onComplete={onComplete} />
        </TestWrapper>
      );

      // Fill basic data and navigate to media step
      await user.type(screen.getByLabelText(/title/i), "Image Test Blog");
      await user.type(
        screen.getByLabelText(/content/i),
        "Blog with cover image"
      );
      await user.click(screen.getByRole("button", { name: /next/i }));

      // Upload cover image
      await waitFor(() => {
        expect(screen.getByLabelText(/cover image/i)).toBeInTheDocument();
      });

      const fileInput = screen.getByLabelText(/cover image/i);
      const file = createMockFile("cover.jpg");
      await user.upload(fileInput, file);

      // Complete wizard
      for (let i = 0; i < 2; i++) {
        await user.click(screen.getByRole("button", { name: /next/i }));
        await waitFor(() => {
          // Wait for step transition
        });
      }

      await user.click(screen.getByRole("button", { name: /publish blog/i }));

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });

      // Verify cover image
      expect(capturedData.coverImage).toBeDefined();
      expect(typeof capturedData.coverImage).toBe("string");

      // Test BlogCard can render with cover image
      render(<BlogCard post={capturedData} />);

      const coverImage = screen.getByRole("img", { name: /cover/i });
      expect(coverImage).toBeInTheDocument();
      expect(coverImage).toHaveAttribute("src", capturedData.coverImage);
    });
  });

  describe("Cross-Component Data Validation", () => {
    it("should maintain consistent data types across all wizards", async () => {
      const dataTypes = {
        property: null as any,
        land: null as any,
        blog: null as any,
      };

      // Capture data from each wizard type
      const propertyComplete = jest.fn((data) => {
        dataTypes.property = data;
      });
      const landComplete = jest.fn((data) => {
        dataTypes.land = data;
      });
      const blogComplete = jest.fn((data) => {
        dataTypes.blog = data;
      });

      // Test property wizard
      const { unmount: unmountProperty } = render(
        <TestWrapper>
          <PropertyWizard onComplete={propertyComplete} />
        </TestWrapper>
      );

      await user.type(screen.getByLabelText(/title/i), "Property Test");
      await user.type(screen.getByLabelText(/price/i), "100000");

      // Quick completion
      for (let i = 0; i < 4; i++) {
        await user.click(screen.getByRole("button", { name: /next/i }));
        await waitFor(() => {});
      }
      await user.click(
        screen.getByRole("button", { name: /create property/i })
      );

      await waitFor(() => {
        expect(propertyComplete).toHaveBeenCalled();
      });

      unmountProperty();

      // Test land wizard
      const { unmount: unmountLand } = render(
        <TestWrapper>
          <LandWizard onComplete={landComplete} />
        </TestWrapper>
      );

      await user.type(screen.getByLabelText(/name/i), "Land Test");
      await user.type(screen.getByLabelText(/price/i), "50000");

      for (let i = 0; i < 3; i++) {
        await user.click(screen.getByRole("button", { name: /next/i }));
        await waitFor(() => {});
      }
      await user.click(screen.getByRole("button", { name: /create land/i }));

      await waitFor(() => {
        expect(landComplete).toHaveBeenCalled();
      });

      unmountLand();

      // Test blog wizard
      const { unmount: unmountBlog } = render(
        <TestWrapper>
          <BlogWizard onComplete={blogComplete} />
        </TestWrapper>
      );

      await user.type(screen.getByLabelText(/title/i), "Blog Test");
      await user.type(screen.getByLabelText(/content/i), "Blog content");

      for (let i = 0; i < 3; i++) {
        await user.click(screen.getByRole("button", { name: /next/i }));
        await waitFor(() => {});
      }
      await user.click(screen.getByRole("button", { name: /publish blog/i }));

      await waitFor(() => {
        expect(blogComplete).toHaveBeenCalled();
      });

      unmountBlog();

      // Verify consistent data types
      expect(typeof dataTypes.property.price).toBe("number");
      expect(typeof dataTypes.land.price).toBe("number");
      expect(typeof dataTypes.property.title).toBe("string");
      expect(typeof dataTypes.land.name).toBe("string");
      expect(typeof dataTypes.blog.title).toBe("string");

      // Verify date fields are consistent
      if (dataTypes.property.createdAt) {
        expect(dataTypes.property.createdAt).toBeInstanceOf(Date);
      }
      if (dataTypes.land.createdAt) {
        expect(dataTypes.land.createdAt).toBeInstanceOf(Date);
      }
      if (dataTypes.blog.createdAt) {
        expect(dataTypes.blog.createdAt).toBeInstanceOf(Date);
      }
    });

    it("should handle missing optional fields gracefully", async () => {
      const onComplete = jest.fn();

      render(
        <TestWrapper>
          <PropertyWizard onComplete={onComplete} />
        </TestWrapper>
      );

      // Fill only required fields
      await user.type(screen.getByLabelText(/title/i), "Minimal Property");
      await user.type(screen.getByLabelText(/price/i), "100000");
      await user.type(screen.getByLabelText(/surface/i), "200");

      // Skip optional fields and complete
      for (let i = 0; i < 4; i++) {
        await user.click(screen.getByRole("button", { name: /next/i }));
        await waitFor(() => {});
      }
      await user.click(
        screen.getByRole("button", { name: /create property/i })
      );

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });

      const capturedData = onComplete.mock.calls[0][0];

      // Test PropertyCard can handle minimal data
      render(<PropertyCard property={capturedData} />);

      expect(screen.getByTestId("property-card")).toBeInTheDocument();
      expect(screen.getByText("Minimal Property")).toBeInTheDocument();
    });
  });
});
