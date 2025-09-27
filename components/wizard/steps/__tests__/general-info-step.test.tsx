import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GeneralInfoStep } from "../general-info-step";
import { useAIGeneration } from "@/hooks/use-ai-generation";
import { useCharacteristics } from "@/hooks/use-characteristics";

// Mock the hooks
jest.mock("@/hooks/use-ai-generation");
jest.mock("@/hooks/use-characteristics");

const mockUseAIGeneration = useAIGeneration as jest.MockedFunction<
  typeof useAIGeneration
>;
const mockUseCharacteristics = useCharacteristics as jest.MockedFunction<
  typeof useCharacteristics
>;

describe("GeneralInfoStep", () => {
  const mockProps = {
    data: {},
    onUpdate: jest.fn(),
    onNext: jest.fn(),
    locale: "es" as const,
  };

  const mockAIGeneration = {
    generateContent: jest.fn(),
    isGenerating: false,
    error: null,
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
    mockUseAIGeneration.mockReturnValue(mockAIGeneration);
    mockUseCharacteristics.mockReturnValue(mockCharacteristics);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders all form fields", () => {
    render(<GeneralInfoStep {...mockProps} />);

    expect(screen.getByLabelText("Título de la propiedad")).toBeInTheDocument();
    expect(screen.getByLabelText("Descripción")).toBeInTheDocument();
    expect(screen.getByLabelText("Precio (USD)")).toBeInTheDocument();
    expect(screen.getByLabelText("Superficie (m²)")).toBeInTheDocument();
    expect(screen.getByLabelText("Tipo de propiedad")).toBeInTheDocument();
  });

  it("updates form data when fields change", async () => {
    const user = userEvent.setup();

    render(<GeneralInfoStep {...mockProps} />);

    const titleInput = screen.getByLabelText("Título de la propiedad");
    await user.type(titleInput, "Casa en Santo Domingo");

    expect(mockProps.onUpdate).toHaveBeenCalledWith({
      title: "Casa en Santo Domingo",
    });
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();

    render(<GeneralInfoStep {...mockProps} />);

    const nextButton = screen.getByText("Siguiente");
    await user.click(nextButton);

    expect(screen.getByText("El título es requerido")).toBeInTheDocument();
    expect(screen.getByText("La descripción es requerida")).toBeInTheDocument();
    expect(screen.getByText("El precio es requerido")).toBeInTheDocument();
  });

  it("validates field formats", async () => {
    const user = userEvent.setup();

    render(<GeneralInfoStep {...mockProps} />);

    const priceInput = screen.getByLabelText("Precio (USD)");
    await user.type(priceInput, "invalid-price");

    const surfaceInput = screen.getByLabelText("Superficie (m²)");
    await user.type(surfaceInput, "-100");

    const nextButton = screen.getByText("Siguiente");
    await user.click(nextButton);

    expect(
      screen.getByText("El precio debe ser un número válido")
    ).toBeInTheDocument();
    expect(
      screen.getByText("La superficie debe ser mayor a 0")
    ).toBeInTheDocument();
  });

  it("generates AI content when button is clicked", async () => {
    const user = userEvent.setup();
    const mockGeneratedContent = {
      title: "Hermosa Casa en Santo Domingo",
      description: "Una propiedad excepcional con todas las comodidades...",
      tags: ["casa", "santo domingo", "moderna"],
    };

    mockAIGeneration.generateContent.mockResolvedValue(mockGeneratedContent);

    render(
      <GeneralInfoStep
        {...mockProps}
        data={{ price: 150000, surface: 200, propertyType: "house" }}
      />
    );

    const aiButton = screen.getByText("Generar con IA");
    await user.click(aiButton);

    expect(mockAIGeneration.generateContent).toHaveBeenCalledWith({
      price: 150000,
      surface: 200,
      propertyType: "house",
    });

    await waitFor(() => {
      expect(mockProps.onUpdate).toHaveBeenCalledWith(mockGeneratedContent);
    });
  });

  it("shows loading state during AI generation", async () => {
    const user = userEvent.setup();
    mockAIGeneration.isGenerating = true;

    render(<GeneralInfoStep {...mockProps} />);

    expect(screen.getByText("Generando...")).toBeInTheDocument();
    expect(screen.getByText("Generar con IA")).toBeDisabled();
  });

  it("handles AI generation errors", async () => {
    const user = userEvent.setup();
    mockAIGeneration.error = "Error al generar contenido";

    render(<GeneralInfoStep {...mockProps} />);

    expect(screen.getByText("Error al generar contenido")).toBeInTheDocument();
  });

  it("displays and manages characteristics", () => {
    render(<GeneralInfoStep {...mockProps} />);

    expect(screen.getByText("Piscina")).toBeInTheDocument();
    expect(screen.getByText("Garaje")).toBeInTheDocument();
  });

  it("toggles characteristics selection", async () => {
    const user = userEvent.setup();

    render(<GeneralInfoStep {...mockProps} />);

    const poolCheckbox = screen.getByLabelText("Piscina");
    await user.click(poolCheckbox);

    expect(mockCharacteristics.toggleCharacteristic).toHaveBeenCalledWith("1");
  });

  it("adds custom characteristics", async () => {
    const user = userEvent.setup();

    render(<GeneralInfoStep {...mockProps} />);

    const customInput = screen.getByPlaceholderText(
      "Agregar característica personalizada"
    );
    await user.type(customInput, "Terraza");

    const addButton = screen.getByText("Agregar");
    await user.click(addButton);

    expect(mockCharacteristics.addCustomCharacteristic).toHaveBeenCalledWith(
      "Terraza"
    );
  });

  it("supports property type selection", async () => {
    const user = userEvent.setup();

    render(<GeneralInfoStep {...mockProps} />);

    const propertyTypeSelect = screen.getByLabelText("Tipo de propiedad");
    await user.selectOptions(propertyTypeSelect, "apartment");

    expect(mockProps.onUpdate).toHaveBeenCalledWith({
      propertyType: "apartment",
    });
  });

  it("handles bedroom and bathroom inputs", async () => {
    const user = userEvent.setup();

    render(<GeneralInfoStep {...mockProps} />);

    const bedroomsInput = screen.getByLabelText("Habitaciones");
    await user.type(bedroomsInput, "3");

    const bathroomsInput = screen.getByLabelText("Baños");
    await user.type(bathroomsInput, "2");

    expect(mockProps.onUpdate).toHaveBeenCalledWith({ bedrooms: 3 });
    expect(mockProps.onUpdate).toHaveBeenCalledWith({ bathrooms: 2 });
  });

  it("validates minimum field lengths", async () => {
    const user = userEvent.setup();

    render(<GeneralInfoStep {...mockProps} />);

    const titleInput = screen.getByLabelText("Título de la propiedad");
    await user.type(titleInput, "Short");

    const descriptionInput = screen.getByLabelText("Descripción");
    await user.type(descriptionInput, "Too short description");

    const nextButton = screen.getByText("Siguiente");
    await user.click(nextButton);

    expect(
      screen.getByText("El título debe tener al menos 10 caracteres")
    ).toBeInTheDocument();
    expect(
      screen.getByText("La descripción debe tener al menos 50 caracteres")
    ).toBeInTheDocument();
  });

  it("validates maximum field lengths", async () => {
    const user = userEvent.setup();

    render(<GeneralInfoStep {...mockProps} />);

    const titleInput = screen.getByLabelText("Título de la propiedad");
    const longTitle = "A".repeat(101);
    await user.type(titleInput, longTitle);

    const descriptionInput = screen.getByLabelText("Descripción");
    const longDescription = "A".repeat(2001);
    await user.type(descriptionInput, longDescription);

    const nextButton = screen.getByText("Siguiente");
    await user.click(nextButton);

    expect(
      screen.getByText("El título no puede exceder 100 caracteres")
    ).toBeInTheDocument();
    expect(
      screen.getByText("La descripción no puede exceder 2000 caracteres")
    ).toBeInTheDocument();
  });
});
