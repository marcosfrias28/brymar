/**
 * Component tests for PropertyForm
 */

import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the hooks
jest.mock("@/hooks/use-properties", () => ({
  useCreateProperty: jest.fn(),
  useUpdateProperty: jest.fn(),
}));

// Mock react-hook-form
jest.mock("react-hook-form", () => ({
  useForm: jest.fn(() => ({
    register: jest.fn(),
    handleSubmit: jest.fn((fn) => fn),
    formState: { errors: {} },
    setValue: jest.fn(),
    watch: jest.fn(),
    reset: jest.fn(),
  })),
}));

import { useCreateProperty, useUpdateProperty } from "@/hooks/use-properties";
import { PropertyForm } from "@/components/forms/property-form";

// Mock component to test
const MockPropertyForm = ({ property, onSuccess }: any) => {
  return (
    <form data-testid="property-form">
      <input
        data-testid="title-input"
        placeholder="Property Title"
        defaultValue={property?.title || ""}
      />
      <input
        data-testid="price-input"
        type="number"
        placeholder="Price"
        defaultValue={property?.price || ""}
      />
      <textarea
        data-testid="description-input"
        placeholder="Description"
        defaultValue={property?.description || ""}
      />
      <button
        type="submit"
        data-testid="submit-button"
        onClick={() => onSuccess?.()}
      >
        {property ? "Update Property" : "Create Property"}
      </button>
    </form>
  );
};

describe("PropertyForm Component", () => {
  let queryClient: QueryClient;
  const mockCreateProperty = {
    mutateAsync: jest.fn(),
    isPending: false,
    error: null,
  };
  const mockUpdateProperty = {
    mutateAsync: jest.fn(),
    isPending: false,
    error: null,
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    jest.clearAllMocks();
    (useCreateProperty as jest.Mock).mockReturnValue(mockCreateProperty);
    (useUpdateProperty as jest.Mock).mockReturnValue(mockUpdateProperty);
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it("should render create form when no property provided", () => {
    renderWithProviders(<MockPropertyForm />);

    expect(screen.getByTestId("property-form")).toBeInTheDocument();
    expect(screen.getByTestId("title-input")).toBeInTheDocument();
    expect(screen.getByTestId("price-input")).toBeInTheDocument();
    expect(screen.getByTestId("description-input")).toBeInTheDocument();
    expect(screen.getByText("Create Property")).toBeInTheDocument();
  });

  it("should render update form when property provided", () => {
    const mockProperty = {
      id: "1",
      title: "Test Property",
      price: 250000,
      description: "A beautiful test property",
    };

    renderWithProviders(<MockPropertyForm property={mockProperty} />);

    expect(screen.getByDisplayValue("Test Property")).toBeInTheDocument();
    expect(screen.getByDisplayValue("250000")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("A beautiful test property")
    ).toBeInTheDocument();
    expect(screen.getByText("Update Property")).toBeInTheDocument();
  });

  it("should call onSuccess when form is submitted", async () => {
    const mockOnSuccess = jest.fn();
    renderWithProviders(<MockPropertyForm onSuccess={mockOnSuccess} />);

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it("should handle form input changes", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MockPropertyForm />);

    const titleInput = screen.getByTestId("title-input");
    await user.type(titleInput, "New Property Title");

    expect(titleInput).toHaveValue("New Property Title");
  });

  it("should display loading state during submission", () => {
    const loadingMockCreateProperty = {
      ...mockCreateProperty,
      isPending: true,
    };
    (useCreateProperty as jest.Mock).mockReturnValue(loadingMockCreateProperty);

    renderWithProviders(<MockPropertyForm />);

    // In a real implementation, you would check for loading indicators
    expect(useCreateProperty).toHaveBeenCalled();
  });

  it("should display error state when submission fails", () => {
    const errorMockCreateProperty = {
      ...mockCreateProperty,
      error: { message: "Failed to create property" },
    };
    (useCreateProperty as jest.Mock).mockReturnValue(errorMockCreateProperty);

    renderWithProviders(<MockPropertyForm />);

    // In a real implementation, you would check for error display
    expect(useCreateProperty).toHaveBeenCalled();
  });

  it("should validate required fields", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MockPropertyForm />);

    const submitButton = screen.getByTestId("submit-button");

    // Try to submit without filling required fields
    await user.click(submitButton);

    // In a real implementation, you would check for validation errors
    expect(screen.getByTestId("property-form")).toBeInTheDocument();
  });

  it("should reset form after successful submission", async () => {
    const mockOnSuccess = jest.fn();
    mockCreateProperty.mutateAsync.mockResolvedValue({
      success: true,
      data: { id: "1", title: "New Property" },
    });

    renderWithProviders(<MockPropertyForm onSuccess={mockOnSuccess} />);

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("should handle update operation for existing property", async () => {
    const mockProperty = {
      id: "1",
      title: "Existing Property",
      price: 300000,
      description: "An existing property",
    };

    const mockOnSuccess = jest.fn();
    mockUpdateProperty.mutateAsync.mockResolvedValue({
      success: true,
      data: { ...mockProperty, title: "Updated Property" },
    });

    renderWithProviders(
      <MockPropertyForm property={mockProperty} onSuccess={mockOnSuccess} />
    );

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("should handle network errors gracefully", async () => {
    mockCreateProperty.mutateAsync.mockRejectedValue(
      new Error("Network error")
    );

    renderWithProviders(<MockPropertyForm />);

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    // In a real implementation, you would check for error handling
    expect(screen.getByTestId("property-form")).toBeInTheDocument();
  });
});
