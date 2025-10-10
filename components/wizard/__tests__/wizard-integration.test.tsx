/**
 * Integration Tests for Complete Wizard Workflows
 * Tests end-to-end wizard functionality across all wizard types
 */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock external dependencies
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

vi.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

// Mock database operations
vi.mock("@/lib/db/drizzle", () => ({
  default: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock server actions
vi.mock("@/lib/actions/unified-wizard-actions", () => ({
  createPropertyFromWizard: vi
    .fn()
    .mockResolvedValue({ success: true, id: "prop-123" }),
  createLandFromWizard: vi
    .fn()
    .mockResolvedValue({ success: true, id: "land-123" }),
  createBlogFromWizard: vi
    .fn()
    .mockResolvedValue({ success: true, id: "blog-123" }),
  updatePropertyFromWizard: vi.fn().mockResolvedValue({ success: true }),
  updateLandFromWizard: vi.fn().mockResolvedValue({ success: true }),
  updateBlogFromWizard: vi.fn().mockResolvedValue({ success: true }),
}));

// Import components after mocking
import { PropertyWizard } from "@/components/wizard/property/property-wizard";
import { LandWizard } from "@/components/wizard/land/land-wizard";
import { BlogWizard } from "@/components/wizard/blog/blog-wizard";
import { WizardPersistence } from "@/lib/wizard/wizard-persistence";
import type {
  PropertyWizardData,
  LandWizardData,
  BlogWizardData,
} from "@/types/wizard-core";

// Test data
const mockPropertyData: Partial<PropertyWizardData> = {
  title: "Beautiful Villa",
  description: "A stunning villa with ocean views",
  price: 500000,
  surface: 200,
  propertyType: "villa",
  bedrooms: 3,
  bathrooms: 2,
  characteristics: ["pool", "garden", "garage"],
  address: {
    street: "123 Ocean Drive",
    city: "Miami",
    state: "FL",
    zipCode: "33101",
    country: "USA",
  },
  coordinates: {
    lat: 25.7617,
    lng: -80.1918,
  },
  images: [
    {
      id: "img-1",
      url: "https://example.com/image1.jpg",
      filename: "image1.jpg",
      size: 1024000,
      contentType: "image/jpeg",
      width: 1920,
      height: 1080,
      displayOrder: 0,
    },
  ],
};

const mockLandData: Partial<LandWizardData> = {
  title: "Prime Development Land",
  description: "Perfect for residential development",
  price: 200000,
  surface: 5000,
  landType: "residential",
  location: "Downtown District",
  coordinates: {
    lat: 25.7617,
    lng: -80.1918,
  },
  zoning: "R-2",
  utilities: ["water", "electricity", "sewer"],
  images: [
    {
      id: "img-1",
      url: "https://example.com/land1.jpg",
      filename: "land1.jpg",
      size: 512000,
      contentType: "image/jpeg",
      width: 1600,
      height: 900,
      displayOrder: 0,
    },
  ],
};

const mockBlogData: Partial<BlogWizardData> = {
  title: "Real Estate Market Trends 2024",
  description: "Analysis of current market conditions",
  content: "The real estate market in 2024 shows interesting trends...",
  author: "John Smith",
  category: "market-analysis",
  coverImage: "https://example.com/blog-cover.jpg",
  tags: ["market", "trends", "2024"],
  seoTitle: "Real Estate Market Trends 2024 - Expert Analysis",
  seoDescription:
    "Comprehensive analysis of real estate market trends for 2024",
};

describe("Property Wizard Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  it("should complete full property creation workflow", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(<PropertyWizard onComplete={onComplete} />);

    // Step 1: General Information
    expect(screen.getByText("Información General")).toBeInTheDocument();

    await user.type(screen.getByLabelText(/título/i), mockPropertyData.title!);
    await user.type(
      screen.getByLabelText(/descripción/i),
      mockPropertyData.description!
    );
    await user.type(
      screen.getByLabelText(/precio/i),
      mockPropertyData.price!.toString()
    );
    await user.selectOptions(
      screen.getByLabelText(/tipo de propiedad/i),
      mockPropertyData.propertyType!
    );

    // Navigate to next step
    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    // Step 2: Location
    await waitFor(() => {
      expect(screen.getByText("Ubicación")).toBeInTheDocument();
    });

    await user.type(
      screen.getByLabelText(/dirección/i),
      mockPropertyData.address!.street
    );
    await user.type(
      screen.getByLabelText(/ciudad/i),
      mockPropertyData.address!.city
    );

    // Navigate to next step
    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    // Step 3: Media
    await waitFor(() => {
      expect(screen.getByText("Fotos y Videos")).toBeInTheDocument();
    });

    // Mock file upload
    const fileInput = screen.getByLabelText(/subir imágenes/i);
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    await user.upload(fileInput, file);

    // Navigate to preview
    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    // Step 4: Preview
    await waitFor(() => {
      expect(screen.getByText("Vista Previa")).toBeInTheDocument();
    });

    // Verify data is displayed correctly
    expect(screen.getByText(mockPropertyData.title!)).toBeInTheDocument();
    expect(screen.getByText(mockPropertyData.description!)).toBeInTheDocument();

    // Complete wizard
    await user.click(screen.getByRole("button", { name: /completar/i }));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it("should handle draft saving and loading", async () => {
    const user = userEvent.setup();

    // Mock WizardPersistence
    const saveDraftSpy = vi
      .spyOn(WizardPersistence, "saveDraft")
      .mockResolvedValue({
        success: true,
        data: { draftId: "property-draft-123" },
      });

    const loadDraftSpy = vi
      .spyOn(WizardPersistence, "loadDraft")
      .mockResolvedValue({
        success: true,
        data: {
          data: mockPropertyData,
          currentStep: "general",
          stepProgress: { general: true },
          completionPercentage: 25,
        },
      });

    render(<PropertyWizard />);

    // Fill in some data
    await user.type(screen.getByLabelText(/título/i), mockPropertyData.title!);
    await user.type(
      screen.getByLabelText(/descripción/i),
      mockPropertyData.description!
    );

    // Save draft
    await user.click(screen.getByRole("button", { name: /guardar borrador/i }));

    await waitFor(() => {
      expect(saveDraftSpy).toHaveBeenCalled();
    });

    // Simulate loading draft in new wizard instance
    render(<PropertyWizard draftId="property-draft-123" />);

    await waitFor(() => {
      expect(loadDraftSpy).toHaveBeenCalledWith("property-draft-123");
    });
  });

  it("should handle validation errors gracefully", async () => {
    const user = userEvent.setup();

    render(<PropertyWizard />);

    // Try to proceed without filling required fields
    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/título es requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/descripción es requerida/i)).toBeInTheDocument();
    });

    // Should stay on current step
    expect(screen.getByText("Información General")).toBeInTheDocument();
  });

  it("should support keyboard navigation", async () => {
    const user = userEvent.setup();

    render(<PropertyWizard initialData={mockPropertyData} />);

    // Use keyboard shortcut to navigate
    await user.keyboard("{Control>}{ArrowRight}{/Control}");

    await waitFor(() => {
      expect(screen.getByText("Ubicación")).toBeInTheDocument();
    });

    // Navigate back
    await user.keyboard("{Control>}{ArrowLeft}{/Control}");

    await waitFor(() => {
      expect(screen.getByText("Información General")).toBeInTheDocument();
    });
  });
});

describe("Land Wizard Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should complete full land creation workflow", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(<LandWizard onComplete={onComplete} />);

    // Step 1: General Information
    await user.type(screen.getByLabelText(/título/i), mockLandData.title!);
    await user.type(
      screen.getByLabelText(/descripción/i),
      mockLandData.description!
    );
    await user.type(
      screen.getByLabelText(/precio/i),
      mockLandData.price!.toString()
    );
    await user.type(
      screen.getByLabelText(/superficie/i),
      mockLandData.surface!.toString()
    );

    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    // Step 2: Location
    await waitFor(() => {
      expect(screen.getByText("Ubicación")).toBeInTheDocument();
    });

    await user.type(
      screen.getByLabelText(/ubicación/i),
      mockLandData.location!
    );

    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    // Step 3: Media
    await waitFor(() => {
      expect(screen.getByText("Fotos y Videos")).toBeInTheDocument();
    });

    const fileInput = screen.getByLabelText(/subir imágenes/i);
    const file = new File(["test"], "land.jpg", { type: "image/jpeg" });
    await user.upload(fileInput, file);

    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    // Step 4: Preview
    await waitFor(() => {
      expect(screen.getByText("Vista Previa")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /completar/i }));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it("should handle land-specific validation", async () => {
    const user = userEvent.setup();

    render(<LandWizard />);

    // Try to proceed with invalid land type
    await user.type(screen.getByLabelText(/título/i), "Test Land");
    await user.selectOptions(
      screen.getByLabelText(/tipo de terreno/i),
      "invalid-type"
    );

    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    // Should show validation error for invalid land type
    await waitFor(() => {
      expect(screen.getByText(/tipo de terreno inválido/i)).toBeInTheDocument();
    });
  });
});

describe("Blog Wizard Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should complete full blog creation workflow", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(<BlogWizard onComplete={onComplete} />);

    // Step 1: Content
    await user.type(screen.getByLabelText(/título/i), mockBlogData.title!);
    await user.type(screen.getByLabelText(/contenido/i), mockBlogData.content!);
    await user.selectOptions(
      screen.getByLabelText(/categoría/i),
      mockBlogData.category!
    );

    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    // Step 2: Media
    await waitFor(() => {
      expect(screen.getByText("Multimedia")).toBeInTheDocument();
    });

    await user.type(
      screen.getByLabelText(/imagen de portada/i),
      mockBlogData.coverImage!
    );

    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    // Step 3: SEO
    await waitFor(() => {
      expect(screen.getByText("SEO")).toBeInTheDocument();
    });

    await user.type(
      screen.getByLabelText(/título seo/i),
      mockBlogData.seoTitle!
    );
    await user.type(
      screen.getByLabelText(/descripción seo/i),
      mockBlogData.seoDescription!
    );

    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    // Step 4: Preview
    await waitFor(() => {
      expect(screen.getByText("Vista Previa")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /completar/i }));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it("should handle rich text editing", async () => {
    const user = userEvent.setup();

    render(<BlogWizard />);

    // Find rich text editor
    const editor = screen.getByRole("textbox", { name: /contenido/i });

    // Type content
    await user.type(editor, mockBlogData.content!);

    // Verify content is updated
    expect(editor).toHaveValue(mockBlogData.content);
  });
});

describe("Cross-Wizard Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle multiple wizard instances simultaneously", async () => {
    const user = userEvent.setup();

    // Render multiple wizards
    const { rerender } = render(<PropertyWizard />);

    // Fill property wizard
    await user.type(screen.getByLabelText(/título/i), "Property Title");

    // Switch to land wizard
    rerender(<LandWizard />);

    // Fill land wizard
    await user.type(screen.getByLabelText(/título/i), "Land Title");

    // Both should maintain their state independently
    rerender(<PropertyWizard />);
    expect(screen.getByDisplayValue("Property Title")).toBeInTheDocument();

    rerender(<LandWizard />);
    expect(screen.getByDisplayValue("Land Title")).toBeInTheDocument();
  });

  it("should handle offline/online state transitions", async () => {
    const user = userEvent.setup();

    // Mock online/offline events
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: true,
    });

    render(<PropertyWizard />);

    // Fill some data
    await user.type(screen.getByLabelText(/título/i), "Test Property");

    // Go offline
    Object.defineProperty(navigator, "onLine", { value: false });
    fireEvent(window, new Event("offline"));

    // Save draft (should use localStorage)
    await user.click(screen.getByRole("button", { name: /guardar borrador/i }));

    // Go back online
    Object.defineProperty(navigator, "onLine", { value: true });
    fireEvent(window, new Event("online"));

    // Should sync with database
    await waitFor(() => {
      expect(WizardPersistence.syncDrafts).toHaveBeenCalled();
    });
  });

  it("should handle concurrent auto-save operations", async () => {
    const user = userEvent.setup();

    const autoSaveSpy = vi
      .spyOn(WizardPersistence, "autoSaveDraft")
      .mockResolvedValue({
        success: true,
        data: { draftId: "auto-save-123" },
      });

    render(<PropertyWizard />);

    // Rapid typing should debounce auto-save
    const titleInput = screen.getByLabelText(/título/i);

    await user.type(titleInput, "T");
    await user.type(titleInput, "e");
    await user.type(titleInput, "s");
    await user.type(titleInput, "t");

    // Wait for debounce
    await waitFor(
      () => {
        expect(autoSaveSpy).toHaveBeenCalledTimes(1);
      },
      { timeout: 2000 }
    );
  });

  it("should handle memory pressure and cleanup", async () => {
    const clearCacheSpy = vi.spyOn(WizardPersistence, "clearMemoryCache");
    const clearTimeoutsSpy = vi.spyOn(
      WizardPersistence,
      "clearAutoSaveTimeouts"
    );

    const { unmount } = render(<PropertyWizard />);

    // Unmount component
    unmount();

    // Should cleanup resources
    expect(clearTimeoutsSpy).toHaveBeenCalled();
  });
});

describe("Error Recovery Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should recover from network failures", async () => {
    const user = userEvent.setup();

    // Mock network failure
    vi.spyOn(WizardPersistence, "saveDraft").mockRejectedValueOnce(
      new Error("Network error")
    );

    render(<PropertyWizard />);

    await user.type(screen.getByLabelText(/título/i), "Test Property");

    // Try to save draft
    await user.click(screen.getByRole("button", { name: /guardar borrador/i }));

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/error de red/i)).toBeInTheDocument();
    });

    // Mock successful retry
    vi.spyOn(WizardPersistence, "saveDraft").mockResolvedValueOnce({
      success: true,
      data: { draftId: "retry-success" },
    });

    // Retry save
    await user.click(screen.getByRole("button", { name: /reintentar/i }));

    await waitFor(() => {
      expect(screen.getByText(/borrador guardado/i)).toBeInTheDocument();
    });
  });

  it("should handle corrupted draft data", async () => {
    const user = userEvent.setup();

    // Mock corrupted draft
    vi.spyOn(WizardPersistence, "loadDraft").mockResolvedValueOnce({
      success: false,
      error: "Corrupted draft data",
    });

    render(<PropertyWizard draftId="corrupted-draft" />);

    // Should show error and offer to start fresh
    await waitFor(() => {
      expect(screen.getByText(/borrador corrupto/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /empezar de nuevo/i })
      ).toBeInTheDocument();
    });

    // Start fresh
    await user.click(screen.getByRole("button", { name: /empezar de nuevo/i }));

    // Should reset to initial state
    expect(screen.getByText("Información General")).toBeInTheDocument();
  });

  it("should handle validation schema changes", async () => {
    const user = userEvent.setup();

    // Mock draft with old schema
    vi.spyOn(WizardPersistence, "loadDraft").mockResolvedValueOnce({
      success: true,
      data: {
        data: {
          title: "Old Property",
          oldField: "deprecated value", // Field no longer in schema
        },
        currentStep: "general",
        stepProgress: {},
        completionPercentage: 25,
      },
    });

    render(<PropertyWizard draftId="old-schema-draft" />);

    // Should load compatible fields and ignore deprecated ones
    await waitFor(() => {
      expect(screen.getByDisplayValue("Old Property")).toBeInTheDocument();
    });

    // Should not crash on deprecated fields
    expect(screen.queryByText("oldField")).not.toBeInTheDocument();
  });
});
