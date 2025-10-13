import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InteractiveMap } from "../shared/interactive-map";
import { mapService } from '@/lib/services/map-service';

// Mock the map service
jest.mock("@/lib/services/map-service", () => ({
  mapService: {
    isWithinDominicanRepublic: jest.fn(),
    reverseGeocode: jest.fn(),
  },
  DOMINICAN_REPUBLIC_CENTER: {
    latitude: 18.7357,
    longitude: -70.1627,
  },
  DOMINICAN_REPUBLIC_BOUNDS: {
    north: 19.9,
    south: 17.5,
    east: -68.3,
    west: -72.0,
  },
}));

// Mock react-leaflet components
jest.mock("react-leaflet", () => ({
  MapContainer: ({ children, ...props }: any) => (
    <div data-testid="map-container" {...props}>
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ position }: any) => (
    <div data-testid="marker" data-position={JSON.stringify(position)} />
  ),
  useMapEvents: (handlers: any) => {
    // Store the click handler for testing
    (global as any).mockMapClickHandler = handlers.click;
    return null;
  },
}));

// Mock leaflet
jest.mock("leaflet", () => ({
  Icon: jest.fn().mockImplementation(() => ({})),
}));

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
};
(global as any).navigator.geolocation = mockGeolocation;

describe("InteractiveMap", () => {
  const mockOnCoordinatesChange = jest.fn();
  const mockOnAddressChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (mapService.isWithinDominicanRepublic as jest.Mock).mockReturnValue(true);
    (mapService.reverseGeocode as jest.Mock).mockResolvedValue({
      street: "Test Street",
      city: "Santo Domingo",
      province: "Santo Domingo",
      country: "Dominican Republic",
      formattedAddress: "Test Street, Santo Domingo, Dominican Republic",
    });
  });

  it("renders without crashing", () => {
    render(
      <InteractiveMap
        onCoordinatesChange={mockOnCoordinatesChange}
        onAddressChange={mockOnAddressChange}
      />
    );

    expect(
      screen.getByText("Toca el mapa para seleccionar ubicación")
    ).toBeInTheDocument();
  });

  it("shows coordinates when provided", () => {
    const coordinates = { latitude: 18.7357, longitude: -70.1627 };

    render(
      <InteractiveMap
        coordinates={coordinates}
        onCoordinatesChange={mockOnCoordinatesChange}
        onAddressChange={mockOnAddressChange}
      />
    );

    expect(screen.getByText("18.7357, -70.1627")).toBeInTheDocument();
    expect(screen.getByTestId("marker")).toBeInTheDocument();
  });

  it("handles map clicks within Dominican Republic bounds", async () => {
    render(
      <InteractiveMap
        onCoordinatesChange={mockOnCoordinatesChange}
        onAddressChange={mockOnAddressChange}
      />
    );

    // Simulate a map click
    const mockEvent = {
      latlng: { lat: 18.7357, lng: -70.1627 },
      originalEvent: {
        stopPropagation: jest.fn(),
        preventDefault: jest.fn(),
      },
    };

    // Call the click handler directly
    if ((global as any).mockMapClickHandler) {
      await (global as any).mockMapClickHandler(mockEvent);
    }

    await waitFor(() => {
      expect(mockOnCoordinatesChange).toHaveBeenCalledWith({
        latitude: 18.7357,
        longitude: -70.1627,
      });
    });

    expect(mapService.isWithinDominicanRepublic).toHaveBeenCalledWith({
      latitude: 18.7357,
      longitude: -70.1627,
    });
  });

  it("ignores clicks outside Dominican Republic bounds", async () => {
    (mapService.isWithinDominicanRepublic as jest.Mock).mockReturnValue(false);

    render(
      <InteractiveMap
        onCoordinatesChange={mockOnCoordinatesChange}
        onAddressChange={mockOnAddressChange}
      />
    );

    // Simulate a map click outside bounds
    const mockEvent = {
      latlng: { lat: 25.0, lng: -80.0 }, // Miami coordinates
      originalEvent: {
        stopPropagation: jest.fn(),
        preventDefault: jest.fn(),
      },
    };

    // Call the click handler directly
    if ((global as any).mockMapClickHandler) {
      await (global as any).mockMapClickHandler(mockEvent);
    }

    expect(mockOnCoordinatesChange).not.toHaveBeenCalled();
  });

  it("prevents multiple simultaneous clicks", async () => {
    render(
      <InteractiveMap
        onCoordinatesChange={mockOnCoordinatesChange}
        onAddressChange={mockOnAddressChange}
      />
    );

    const mockEvent = {
      latlng: { lat: 18.7357, lng: -70.1627 },
      originalEvent: {
        stopPropagation: jest.fn(),
        preventDefault: jest.fn(),
      },
    };

    // Simulate rapid clicks
    if ((global as any).mockMapClickHandler) {
      const promise1 = (global as any).mockMapClickHandler(mockEvent);
      const promise2 = (global as any).mockMapClickHandler(mockEvent);

      await Promise.all([promise1, promise2]);
    }

    // Should only be called once due to processing prevention
    expect(mockOnCoordinatesChange).toHaveBeenCalledTimes(1);
  });

  it("handles geolocation success", async () => {
    const mockPosition = {
      coords: {
        latitude: 18.7357,
        longitude: -70.1627,
      },
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success(mockPosition);
    });

    render(
      <InteractiveMap
        onCoordinatesChange={mockOnCoordinatesChange}
        onAddressChange={mockOnAddressChange}
      />
    );

    const locationButton = screen.getByText("Mi ubicación");
    fireEvent.click(locationButton);

    await waitFor(() => {
      expect(mockOnCoordinatesChange).toHaveBeenCalledWith({
        latitude: 18.7357,
        longitude: -70.1627,
      });
    });
  });

  it("handles geolocation outside Dominican Republic", async () => {
    const mockPosition = {
      coords: {
        latitude: 25.0,
        longitude: -80.0, // Miami coordinates
      },
    };

    (mapService.isWithinDominicanRepublic as jest.Mock).mockReturnValue(false);
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success(mockPosition);
    });

    render(
      <InteractiveMap
        onCoordinatesChange={mockOnCoordinatesChange}
        onAddressChange={mockOnAddressChange}
      />
    );

    const locationButton = screen.getByText("Mi ubicación");
    fireEvent.click(locationButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Tu ubicación actual está fuera de República Dominicana"
        )
      ).toBeInTheDocument();
    });

    expect(mockOnCoordinatesChange).not.toHaveBeenCalled();
  });

  it("handles geolocation errors", async () => {
    const mockError = {
      code: 1, // PERMISSION_DENIED
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error(mockError);
    });

    render(
      <InteractiveMap
        onCoordinatesChange={mockOnCoordinatesChange}
        onAddressChange={mockOnAddressChange}
      />
    );

    const locationButton = screen.getByText("Mi ubicación");
    fireEvent.click(locationButton);

    await waitFor(() => {
      expect(
        screen.getByText("Permiso de ubicación denegado")
      ).toBeInTheDocument();
    });
  });

  it("shows processing indicator during reverse geocoding", async () => {
    // Make reverse geocoding take some time
    (mapService.reverseGeocode as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                street: "Test Street",
                city: "Santo Domingo",
                province: "Santo Domingo",
                country: "Dominican Republic",
                formattedAddress:
                  "Test Street, Santo Domingo, Dominican Republic",
              }),
            100
          )
        )
    );

    render(
      <InteractiveMap
        onCoordinatesChange={mockOnCoordinatesChange}
        onAddressChange={mockOnAddressChange}
      />
    );

    const mockEvent = {
      latlng: { lat: 18.7357, lng: -70.1627 },
      originalEvent: {
        stopPropagation: jest.fn(),
        preventDefault: jest.fn(),
      },
    };

    // Call the click handler
    if ((global as any).mockMapClickHandler) {
      (global as any).mockMapClickHandler(mockEvent);
    }

    // Should show processing indicator
    await waitFor(() => {
      expect(screen.getByText("Procesando ubicación...")).toBeInTheDocument();
    });

    // Wait for processing to complete
    await waitFor(
      () => {
        expect(
          screen.queryByText("Procesando ubicación...")
        ).not.toBeInTheDocument();
      },
      { timeout: 200 }
    );
  });
});
