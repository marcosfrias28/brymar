/**
 * Comprehensive tests for unified wizard navigation and progress components
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock all external dependencies
jest.mock("@/lib/utils/mobile-utils", () => ({
  triggerHapticFeedback: jest.fn(),
  mobileClasses: {
    touchButton: "min-h-[48px] touch-manipulation",
  },
}));

jest.mock("@/hooks/use-mobile-responsive", () => ({
  useResponsive: () => ({
    isTouchDevice: false,
  }),
  useTouchGestures: () => ({
    touchState: {
      isPressed: false,
      deltaX: 0,
      deltaY: 0,
      distance: 0,
    },
    handlers: {
      onTouchStart: jest.fn(),
      onTouchMove: jest.fn(),
      onTouchEnd: jest.fn(),
    },
  }),
}));

jest.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock("@/components/ui/progress", () => ({
  Progress: ({ value, ...props }: any) => (
    <div role="progressbar" aria-valuenow={value} {...props}>
      Progress: {value}%
    </div>
  ),
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}));

// Mock icons
jest.mock("lucide-react", () => ({
  ChevronLeft: () => <span>←</span>,
  ChevronRight: () => <span>→</span>,
  Save: () => <span>💾</span>,
  Check: () => <span>✓</span>,
  X: () => <span>✕</span>,
  HelpCircle: () => <span>?</span>,
  Circle: () => <span>○</span>,
  Dot: () => <span>•</span>,
  AlertCircle: () => <span>⚠</span>,
  Clock: () => <span>🕐</span>,
}));

// Import components after mocking
import { WizardNavigation } from "../wizard-navigation";
import { WizardProgress } from "../wizard-progress";

interface TestWizardData {
  id?: string;
  title: string;
  description: string;
  status: "draft" | "published";
  createdAt?: Date;
  updatedAt?: Date;
  name: string;
  email: string;
}

interface TestWizardStep {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<any>;
  isOptional?: boolean;
  canSkip?: boolean;
}

const mockSteps: TestWizardStep[] = [
  {
    id: "step1",
    title: "Información Personal",
    description: "Datos básicos",
    component: () => <div>Step 1</div>,
  },
  {
    id: "step2",
    title: "Contacto",
    description: "Información de contacto",
    component: () => <div>Step 2</div>,
  },
  {
    id: "step3",
    title: "Confirmación",
    description: "Revisar datos",
    component: () => <div>Step 3</div>,
    isOptional: true,
  },
];

describe("WizardNavigation", () => {
  const defaultProps = {
    canGoNext: true,
    canGoPrevious: true,
    canComplete: false,
    isFirstStep: false,
    isLastStep: false,
    onNext: jest.fn().mockResolvedValue(undefined),
    onPrevious: jest.fn(),
    onComplete: jest.fn().mockResolvedValue(undefined),
    onSaveDraft: jest.fn().mockResolvedValue(undefined),
    onCancel: jest.fn(),
    isLoading: false,
    isSaving: false,
    isMobile: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Desktop Navigation", () => {
    it("renders all navigation buttons correctly", () => {
      render(<WizardNavigation {...defaultProps} />);

      expect(screen.getByRole("navigation")).toBeInTheDocument();
      expect(screen.getByText("Anterior")).toBeInTheDocument();
      expect(screen.getByText("Siguiente")).toBeInTheDocument();
      expect(screen.getByText("Guardar borrador")).toBeInTheDocument();
      expect(screen.getByText("Cancelar")).toBeInTheDocument();
    });

    it("shows complete button on last step", () => {
      render(
        <WizardNavigation
          {...defaultProps}
          isLastStep={true}
          canComplete={true}
        />
      );

      expect(screen.getByText("Completar")).toBeInTheDocument();
      expect(screen.queryByText("Siguiente")).not.toBeInTheDocument();
    });

    it("disables previous button on first step", () => {
      render(
        <WizardNavigation
          {...defaultProps}
          isFirstStep={true}
          canGoPrevious={false}
        />
      );

      const previousButton = screen.getByText("Anterior");
      expect(previousButton).toBeDisabled();
    });

    it("handles keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<WizardNavigation {...defaultProps} />);

      // Test Ctrl+Right Arrow for next
      await user.keyboard("{Control>}{ArrowRight}{/Control}");
      expect(defaultProps.onNext).toHaveBeenCalled();

      // Test Ctrl+Left Arrow for previous
      await user.keyboard("{Control>}{ArrowLeft}{/Control}");
      expect(defaultProps.onPrevious).toHaveBeenCalled();

      // Test Ctrl+S for save
      await user.keyboard("{Control>}s{/Control}");
      expect(defaultProps.onSaveDraft).toHaveBeenCalled();
    });

    it("shows loading states correctly", () => {
      render(<WizardNavigation {...defaultProps} isLoading={true} />);

      expect(screen.getByText("Validando...")).toBeInTheDocument();
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("shows saving state correctly", () => {
      render(<WizardNavigation {...defaultProps} isSaving={true} />);

      expect(screen.getByText("Guardando...")).toBeInTheDocument();
    });

    it("includes proper ARIA labels and accessibility attributes", () => {
      render(<WizardNavigation {...defaultProps} />);

      const navigation = screen.getByRole("navigation");
      expect(navigation).toHaveAttribute(
        "aria-label",
        "Navegación del asistente"
      );

      const nextButton = screen.getByText("Siguiente");
      expect(nextButton).toHaveAttribute("aria-label");
      expect(nextButton).toHaveAttribute("title");
    });
  });

  describe("Mobile Navigation", () => {
    const mobileProps = { ...defaultProps, isMobile: true };

    it("renders mobile-optimized layout", () => {
      render(<WizardNavigation {...mobileProps} />);

      expect(screen.getByRole("navigation")).toHaveClass(
        "wizard-navigation-mobile"
      );
      expect(screen.getByText("Siguiente")).toBeInTheDocument();
      expect(screen.getByText("Anterior")).toBeInTheDocument();
    });

    it("shows touch gesture hint when enabled", () => {
      render(<WizardNavigation {...mobileProps} enableTouchGestures={true} />);

      expect(screen.getByText("Desliza ← → para navegar")).toBeInTheDocument();
    });

    it("includes proper touch button classes", () => {
      render(<WizardNavigation {...mobileProps} />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveClass("min-h-[48px]");
      });
    });
  });

  describe("Error Handling", () => {
    it("handles navigation errors gracefully", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const onNext = jest
        .fn()
        .mockRejectedValue(new Error("Navigation failed"));

      render(<WizardNavigation {...defaultProps} onNext={onNext} />);

      const nextButton = screen.getByText("Siguiente");
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Navigation error:",
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });
});

describe("WizardProgress", () => {
  const defaultProps = {
    steps: mockSteps,
    currentStep: 1,
    showStepNumbers: true,
    isMobile: false,
  };

  describe("Desktop Progress", () => {
    it("renders step indicators correctly", () => {
      render(<WizardProgress {...defaultProps} />);

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
      expect(screen.getByText("Información Personal")).toBeInTheDocument();
      expect(screen.getByText("Contacto")).toBeInTheDocument();
      expect(screen.getByText("Confirmación")).toBeInTheDocument();
    });

    it("shows current step correctly", () => {
      render(<WizardProgress {...defaultProps} />);

      const currentStepButton = screen.getByRole("tab", { selected: true });
      expect(currentStepButton).toHaveAttribute("aria-current", "step");
    });

    it("displays optional step indicators", () => {
      render(<WizardProgress {...defaultProps} />);

      expect(screen.getByText("Opcional")).toBeInTheDocument();
    });

    it("handles step click when enabled", async () => {
      const onStepClick = jest.fn();
      render(<WizardProgress {...defaultProps} onStepClick={onStepClick} />);

      const firstStep = screen.getByLabelText(/Paso 1: Información Personal/);
      fireEvent.click(firstStep);

      expect(onStepClick).toHaveBeenCalledWith(0);
    });

    it("shows validation indicators", () => {
      const stepValidation = {
        0: { isValid: true, hasErrors: false, hasWarnings: false },
        1: {
          isValid: false,
          hasErrors: true,
          hasWarnings: false,
          errorCount: 2,
        },
        2: { isValid: false, hasErrors: false, hasWarnings: true },
      };

      render(
        <WizardProgress {...defaultProps} stepValidation={stepValidation} />
      );

      expect(screen.getByText("2 errores")).toBeInTheDocument();
    });
  });

  describe("Mobile Progress", () => {
    const mobileProps = { ...defaultProps, isMobile: true };

    it("renders mobile-optimized layout", () => {
      render(<WizardProgress {...mobileProps} />);

      expect(screen.getByText("Paso 2 de 3")).toBeInTheDocument();
      expect(screen.getByText("Contacto")).toBeInTheDocument();
    });

    it("shows validation indicators in mobile view", () => {
      const stepValidation = {
        1: {
          isValid: false,
          hasErrors: true,
          hasWarnings: false,
          errorCount: 3,
        },
      };

      render(
        <WizardProgress {...mobileProps} stepValidation={stepValidation} />
      );

      expect(screen.getByText("3")).toBeInTheDocument(); // Error count badge
    });
  });

  describe("Accessibility", () => {
    it("includes proper ARIA attributes", () => {
      render(<WizardProgress {...defaultProps} />);

      const progressbar = screen.getByRole("progressbar");
      expect(progressbar).toHaveAttribute("aria-valuenow");
      expect(progressbar).toHaveAttribute("aria-valuemin", "0");
      expect(progressbar).toHaveAttribute("aria-valuemax", "100");
    });

    it("provides screen reader announcements", () => {
      render(<WizardProgress {...defaultProps} />);

      const srTexts = screen.getAllByText(/Este paso/, {
        selector: ".sr-only",
      });
      expect(srTexts.length).toBeGreaterThan(0);
    });

    it("includes proper step labels", () => {
      render(<WizardProgress {...defaultProps} />);

      const stepButtons = screen.getAllByRole("tab");
      stepButtons.forEach((button) => {
        expect(button).toHaveAttribute("aria-label");
      });
    });
  });
});

describe("Integration", () => {
  it("navigation and progress work together", () => {
    const onStepClick = jest.fn();

    render(
      <div>
        <WizardProgress
          steps={mockSteps}
          currentStep={1}
          showStepNumbers={true}
          isMobile={false}
          onStepClick={onStepClick}
        />
        <WizardNavigation
          canGoNext={true}
          canGoPrevious={true}
          canComplete={false}
          isFirstStep={false}
          isLastStep={false}
          onNext={jest.fn()}
          onPrevious={jest.fn()}
          onComplete={jest.fn()}
          onSaveDraft={jest.fn()}
          isLoading={false}
          isSaving={false}
          isMobile={false}
        />
      </div>
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });
});
