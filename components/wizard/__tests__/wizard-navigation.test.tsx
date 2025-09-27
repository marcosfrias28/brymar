import { render, screen, fireEvent } from "@testing-library/react";
import { WizardNavigation } from "../wizard-navigation";
import { WizardState } from "@/types/wizard";

// Mock the translations hook
jest.mock("@/hooks/use-wizard-translations", () => ({
  useWizardStepTranslations: () => ({
    t: (key: string, params?: any) => {
      const translations: Record<string, string> = {
        "wizard.title": "Create New Property",
        "wizard.progress.step": `Step ${params?.step}`,
        "wizard.navigation.undo": "Undo",
        "wizard.navigation.redo": "Redo",
        "wizard.navigation.save": "Save",
        "wizard.navigation.saving": "Saving...",
        "wizard.navigation.previous": "Previous",
        "wizard.navigation.next": "Next",
        "wizard.navigation.saveDraft": "Save Draft",
        "wizard.navigation.publish": "Publish Property",
        "wizard.messages.unsavedChanges": "You have unsaved changes",
      };
      return translations[key] || key;
    },
    stepTitles: {
      1: "General Information",
      2: "Location",
      3: "Photos and Videos",
      4: "Preview and Publish",
    },
    stepDescriptions: {
      1: "Basic details",
      2: "Location on map",
      3: "Images and videos",
      4: "Review and publish",
    },
  }),
}));

describe("WizardNavigation", () => {
  const mockWizardState: WizardState = {
    currentStep: 1,
    formData: {},
    isValid: {},
    isDirty: false,
    isLoading: false,
    errors: {},
  };

  const mockProps = {
    wizardState: mockWizardState,
    onStepChange: jest.fn(),
    onNext: jest.fn(),
    onPrevious: jest.fn(),
    onSaveDraft: jest.fn(),
    onComplete: jest.fn(),
    canUndo: false,
    canRedo: false,
    onUndo: jest.fn(),
    onRedo: jest.fn(),
    stepValidation: { 1: true, 2: false, 3: false, 4: false },
    stepCompletion: { 1: 100, 2: 50, 3: 0, 4: 0 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders wizard navigation with progress", () => {
    render(<WizardNavigation {...mockProps} />);

    expect(screen.getByText("Create New Property")).toBeInTheDocument();
    expect(screen.getByText("Step 1")).toBeInTheDocument();
  });

  it("shows undo/redo buttons with correct disabled state", () => {
    render(<WizardNavigation {...mockProps} />);

    const undoButton = screen.getByTitle("Undo");
    const redoButton = screen.getByTitle("Redo");

    expect(undoButton).toBeDisabled();
    expect(redoButton).toBeDisabled();
  });

  it("enables undo/redo buttons when available", () => {
    const propsWithHistory = {
      ...mockProps,
      canUndo: true,
      canRedo: true,
    };

    render(<WizardNavigation {...propsWithHistory} />);

    const undoButton = screen.getByTitle("Undo");
    const redoButton = screen.getByTitle("Redo");

    expect(undoButton).not.toBeDisabled();
    expect(redoButton).not.toBeDisabled();
  });

  it("calls onUndo when undo button is clicked", () => {
    const propsWithUndo = {
      ...mockProps,
      canUndo: true,
    };

    render(<WizardNavigation {...propsWithUndo} />);

    const undoButton = screen.getByTitle("Undo");
    fireEvent.click(undoButton);

    expect(mockProps.onUndo).toHaveBeenCalledTimes(1);
  });

  it("shows step completion indicators", () => {
    render(<WizardNavigation {...mockProps} />);

    // Step 1 should show as completed (100%)
    expect(screen.getByText("100%")).toBeInTheDocument();

    // Step 2 should show as partially completed (50%)
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("disables next button when current step is invalid", () => {
    const propsWithInvalidStep = {
      ...mockProps,
      stepValidation: { 1: false, 2: false, 3: false, 4: false },
    };

    render(<WizardNavigation {...propsWithInvalidStep} />);

    const nextButton = screen.getByText("Next");
    expect(nextButton).toBeDisabled();
  });

  it("shows publish button on last step", () => {
    const propsOnLastStep = {
      ...mockProps,
      wizardState: { ...mockWizardState, currentStep: 4 },
      stepValidation: { 1: true, 2: true, 3: true, 4: true },
    };

    render(<WizardNavigation {...propsOnLastStep} />);

    expect(screen.getByText("Publish Property")).toBeInTheDocument();
    expect(screen.queryByText("Next")).not.toBeInTheDocument();
  });
});
