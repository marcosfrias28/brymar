import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PropertyWizard } from "../property-wizard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock all the services and hooks
jest.mock("@/hooks/use-wizard-state-manager");
jest.mock("@/hooks/use-wizard-actions");
jest.mock("@/hooks/use-ai-generation");
jest.mock("@/hooks/use-characteristics");
jest.mock("@/lib/services/image-upload-service");
jest.mock("@/lib/services/map-service");

import { useWizardStateManager } from "@/hooks/use-wizard-state-manager";
import { useWizardActions } from "@/hooks/use-wizard-actions";
import { useAIGeneration } from "@/hooks/use-ai-generation";
import { useCharacteristics } from "@/hooks/use-characteristics";
import {
  generateSignedUrl,
  uploadDirect,
} from "@/lib/services/image-upload-service";
import { reverseGeocode, geocode } from "@/lib/services/map-service";

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
const mockGenerateSignedUrl = generateSignedUrl as jest.MockedFunction<
  typeof generateSignedUrl
>;
const mockUploadDirect = uploadDirect as jest.MockedFunction<
  typeof uploadDirect
>;
const mockReverseGeocode = reverseGeocode as jest.MockedFunction<
  typeof reverseGeocode
>;
const mockGeocode = geocode as jest.MockedFunction<typeof geocode>;

// Test wrapper with QueryClient
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("Wizard Integration Tests", () => {
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

    // Mock service responses
    mockGenerateSignedUrl.mockResolvedValue({
      uploadUrl: "https://blob.vercel-storage.com/upload-url",
      publicUrl: "https://blob.vercel-storage.com/test-image.jpg",
      expiresAt: new Date(Date.now() + 3600000),
    });

    mockUploadDirect.mockResolvedValue({
      url: "https://blob.vercel-storage.com/test-image.jpg",
      size: 1024 * 1024,
      uploadedAt: new Date(),
    });

    mockReverseGeocode.mockResolvedValue({
      street: "Calle Principal 123",
      city: "Santo Domingo",
      province: "Distrito Nacional",
      postalCode: "10101",
      country: "Dominican Republic",
      formattedAddress: "Calle Principal 123, Santo Domingo, Distrito Nacional",
    });

    mockGeocode.mockResolvedValue({
      latitude: 18.4861,
      longitude: -69.9312,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("completes full wizard flow from start to finish", async () => {
    const user = userEvent.setup();

    // Mock progressive step validation
    let currentStep = 1;
    mockWizardState.goToNextStep.mockImplementation(() => {
      currentStep++;
      mockWizardState.wizardState.currentStep = currentStep;
    });

    mockWizardState.goToPreviousStep.mockImplementation(() => {
      if (currentStep > 1) {
        currentStep--;
        mockWizardState.wizardState.currentStep = currentStep;
      }
    });

    // Mock AI generation
    mockAIGeneration.generateContent.mockResolvedValue({
      title: "Hermosa Casa en Santo Domingo",
      description: "Una propiedad excepcional con todas las comodidades...",
      tags: ["casa", "santo domingo", "moderna"],
    });

    // Mock successful publication
    mockWizardActions.publishProperty.mockResolvedValue({
      success: true,
      data: { id: "prop-123" },
    });

    render(
      <TestWrapper>
        <PropertyWizard />
      </TestWrapper>
    );

    // Step 1: Fill general information
    expect(screen.getByText("Paso 1 de 4")).toBeInTheDocument();

    const titleInput = screen.getByLabelText("Título de la propiedad");
    await user.type(titleInput, "Casa en Santo Domingo");

    const priceInput = screen.getByLabelText("Precio (USD)");
    await user.type(priceInput, "150000");

    const surfaceInput = screen.getByLabelText("Superficie (m²)");
    await user.type(surfaceInput, "200");

    // Test AI generation
    const aiButton = screen.getByText("Generar con IA");
    await user.click(aiButton);

    expect(mockAIGeneration.generateContent).toHaveBeenCalled();

    // Select characteristics
    const poolCheckbox = screen.getByLabelText("Piscina");
    await user.click(poolCheckbox);

    expect(mockCharacteristics.toggleCharacteristic).toHaveBeenCalledWith("1");

    // Proceed to step 2
    mockWizardState.stepValidation[1] = true;
    const nextButton = screen.getByText("Siguiente");
    await user.click(nextButton);

    expect(mockWizardState.goToNextStep).toHaveBeenCalled();

    // Step 2: Set location
    mockWizardState.wizardState.currentStep = 2;

    // Simulate map click
    const mapContainer = screen.getByTestId("map-container");
    fireEvent.click(mapContainer, {
      latlng: { lat: 18.4861, lng: -69.9312 },
    });

    await waitFor(() => {
      expect(mockReverseGeocode).toHaveBeenCalled();
    });

    // Fill address manually
    const streetInput = screen.getByLabelText("Dirección");
    await user.type(streetInput, "Calle Principal 123");

    // Proceed to step 3
    mockWizardState.stepValidation[2] = true;
    await user.click(screen.getByText("Siguiente"));

    // Step 3: Upload images
    mockWizardState.wizardState.currentStep = 3;

    const imageFile = new File(["image content"], "test-image.jpg", {
      type: "image/jpeg",
    });

    const fileInput = screen.getByLabelText("Seleccionar imágenes");
    await user.upload(fileInput, imageFile);

    await waitFor(() => {
      expect(mockGenerateSignedUrl).toHaveBeenCalled();
      expect(mockUploadDirect).toHaveBeenCalled();
    });

    // Proceed to step 4
    mockWizardState.stepValidation[3] = true;
    await user.click(screen.getByText("Siguiente"));

    // Step 4: Preview and publish
    mockWizardState.wizardState.currentStep = 4;

    expect(screen.getByText("Paso 4 de 4")).toBeInTheDocument();
    expect(screen.getByText("Vista Previa")).toBeInTheDocument();

    // Publish property
    const publishButton = screen.getByText("Publicar Propiedad");
    await user.click(publishButton);

    // Confirm publication
    const confirmButton = screen.getByText("Confirmar Publicación");
    await user.click(confirmButton);

    expect(mockWizardActions.publishProperty).toHaveBeenCalled();
  });

  it("handles validation errors throughout the flow", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <PropertyWizard />
      </TestWrapper>
    );

    // Try to proceed without filling required fields
    const nextButton = screen.getByText("Siguiente");
    await user.click(nextButton);

    // Should show validation errors
    expect(mockWizardState.goToNextStep).toHaveBeenCalled();

    // Mock validation errors
    mockWizardState.wizardState.errors = {
      title: "El título es requerido",
      price: "El precio es requerido",
    };

    expect(screen.getByText("El título es requerido")).toBeInTheDocument();
    expect(screen.getByText("El precio es requerido")).toBeInTheDocument();
  });

  it("supports draft saving and loading", async () => {
    const user = userEvent.setup();

    mockWizardActions.saveDraft.mockResolvedValue({
      success: true,
      data: { id: "draft-123" },
    });

    render(
      <TestWrapper>
        <PropertyWizard />
      </TestWrapper>
    );

    // Fill some data
    const titleInput = screen.getByLabelText("Título de la propiedad");
    await user.type(titleInput, "Draft Property");

    // Save as draft
    const saveDraftButton = screen.getByText("Guardar Borrador");
    await user.click(saveDraftButton);

    expect(mockWizardActions.saveDraft).toHaveBeenCalled();
  });

  it("handles service errors gracefully", async () => {
    const user = userEvent.setup();

    // Mock AI generation error
    mockAIGeneration.generateContent.mockRejectedValue(
      new Error("AI service error")
    );

    render(
      <TestWrapper>
        <PropertyWizard />
      </TestWrapper>
    );

    const aiButton = screen.getByText("Generar con IA");
    await user.click(aiButton);

    await waitFor(() => {
      expect(
        screen.getByText("Error al generar contenido con IA")
      ).toBeInTheDocument();
    });
  });

  it("supports navigation between steps", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <PropertyWizard />
      </TestWrapper>
    );

    // Go to step 2
    mockWizardState.wizardState.currentStep = 2;

    // Go back to step 1
    const prevButton = screen.getByText("Anterior");
    await user.click(prevButton);

    expect(mockWizardState.goToPreviousStep).toHaveBeenCalled();
  });

  it("handles undo/redo functionality", async () => {
    const user = userEvent.setup();

    mockWizardState.canUndo = true;
    mockWizardState.canRedo = true;

    render(
      <TestWrapper>
        <PropertyWizard />
      </TestWrapper>
    );

    // Test keyboard shortcuts
    await user.keyboard("{Control>}z{/Control}");
    expect(mockWizardState.undo).toHaveBeenCalled();

    await user.keyboard("{Control>}{Shift>}z{/Shift}{/Control}");
    expect(mockWizardState.redo).toHaveBeenCalled();
  });

  it("displays loading states appropriately", () => {
    mockWizardState.wizardState.isLoading = true;

    render(
      <TestWrapper>
        <PropertyWizard />
      </TestWrapper>
    );

    expect(screen.getByText("Guardando...")).toBeInTheDocument();
  });

  it("handles network connectivity issues", async () => {
    const user = userEvent.setup();

    // Mock network error
    mockUploadDirect.mockRejectedValue(new Error("Network error"));

    render(
      <TestWrapper>
        <PropertyWizard />
      </TestWrapper>
    );

    // Try to upload image
    const imageFile = new File(["image content"], "test-image.jpg", {
      type: "image/jpeg",
    });

    const fileInput = screen.getByLabelText("Seleccionar imágenes");
    await user.upload(fileInput, imageFile);

    await waitFor(() => {
      expect(screen.getByText("Error de conexión")).toBeInTheDocument();
      expect(screen.getByText("Reintentar")).toBeInTheDocument();
    });
  });

  it("supports multilingual interface", () => {
    // Test English locale
    mockWizardState.wizardState.formData.language = "en";

    render(
      <TestWrapper>
        <PropertyWizard />
      </TestWrapper>
    );

    // Should display English text
    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
    expect(screen.getByText("General Information")).toBeInTheDocument();
  });

  it("tracks step completion progress", () => {
    mockWizardState.stepCompletion = { 1: 100, 2: 75, 3: 50, 4: 0 };

    render(
      <TestWrapper>
        <PropertyWizard />
      </TestWrapper>
    );

    // Check progress indicators
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "25"); // Step 1 of 4
  });
});
