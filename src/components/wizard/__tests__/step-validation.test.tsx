import { render, screen } from "@testing-library/react";
import { StepValidation, FieldValidation } from "../step-validation";
import type { StepValidationState } from "../step-validation";

describe("StepValidation", () => {
  const mockValidation: StepValidationState = {
    isValid: false,
    completion: 60,
    errors: [
      { field: "title", message: "Title is required", type: "error" },
      { field: "price", message: "Price must be positive", type: "error" },
    ],
    warnings: [
      {
        field: "description",
        message: "Description could be longer",
        type: "warning",
      },
    ],
    requiredFields: ["title", "price", "description"],
    missingFields: ["title", "price"],
  };

  it("renders step validation with errors and warnings", () => {
    render(
      <StepValidation
        stepNumber={1}
        stepTitle="Test Step"
        validation={mockValidation}
        showProgress={true}
        showErrors={true}
        showWarnings={true}
      >
        <div>Step content</div>
      </StepValidation>
    );

    expect(screen.getByText("Test Step")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText("2 errores")).toBeInTheDocument();
    expect(screen.getByText("1 aviso")).toBeInTheDocument();
    expect(
      screen.getByText("Errores que deben corregirse:")
    ).toBeInTheDocument();
    expect(screen.getByText("title: Title is required")).toBeInTheDocument();
    expect(
      screen.getByText("price: Price must be positive")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Recomendaciones para mejorar:")
    ).toBeInTheDocument();
    expect(
      screen.getByText("description: Description could be longer")
    ).toBeInTheDocument();
  });

  it("renders completed step validation", () => {
    const completedValidation: StepValidationState = {
      isValid: true,
      completion: 100,
      errors: [],
      warnings: [],
      requiredFields: ["title", "price"],
      missingFields: [],
    };

    render(
      <StepValidation
        stepNumber={1}
        stepTitle="Completed Step"
        validation={completedValidation}
      >
        <div>Step content</div>
      </StepValidation>
    );

    expect(screen.getByText("Completo")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.queryByText("errores")).not.toBeInTheDocument();
    expect(screen.queryByText("avisos")).not.toBeInTheDocument();
  });

  it("renders mobile layout correctly", () => {
    render(
      <StepValidation
        stepNumber={1}
        stepTitle="Mobile Step"
        validation={mockValidation}
        isMobile={true}
      >
        <div>Step content</div>
      </StepValidation>
    );

    expect(screen.getByText("Mobile Step")).toBeInTheDocument();
    // Mobile-specific classes should be applied
    const stepHeader = screen.getByText("Mobile Step").closest("div");
    expect(stepHeader).toHaveClass("flex-col");
  });
});

describe("FieldValidation", () => {
  it("renders field with error", () => {
    render(
      <FieldValidation
        fieldName="title"
        error="Title is required"
        isRequired={true}
        isValid={false}
      >
        <input data-testid="test-input" />
      </FieldValidation>
    );

    expect(screen.getByTestId("test-input")).toBeInTheDocument();
    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Title is required")).toHaveClass("text-red-600");
  });

  it("renders field with warning", () => {
    render(
      <FieldValidation
        fieldName="description"
        warning="Description could be longer"
        isRequired={false}
        isValid={true}
      >
        <input data-testid="test-input" />
      </FieldValidation>
    );

    expect(screen.getByTestId("test-input")).toBeInTheDocument();
    expect(screen.getByText("Description could be longer")).toBeInTheDocument();
    expect(screen.getByText("Description could be longer")).toHaveClass(
      "text-yellow-600"
    );
  });

  it("renders valid required field", () => {
    render(
      <FieldValidation fieldName="title" isRequired={true} isValid={true}>
        <input data-testid="test-input" />
      </FieldValidation>
    );

    expect(screen.getByTestId("test-input")).toBeInTheDocument();
    // Should show green check icon for valid required field
    const checkIcon = screen
      .getByTestId("test-input")
      .parentElement?.querySelector("svg");
    expect(checkIcon).toBeInTheDocument();
  });
});
