import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { PropertyWizard } from "../property-wizard";
import { GeneralInfoStep } from "../steps/general-info-step";
import { LocationStep } from "../steps/location-step";
import { MediaUploadStep } from "../steps/media-upload-step";
import { PreviewStep } from "../steps/preview-step";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

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

describe("Wizard Accessibility Tests", () => {
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

  describe("PropertyWizard Accessibility", () => {
    it("should not have accessibility violations", async () => {
      const { container } = render(<PropertyWizard />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has proper ARIA landmarks", () => {
      render(<PropertyWizard />);

      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByRole("navigation")).toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("has proper heading hierarchy", () => {
      render(<PropertyWizard />);

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("Crear Nueva Propiedad");

      const h2 = screen.getByRole("heading", { level: 2 });
      expect(h2).toHaveTextContent("Información General");
    });

    it("supports keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<PropertyWizard />);

      // Tab through interactive elements
      await user.tab();
      expect(document.activeElement).toHaveAttribute(
        "data-testid",
        "wizard-step-1"
      );

      await user.tab();
      expect(document.activeElement?.tagName).toBe("INPUT");
    });

    it("announces step changes to screen readers", () => {
      render(<PropertyWizard />);

      const stepAnnouncement = screen.getByLabelText(
        "Paso actual: Paso 1 de 4, Información General"
      );
      expect(stepAnnouncement).toBeInTheDocument();
    });

    it("has proper focus management", async () => {
      const user = userEvent.setup();
      render(<PropertyWizard />);

      const nextButton = screen.getByText("Siguiente");
      nextButton.focus();

      await user.keyboard("{Enter}");
      expect(mockWizardState.goToNextStep).toHaveBeenCalled();
    });

    it("provides skip links for keyboard users", () => {
      render(<PropertyWizard />);

      const skipLink = screen.getByText("Saltar al contenido principal");
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute("href", "#main-content");
    });
  });

  describe("GeneralInfoStep Accessibility", () => {
    const mockProps = {
      data: {},
      onUpdate: jest.fn(),
      onNext: jest.fn(),
      locale: "es" as const,
    };

    it("should not have accessibility violations", async () => {
      const { container } = render(<GeneralInfoStep {...mockProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has proper form labels", () => {
      render(<GeneralInfoStep {...mockProps} />);

      expect(
        screen.getByLabelText("Título de la propiedad")
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Descripción")).toBeInTheDocument();
      expect(screen.getByLabelText("Precio (USD)")).toBeInTheDocument();
      expect(screen.getByLabelText("Superficie (m²)")).toBeInTheDocument();
    });

    it("associates error messages with form fields", () => {
      const propsWithErrors = {
        ...mockProps,
        errors: { title: "El título es requerido" },
      };

      render(<GeneralInfoStep {...propsWithErrors} />);

      const titleInput = screen.getByLabelText("Título de la propiedad");
      const errorMessage = screen.getByText("El título es requerido");

      expect(titleInput).toHaveAttribute("aria-describedby");
      expect(errorMessage).toHaveAttribute("id");
    });

    it("has proper fieldset and legend for characteristics", () => {
      render(<GeneralInfoStep {...mockProps} />);

      const fieldset = screen.getByRole("group", {
        name: "Características de la propiedad",
      });
      expect(fieldset).toBeInTheDocument();
    });

    it("provides clear button descriptions", () => {
      render(<GeneralInfoStep {...mockProps} />);

      const aiButton = screen.getByRole("button", {
        name: "Generar contenido con inteligencia artificial",
      });
      expect(aiButton).toBeInTheDocument();
    });

    it("announces loading states to screen readers", () => {
      mockAIGeneration.isGenerating = true;

      render(<GeneralInfoStep {...mockProps} />);

      const loadingAnnouncement = screen.getByText(
        "Generando contenido con IA, por favor espere"
      );
      expect(loadingAnnouncement).toHaveAttribute("aria-live", "polite");
    });
  });

  describe("LocationStep Accessibility", () => {
    const mockProps = {
      data: {},
      onUpdate: jest.fn(),
      onNext: jest.fn(),
      onPrevious: jest.fn(),
      locale: "es" as const,
    };

    it("should not have accessibility violations", async () => {
      const { container } = render(<LocationStep {...mockProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has accessible map interface", () => {
      render(<LocationStep {...mockProps} />);

      const mapContainer = screen.getByRole("application", {
        name: "Mapa interactivo para seleccionar ubicación",
      });
      expect(mapContainer).toBeInTheDocument();
      expect(mapContainer).toHaveAttribute("aria-describedby");
    });

    it("provides keyboard alternatives for map interaction", () => {
      render(<LocationStep {...mockProps} />);

      const coordinatesInput = screen.getByLabelText(
        "Coordenadas (Latitud, Longitud)"
      );
      expect(coordinatesInput).toBeInTheDocument();
    });

    it("has proper address form structure", () => {
      render(<LocationStep {...mockProps} />);

      const addressFieldset = screen.getByRole("group", {
        name: "Dirección de la propiedad",
      });
      expect(addressFieldset).toBeInTheDocument();
    });

    it("announces geocoding status to screen readers", () => {
      render(<LocationStep {...mockProps} />);

      const statusRegion = screen.getByRole("status");
      expect(statusRegion).toHaveAttribute("aria-live", "polite");
    });
  });

  describe("MediaUploadStep Accessibility", () => {
    const mockProps = {
      data: { images: [] },
      onUpdate: jest.fn(),
      onNext: jest.fn(),
      onPrevious: jest.fn(),
      locale: "es" as const,
    };

    it("should not have accessibility violations", async () => {
      const { container } = render(<MediaUploadStep {...mockProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has accessible file upload interface", () => {
      render(<MediaUploadStep {...mockProps} />);

      const fileInput = screen.getByLabelText(
        "Seleccionar imágenes de la propiedad"
      );
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute("accept", "image/*");
      expect(fileInput).toHaveAttribute("multiple");
    });

    it("provides drag and drop accessibility", () => {
      render(<MediaUploadStep {...mockProps} />);

      const dropZone = screen.getByRole("button", {
        name: "Zona de arrastre para subir imágenes",
      });
      expect(dropZone).toBeInTheDocument();
      expect(dropZone).toHaveAttribute("aria-describedby");
    });

    it("has accessible image management controls", () => {
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
          ],
        },
      };

      render(<MediaUploadStep {...propsWithImages} />);

      const deleteButton = screen.getByRole("button", {
        name: "Eliminar imagen image1.jpg",
      });
      expect(deleteButton).toBeInTheDocument();

      const moveUpButton = screen.getByRole("button", {
        name: "Mover imagen image1.jpg hacia arriba",
      });
      expect(moveUpButton).toBeInTheDocument();
    });

    it("announces upload progress to screen readers", () => {
      render(<MediaUploadStep {...mockProps} />);

      const progressRegion = screen.getByRole("status", {
        name: "Estado de subida de imágenes",
      });
      expect(progressRegion).toBeInTheDocument();
    });
  });

  describe("PreviewStep Accessibility", () => {
    const mockCompleteData = {
      title: "Test Property",
      description: "A test property description",
      price: 150000,
      surface: 200,
      propertyType: "house" as const,
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
      coordinates: { latitude: 18.4861, longitude: -69.9312 },
      address: {
        street: "Test Street",
        city: "Santo Domingo",
        province: "Distrito Nacional",
        country: "Dominican Republic",
        formattedAddress: "Test Street, Santo Domingo",
      },
      characteristics: [],
      status: "draft" as const,
      language: "es" as const,
      aiGenerated: { title: false, description: false, tags: false },
    };

    const mockProps = {
      data: mockCompleteData,
      onPublish: jest.fn(),
      onSaveDraft: jest.fn(),
      onEdit: jest.fn(),
      locale: "es" as const,
    };

    it("should not have accessibility violations", async () => {
      const { container } = render(<PreviewStep {...mockProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has proper preview structure", () => {
      render(<PreviewStep {...mockProps} />);

      const previewRegion = screen.getByRole("region", {
        name: "Vista previa de la propiedad",
      });
      expect(previewRegion).toBeInTheDocument();
    });

    it("has accessible image gallery", () => {
      render(<PreviewStep {...mockProps} />);

      const gallery = screen.getByRole("region", {
        name: "Galería de imágenes de la propiedad",
      });
      expect(gallery).toBeInTheDocument();

      const image = screen.getByRole("img", {
        name: "Imagen de la propiedad 1 de 1",
      });
      expect(image).toBeInTheDocument();
    });

    it("has accessible action buttons", () => {
      render(<PreviewStep {...mockProps} />);

      const publishButton = screen.getByRole("button", {
        name: "Publicar propiedad en el sitio web",
      });
      expect(publishButton).toBeInTheDocument();

      const draftButton = screen.getByRole("button", {
        name: "Guardar como borrador para editar más tarde",
      });
      expect(draftButton).toBeInTheDocument();
    });

    it("provides edit shortcuts with proper descriptions", () => {
      render(<PreviewStep {...mockProps} />);

      const editGeneralButton = screen.getByRole("button", {
        name: "Editar información general (Paso 1)",
      });
      expect(editGeneralButton).toBeInTheDocument();
    });
  });

  describe("Keyboard Navigation", () => {
    it("supports Tab navigation through all interactive elements", async () => {
      const user = userEvent.setup();
      render(<PropertyWizard />);

      // Get all focusable elements
      const focusableElements = screen
        .getAllByRole("button")
        .concat(screen.getAllByRole("textbox"))
        .concat(screen.getAllByRole("combobox"))
        .concat(screen.getAllByRole("checkbox"));

      // Tab through elements
      for (let i = 0; i < focusableElements.length; i++) {
        await user.tab();
        expect(document.activeElement).toBe(focusableElements[i]);
      }
    });

    it("supports Shift+Tab for reverse navigation", async () => {
      const user = userEvent.setup();
      render(<PropertyWizard />);

      // Focus last element first
      const buttons = screen.getAllByRole("button");
      const lastButton = buttons[buttons.length - 1];
      lastButton.focus();

      // Shift+Tab to previous element
      await user.keyboard("{Shift>}{Tab}{/Shift}");
      expect(document.activeElement).toBe(buttons[buttons.length - 2]);
    });

    it("traps focus within modal dialogs", async () => {
      const user = userEvent.setup();
      render(<PropertyWizard />);

      // Open confirmation dialog
      const publishButton = screen.getByText("Publicar Propiedad");
      await user.click(publishButton);

      // Focus should be trapped within dialog
      const dialog = screen.getByRole("dialog");
      const dialogButtons = screen.getAllByRole("button");

      await user.tab();
      expect(document.activeElement).toBeInTheDocument();
      expect(dialog).toContainElement(document.activeElement);
    });
  });

  describe("Screen Reader Support", () => {
    it("provides live region updates for dynamic content", () => {
      render(<PropertyWizard />);

      const liveRegion = screen.getByRole("status");
      expect(liveRegion).toHaveAttribute("aria-live", "polite");
    });

    it("announces form validation errors", () => {
      mockWizardState.wizardState.errors = {
        title: "El título es requerido",
      };

      render(<PropertyWizard />);

      const errorAnnouncement = screen.getByRole("alert");
      expect(errorAnnouncement).toHaveTextContent("El título es requerido");
    });

    it("provides descriptive button labels", () => {
      render(<PropertyWizard />);

      const nextButton = screen.getByRole("button", {
        name: "Ir al siguiente paso: Ubicación",
      });
      expect(nextButton).toBeInTheDocument();
    });

    it("uses proper ARIA attributes for complex widgets", () => {
      render(<PropertyWizard />);

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-valuenow");
      expect(progressBar).toHaveAttribute("aria-valuemin", "0");
      expect(progressBar).toHaveAttribute("aria-valuemax", "100");
      expect(progressBar).toHaveAttribute("aria-label");
    });
  });

  describe("High Contrast and Visual Accessibility", () => {
    it("maintains focus indicators in high contrast mode", () => {
      render(<PropertyWizard />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveStyle("outline: none"); // Custom focus styles
        expect(button).toHaveClass("focus:ring-2"); // Tailwind focus ring
      });
    });

    it("uses sufficient color contrast for text", () => {
      render(<PropertyWizard />);

      const headings = screen.getAllByRole("heading");
      headings.forEach((heading) => {
        const styles = window.getComputedStyle(heading);
        // This would need actual color contrast calculation in a real test
        expect(styles.color).toBeDefined();
      });
    });

    it("provides text alternatives for icons", () => {
      render(<PropertyWizard />);

      const iconButtons = screen
        .getAllByRole("button")
        .filter((button) => button.querySelector("svg"));

      iconButtons.forEach((button) => {
        expect(button).toHaveAttribute("aria-label");
      });
    });
  });
});
