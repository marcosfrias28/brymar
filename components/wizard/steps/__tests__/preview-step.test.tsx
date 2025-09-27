import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PreviewStep } from "../preview-step";
import { useWizardActions } from "@/hooks/use-wizard-actions";

// Mock the wizard actions hook
jest.mock("@/hooks/use-wizard-actions");

const mockUseWizardActions = useWizardActions as jest.MockedFunction<
  typeof useWizardActions
>;

describe("PreviewStep", () => {
  const mockCompletePropertyData = {
    title: "Hermosa Casa en Santo Domingo",
    description:
      "Una propiedad excepcional con todas las comodidades modernas...",
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
      { id: "2", name: "Garaje", category: "feature" as const, selected: true },
    ],
    coordinates: { latitude: 18.4861, longitude: -69.9312 },
    address: {
      street: "Calle Principal 123",
      city: "Santo Domingo",
      province: "Distrito Nacional",
      country: "Dominican Republic",
      formattedAddress: "Calle Principal 123, Santo Domingo, Distrito Nacional",
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
    data: mockCompletePropertyData,
    onPublish: jest.fn(),
    onSaveDraft: jest.fn(),
    onEdit: jest.fn(),
    locale: "es" as const,
  };

  const mockWizardActions = {
    publishProperty: jest.fn(),
    saveDraft: jest.fn(),
    loadDraft: jest.fn(),
    deleteDraft: jest.fn(),
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    mockUseWizardActions.mockReturnValue(mockWizardActions);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders complete property preview", () => {
    render(<PreviewStep {...mockProps} />);

    expect(
      screen.getByText("Hermosa Casa en Santo Domingo")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Una propiedad excepcional con todas las comodidades modernas..."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("$150,000")).toBeInTheDocument();
    expect(screen.getByText("200 m²")).toBeInTheDocument();
    expect(screen.getByText("3 habitaciones")).toBeInTheDocument();
    expect(screen.getByText("2 baños")).toBeInTheDocument();
  });

  it("displays property characteristics", () => {
    render(<PreviewStep {...mockProps} />);

    expect(screen.getByText("Piscina")).toBeInTheDocument();
    expect(screen.getByText("Garaje")).toBeInTheDocument();
  });

  it("shows property location", () => {
    render(<PreviewStep {...mockProps} />);

    expect(
      screen.getByText("Calle Principal 123, Santo Domingo, Distrito Nacional")
    ).toBeInTheDocument();
  });

  it("displays property images", () => {
    render(<PreviewStep {...mockProps} />);

    const image = screen.getByAltText("Imagen de la propiedad 1");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "https://example.com/image1.jpg");
  });

  it("shows AI generation indicators", () => {
    render(<PreviewStep {...mockProps} />);

    expect(screen.getByText("Generado con IA")).toBeInTheDocument();
    expect(screen.getAllByText("Generado con IA")).toHaveLength(2); // Title and description
  });

  it("provides edit buttons for each step", async () => {
    const user = userEvent.setup();

    render(<PreviewStep {...mockProps} />);

    const editGeneralButton = screen.getByText("Editar Información General");
    await user.click(editGeneralButton);
    expect(mockProps.onEdit).toHaveBeenCalledWith(1);

    const editLocationButton = screen.getByText("Editar Ubicación");
    await user.click(editLocationButton);
    expect(mockProps.onEdit).toHaveBeenCalledWith(2);

    const editImagesButton = screen.getByText("Editar Imágenes");
    await user.click(editImagesButton);
    expect(mockProps.onEdit).toHaveBeenCalledWith(3);
  });

  it("handles property publication", async () => {
    const user = userEvent.setup();
    mockWizardActions.publishProperty.mockResolvedValue({
      success: true,
      id: "prop-123",
    });

    render(<PreviewStep {...mockProps} />);

    const publishButton = screen.getByText("Publicar Propiedad");
    await user.click(publishButton);

    expect(mockWizardActions.publishProperty).toHaveBeenCalledWith(
      mockCompletePropertyData
    );

    await waitFor(() => {
      expect(mockProps.onPublish).toHaveBeenCalled();
    });
  });

  it("handles draft saving", async () => {
    const user = userEvent.setup();
    mockWizardActions.saveDraft.mockResolvedValue({
      success: true,
      id: "draft-123",
    });

    render(<PreviewStep {...mockProps} />);

    const saveDraftButton = screen.getByText("Guardar como Borrador");
    await user.click(saveDraftButton);

    expect(mockWizardActions.saveDraft).toHaveBeenCalledWith(
      mockCompletePropertyData
    );

    await waitFor(() => {
      expect(mockProps.onSaveDraft).toHaveBeenCalled();
    });
  });

  it("shows loading state during publication", () => {
    mockWizardActions.isLoading = true;

    render(<PreviewStep {...mockProps} />);

    expect(screen.getByText("Publicando...")).toBeInTheDocument();
    expect(screen.getByText("Publicar Propiedad")).toBeDisabled();
  });

  it("displays publication errors", () => {
    mockWizardActions.error = "Error al publicar la propiedad";

    render(<PreviewStep {...mockProps} />);

    expect(
      screen.getByText("Error al publicar la propiedad")
    ).toBeInTheDocument();
  });

  it("validates required data before publication", async () => {
    const user = userEvent.setup();
    const incompleteData = {
      ...mockCompletePropertyData,
      title: "", // Missing required field
    };

    render(<PreviewStep {...mockProps} data={incompleteData} />);

    const publishButton = screen.getByText("Publicar Propiedad");
    await user.click(publishButton);

    expect(
      screen.getByText("Complete todos los campos requeridos antes de publicar")
    ).toBeInTheDocument();
    expect(mockWizardActions.publishProperty).not.toHaveBeenCalled();
  });

  it("shows property type with proper formatting", () => {
    render(<PreviewStep {...mockProps} />);

    expect(screen.getByText("Casa")).toBeInTheDocument();
  });

  it("formats price with proper currency", () => {
    render(<PreviewStep {...mockProps} />);

    expect(screen.getByText("$150,000")).toBeInTheDocument();
  });

  it("displays surface area with units", () => {
    render(<PreviewStep {...mockProps} />);

    expect(screen.getByText("200 m²")).toBeInTheDocument();
  });

  it("handles missing optional fields gracefully", () => {
    const dataWithoutOptionalFields = {
      ...mockCompletePropertyData,
      bedrooms: undefined,
      bathrooms: undefined,
    };

    render(<PreviewStep {...mockProps} data={dataWithoutOptionalFields} />);

    expect(screen.queryByText("habitaciones")).not.toBeInTheDocument();
    expect(screen.queryByText("baños")).not.toBeInTheDocument();
  });

  it("shows image gallery with navigation", async () => {
    const user = userEvent.setup();
    const dataWithMultipleImages = {
      ...mockCompletePropertyData,
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
          size: 1024 * 1024,
          contentType: "image/jpeg",
          width: 800,
          height: 600,
        },
      ],
    };

    render(<PreviewStep {...mockProps} data={dataWithMultipleImages} />);

    expect(screen.getByText("1 / 2")).toBeInTheDocument();

    const nextImageButton = screen.getByLabelText("Siguiente imagen");
    await user.click(nextImageButton);

    expect(screen.getByText("2 / 2")).toBeInTheDocument();
  });

  it("displays property summary statistics", () => {
    render(<PreviewStep {...mockProps} />);

    expect(screen.getByText("Resumen de la Propiedad")).toBeInTheDocument();
    expect(screen.getByText("Precio por m²: $750")).toBeInTheDocument();
  });

  it("shows completion status for each step", () => {
    render(<PreviewStep {...mockProps} />);

    expect(screen.getByText("Información General")).toBeInTheDocument();
    expect(screen.getByText("Ubicación")).toBeInTheDocument();
    expect(screen.getByText("Imágenes")).toBeInTheDocument();

    // Check completion indicators
    const completedSteps = screen.getAllByTestId("step-completed");
    expect(completedSteps).toHaveLength(3);
  });

  it("handles confirmation dialog for publication", async () => {
    const user = userEvent.setup();

    render(<PreviewStep {...mockProps} />);

    const publishButton = screen.getByText("Publicar Propiedad");
    await user.click(publishButton);

    expect(
      screen.getByText("¿Está seguro que desea publicar esta propiedad?")
    ).toBeInTheDocument();

    const confirmButton = screen.getByText("Confirmar Publicación");
    await user.click(confirmButton);

    expect(mockWizardActions.publishProperty).toHaveBeenCalled();
  });

  it("allows canceling publication", async () => {
    const user = userEvent.setup();

    render(<PreviewStep {...mockProps} />);

    const publishButton = screen.getByText("Publicar Propiedad");
    await user.click(publishButton);

    const cancelButton = screen.getByText("Cancelar");
    await user.click(cancelButton);

    expect(mockWizardActions.publishProperty).not.toHaveBeenCalled();
    expect(
      screen.queryByText("¿Está seguro que desea publicar esta propiedad?")
    ).not.toBeInTheDocument();
  });
});
