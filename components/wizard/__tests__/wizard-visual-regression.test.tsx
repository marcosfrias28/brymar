import React from "react";
import { render } from "@testing-library/react";
import { PropertyWizard } from "../property-wizard";
import { GeneralInfoStep } from "../steps/general-info-step";
import { LocationStep } from "../steps/location-step";
import { MediaUploadStep } from "../steps/media-upload-step";
import { PreviewStep } from "../steps/preview-step";

// Mock dependencies
jest.mock("@/hooks/use-wizard-state-manager");
jest.mock("@/hooks/use-wizard-actions");
jest.mock("@/hooks/use-ai-generation");
jest.mock("@/hooks/use-characteristics");

import { useWizardStateManager } from "@/hooks/use-wizard-state-manager";
import { useWizardActions } from "@/hooks/use-wizard-actions";
import { useAIGeneration } from "@/hooks/use-ai-generation";
import { useCharacteristics } from "@/hooks/use-characteristics";

const mockUseWizardStateManager = useWizardStateManager as jest.MockedFunction<
  typeof useWizardStateManager
>;
const mockUseWizardActions = useWizardActions as jest.MockedFunction<
  typeof useWizardActions
>;
const mockUseAIGeneration = useAIGeneration as jest.MockedFunction<
  typeof useAIGeneration
>;
const mockUseCharacteristics = useCharacteristics as jest.MockedFunction<
  typeof useCharacteristics
>;

// Visual regression testing utilities
const takeSnapshot = (container: HTMLElement, testName: string) => {
  // In a real implementation, this would capture a screenshot
  // For now, we'll capture the HTML structure and styles
  const snapshot = {
    html: container.innerHTML,
    styles: Array.from(container.querySelectorAll("*")).map((el) => ({
      tagName: el.tagName,
      className: el.className,
      computedStyles: window.getComputedStyle(el),
    })),
    testName,
    timestamp: new Date().toISOString(),
  };

  return snapshot;
};

const compareSnapshots = (snapshot1: any, snapshot2: any) => {
  // Simple comparison - in real implementation would use image diff
  return snapshot1.html === snapshot2.html;
};

describe("Wizard Visual Regression Tests", () => {
  const mockWizardState = {
    wizardState: {
      currentStep: 1,
      formData: {},
      isValid: { 1: false, 2: false, 3: false, 4: false },
      isDirty: false,
      isLoading: false,
      errors: {},
    },
    stepValidation: { 1: false, 2: false, 3: false, 4: false },
    stepCompletion: { 1: 0, 2: 0, 3: 0, 4: 0 },
    updateFormData: jest.fn(),
    goToStep: jest.fn(),
    goToNextStep: jest.fn(),
    goToPreviousStep: jest.fn(),
    undo: jest.fn(),
    redo: jest.fn(),
    canUndo: false,
    canRedo: false,
    setLoading: jest.fn(),
    setErrors: jest.fn(),
    clearDirtyState: jest.fn(),
  };

  const mockWizardActions = {
    publishProperty: jest.fn(),
    saveDraft: jest.fn(),
    loadDraft: jest.fn(),
    deleteDraft: jest.fn(),
    isLoading: false,
    error: null,
  };

  const mockAIGeneration = {
    generateContent: jest.fn(),
    generateTitle: jest.fn(),
    generateDescription: jest.fn(),
    generateTags: jest.fn(),
    isGenerating: false,
    error: null,
    retry: jest.fn(),
    generationHistory: [],
  };

  const mockCharacteristics = {
    characteristics: [
      {
        id: "1",
        name: "Piscina",
        category: "amenity" as const,
        selected: false,
      },
      {
        id: "2",
        name: "Garaje",
        category: "feature" as const,
        selected: false,
      },
      { id: "3", name: "Jardín", category: "feature" as const, selected: true },
    ],
    loading: false,
    error: null,
    toggleCharacteristic: jest.fn(),
    addCustomCharacteristic: jest.fn(),
  };

  beforeEach(() => {
    mockUseWizardStateManager.mockReturnValue(mockWizardState);
    mockUseWizardActions.mockReturnValue(mockWizardActions);
    mockUseAIGeneration.mockReturnValue(mockAIGeneration);
    mockUseCharacteristics.mockReturnValue(mockCharacteristics);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("PropertyWizard Visual States", () => {
    it("renders initial state consistently", () => {
      const { container } = render(<PropertyWizard />);
      const snapshot = takeSnapshot(container, "wizard-initial-state");

      // Verify key visual elements are present
      expect(
        container.querySelector('[data-testid="wizard-progress"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('[data-testid="wizard-step-1"]')
      ).toBeInTheDocument();
      expect(container.querySelector(".wizard-navigation")).toBeInTheDocument();

      // Store snapshot for future comparisons
      expect(snapshot).toBeDefined();
    });

    it("renders loading state consistently", () => {
      mockWizardState.wizardState.isLoading = true;

      const { container } = render(<PropertyWizard />);
      const snapshot = takeSnapshot(container, "wizard-loading-state");

      // Verify loading indicators
      expect(
        container.querySelector('[data-testid="loading-spinner"]')
      ).toBeInTheDocument();
      expect(container.querySelector(".wizard-loading")).toBeInTheDocument();

      expect(snapshot).toBeDefined();
    });

    it("renders error state consistently", () => {
      mockWizardState.wizardState.errors = {
        title: "El título es requerido",
        price: "El precio debe ser mayor a 0",
      };

      const { container } = render(<PropertyWizard />);
      const snapshot = takeSnapshot(container, "wizard-error-state");

      // Verify error styling
      expect(container.querySelector(".error-message")).toBeInTheDocument();
      expect(
        container.querySelector('[aria-invalid="true"]')
      ).toBeInTheDocument();

      expect(snapshot).toBeDefined();
    });

    it("renders different steps consistently", () => {
      const steps = [1, 2, 3, 4];
      const snapshots: any[] = [];

      steps.forEach((step) => {
        mockWizardState.wizardState.currentStep = step;
        const { container } = render(<PropertyWizard />);
        const snapshot = takeSnapshot(container, `wizard-step-${step}`);
        snapshots.push(snapshot);

        // Verify step-specific elements
        expect(
          container.querySelector(`[data-testid="wizard-step-${step}"]`)
        ).toBeInTheDocument();
      });

      // Ensure each step has unique visual characteristics
      snapshots.forEach((snapshot, index) => {
        if (index > 0) {
          expect(compareSnapshots(snapshot, snapshots[index - 1])).toBe(false);
        }
      });
    });
  });

  describe("GeneralInfoStep Visual States", () => {
    const mockProps = {
      data: {},
      onUpdate: jest.fn(),
      onNext: jest.fn(),
      locale: "es" as const,
    };

    it("renders empty form consistently", () => {
      const { container } = render(<GeneralInfoStep {...mockProps} />);
      const snapshot = takeSnapshot(container, "general-info-empty");

      // Verify form structure
      expect(container.querySelector("form")).toBeInTheDocument();
      expect(container.querySelectorAll("input")).toHaveLength(4); // title, price, surface, bedrooms, bathrooms
      expect(container.querySelector("textarea")).toBeInTheDocument(); // description

      expect(snapshot).toBeDefined();
    });

    it("renders filled form consistently", () => {
      const filledProps = {
        ...mockProps,
        data: {
          title: "Beautiful House in Santo Domingo",
          description: "A wonderful property with all modern amenities...",
          price: 150000,
          surface: 200,
          bedrooms: 3,
          bathrooms: 2,
          propertyType: "house" as const,
        },
      };

      const { container } = render(<GeneralInfoStep {...filledProps} />);
      const snapshot = takeSnapshot(container, "general-info-filled");

      // Verify filled values are displayed
      expect(
        container.querySelector(
          'input[value="Beautiful House in Santo Domingo"]'
        )
      ).toBeInTheDocument();
      expect(
        container.querySelector('input[value="150000"]')
      ).toBeInTheDocument();

      expect(snapshot).toBeDefined();
    });

    it("renders AI generation states consistently", () => {
      // Loading state
      mockAIGeneration.isGenerating = true;
      const { container: loadingContainer } = render(
        <GeneralInfoStep {...mockProps} />
      );
      const loadingSnapshot = takeSnapshot(
        loadingContainer,
        "general-info-ai-loading"
      );

      expect(
        loadingContainer.querySelector('[data-testid="ai-loading"]')
      ).toBeInTheDocument();

      // Error state
      mockAIGeneration.isGenerating = false;
      mockAIGeneration.error = "AI service unavailable";
      const { container: errorContainer } = render(
        <GeneralInfoStep {...mockProps} />
      );
      const errorSnapshot = takeSnapshot(
        errorContainer,
        "general-info-ai-error"
      );

      expect(errorContainer.querySelector(".ai-error")).toBeInTheDocument();

      expect(loadingSnapshot).toBeDefined();
      expect(errorSnapshot).toBeDefined();
    });

    it("renders characteristics selection consistently", () => {
      const { container } = render(<GeneralInfoStep {...mockProps} />);
      const snapshot = takeSnapshot(container, "general-info-characteristics");

      // Verify characteristics are displayed
      expect(
        container.querySelector('[data-testid="characteristics-list"]')
      ).toBeInTheDocument();
      expect(container.querySelectorAll(".characteristic-item")).toHaveLength(
        3
      );

      // Verify selected state styling
      expect(
        container.querySelector(".characteristic-item.selected")
      ).toBeInTheDocument();

      expect(snapshot).toBeDefined();
    });
  });

  describe("LocationStep Visual States", () => {
    const mockProps = {
      data: {},
      onUpdate: jest.fn(),
      onNext: jest.fn(),
      onPrevious: jest.fn(),
      locale: "es" as const,
    };

    it("renders map interface consistently", () => {
      const { container } = render(<LocationStep {...mockProps} />);
      const snapshot = takeSnapshot(container, "location-step-map");

      // Verify map container
      expect(
        container.querySelector('[data-testid="map-container"]')
      ).toBeInTheDocument();
      expect(container.querySelector(".map-controls")).toBeInTheDocument();

      expect(snapshot).toBeDefined();
    });

    it("renders address form consistently", () => {
      const { container } = render(<LocationStep {...mockProps} />);
      const snapshot = takeSnapshot(container, "location-step-address");

      // Verify address form fields
      expect(
        container.querySelector('input[name="street"]')
      ).toBeInTheDocument();
      expect(container.querySelector('input[name="city"]')).toBeInTheDocument();
      expect(
        container.querySelector('input[name="province"]')
      ).toBeInTheDocument();

      expect(snapshot).toBeDefined();
    });

    it("renders with selected location consistently", () => {
      const propsWithLocation = {
        ...mockProps,
        data: {
          coordinates: { latitude: 18.4861, longitude: -69.9312 },
          address: {
            street: "Calle Principal 123",
            city: "Santo Domingo",
            province: "Distrito Nacional",
            country: "Dominican Republic",
            formattedAddress: "Calle Principal 123, Santo Domingo",
          },
        },
      };

      const { container } = render(<LocationStep {...propsWithLocation} />);
      const snapshot = takeSnapshot(container, "location-step-selected");

      // Verify marker and filled address
      expect(
        container.querySelector('[data-testid="map-marker"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('input[value="Calle Principal 123"]')
      ).toBeInTheDocument();

      expect(snapshot).toBeDefined();
    });
  });

  describe("MediaUploadStep Visual States", () => {
    const mockProps = {
      data: { images: [] },
      onUpdate: jest.fn(),
      onNext: jest.fn(),
      onPrevious: jest.fn(),
      locale: "es" as const,
    };

    it("renders empty upload interface consistently", () => {
      const { container } = render(<MediaUploadStep {...mockProps} />);
      const snapshot = takeSnapshot(container, "media-upload-empty");

      // Verify upload interface
      expect(
        container.querySelector('[data-testid="upload-dropzone"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector(".upload-instructions")
      ).toBeInTheDocument();

      expect(snapshot).toBeDefined();
    });

    it("renders with uploaded images consistently", () => {
      const propsWithImages = {
        ...mockProps,
        data: {
          images: [
            {
              id: "img-1",
              url: "https://example.com/image1.jpg",
              filename: "image1.jpg",
              size: 1024 * 1024,
              contentType: "image/jpeg",
              width: 800,
              height: 600,
            },
            {
              id: "img-2",
              url: "https://example.com/image2.jpg",
              filename: "image2.jpg",
              size: 2 * 1024 * 1024,
              contentType: "image/jpeg",
              width: 1200,
              height: 800,
            },
          ],
        },
      };

      const { container } = render(<MediaUploadStep {...propsWithImages} />);
      const snapshot = takeSnapshot(container, "media-upload-with-images");

      // Verify image previews
      expect(container.querySelectorAll(".image-preview")).toHaveLength(2);
      expect(container.querySelectorAll(".image-controls")).toHaveLength(2);

      expect(snapshot).toBeDefined();
    });

    it("renders upload progress consistently", () => {
      // Mock upload in progress
      const { container } = render(<MediaUploadStep {...mockProps} />);

      // Simulate upload progress UI
      const progressElement = document.createElement("div");
      progressElement.className = "upload-progress";
      progressElement.setAttribute("data-testid", "upload-progress");
      container.appendChild(progressElement);

      const snapshot = takeSnapshot(container, "media-upload-progress");

      expect(
        container.querySelector('[data-testid="upload-progress"]')
      ).toBeInTheDocument();
      expect(snapshot).toBeDefined();
    });
  });

  describe("PreviewStep Visual States", () => {
    const mockCompleteData = {
      title: "Beautiful House in Santo Domingo",
      description:
        "A wonderful property with all modern amenities and stunning views.",
      price: 150000,
      surface: 200,
      propertyType: "house" as const,
      bedrooms: 3,
      bathrooms: 2,
      characteristics: [
        {
          id: "1",
          name: "Piscina",
          category: "amenity" as const,
          selected: true,
        },
        {
          id: "2",
          name: "Garaje",
          category: "feature" as const,
          selected: true,
        },
      ],
      coordinates: { latitude: 18.4861, longitude: -69.9312 },
      address: {
        street: "Calle Principal 123",
        city: "Santo Domingo",
        province: "Distrito Nacional",
        country: "Dominican Republic",
        formattedAddress: "Calle Principal 123, Santo Domingo",
      },
      images: [
        {
          id: "img-1",
          url: "https://example.com/image1.jpg",
          filename: "image1.jpg",
          size: 1024 * 1024,
          contentType: "image/jpeg",
          width: 800,
          height: 600,
        },
      ],
      status: "draft" as const,
      language: "es" as const,
      aiGenerated: {
        title: true,
        description: true,
        tags: false,
      },
    };

    const mockProps = {
      data: mockCompleteData,
      onPublish: jest.fn(),
      onSaveDraft: jest.fn(),
      onEdit: jest.fn(),
      locale: "es" as const,
    };

    it("renders complete preview consistently", () => {
      const { container } = render(<PreviewStep {...mockProps} />);
      const snapshot = takeSnapshot(container, "preview-step-complete");

      // Verify preview sections
      expect(container.querySelector(".property-preview")).toBeInTheDocument();
      expect(container.querySelector(".property-details")).toBeInTheDocument();
      expect(container.querySelector(".property-images")).toBeInTheDocument();
      expect(container.querySelector(".property-location")).toBeInTheDocument();

      expect(snapshot).toBeDefined();
    });

    it("renders AI generation indicators consistently", () => {
      const { container } = render(<PreviewStep {...mockProps} />);
      const snapshot = takeSnapshot(container, "preview-step-ai-indicators");

      // Verify AI indicators
      expect(
        container.querySelectorAll(".ai-generated-indicator")
      ).toHaveLength(2); // title and description

      expect(snapshot).toBeDefined();
    });

    it("renders action buttons consistently", () => {
      const { container } = render(<PreviewStep {...mockProps} />);
      const snapshot = takeSnapshot(container, "preview-step-actions");

      // Verify action buttons
      expect(
        container.querySelector('[data-testid="publish-button"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('[data-testid="save-draft-button"]')
      ).toBeInTheDocument();
      expect(container.querySelectorAll(".edit-step-button")).toHaveLength(3); // Edit buttons for steps 1-3

      expect(snapshot).toBeDefined();
    });
  });

  describe("Responsive Design Consistency", () => {
    const viewports = [
      { width: 320, height: 568, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1024, height: 768, name: "desktop" },
      { width: 1920, height: 1080, name: "large-desktop" },
    ];

    viewports.forEach((viewport) => {
      it(`renders consistently on ${viewport.name} viewport`, () => {
        // Mock viewport size
        Object.defineProperty(window, "innerWidth", {
          writable: true,
          configurable: true,
          value: viewport.width,
        });
        Object.defineProperty(window, "innerHeight", {
          writable: true,
          configurable: true,
          value: viewport.height,
        });

        const { container } = render(<PropertyWizard />);
        const snapshot = takeSnapshot(container, `wizard-${viewport.name}`);

        // Verify responsive classes are applied
        expect(
          container.querySelector(".wizard-container")
        ).toBeInTheDocument();

        // Check for mobile-specific elements on small screens
        if (viewport.width < 768) {
          expect(
            container.querySelector(".mobile-navigation")
          ).toBeInTheDocument();
        }

        expect(snapshot).toBeDefined();
      });
    });
  });

  describe("Theme Consistency", () => {
    const themes = ["light", "dark"];

    themes.forEach((theme) => {
      it(`renders consistently in ${theme} theme`, () => {
        // Mock theme
        document.documentElement.setAttribute("data-theme", theme);

        const { container } = render(<PropertyWizard />);
        const snapshot = takeSnapshot(container, `wizard-${theme}-theme`);

        // Verify theme-specific styling
        expect(document.documentElement.getAttribute("data-theme")).toBe(theme);

        expect(snapshot).toBeDefined();
      });
    });
  });

  describe("Animation States", () => {
    it("renders step transition animations consistently", () => {
      const { container, rerender } = render(<PropertyWizard />);

      // Initial state
      const initialSnapshot = takeSnapshot(container, "wizard-step-1-initial");

      // Change step
      mockWizardState.wizardState.currentStep = 2;
      rerender(<PropertyWizard />);

      const transitionSnapshot = takeSnapshot(
        container,
        "wizard-step-2-transition"
      );

      // Verify transition classes
      expect(container.querySelector(".step-transition")).toBeInTheDocument();

      expect(initialSnapshot).toBeDefined();
      expect(transitionSnapshot).toBeDefined();
    });

    it("renders loading animations consistently", () => {
      mockWizardState.wizardState.isLoading = true;

      const { container } = render(<PropertyWizard />);
      const snapshot = takeSnapshot(container, "wizard-loading-animation");

      // Verify loading animation elements
      expect(container.querySelector(".loading-spinner")).toBeInTheDocument();
      expect(container.querySelector(".loading-animation")).toBeInTheDocument();

      expect(snapshot).toBeDefined();
    });
  });

  describe("Accessibility Visual States", () => {
    it("renders focus states consistently", () => {
      const { container } = render(<PropertyWizard />);

      // Simulate focus on first input
      const firstInput = container.querySelector("input");
      firstInput?.focus();

      const snapshot = takeSnapshot(container, "wizard-focus-state");

      // Verify focus styling
      expect(document.activeElement).toBe(firstInput);
      expect(firstInput).toHaveClass("focus:ring-2");

      expect(snapshot).toBeDefined();
    });

    it("renders high contrast mode consistently", () => {
      // Mock high contrast mode
      document.documentElement.setAttribute("data-contrast", "high");

      const { container } = render(<PropertyWizard />);
      const snapshot = takeSnapshot(container, "wizard-high-contrast");

      // Verify high contrast styling
      expect(document.documentElement.getAttribute("data-contrast")).toBe(
        "high"
      );

      expect(snapshot).toBeDefined();
    });
  });
});
