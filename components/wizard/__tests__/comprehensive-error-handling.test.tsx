/**
 * Comprehensive Error Handling Tests
 * Tests all error scenarios and recovery mechanisms
 */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { toast } from "sonner";
import { ComprehensiveErrorRecovery } from "../comprehensive-error-recovery";
import { NetworkAwareWizard } from "../network-aware-wizard";
import { WizardFallbackUI } from "../fallback-ui-states";
import { ErrorTestingPanel, ErrorScenarioRunner } from "../error-testing-utils";
import {
  WizardError,
  NetworkError,
  AIServiceError,
  UploadError,
  ValidationError,
} from "@/lib/errors/wizard-errors";

// Mock dependencies
jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

jest.mock("@/lib/utils/network-detection", () => ({
  useNetworkStatus: () => ({ isOnline: true, effectiveType: "4g" }),
  useOfflineQueue: () => ({
    queuedOperations: [],
    queueOperation: jest.fn(),
    removeOperation: jest.fn(),
    clearQueue: jest.fn(),
  }),
  executeWithOfflineSupport: jest.fn(),
}));

// Test component that can throw errors
const TestComponent = ({
  shouldThrow,
  errorType,
}: {
  shouldThrow: boolean;
  errorType?: string;
}) => {
  if (shouldThrow) {
    switch (errorType) {
      case "network":
        throw new NetworkError("Test network error");
      case "ai":
        throw new AIServiceError("Test AI error", "API_ERROR", true);
      case "upload":
        throw new UploadError("Test upload error", "UPLOAD_FAILED", true);
      case "validation":
        throw new ValidationError({ field: ["Test validation error"] });
      default:
        throw new Error("Test generic error");
    }
  }
  return <div>Test Component</div>;
};

describe("ComprehensiveErrorRecovery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children when no errors occur", () => {
    render(
      <ComprehensiveErrorRecovery>
        <TestComponent shouldThrow={false} />
      </ComprehensiveErrorRecovery>
    );

    expect(screen.getByText("Test Component")).toBeInTheDocument();
  });

  it("catches and displays network errors", async () => {
    const onError = jest.fn();

    render(
      <ComprehensiveErrorRecovery onError={onError}>
        <TestComponent shouldThrow={true} errorType="network" />
      </ComprehensiveErrorRecovery>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error de Conexión/i)).toBeInTheDocument();
    });

    expect(onError).toHaveBeenCalledWith(expect.any(NetworkError));
  });

  it("catches and displays AI service errors", async () => {
    const onError = jest.fn();

    render(
      <ComprehensiveErrorRecovery onError={onError}>
        <TestComponent shouldThrow={true} errorType="ai" />
      </ComprehensiveErrorRecovery>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error en el Asistente/i)).toBeInTheDocument();
    });

    expect(onError).toHaveBeenCalledWith(expect.any(AIServiceError));
  });

  it("provides retry functionality for retryable errors", async () => {
    const onRecovery = jest.fn();

    render(
      <ComprehensiveErrorRecovery onRecovery={onRecovery}>
        <TestComponent shouldThrow={true} errorType="network" />
      </ComprehensiveErrorRecovery>
    );

    await waitFor(() => {
      expect(screen.getByText(/Reintentar todo/i)).toBeInTheDocument();
    });

    const retryButton = screen.getByText(/Reintentar todo/i);
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(onRecovery).toHaveBeenCalled();
    });
  });

  it("uses custom fallback component when provided", async () => {
    const CustomFallback = ({ error }: { error: WizardError }) => (
      <div>Custom Fallback: {error.userMessage}</div>
    );

    render(
      <ComprehensiveErrorRecovery fallbackComponent={CustomFallback}>
        <TestComponent shouldThrow={true} errorType="network" />
      </ComprehensiveErrorRecovery>
    );

    await waitFor(() => {
      expect(screen.getByText(/Custom Fallback:/)).toBeInTheDocument();
    });
  });

  it("handles auto-retry for retryable errors", async () => {
    jest.useFakeTimers();
    const onRecovery = jest.fn();

    render(
      <ComprehensiveErrorRecovery
        enableAutoRetry={true}
        maxRetries={2}
        onRecovery={onRecovery}
      >
        <TestComponent shouldThrow={true} errorType="network" />
      </ComprehensiveErrorRecovery>
    );

    // Fast-forward time to trigger auto-retry
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(onRecovery).toHaveBeenCalled();
    });

    jest.useRealTimers();
  });
});

describe("NetworkAwareWizard", () => {
  it("renders children normally when online", () => {
    render(
      <NetworkAwareWizard>
        <TestComponent shouldThrow={false} />
      </NetworkAwareWizard>
    );

    expect(screen.getByText("Test Component")).toBeInTheDocument();
  });

  it("shows offline mode when network is unavailable", () => {
    // Mock offline status
    jest
      .mocked(require("@/lib/utils/network-detection").useNetworkStatus)
      .mockReturnValue({
        isOnline: false,
        effectiveType: undefined,
      });

    render(
      <NetworkAwareWizard enableOfflineMode={true}>
        <TestComponent shouldThrow={false} />
      </NetworkAwareWizard>
    );

    expect(screen.getByText(/Sin conexión/i)).toBeInTheDocument();
  });

  it("calls network error handler when going offline", () => {
    const onNetworkError = jest.fn();

    render(
      <NetworkAwareWizard onNetworkError={onNetworkError}>
        <TestComponent shouldThrow={false} />
      </NetworkAwareWizard>
    );

    // Simulate going offline
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });

    expect(onNetworkError).toHaveBeenCalled();
  });
});

describe("WizardFallbackUI", () => {
  it("renders network error fallback correctly", () => {
    const error = new NetworkError("Test network error");
    const onRetry = jest.fn();

    render(
      <WizardFallbackUI error={error} onRetry={onRetry} showDetails={true} />
    );

    expect(screen.getByText(/Error de Conexión/i)).toBeInTheDocument();
    expect(screen.getByText(/Reintentar/i)).toBeInTheDocument();
  });

  it("renders server error fallback correctly", () => {
    const error = new WizardError(
      "Server error",
      "SERVER_ERROR",
      true,
      "Error del servidor"
    );

    render(<WizardFallbackUI error={error} />);

    expect(screen.getByText(/Error del Servidor/i)).toBeInTheDocument();
  });

  it("renders validation error fallback correctly", () => {
    const error = new ValidationError({ field: ["Required field"] });

    render(<WizardFallbackUI error={error} />);

    expect(screen.getByText(/Error de Validación/i)).toBeInTheDocument();
  });

  it("calls retry handler when retry button is clicked", () => {
    const error = new NetworkError("Test error");
    const onRetry = jest.fn();

    render(<WizardFallbackUI error={error} onRetry={onRetry} />);

    const retryButton = screen.getByText(/Reintentar/i);
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalled();
  });

  it("calls navigation handlers when buttons are clicked", () => {
    const error = new NetworkError("Test error");
    const onGoBack = jest.fn();
    const onGoHome = jest.fn();

    render(
      <WizardFallbackUI error={error} onGoBack={onGoBack} onGoHome={onGoHome} />
    );

    const backButton = screen.getByText(/Volver/i);
    const homeButton = screen.getByText(/Inicio/i);

    fireEvent.click(backButton);
    fireEvent.click(homeButton);

    expect(onGoBack).toHaveBeenCalled();
    expect(onGoHome).toHaveBeenCalled();
  });

  it("shows error details in development mode", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const error = new NetworkError("Test error");

    render(<WizardFallbackUI error={error} showDetails={true} />);

    expect(screen.getByText(/Detalles del Error/i)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });
});

describe("ErrorTestingPanel", () => {
  it("renders testing panel in development mode", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const onTriggerError = jest.fn();

    render(<ErrorTestingPanel onTriggerError={onTriggerError} />);

    expect(
      screen.getByText(/Panel de Pruebas de Errores/i)
    ).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it("does not render in production mode by default", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const onTriggerError = jest.fn();

    render(<ErrorTestingPanel onTriggerError={onTriggerError} />);

    expect(
      screen.queryByText(/Panel de Pruebas de Errores/i)
    ).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it("triggers error when simulate button is clicked", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const onTriggerError = jest.fn();

    render(<ErrorTestingPanel onTriggerError={onTriggerError} />);

    // Select category and scenario
    const categorySelect = screen.getByRole("combobox");
    fireEvent.click(categorySelect);

    // This would require more complex interaction testing
    // For now, just test the quick action buttons
    const networkErrorButton = screen.getByText(/Error de Red/i);
    fireEvent.click(networkErrorButton);

    expect(onTriggerError).toHaveBeenCalledWith(expect.any(NetworkError));

    process.env.NODE_ENV = originalEnv;
  });
});

describe("ErrorScenarioRunner", () => {
  it("adds and runs error scenarios", async () => {
    const runner = new ErrorScenarioRunner();
    const onError = jest.fn();
    const onResult = jest.fn();

    const testError = new NetworkError("Test error");
    runner.addScenario("Test Network Error", testError, true);

    expect(runner.getScenarios()).toHaveLength(1);

    await runner.runScenarios(onError, onResult);

    expect(onError).toHaveBeenCalledWith(testError);
    expect(onResult).toHaveBeenCalledWith(
      "Test Network Error",
      true,
      "Scenario completed successfully"
    );
  });

  it("clears scenarios", () => {
    const runner = new ErrorScenarioRunner();

    runner.addScenario("Test", new NetworkError(), true);
    expect(runner.getScenarios()).toHaveLength(1);

    runner.clear();
    expect(runner.getScenarios()).toHaveLength(0);
  });
});

describe("Integration Tests", () => {
  it("handles complete error recovery flow", async () => {
    const onError = jest.fn();
    const onRecovery = jest.fn();

    const { rerender } = render(
      <ComprehensiveErrorRecovery onError={onError} onRecovery={onRecovery}>
        <TestComponent shouldThrow={true} errorType="network" />
      </ComprehensiveErrorRecovery>
    );

    // Error should be caught and displayed
    await waitFor(() => {
      expect(screen.getByText(/Error de Conexión/i)).toBeInTheDocument();
    });

    expect(onError).toHaveBeenCalled();

    // Simulate recovery by re-rendering without error
    rerender(
      <ComprehensiveErrorRecovery onError={onError} onRecovery={onRecovery}>
        <TestComponent shouldThrow={false} />
      </ComprehensiveErrorRecovery>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Component")).toBeInTheDocument();
    });
  });

  it("handles network-aware error recovery", async () => {
    const onNetworkError = jest.fn();
    const onNetworkRecovery = jest.fn();

    render(
      <NetworkAwareWizard
        onNetworkError={onNetworkError}
        onNetworkRecovery={onNetworkRecovery}
      >
        <ComprehensiveErrorRecovery>
          <TestComponent shouldThrow={false} />
        </ComprehensiveErrorRecovery>
      </NetworkAwareWizard>
    );

    // Simulate network events
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });

    expect(onNetworkError).toHaveBeenCalled();

    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    expect(onNetworkRecovery).toHaveBeenCalled();
  });
});

describe("Error Boundary Integration", () => {
  it("catches unhandled errors and shows fallback UI", async () => {
    // Mock console.error to avoid test output noise
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <ComprehensiveErrorRecovery>
        <TestComponent shouldThrow={true} />
      </ComprehensiveErrorRecovery>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error Inesperado/i)).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it("provides graceful degradation options", async () => {
    render(
      <ComprehensiveErrorRecovery>
        <TestComponent shouldThrow={true} errorType="network" />
      </ComprehensiveErrorRecovery>
    );

    await waitFor(() => {
      expect(screen.getByText(/Guardar y continuar/i)).toBeInTheDocument();
    });

    const gracefulButton = screen.getByText(/Guardar y continuar/i);
    fireEvent.click(gracefulButton);

    expect(toast.info).toHaveBeenCalledWith(
      "Continuando en modo básico",
      expect.any(Object)
    );
  });
});
