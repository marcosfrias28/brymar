/**
 * End-to-End Integration Tests for AI Property Wizard
 *
 * This test suite validates the complete wizard workflow including:
 * - Full wizard flow from start to finish
 * - External service integrations (HuggingFace, cloud storage, maps)
 * - Error recovery and fallback mechanisms
 * - Performance under load
 * - Multi-user concurrent scenarios
 */

import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { jest } from "@jest/globals";
import { PropertyWizard } from "../property-wizard";
import { AIService } from '@/lib/services/ai-service';
import { ImageUploadService } from '@/lib/services/image-upload-service';
import { MapService } from '@/lib/services/map-service';
import { WizardAnalyticsService } from '@/lib/services/wizard-analytics-service';

// Mock external services
jest.mock("@/lib/services/ai-service");
jest.mock("@/lib/services/image-upload-service");
jest.mock("@/lib/services/map-service");
jest.mock("@/lib/services/wizard-analytics-service");

// Mock Next.js router
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/dashboard/properties/new",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock authentication
jest.mock("@/lib/auth/auth", () => ({
  getSession: jest.fn().mockResolvedValue({
    user: { id: "user-1", role: "agent" },
  }),
}));

// Test utilities
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWizard = (props = {}) => {
  const queryClient = createQueryClient();
  const defaultProps = {
    onComplete: jest.fn(),
    onSaveDraft: jest.fn(),
    ...props,
  };

  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <PropertyWizard {...defaultProps} />
      </QueryClientProvider>
    ),
    props: defaultProps,
  };
};

// Mock data
const mockPropertyData = {
  title: "Beautiful House in Santo Domingo",
  description: "A wonderful property with ocean views and modern amenities.",
  price: 150000,
  surface: 200,
  propertyType: "house",
  bedrooms: 3,
  bathrooms: 2,
  characteristics: ["pool", "parking", "ocean-view"],
  coordinates: { latitude: 18.4861, longitude: -69.9312 },
  address: {
    street: "Calle Principal 123",
    city: "Santo Domingo",
    province: "Distrito Nacional",
    country: "Dominican Republic",
  },
  images: [
    { id: "1", url: "https://example.com/image1.jpg", filename: "house1.jpg" },
    { id: "2", url: "https://example.com/image2.jpg", filename: "house2.jpg" },
  ],
};

const mockFile = new File(["image content"], "test-image.jpg", {
  type: "image/jpeg",
});

describe("AI Property Wizard - End-to-End Integration", () => {
  let mockAIService: jest.Mocked<typeof AIService>;
  let mockImageUploadService: jest.Mocked<typeof ImageUploadService>;
  let mockMapService: jest.Mocked<typeof MapService>;
  let mockAnalyticsService: jest.Mocked<typeof WizardAnalyticsService>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup AI service mocks
    mockAIService = AIService as jest.Mocked<typeof AIService>;
    mockAIService.generateDescription = jest
      .fn()
      .mockResolvedValue(mockPropertyData.description);
    mockAIService.generateTitle = jest
      .fn()
      .mockResolvedValue(mockPropertyData.title);
    mockAIService.generateTags = jest
      .fn()
      .mockResolvedValue(["luxury", "ocean-view", "modern"]);

    // Setup image upload service mocks
    mockImageUploadService = ImageUploadService as jest.Mocked<
      typeof ImageUploadService
    >;
    mockImageUploadService.generateSignedUrl = jest.fn().mockResolvedValue({
      uploadUrl: "https://upload.example.com/signed-url",
      publicUrl: "https://example.com/image.jpg",
      expiresAt: new Date(Date.now() + 3600000),
    });
    mockImageUploadService.uploadDirect = jest.fn().mockResolvedValue({
      success: true,
      url: "https://example.com/image.jpg",
      metadata: { size: 1024, contentType: "image/jpeg" },
    });

    // Setup map service mocks
    mockMapService = MapService as jest.Mocked<typeof MapService>;
    mockMapService.reverseGeocode = jest
      .fn()
      .mockResolvedValue(mockPropertyData.address);
    mockMapService.geocode = jest
      .fn()
      .mockResolvedValue(mockPropertyData.coordinates);

    // Setup analytics service mocks
    mockAnalyticsService = WizardAnalyticsService as jest.Mocked<
      typeof WizardAnalyticsService
    >;
    mockAnalyticsService.trackStepCompletion = jest
      .fn()
      .mockResolvedValue(undefined);
    mockAnalyticsService.trackAIGeneration = jest
      .fn()
      .mockResolvedValue(undefined);
    mockAnalyticsService.trackUpload = jest.fn().mockResolvedValue(undefined);
  });

  describe("Complete Wizard Flow", () => {
    it("should complete full wizard workflow successfully", async () => {
      const user = userEvent.setup();
      const { props } = renderWizard();

      // Step 1: General Information
      expect(screen.getByText("Información General")).toBeInTheDocument();

      // Fill basic information
      await user.type(screen.getByLabelText(/título/i), mockPropertyData.title);
      await user.type(
        screen.getByLabelText(/precio/i),
        mockPropertyData.price.toString()
      );
      await user.type(
        screen.getByLabelText(/superficie/i),
        mockPropertyData.surface.toString()
      );

      // Select property type
      await user.click(screen.getByLabelText(/tipo de propiedad/i));
      await user.click(screen.getByText("Casa"));

      // Generate AI description
      await user.click(screen.getByText(/generar con ia/i));

      await waitFor(() => {
        expect(mockAIService.generateDescription).toHaveBeenCalled();
        expect(
          screen.getByDisplayValue(mockPropertyData.description)
        ).toBeInTheDocument();
      });

      // Select characteristics
      await user.click(screen.getByLabelText(/piscina/i));
      await user.click(screen.getByLabelText(/estacionamiento/i));

      // Navigate to Step 2
      await user.click(screen.getByText("Siguiente"));

      // Step 2: Location
      await waitFor(() => {
        expect(screen.getByText("Ubicación")).toBeInTheDocument();
      });

      // Simulate map click
      const mapContainer = screen.getByTestId("map-container");
      fireEvent.click(mapContainer, {
        clientX: 100,
        clientY: 100,
      });

      await waitFor(() => {
        expect(mockMapService.reverseGeocode).toHaveBeenCalled();
      });

      // Navigate to Step 3
      await user.click(screen.getByText("Siguiente"));

      // Step 3: Media Upload
      await waitFor(() => {
        expect(screen.getByText("Fotos y Videos")).toBeInTheDocument();
      });

      // Upload images
      const fileInput = screen.getByLabelText(/subir imágenes/i);
      await user.upload(fileInput, [mockFile]);

      await waitFor(() => {
        expect(mockImageUploadService.generateSignedUrl).toHaveBeenCalled();
        expect(mockImageUploadService.uploadDirect).toHaveBeenCalled();
      });

      // Navigate to Step 4
      await user.click(screen.getByText("Siguiente"));

      // Step 4: Preview and Publish
      await waitFor(() => {
        expect(screen.getByText("Vista Previa")).toBeInTheDocument();
      });

      // Verify preview content
      expect(screen.getByText(mockPropertyData.title)).toBeInTheDocument();
      expect(
        screen.getByText(mockPropertyData.description)
      ).toBeInTheDocument();
      expect(
        screen.getByText(`$${mockPropertyData.price.toLocaleString()}`)
      ).toBeInTheDocument();

      // Publish property
      await user.click(screen.getByText("Publicar"));

      await waitFor(() => {
        expect(props.onComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            title: mockPropertyData.title,
            price: mockPropertyData.price,
            surface: mockPropertyData.surface,
          })
        );
      });
    }, 30000);

    it("should handle step navigation with data persistence", async () => {
      const user = userEvent.setup();
      renderWizard();

      // Fill Step 1
      await user.type(screen.getByLabelText(/título/i), "Test Property");
      await user.type(screen.getByLabelText(/precio/i), "100000");

      // Navigate forward and back
      await user.click(screen.getByText("Siguiente"));
      await user.click(screen.getByText("Anterior"));

      // Verify data persistence
      expect(screen.getByDisplayValue("Test Property")).toBeInTheDocument();
      expect(screen.getByDisplayValue("100000")).toBeInTheDocument();
    });
  });

  describe("External Service Integration", () => {
    it("should integrate with HuggingFace AI service", async () => {
      const user = userEvent.setup();
      renderWizard();

      // Fill basic info
      await user.type(screen.getByLabelText(/título/i), "Test House");
      await user.selectOptions(screen.getByLabelText(/tipo/i), "house");

      // Trigger AI generation
      await user.click(screen.getByText(/generar con ia/i));

      await waitFor(() => {
        expect(mockAIService.generateDescription).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "house",
            title: "Test House",
          })
        );
      });
    });

    it("should integrate with cloud storage for image uploads", async () => {
      const user = userEvent.setup();
      renderWizard();

      // Navigate to Step 3
      await user.click(screen.getByText("Siguiente"));
      await user.click(screen.getByText("Siguiente"));

      // Upload image
      const fileInput = screen.getByLabelText(/subir imágenes/i);
      await user.upload(fileInput, mockFile);

      await waitFor(() => {
        expect(mockImageUploadService.generateSignedUrl).toHaveBeenCalledWith(
          "test-image.jpg",
          "image/jpeg"
        );
        expect(mockImageUploadService.uploadDirect).toHaveBeenCalled();
      });
    });

    it("should integrate with map service for geocoding", async () => {
      const user = userEvent.setup();
      renderWizard();

      // Navigate to Step 2
      await user.click(screen.getByText("Siguiente"));

      // Enter address manually
      await user.type(
        screen.getByLabelText(/dirección/i),
        "Calle Principal 123"
      );
      await user.click(screen.getByText(/buscar en mapa/i));

      await waitFor(() => {
        expect(mockMapService.geocode).toHaveBeenCalledWith(
          "Calle Principal 123"
        );
      });
    });
  });

  describe("Error Recovery and Fallback Mechanisms", () => {
    it("should handle AI service failures gracefully", async () => {
      const user = userEvent.setup();

      // Mock AI service failure
      mockAIService.generateDescription = jest
        .fn()
        .mockRejectedValue(new Error("AI service unavailable"));

      renderWizard();

      await user.type(screen.getByLabelText(/título/i), "Test Property");
      await user.click(screen.getByText(/generar con ia/i));

      await waitFor(() => {
        expect(
          screen.getByText(/error al generar contenido/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/intenta nuevamente/i)).toBeInTheDocument();
      });

      // Should allow manual content entry
      await user.type(
        screen.getByLabelText(/descripción/i),
        "Manual description"
      );
      expect(
        screen.getByDisplayValue("Manual description")
      ).toBeInTheDocument();
    });

    it("should handle image upload failures with retry", async () => {
      const user = userEvent.setup();

      // Mock upload failure then success
      mockImageUploadService.uploadDirect = jest
        .fn()
        .mockRejectedValueOnce(new Error("Upload failed"))
        .mockResolvedValueOnce({
          success: true,
          url: "https://example.com/image.jpg",
          metadata: { size: 1024, contentType: "image/jpeg" },
        });

      renderWizard();

      // Navigate to Step 3
      await user.click(screen.getByText("Siguiente"));
      await user.click(screen.getByText("Siguiente"));

      // Upload image
      const fileInput = screen.getByLabelText(/subir imágenes/i);
      await user.upload(fileInput, mockFile);

      // Should show error and retry option
      await waitFor(() => {
        expect(screen.getByText(/error al subir imagen/i)).toBeInTheDocument();
      });

      // Click retry
      await user.click(screen.getByText(/reintentar/i));

      await waitFor(() => {
        expect(mockImageUploadService.uploadDirect).toHaveBeenCalledTimes(2);
        expect(
          screen.getByText(/imagen subida exitosamente/i)
        ).toBeInTheDocument();
      });
    });

    it("should handle network connectivity issues", async () => {
      const user = userEvent.setup();

      // Mock network error
      mockAIService.generateDescription = jest
        .fn()
        .mockRejectedValue(new Error("Network error"));

      renderWizard();

      await user.type(screen.getByLabelText(/título/i), "Test Property");
      await user.click(screen.getByText(/generar con ia/i));

      await waitFor(() => {
        expect(screen.getByText(/problema de conexión/i)).toBeInTheDocument();
        expect(screen.getByText(/verificar conexión/i)).toBeInTheDocument();
      });
    });

    it("should handle validation errors gracefully", async () => {
      const user = userEvent.setup();
      renderWizard();

      // Try to proceed without required fields
      await user.click(screen.getByText("Siguiente"));

      await waitFor(() => {
        expect(screen.getByText(/título es requerido/i)).toBeInTheDocument();
        expect(screen.getByText(/precio es requerido/i)).toBeInTheDocument();
      });

      // Should not navigate to next step
      expect(screen.getByText("Información General")).toBeInTheDocument();
    });
  });

  describe("Performance Under Load", () => {
    it("should handle multiple concurrent AI requests", async () => {
      const user = userEvent.setup();
      renderWizard();

      await user.type(screen.getByLabelText(/título/i), "Test Property");

      // Simulate rapid clicking
      const generateButton = screen.getByText(/generar con ia/i);

      await user.click(generateButton);
      await user.click(generateButton);
      await user.click(generateButton);

      // Should handle concurrent requests gracefully
      await waitFor(() => {
        expect(mockAIService.generateDescription).toHaveBeenCalled();
      });

      // Should not crash or show multiple loading states
      expect(screen.queryAllByText(/generando/i)).toHaveLength(1);
    });

    it("should handle large image uploads efficiently", async () => {
      const user = userEvent.setup();
      renderWizard();

      // Navigate to Step 3
      await user.click(screen.getByText("Siguiente"));
      await user.click(screen.getByText("Siguiente"));

      // Create large mock files
      const largeFiles = Array.from(
        { length: 10 },
        (_, i) =>
          new File(["large image content".repeat(1000)], `image-${i}.jpg`, {
            type: "image/jpeg",
          })
      );

      const fileInput = screen.getByLabelText(/subir imágenes/i);
      await user.upload(fileInput, largeFiles);

      // Should handle batch uploads
      await waitFor(
        () => {
          expect(
            mockImageUploadService.generateSignedUrl
          ).toHaveBeenCalledTimes(10);
        },
        { timeout: 10000 }
      );
    });

    it("should maintain responsiveness during heavy operations", async () => {
      const user = userEvent.setup();
      renderWizard();

      // Start AI generation
      await user.type(screen.getByLabelText(/título/i), "Test Property");
      await user.click(screen.getByText(/generar con ia/i));

      // Should still be able to interact with other elements
      await user.type(screen.getByLabelText(/precio/i), "100000");

      expect(screen.getByDisplayValue("100000")).toBeInTheDocument();
    });
  });

  describe("Multi-User Concurrent Scenarios", () => {
    it("should handle multiple wizard instances", async () => {
      // Render multiple wizard instances
      const { rerender } = renderWizard({ key: "wizard-1" });

      rerender(
        <QueryClientProvider client={createQueryClient()}>
          <PropertyWizard
            key="wizard-2"
            onComplete={jest.fn()}
            onSaveDraft={jest.fn()}
          />
        </QueryClientProvider>
      );

      // Both instances should work independently
      const titleInputs = screen.getAllByLabelText(/título/i);
      expect(titleInputs).toHaveLength(2);
    });

    it("should handle concurrent draft saves", async () => {
      const user = userEvent.setup();
      const mockSaveDraft = jest.fn().mockResolvedValue("draft-id-1");
      renderWizard({ onSaveDraft: mockSaveDraft });

      await user.type(screen.getByLabelText(/título/i), "Draft Property");

      // Simulate rapid draft saves
      await user.click(screen.getByText(/guardar borrador/i));
      await user.click(screen.getByText(/guardar borrador/i));

      await waitFor(() => {
        expect(mockSaveDraft).toHaveBeenCalled();
      });
    });
  });

  describe("Analytics Integration", () => {
    it("should track wizard analytics throughout the flow", async () => {
      const user = userEvent.setup();
      renderWizard();

      // Step 1 completion
      await user.type(screen.getByLabelText(/título/i), "Test Property");
      await user.click(screen.getByText("Siguiente"));

      await waitFor(() => {
        expect(mockAnalyticsService.trackStepCompletion).toHaveBeenCalledWith(
          1,
          expect.any(Object)
        );
      });

      // AI generation tracking
      await user.click(screen.getByText("Anterior"));
      await user.click(screen.getByText(/generar con ia/i));

      await waitFor(() => {
        expect(mockAnalyticsService.trackAIGeneration).toHaveBeenCalled();
      });
    });
  });

  describe("Accessibility Compliance", () => {
    it("should maintain keyboard navigation throughout the flow", async () => {
      renderWizard();

      // Should be able to navigate with keyboard
      const titleInput = screen.getByLabelText(/título/i);
      titleInput.focus();

      expect(document.activeElement).toBe(titleInput);

      // Tab navigation should work
      fireEvent.keyDown(titleInput, { key: "Tab" });
      expect(document.activeElement).not.toBe(titleInput);
    });

    it("should announce step changes to screen readers", async () => {
      const user = userEvent.setup();
      renderWizard();

      await user.type(screen.getByLabelText(/título/i), "Test Property");
      await user.click(screen.getByText("Siguiente"));

      // Should have aria-live region for announcements
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });
});
