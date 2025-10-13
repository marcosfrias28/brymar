import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EnhancedAIDescription } from "../shared/enhanced-ai-description";
import { PropertyBasicInfo } from '@/types/wizard';

// Mock the AI generation hook
jest.mock("@/hooks/use-ai-generation", () => ({
  useAIGeneration: jest.fn(() => ({
    isGenerating: false,
    error: null,
    generateDescription: jest.fn(),
    clearState: jest.fn(),
  })),
  RichTextContent: {},
}));

// Mock the advanced rich text editor
jest.mock("@/components/ui/advanced-rich-text-editor", () => ({
  AdvancedRichTextEditor: ({ content, onChange, onSave, onCancel }: any) => (
    <div data-testid="rich-text-editor">
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        data-testid="rich-text-textarea"
      />
      <button onClick={onSave} data-testid="save-button">
        Save
      </button>
      <button onClick={onCancel} data-testid="cancel-button">
        Cancel
      </button>
    </div>
  ),
}));

const mockPropertyData: PropertyBasicInfo = {
  type: "Casa",
  location: "Santo Domingo",
  price: 150000,
  surface: 200,
  characteristics: ["Piscina", "Jardín", "Garaje"],
  bedrooms: 3,
  bathrooms: 2,
};

describe("EnhancedAIDescription", () => {
  const defaultProps = {
    value: "",
    onChange: jest.fn(),
    propertyData: mockPropertyData,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the component with basic elements", () => {
    render(<EnhancedAIDescription {...defaultProps} />);

    expect(
      screen.getByText("Generación Inteligente de Descripción")
    ).toBeInTheDocument();
    expect(screen.getByText("Generar Descripción Rica")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("shows generate button as disabled when property data is incomplete", () => {
    const incompletePropertyData = { ...mockPropertyData, price: 0 };
    render(
      <EnhancedAIDescription
        {...defaultProps}
        propertyData={incompletePropertyData}
      />
    );

    expect(screen.getByText("Generar Descripción Rica")).toBeDisabled();
  });

  it("enables generate button when property data is complete", () => {
    render(<EnhancedAIDescription {...defaultProps} />);

    expect(screen.getByText("Generar Descripción Rica")).not.toBeDisabled();
  });

  it("shows rich text editor when switching to rich text mode", () => {
    render(
      <EnhancedAIDescription {...defaultProps} value="Some description" />
    );

    const editButton = screen.getByText("Editar con Formato");
    fireEvent.click(editButton);

    expect(screen.getByTestId("rich-text-editor")).toBeInTheDocument();
  });

  it("calls onChange when textarea value changes", () => {
    const onChange = jest.fn();
    render(<EnhancedAIDescription {...defaultProps} onChange={onChange} />);

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "New description" } });

    expect(onChange).toHaveBeenCalledWith("New description");
  });

  it("shows warning message when property data is incomplete", () => {
    render(<EnhancedAIDescription {...defaultProps} propertyData={null} />);

    expect(
      screen.getByText(/Completa el tipo de propiedad/)
    ).toBeInTheDocument();
  });

  it("handles rich text mode correctly", () => {
    render(<EnhancedAIDescription {...defaultProps} value="Test content" />);

    // Switch to rich text mode
    const editButton = screen.getByText("Editar con Formato");
    fireEvent.click(editButton);

    // Should show rich text editor
    expect(screen.getByTestId("rich-text-editor")).toBeInTheDocument();
    expect(
      screen.getByText(/Modo de edición rica activado/)
    ).toBeInTheDocument();
  });
});
