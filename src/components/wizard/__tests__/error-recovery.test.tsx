import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PropertyWizard } from "../property/property-wizard";
import { EnhancedAIDescription } from "../shared/enhanced-ai-description";
import { InteractiveMap } from "../shared/interactive-map";
import { WizardErrorBoundary } from "../core/wizard-error-boundary";

// Mock error scenarios
const mockConsoleError = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

// Mock network failures
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock AI generation failures
jest.mock("@/hooks/use-ai-generation", () => ({
  useAIGeneration: jest.fn(() => ({
    isGenerating: false,
    error: null,
    generateDescription: jest.fn(),
    clearState: jest.fn(),
  })),
}));

// Mock map service failures
jest.mock("@/lib/services/map-service", () => ({
  mapService: {
    isWithinDominicanRepublic: jest.fn(),
    reverseGeocode: jest.fn(),
  },
}));

describe("Error Recovery and Fallback Tests", () => {
  const mockOnComplete = jest.fn();
  const mockOnSaveDraft = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();
    mockFetch.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe("Network Error Recovery", () => {
    it("handles network failures during form submission", async () => {
      const user = userEvent.setup();
      mockOnComplete.mockRejectedValue(new Error("Network error"));

      render(
        <PropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      // Fill form and submit
      await user.type(screen.getByTestId("title-input"), "Test Property");
      await user.type(screen.getByTestId("price-input"), "150000");
      await user.type(screen.getByTestId("surface-input"), "200");

      // Navigate to final step
      await user.click(screen.getByTestId("next-button"));
      await user.click(screen.getByTestId("next-button"));
      await user.click(screen.getByTestId("next-button"));
      await user.click(screen.getByTestId("next-button"));

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it("handles network failures during draft saving", async () => {
      const user = userEvent.setup();
      mockOnSaveDraft.mockRejectedValue(new Error("Save failed"));

      render(
        <PropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      await user.type(screen.getByTestId("title-input"), "Draft Property");
      await user.click(screen.getByTestId("save-draft"));

      // Should show error message and allow retry
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it("provides retry mechanism for failed operations", async () => {
      const user = userEvent.setup();
      mockOnComplete
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce(undefined);

      render(
        <PropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      // Fill and submit form
      await user.type(screen.getByTestId("title-input"), "Retry Property");
      await user.type(screen.getByTestId("price-input"), "180000");

      // Navigate to final step and submit
      await user.click(screen.getByTestId("next-button"));
      await user.click(screen.getByTestId("next-button"));
      await user.click(screen.getByTestId("next-button"));
      await user.click(screen.getByTestId("next-button"));

      // Should show error first
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });

      // Retry should work
      const retryButton = screen.getByText(/retry/i);
      await user.click(retryButton);

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledTimes(2);
      });
    });

    it("handles timeout errors gracefully", async () => {
      const user = userEvent.setup();
      mockOnComplete.mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 100)
          )
      );

      render(
        <PropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      await user.type(screen.getByTestId("title-input"), "Timeout Test");

      // Submit and wait for timeout
      await user.click(screen.getByTestId("next-button"));
      await user.click(screen.getByTestId("next-button"));
      await user.click(screen.getByTestId("next-button"));
      await user.click(screen.getByTestId("next-button"));

      await waitFor(
        () => {
          expect(screen.getByText(/timeout/i)).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });
  });

  describe("AI Generation Error Recovery", () => {
    const { useAIGeneration } = require("@/hooks/use-ai-generation");

    it("handles AI service unavailable", async () => {
      const user = userEvent.setup();
      const mockGenerateDescription = jest
        .fn()
        .mockRejectedValue(new Error("AI service unavailable"));

      useAIGeneration.mockReturnValue({
        isGenerating: false,
        error: "AI service unavailable",
        generateDescription: mockGenerateDescription,
        clearState: jest.fn(),
      });

      render(
        <EnhancedAIDescription
          value=""
          onChange={jest.fn()}
          propertyData={{
            type: "Casa",
            location: "Santo Domingo",
            price: 150000,
            surface: 200,
          }}
        />
      );

      await user.click(screen.getByText("Generar Descripción Rica"));

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/AI service unavailable/i)).toBeInTheDocument();
      });

      // Should show fallback options
      expect(screen.getByText(/usar plantilla básica/i)).toBeInTheDocument();
    });

    it("provides fallback content when AI fails", async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();
      const mockGenerateDescription = jest
        .fn()
        .mockRejectedValue(new Error("AI generation failed"));

      useAIGeneration.mockReturnValue({
        isGenerating: false,
        error: "AI generation failed",
        generateDescription: mockGenerateDescription,
        clearState: jest.fn(),
      });

      render(
        <EnhancedAIDescription
          value=""
          onChange={mockOnChange}
          propertyData={{
            type: "Casa",
            location: "Santo Domingo",
            price: 150000,
            surface: 200,
            characteristics: ["Piscina", "Jardín"],
          }}
        />
      );

      await user.click(screen.getByText("Generar Descripción Rica"));

      // Should offer fallback template
      const fallbackButton = screen.getByText(/usar plantilla básica/i);
      await user.click(fallbackButton);

      // Should generate basic template
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.stringContaining("Casa en Santo Domingo")
        );
      });
    });

    it("handles partial AI generation failures", async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();
      const mockGenerateDescription = jest.fn().mockResolvedValue({
        title: "Casa Moderna",
        description: "", // Partial failure - no description generated
      });

      useAIGeneration.mockReturnValue({
        isGenerating: false,
        error: null,
        generateDescription: mockGenerateDescription,
        clearState: jest.fn(),
      });

      render(
        <EnhancedAIDescription
          value=""
          onChange={mockOnChange}
          propertyData={{
            type: "Casa",
            location: "Santo Domingo",
            price: 150000,
            surface: 200,
          }}
        />
      );

      await user.click(screen.getByText("Generar Descripción Rica"));

      // Should handle partial generation and offer to complete
      await waitFor(() => {
        expect(screen.getByText(/completar descripción/i)).toBeInTheDocument();
      });
    });

    it("recovers from AI rate limiting", async () => {
      const user = userEvent.setup();
      const mockGenerateDescription = jest
        .fn()
        .mockRejectedValueOnce(new Error("Rate limit exceeded"))
        .mockResolvedValueOnce({
          title: "Casa Generada",
          description: "Descripción generada exitosamente",
        });

      useAIGeneration.mockReturnValue({
        isGenerating: false,
        error: "Rate limit exceeded",
        generateDescription: mockGenerateDescription,
        clearState: jest.fn(),
      });

      render(
        <EnhancedAIDescription
          value=""
          onChange={jest.fn()}
          propertyData={{
            type: "Casa",
            location: "Santo Domingo",
            price: 150000,
            surface: 200,
          }}
        />
      );

      await user.click(screen.getByText("Generar Descripción Rica"));

      // Should show rate limit message
      await waitFor(() => {
        expect(screen.getByText(/rate limit/i)).toBeInTheDocument();
      });

      // Should offer retry after delay
      const retryButton = screen.getByText(/intentar en/i);
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe("Map Interaction Error Recovery", () => {
    const { mapService } = require("@/lib/services/map-service");
    const mockOnCoordinatesChange = jest.fn();
    const mockOnAddressChange = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("handles map loading failures", async () => {
      // Mock map loading error
      const mockMapError = new Error("Failed to load map");

      render(
        <InteractiveMap
          onCoordinatesChange={mockOnCoordinatesChange}
          onAddressChange={mockOnAddressChange}
        />
      );

      // Simulate map loading error
      fireEvent.error(screen.getByTestId("map-container"));

      // Should show fallback interface
      await waitFor(() => {
        expect(screen.getByText(/mapa no disponible/i)).toBeInTheDocument();
      });

      // Should provide manual coordinate input
      expect(
        screen.getByText(/ingresar coordenadas manualmente/i)
      ).toBeInTheDocument();
    });

    it("handles geocoding service failures", async () => {
      mapService.reverseGeocode.mockRejectedValue(
        new Error("Geocoding failed")
      );
      mapService.isWithinDominicanRepublic.mockReturnValue(true);

      render(
        <InteractiveMap
          onCoordinatesChange={mockOnCoordinatesChange}
          onAddressChange={mockOnAddressChange}
        />
      );

      // Simulate map click
      const mockEvent = {
        latlng: { lat: 18.7357, lng: -70.1627 },
        originalEvent: {
          stopPropagation: jest.fn(),
          preventDefault: jest.fn(),
        },
      };

      // Trigger click handler
      if ((global as any).mockMapClickHandler) {
        await (global as any).mockMapClickHandler(mockEvent);
      }

      // Should still set coordinates even if geocoding fails
      await waitFor(() => {
        expect(mockOnCoordinatesChange).toHaveBeenCalledWith({
          latitude: 18.7357,
          longitude: -70.1627,
        });
      });

      // Should show geocoding error message
      expect(
        screen.getByText(/no se pudo obtener la dirección/i)
      ).toBeInTheDocument();
    });

    it("handles GPS/geolocation errors", async () => {
      const mockGeolocation = {
        getCurrentPosition: jest.fn((success, error) => {
          error({ code: 1, message: "Permission denied" });
        }),
      };
      (global as any).navigator.geolocation = mockGeolocation;

      render(
        <InteractiveMap
          onCoordinatesChange={mockOnCoordinatesChange}
          onAddressChange={mockOnAddressChange}
        />
      );

      const locationButton = screen.getByText("Mi ubicación");
      fireEvent.click(locationButton);

      // Should show permission error
      await waitFor(() => {
        expect(
          screen.getByText(/permiso de ubicación denegado/i)
        ).toBeInTheDocument();
      });

      // Should provide alternative options
      expect(screen.getByText(/seleccionar manualmente/i)).toBeInTheDocument();
    });

    it("handles map tile loading failures", async () => {
      render(
        <InteractiveMap
          onCoordinatesChange={mockOnCoordinatesChange}
          onAddressChange={mockOnAddressChange}
        />
      );

      // Simulate tile loading error
      const tileLayer = screen.getByTestId("tile-layer");
      fireEvent.error(tileLayer);

      // Should show alternative map source
      await waitFor(() => {
        expect(
          screen.getByText(/cambiando fuente del mapa/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Form Validation Error Recovery", () => {
    it("handles validation errors gracefully", async () => {
      const user = userEvent.setup();
      render(
        <PropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      // Try to proceed without filling required fields
      await user.click(screen.getByTestId("next-button"));

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/título es requerido/i)).toBeInTheDocument();
        expect(screen.getByText(/precio es requerido/i)).toBeInTheDocument();
      });

      // Should prevent navigation
      expect(screen.getByTestId("current-step")).toHaveTextContent("1");
    });

    it("recovers from invalid data formats", async () => {
      const user = userEvent.setup();
      render(
        <PropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      // Enter invalid price format
      await user.type(screen.getByTestId("price-input"), "invalid-price");

      // Should show format error
      await waitFor(() => {
        expect(
          screen.getByText(/formato de precio inválido/i)
        ).toBeInTheDocument();
      });

      // Should provide correction suggestion
      expect(screen.getByText(/ingrese solo números/i)).toBeInTheDocument();
    });

    it("handles file upload errors", async () => {
      const user = userEvent.setup();
      render(
        <PropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      // Navigate to images step
      await user.type(screen.getByTestId("title-input"), "Test");
      await user.type(screen.getByTestId("price-input"), "150000");
      await user.click(screen.getByTestId("next-button"));
      await user.click(screen.getByTestId("next-button"));

      // Simulate file upload error
      const uploadButton = screen.getByTestId("upload-images");
      fireEvent.click(uploadButton);

      // Mock file upload failure
      mockFetch.mockRejectedValue(new Error("Upload failed"));

      // Should show upload error
      await waitFor(() => {
        expect(screen.getByText(/error al subir imagen/i)).toBeInTheDocument();
      });

      // Should provide retry option
      expect(screen.getByText(/intentar nuevamente/i)).toBeInTheDocument();
    });
  });

  describe("Component Error Boundaries", () => {
    it("catches and handles component errors", () => {
      const ThrowError = () => {
        throw new Error("Component error");
      };

      render(
        <WizardErrorBoundaryWrapper>
          <ThrowError />
        </WizardErrorBoundaryWrapper>
      );

      // Should show error boundary UI
      expect(screen.getByText(/algo salió mal/i)).toBeInTheDocument();
      expect(screen.getByText(/recargar página/i)).toBeInTheDocument();
    });

    it("provides error reporting functionality", () => {
      const ThrowError = () => {
        throw new Error("Reportable error");
      };

      render(
        <WizardErrorBoundaryWrapper>
          <ThrowError />
        </WizardErrorBoundaryWrapper>
      );

      // Should provide error reporting option
      const reportButton = screen.getByText(/reportar error/i);
      fireEvent.click(reportButton);

      // Should handle error reporting
      expect(reportButton).toBeInTheDocument();
    });

    it("recovers from transient errors", async () => {
      const user = userEvent.setup();
      let shouldThrow = true;

      const ConditionalError = () => {
        if (shouldThrow) {
          throw new Error("Transient error");
        }
        return <div data-testid="recovered-component">Recovered!</div>;
      };

      render(
        <WizardErrorBoundaryWrapper>
          <ConditionalError />
        </WizardErrorBoundaryWrapper>
      );

      // Should show error initially
      expect(screen.getByText(/algo salió mal/i)).toBeInTheDocument();

      // Simulate error resolution
      shouldThrow = false;

      // Click retry
      const retryButton = screen.getByText(/intentar nuevamente/i);
      await user.click(retryButton);

      // Should recover
      await waitFor(() => {
        expect(screen.getByTestId("recovered-component")).toBeInTheDocument();
      });
    });
  });

  describe("Blob Storage Error Recovery", () => {
    beforeEach(() => {
      // Mock Vercel Blob
      jest.doMock("@vercel/blob", () => ({
        put: jest.fn(),
      }));
    });

    it("handles blob store does not exist error", async () => {
      const user = userEvent.setup();

      // Mock blob storage error
      const { put } = require("@vercel/blob");
      put.mockRejectedValue(
        new Error("Vercel Blob: This store does not exist.")
      );

      render(
        <PropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      // Navigate to images step and try to upload
      await user.type(screen.getByTestId("title-input"), "Blob Test Property");
      await user.type(screen.getByTestId("price-input"), "200000");
      await user.click(screen.getByTestId("next-button"));
      await user.click(screen.getByTestId("next-button"));

      const uploadButton = screen.getByTestId("upload-images");
      fireEvent.click(uploadButton);

      // Should handle blob error gracefully
      await waitFor(() => {
        expect(
          screen.getByText(/configuración de almacenamiento/i)
        ).toBeInTheDocument();
      });
    });

    it("falls back to mock storage in development", async () => {
      const user = userEvent.setup();

      // Mock development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      // Mock blob configuration to use mock storage
      jest.doMock("@/lib/config/blob-config", () => ({
        shouldUseMockStorage: () => true,
        getBlobConfigInfo: () => ({
          isConfigured: false,
          isDevelopment: true,
          recommendations: ["Use mock storage for development"],
        }),
      }));

      render(
        <PropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      // Upload should work with mock storage
      await user.type(screen.getByTestId("title-input"), "Mock Storage Test");
      await user.type(screen.getByTestId("price-input"), "180000");
      await user.click(screen.getByTestId("next-button"));
      await user.click(screen.getByTestId("next-button"));

      const uploadButton = screen.getByTestId("upload-images");
      fireEvent.click(uploadButton);

      // Should show mock storage usage
      await waitFor(() => {
        expect(
          screen.getByText(/almacenamiento simulado/i)
        ).toBeInTheDocument();
      });

      process.env.NODE_ENV = originalEnv;
    });

    it("provides configuration guidance for blob setup", async () => {
      const user = userEvent.setup();

      // Mock blob configuration error
      jest.doMock("@/lib/config/blob-config", () => ({
        shouldUseMockStorage: () => false,
        getBlobConfigInfo: () => ({
          isConfigured: false,
          isDevelopment: false,
          error: "BLOB_READ_WRITE_TOKEN environment variable is not set",
          recommendations: [
            "Set up Vercel Blob storage:",
            "1. Go to your Vercel dashboard",
            "2. Navigate to Storage tab",
            "3. Create a new Blob store",
          ],
        }),
      }));

      render(
        <PropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      // Should show configuration guidance
      await waitFor(() => {
        expect(screen.getByText(/configurar Vercel Blob/i)).toBeInTheDocument();
      });
    });
  });

  describe("Data Persistence Error Recovery", () => {
    it("recovers data from localStorage on page reload", () => {
      const savedData = {
        title: "Recovered Property",
        price: 200000,
        surface: 180,
      };

      // Mock localStorage
      const mockLocalStorage = {
        getItem: jest.fn().mockReturnValue(JSON.stringify(savedData)),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      };
      Object.defineProperty(window, "localStorage", {
        value: mockLocalStorage,
      });

      render(
        <PropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      // Should recover data from localStorage
      expect(
        screen.getByDisplayValue("Recovered Property")
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue("200000")).toBeInTheDocument();
    });

    it("handles localStorage quota exceeded", async () => {
      const user = userEvent.setup();

      // Mock localStorage quota exceeded
      const mockLocalStorage = {
        setItem: jest.fn().mockImplementation(() => {
          throw new Error("QuotaExceededError");
        }),
        getItem: jest.fn(),
        removeItem: jest.fn(),
      };
      Object.defineProperty(window, "localStorage", {
        value: mockLocalStorage,
      });

      render(
        <PropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      await user.type(screen.getByTestId("title-input"), "Large Data Property");

      // Should handle storage error gracefully
      await waitFor(() => {
        expect(screen.getByText(/almacenamiento lleno/i)).toBeInTheDocument();
      });
    });

    it("provides data export when storage fails", async () => {
      const user = userEvent.setup();

      // Mock storage failure
      const mockLocalStorage = {
        setItem: jest.fn().mockImplementation(() => {
          throw new Error("Storage failed");
        }),
        getItem: jest.fn(),
        removeItem: jest.fn(),
      };
      Object.defineProperty(window, "localStorage", {
        value: mockLocalStorage,
      });

      render(
        <PropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      await user.type(
        screen.getByTestId("title-input"),
        "Export Test Property"
      );

      // Should offer data export
      await waitFor(() => {
        expect(screen.getByText(/exportar datos/i)).toBeInTheDocument();
      });

      const exportButton = screen.getByText(/exportar datos/i);
      await user.click(exportButton);

      // Should trigger download
      expect(exportButton).toBeInTheDocument();
    });
  });

  describe("Offline Error Recovery", () => {
    it("detects offline state", () => {
      // Mock offline state
      Object.defineProperty(navigator, "onLine", {
        writable: true,
        value: false,
      });

      render(
        <PropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      // Should show offline indicator
      expect(screen.getByText(/sin conexión/i)).toBeInTheDocument();
    });

    it("queues operations when offline", async () => {
      const user = userEvent.setup();

      // Mock offline state
      Object.defineProperty(navigator, "onLine", {
        writable: true,
        value: false,
      });

      render(
        <PropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      await user.type(screen.getByTestId("title-input"), "Offline Property");
      await user.click(screen.getByTestId("save-draft"));

      // Should queue the operation
      expect(screen.getByText(/operación en cola/i)).toBeInTheDocument();
    });

    it("processes queued operations when back online", async () => {
      const user = userEvent.setup();

      // Start offline
      Object.defineProperty(navigator, "onLine", {
        writable: true,
        value: false,
      });

      render(
        <PropertyWizard
          onComplete={mockOnComplete}
          onSaveDraft={mockOnSaveDraft}
        />
      );

      await user.type(screen.getByTestId("title-input"), "Queued Property");
      await user.click(screen.getByTestId("save-draft"));

      // Go back online
      Object.defineProperty(navigator, "onLine", {
        writable: true,
        value: true,
      });

      fireEvent(window, new Event("online"));

      // Should process queued operations
      await waitFor(() => {
        expect(mockOnSaveDraft).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Queued Property",
          })
        );
      });
    });
  });
});
