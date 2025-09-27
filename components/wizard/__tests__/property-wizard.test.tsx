import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PropertyWizard } from "../property-wizard";
import { useWizardStateManager } from "@/hooks/use-wizard-state-manager";
import { useWizardActions } from "@/hooks/use-wizard-actions";

// Mock the hooks
jest.mock("@/hooks/use-wizard-state-manager");
jest.mock("@/hooks/use-wizard-actions");
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

const mockUseWizardStateManager = useWizardStateManager as jest.MockedFunction<
  typeof useWizardStateManager
>;
const mockUseWizardActions = useWizardActions as jest.MockedFunction<
  typeof useWizardActions
>;

describe("PropertyWizard", () => {
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

  beforeEach(() => {
    mockUseWizardStateManager.mockReturnValue(mockWizardState);
    mockUseWizardActions.mockReturnValue(mockWizardActions);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the wizard with initial step", () => {
    render(<PropertyWizard />);

    expect(screen.getByText("Paso 1 de 4")).toBeInTheDocument();
    expect(screen.getByText("Información General")).toBeInTheDocument();
  });

  it("displays progress correctly", () => {
    render(<PropertyWizard />);

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "25");
  });

  it("navigates to next step when valid", async () => {
    const user = userEvent.setup();
    mockWizardState.stepValidation[1] = true;

    render(<PropertyWizard />);

    const nextButton = screen.getByText("Siguiente");
    await user.click(nextButton);

    expect(mockWizardState.goToNextStep).toHaveBeenCalled();
  });

  it("prevents navigation when step is invalid", async () => {
    const user = userEvent.setup();
    mockWizardState.stepValidation[1] = false;

    render(<PropertyWizard />);

    const nextButton = screen.getByText("Siguiente");
    await user.click(nextButton);

    expect(mockWizardState.goToNextStep).toHaveBeenCalled();
  });

  it("navigates to previous step", async () => {
    const user = userEvent.setup();
    mockWizardState.wizardState.currentStep = 2;

    render(<PropertyWizard />);

    const prevButton = screen.getByText("Anterior");
    await user.click(prevButton);

    expect(mockWizardState.goToPreviousStep).toHaveBeenCalled();
  });

  it("saves draft when save button is clicked", async () => {
    const user = userEvent.setup();

    render(<PropertyWizard />);

    const saveButton = screen.getByText("Guardar Borrador");
    await user.click(saveButton);

    expect(mockWizardActions.saveDraft).toHaveBeenCalledWith(
      mockWizardState.wizardState.formData
    );
  });

  it("shows loading state during operations", () => {
    mockWizardState.wizardState.isLoading = true;

    render(<PropertyWizard />);

    expect(screen.getByText("Guardando...")).toBeInTheDocument();
  });

  it("displays validation errors", () => {
    mockWizardState.wizardState.errors = {
      title: "El título es requerido",
      price: "El precio debe ser mayor a 0",
    };

    render(<PropertyWizard />);

    expect(screen.getByText("El título es requerido")).toBeInTheDocument();
    expect(
      screen.getByText("El precio debe ser mayor a 0")
    ).toBeInTheDocument();
  });

  it("handles keyboard navigation", async () => {
    const user = userEvent.setup();

    render(<PropertyWizard />);

    // Test Tab navigation
    await user.tab();
    expect(document.activeElement).toHaveAttribute(
      "data-testid",
      "wizard-step-1"
    );

    // Test Enter key on next button
    const nextButton = screen.getByText("Siguiente");
    nextButton.focus();
    await user.keyboard("{Enter}");

    expect(mockWizardState.goToNextStep).toHaveBeenCalled();
  });

  it("supports undo/redo functionality", async () => {
    const user = userEvent.setup();
    mockWizardState.canUndo = true;
    mockWizardState.canRedo = true;

    render(<PropertyWizard />);

    // Test undo
    await user.keyboard("{Control>}z{/Control}");
    expect(mockWizardState.undo).toHaveBeenCalled();

    // Test redo
    await user.keyboard("{Control>}{Shift>}z{/Shift}{/Control}");
    expect(mockWizardState.redo).toHaveBeenCalled();
  });

  it("handles step completion tracking", () => {
    mockWizardState.stepCompletion = { 1: 100, 2: 50, 3: 0, 4: 0 };

    render(<PropertyWizard />);

    const step1 = screen.getByTestId("step-indicator-1");
    const step2 = screen.getByTestId("step-indicator-2");

    expect(step1).toHaveClass("completed");
    expect(step2).toHaveClass("in-progress");
  });
});
