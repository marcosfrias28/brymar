import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LocationStep } from "../location-step";

// Mock Leaflet and map components
jest.mock("react-leaflet", () => ({
  MapContainer: ({ children, ...props }: any) => (
    <div data-testid="map-container" {...props}>
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ position, ...props }: any) => (
    <div
      data-testid="marker"
      data-position={JSON.stringify(position)}
      {...props}
    />
  ),
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
  useMapEvents: () => null,
}));

// Mock map service
jest.mock("@/lib/services/map-service", () => ({
  reverseGeocode: jest.fn(),
  geocode: jest.fn(),
}));

import { reverseGeocode, geocode } from "@/lib/services/map-service";

const mockReverseGeocode = reverseGeocode as jest.MockedFunction<
  typeof reverseGeocode
>;
const mockGeocode = geocode as jest.MockedFunction<typeof geocode>;

describe("LocationStep", () => {
  const mockProps = {
    data: {},
    onUpdate: jest.fn(),
    onNext: jest.fn(),
    onPrevious: jest.fn(),
    locale: "es" as const,
  };

  beforeEach(() => {
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

  it("renders map and address form", () => {
    render(<LocationStep {...mockProps} />);

    expect(screen.getByTestId("map-container")).toBeInTheDocument();
    expect(screen.getByLabelText("Dirección")).toBeInTheDocument();
    expect(screen.getByLabelText("Ciudad")).toBeInTheDocument();
    expect(screen.getByLabelText("Provincia")).toBeInTheDocument();
  });

  it("displays existing location data", () => {
    const dataWithLocation = {
      coordinates: { latitude: 18.4861, longitude: -69.9312 },
      address: {
        street: "Calle Test 456",
        city: "Santiago",
        province: "Santiago",
        country: "Dominican Republic",
        formattedAddress: "Calle Test 456, Santiago, Santiago",
      },
    };

    render(<LocationStep {...mockProps} data={dataWithLocation} />);

    expect(screen.getByDisplayValue("Calle Test 456")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Santiago")).toBeInTheDocument();
    expect(screen.getByTestId("marker")).toHaveAttribute(
      "data-position",
      JSON.stringify([18.4861, -69.9312])
    );
  });

  it("handles map click to set location", async () => {
    render(<LocationStep {...mockProps} />);

    const mapContainer = screen.getByTestId("map-container");

    // Simulate map click event
    fireEvent.click(mapContainer, {
      latlng: { lat: 18.4861, lng: -69.9312 },
    });

    await waitFor(() => {
      expect(mockReverseGeocode).toHaveBeenCalledWith({
        latitude: 18.4861,
        longitude: -69.9312,
      });
    });

    await waitFor(() => {
      expect(mockProps.onUpdate).toHaveBeenCalledWith({
        coordinates: { latitude: 18.4861, longitude: -69.9312 },
        address: {
          street: "Calle Principal 123",
          city: "Santo Domingo",
          province: "Distrito Nacional",
          postalCode: "10101",
          country: "Dominican Republic",
          formattedAddress:
            "Calle Principal 123, Santo Domingo, Distrito Nacional",
        },
      });
    });
  });

  it("handles manual address input with geocoding", async () => {
    const user = userEvent.setup();

    render(<LocationStep {...mockProps} />);

    const streetInput = screen.getByLabelText("Dirección");
    await user.type(streetInput, "Avenida 27 de Febrero");

    const cityInput = screen.getByLabelText("Ciudad");
    await user.type(cityInput, "Santo Domingo");

    const provinceInput = screen.getByLabelText("Provincia");
    await user.type(provinceInput, "Distrito Nacional");

    // Trigger geocoding on blur
    fireEvent.blur(provinceInput);

    await waitFor(() => {
      expect(mockGeocode).toHaveBeenCalledWith(
        "Avenida 27 de Febrero, Santo Domingo, Distrito Nacional, Dominican Republic"
      );
    });

    await waitFor(() => {
      expect(mockProps.onUpdate).toHaveBeenCalledWith({
        coordinates: { latitude: 18.4861, longitude: -69.9312 },
        address: {
          street: "Avenida 27 de Febrero",
          city: "Santo Domingo",
          province: "Distrito Nacional",
          country: "Dominican Republic",
          formattedAddress:
            "Avenida 27 de Febrero, Santo Domingo, Distrito Nacional, Dominican Republic",
        },
      });
    });
  });

  it("validates required address fields", async () => {
    const user = userEvent.setup();

    render(<LocationStep {...mockProps} />);

    const nextButton = screen.getByText("Siguiente");
    await user.click(nextButton);

    expect(screen.getByText("La dirección es requerida")).toBeInTheDocument();
    expect(screen.getByText("La ciudad es requerida")).toBeInTheDocument();
    expect(screen.getByText("La provincia es requerida")).toBeInTheDocument();
  });

  it("validates Dominican Republic coordinates bounds", async () => {
    const user = userEvent.setup();

    render(<LocationStep {...mockProps} />);

    const mapContainer = screen.getByTestId("map-container");

    // Click outside DR bounds
    fireEvent.click(mapContainer, {
      latlng: { lat: 25.0, lng: -80.0 }, // Miami coordinates
    });

    const nextButton = screen.getByText("Siguiente");
    await user.click(nextButton);

    expect(
      screen.getByText("La ubicación debe estar dentro de República Dominicana")
    ).toBeInTheDocument();
  });

  it("handles geocoding errors gracefully", async () => {
    const user = userEvent.setup();
    mockGeocode.mockRejectedValue(new Error("Geocoding failed"));

    render(<LocationStep {...mockProps} />);

    const streetInput = screen.getByLabelText("Dirección");
    await user.type(streetInput, "Invalid Address");

    fireEvent.blur(streetInput);

    await waitFor(() => {
      expect(
        screen.getByText(
          "No se pudo encontrar la ubicación. Verifique la dirección."
        )
      ).toBeInTheDocument();
    });
  });

  it("handles reverse geocoding errors gracefully", async () => {
    mockReverseGeocode.mockRejectedValue(new Error("Reverse geocoding failed"));

    render(<LocationStep {...mockProps} />);

    const mapContainer = screen.getByTestId("map-container");
    fireEvent.click(mapContainer, {
      latlng: { lat: 18.4861, lng: -69.9312 },
    });

    await waitFor(() => {
      expect(
        screen.getByText("No se pudo obtener la dirección de esta ubicación")
      ).toBeInTheDocument();
    });
  });

  it("shows loading state during geocoding operations", async () => {
    const user = userEvent.setup();

    // Make geocoding take time
    mockGeocode.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    render(<LocationStep {...mockProps} />);

    const streetInput = screen.getByLabelText("Dirección");
    await user.type(streetInput, "Test Address");

    fireEvent.blur(streetInput);

    expect(screen.getByText("Buscando ubicación...")).toBeInTheDocument();
  });

  it("navigates to previous step", async () => {
    const user = userEvent.setup();

    render(<LocationStep {...mockProps} />);

    const prevButton = screen.getByText("Anterior");
    await user.click(prevButton);

    expect(mockProps.onPrevious).toHaveBeenCalled();
  });

  it("validates step before proceeding to next", async () => {
    const user = userEvent.setup();

    render(
      <LocationStep
        {...mockProps}
        data={{
          coordinates: { latitude: 18.4861, longitude: -69.9312 },
          address: {
            street: "Calle Test",
            city: "Santo Domingo",
            province: "Distrito Nacional",
            country: "Dominican Republic",
            formattedAddress: "Calle Test, Santo Domingo",
          },
        }}
      />
    );

    const nextButton = screen.getByText("Siguiente");
    await user.click(nextButton);

    expect(mockProps.onNext).toHaveBeenCalled();
  });

  it("supports keyboard navigation on map", async () => {
    const user = userEvent.setup();

    render(<LocationStep {...mockProps} />);

    const mapContainer = screen.getByTestId("map-container");
    mapContainer.focus();

    // Test Enter key to place marker
    await user.keyboard("{Enter}");

    // Should trigger map interaction
    expect(mapContainer).toHaveFocus();
  });

  it("displays current coordinates when available", () => {
    const dataWithCoordinates = {
      coordinates: { latitude: 18.4861, longitude: -69.9312 },
    };

    render(<LocationStep {...mockProps} data={dataWithCoordinates} />);

    expect(screen.getByText("18.4861, -69.9312")).toBeInTheDocument();
  });

  it("allows clearing the current location", async () => {
    const user = userEvent.setup();

    const dataWithLocation = {
      coordinates: { latitude: 18.4861, longitude: -69.9312 },
      address: {
        street: "Calle Test",
        city: "Santo Domingo",
        province: "Distrito Nacional",
        country: "Dominican Republic",
        formattedAddress: "Calle Test, Santo Domingo",
      },
    };

    render(<LocationStep {...mockProps} data={dataWithLocation} />);

    const clearButton = screen.getByText("Limpiar Ubicación");
    await user.click(clearButton);

    expect(mockProps.onUpdate).toHaveBeenCalledWith({
      coordinates: undefined,
      address: undefined,
    });
  });
});
