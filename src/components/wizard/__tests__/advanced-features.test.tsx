import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TemplateSelector } from "../template-selector";
import { PropertyComparison } from "../property-comparison";
import { SocialMediaPreview } from "../social-media-preview";
import { SEOOptimizer } from "../seo-optimizer";
import { TemplateService } from '@/lib/services/template-service';
import { PropertyFormData } from '@/types/template';

// Mock the template service
jest.mock("@/lib/services/template-service");

const mockPropertyData: PropertyFormData = {
  title: "Casa en Santo Domingo",
  description:
    "Hermosa casa residencial con excelente ubicación y acabados de calidad premium.",
  price: 150000,
  surface: 200,
  propertyType: "house",
  bedrooms: 3,
  bathrooms: 2,
  characteristics: ["parking", "garden", "security"],
  coordinates: {
    latitude: 18.4861,
    longitude: -69.9312,
  },
  address: {
    street: "Calle Principal 123",
    city: "Santo Domingo",
    province: "Distrito Nacional",
    country: "Dominican Republic",
  },
  images: [
    {
      url: "/villa/1.jpg",
      filename: "house1.jpg",
      size: 1024000,
    },
  ],
  status: "draft",
  language: "es",
};

describe("Advanced Wizard Features", () => {
  beforeEach(() => {
    // Mock template service methods
    (TemplateService.getTemplates as jest.Mock).mockReturnValue([
      {
        id: "residential-house",
        name: "Casa Residencial",
        description: "Plantilla para casas residenciales típicas",
        category: "residential",
        propertyType: "house",
        defaultData: {
          title: "Casa en [Ubicación]",
          description: "Hermosa casa residencial con excelente ubicación.",
          surface: 150,
          bedrooms: 3,
          bathrooms: 2,
          characteristics: ["parking", "garden", "security"],
        },
        characteristics: ["parking", "garden", "security"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    (TemplateService.getTemplatesByCategory as jest.Mock).mockReturnValue([
      {
        id: "residential-house",
        name: "Casa Residencial",
        description: "Plantilla para casas residenciales típicas",
        category: "residential",
        propertyType: "house",
        defaultData: {
          title: "Casa en [Ubicación]",
          description: "Hermosa casa residencial con excelente ubicación.",
          surface: 150,
          bedrooms: 3,
          bathrooms: 2,
          characteristics: ["parking", "garden", "security"],
        },
        characteristics: ["parking", "garden", "security"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    (TemplateService.applyTemplate as jest.Mock).mockReturnValue(
      mockPropertyData
    );
    (TemplateService.validateBulkImportData as jest.Mock).mockReturnValue({
      valid: 1,
      invalid: 1,
      errors: [
        {
          row: 2,
          field: "title",
          message: "El título debe tener al menos 10 caracteres",
        },
      ],
    });
  });

  describe("TemplateSelector", () => {
    it("should display available templates", () => {
      const mockOnSelect = jest.fn();
      const mockOnSkip = jest.fn();

      render(
        <TemplateSelector onSelectTemplate={mockOnSelect} onSkip={mockOnSkip} />
      );

      expect(screen.getByText("Elige una Plantilla")).toBeInTheDocument();
      expect(screen.getByText("Casa Residencial")).toBeInTheDocument();
      expect(screen.getByText("Residencial")).toBeInTheDocument();
    });

    it("should call onSelectTemplate when template is selected", async () => {
      const mockOnSelect = jest.fn();
      const mockOnSkip = jest.fn();

      (TemplateService.applyTemplate as jest.Mock).mockReturnValue(
        mockPropertyData
      );

      render(
        <TemplateSelector onSelectTemplate={mockOnSelect} onSkip={mockOnSkip} />
      );

      const useTemplateButton = screen.getByText("Usar Plantilla");
      fireEvent.click(useTemplateButton);

      expect(mockOnSelect).toHaveBeenCalledWith(mockPropertyData);
    });

    it("should call onSkip when creating from scratch", () => {
      const mockOnSelect = jest.fn();
      const mockOnSkip = jest.fn();

      render(
        <TemplateSelector onSelectTemplate={mockOnSelect} onSkip={mockOnSkip} />
      );

      const createFromScratchButton = screen.getByText("Crear desde Cero");
      fireEvent.click(createFromScratchButton);

      expect(mockOnSkip).toHaveBeenCalled();
    });
  });

  describe("PropertyComparison", () => {
    it("should display property comparison analysis", async () => {
      const mockOnClose = jest.fn();

      render(
        <PropertyComparison
          currentProperty={mockPropertyData}
          onClose={mockOnClose}
        />
      );

      // Should show loading initially
      expect(screen.getByText("Analizando el Mercado")).toBeInTheDocument();

      // Wait for analysis to complete
      await waitFor(
        () => {
          expect(
            screen.getByText("Análisis Comparativo de Mercado")
          ).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      // Should show market position
      expect(
        screen.getByText(
          /Precio Promedio|Por Encima del Promedio|Por Debajo del Promedio/
        )
      ).toBeInTheDocument();
    });

    it("should display current property details", async () => {
      const mockOnClose = jest.fn();

      render(
        <PropertyComparison
          currentProperty={mockPropertyData}
          onClose={mockOnClose}
        />
      );

      await waitFor(
        () => {
          expect(screen.getByText("Casa en Santo Domingo")).toBeInTheDocument();
          expect(screen.getByText("$150,000")).toBeInTheDocument();
          expect(screen.getByText("200 m²")).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    it("should close when close button is clicked", async () => {
      const mockOnClose = jest.fn();

      render(
        <PropertyComparison
          currentProperty={mockPropertyData}
          onClose={mockOnClose}
        />
      );

      await waitFor(
        () => {
          const closeButton = screen.getByText("Cerrar");
          fireEvent.click(closeButton);
          expect(mockOnClose).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });
  });

  describe("SocialMediaPreview", () => {
    it("should display social media previews for different platforms", () => {
      const mockOnClose = jest.fn();

      render(
        <SocialMediaPreview property={mockPropertyData} onClose={mockOnClose} />
      );

      expect(
        screen.getByText("Vista Previa para Redes Sociales")
      ).toBeInTheDocument();
      expect(screen.getByText("Facebook")).toBeInTheDocument();
      expect(screen.getByText("Instagram")).toBeInTheDocument();
      expect(screen.getByText("Twitter")).toBeInTheDocument();
      expect(screen.getByText("WhatsApp")).toBeInTheDocument();
    });

    it("should allow customizing content for each platform", async () => {
      const user = userEvent.setup();
      const mockOnClose = jest.fn();

      render(
        <SocialMediaPreview property={mockPropertyData} onClose={mockOnClose} />
      );

      // Switch to Instagram tab
      const instagramTab = screen.getByText("Instagram");
      await user.click(instagramTab);

      // Find and modify title input
      const titleInput = screen.getByDisplayValue(/Casa en Santo Domingo/);
      await user.clear(titleInput);
      await user.type(titleInput, "Custom Instagram Title");

      expect(
        screen.getByDisplayValue("Custom Instagram Title")
      ).toBeInTheDocument();
    });

    it("should copy content to clipboard when copy button is clicked", async () => {
      const user = userEvent.setup();
      const mockOnClose = jest.fn();

      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockImplementation(() => Promise.resolve()),
        },
      });

      render(
        <SocialMediaPreview property={mockPropertyData} onClose={mockOnClose} />
      );

      const copyButton = screen.getByText("Copiar Contenido");
      await user.click(copyButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  describe("SEOOptimizer", () => {
    it("should display SEO analysis and suggestions", async () => {
      const mockOnApply = jest.fn();
      const mockOnClose = jest.fn();

      render(
        <SEOOptimizer
          property={mockPropertyData}
          onApplySuggestions={mockOnApply}
          onClose={mockOnClose}
        />
      );

      // Should show loading initially
      expect(screen.getByText("Analizando SEO")).toBeInTheDocument();

      // Wait for analysis to complete
      await waitFor(
        () => {
          expect(screen.getByText("Optimización SEO")).toBeInTheDocument();
          expect(
            screen.getByText("Puntuación SEO General")
          ).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("should show optimization suggestions", async () => {
      const mockOnApply = jest.fn();
      const mockOnClose = jest.fn();

      render(
        <SEOOptimizer
          property={mockPropertyData}
          onApplySuggestions={mockOnApply}
          onClose={mockOnClose}
        />
      );

      await waitFor(
        () => {
          expect(screen.getByText("Título")).toBeInTheDocument();
          expect(screen.getByText("Descripción")).toBeInTheDocument();
          expect(screen.getByText("Palabras Clave")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("should apply optimizations when button is clicked", async () => {
      const user = userEvent.setup();
      const mockOnApply = jest.fn();
      const mockOnClose = jest.fn();

      render(
        <SEOOptimizer
          property={mockPropertyData}
          onApplySuggestions={mockOnApply}
          onClose={mockOnClose}
        />
      );

      await waitFor(
        async () => {
          const applyButton = screen.getByText("Aplicar Optimizaciones");
          await user.click(applyButton);

          expect(mockOnApply).toHaveBeenCalled();
          expect(mockOnClose).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );
    });
  });
});

describe("TemplateService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return available templates", () => {
    const templates = TemplateService.getTemplates();
    expect(Array.isArray(templates)).toBe(true);
  });

  it("should filter templates by category", () => {
    const residentialTemplates =
      TemplateService.getTemplatesByCategory("residential");
    expect(Array.isArray(residentialTemplates)).toBe(true);
  });

  it("should apply template data correctly", () => {
    const template = {
      id: "test-template",
      name: "Test Template",
      description: "Test description",
      category: "residential" as const,
      propertyType: "house",
      defaultData: {
        title: "Test Title",
        price: 100000,
        surface: 150,
      },
      characteristics: ["parking", "garden"],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = TemplateService.applyTemplate(template);

    expect(result.title).toBe("Test Title");
    expect(result.price).toBe(100000);
    expect(result.surface).toBe(150);
    expect(result.characteristics).toContain("parking");
    expect(result.characteristics).toContain("garden");
  });

  it("should validate bulk import data correctly", () => {
    const testData = [
      {
        title: "Valid Property",
        description:
          "This is a valid property description with enough characters to pass validation.",
        price: 150000,
        surface: 200,
        propertyType: "house",
      },
      {
        title: "Invalid", // Too short
        description: "Short", // Too short
        price: -1000, // Invalid price
        surface: 0, // Invalid surface
        propertyType: "", // Missing
      },
    ];

    const result = TemplateService.validateBulkImportData(testData);

    expect(result.valid).toBe(1);
    expect(result.invalid).toBe(1);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
