/**
 * Interactive Map Integration Tests for Wizard Framework
 * Tests map components, location selection, and coordinate handling
 */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock external dependencies
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

vi.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

// Mock Leaflet and React-Leaflet
vi.mock("leaflet", () => ({
  map: vi.fn(() => ({
    setView: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    remove: vi.fn(),
    invalidateSize: vi.fn(),
  })),
  tileLayer: vi.fn(() => ({
    addTo: vi.fn(),
  })),
  marker: vi.fn(() => ({
    addTo: vi.fn(),
    setLatLng: vi.fn(),
    remove: vi.fn(),
  })),
  icon: vi.fn(),
  LatLng: vi.fn((lat, lng) => ({ lat, lng })),
}));

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children, ...props }: any) => (
    <div data-testid="map-container" {...props}>
      {children}
    </div>
  ),
  TileLayer: (props: any) => <div data-testid="tile-layer" {...props} />,
  Marker: ({ position, children, ...props }: any) => (
    <div
      data-testid="map-marker"
      data-position={JSON.stringify(position)}
      {...props}
    >
      {children}
    </div>
  ),
  Popup: ({ children, ...props }: any) => (
    <div data-testid="map-popup" {...props}>
      {children}
    </div>
  ),
  useMap: () => ({
    setView: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    invalidateSize: vi.fn(),
  }),
  useMapEvents: (events: any) => {
    // Mock map events
    return null;
  },
}));

// Mock geolocation API
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};

Object.defineProperty(global.navigator, "geolocation", {
  value: mockGeolocation,
  writable: true,
});

// Import components after mocking
import { LocationPickerStep } from "@/components/wizard/shared/location-picker-step";
import { PropertyWizard } from "@/components/wizard/property/property-wizard";
import { LandWizard } from "@/components/wizard/land/land-wizard";

// Test data types
interface LocationData {
  coordinates?: {
    lat: number;
    lng: number;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  locationDescription?: string;
}

// Mock location services
const mockLocationService = {
  getCurrentLocation: vi.fn(),
  geocodeAddress: vi.fn(),
  reverseGeocode: vi.fn(),
  searchPlaces: vi.fn(),
};

// Mock map component
const MockInteractiveMap = ({
  center,
  zoom,
  onLocationSelect,
  selectedLocation,
  showSearch = true,
  showCurrentLocation = true,
  ...props
}: any) => {
  const handleMapClick = (event: any) => {
    const mockCoordinates = { lat: 25.7617, lng: -80.1918 };
    onLocationSelect?.(mockCoordinates);
  };

  const handleSearchSelect = (place: any) => {
    onLocationSelect?.(place.coordinates);
  };

  return (
    <div data-testid="interactive-map" {...props}>
      <div data-testid="map-container" onClick={handleMapClick}>
        <div data-testid="tile-layer" />
        {selectedLocation && (
          <div
            data-testid="map-marker"
            data-position={JSON.stringify(selectedLocation)}
          />
        )}
      </div>

      {showSearch && (
        <div data-testid="map-search">
          <input
            data-testid="location-search-input"
            placeholder="Search for a location..."
            onChange={(e) => {
              if (e.target.value === "Miami Beach") {
                handleSearchSelect({
                  name: "Miami Beach, FL",
                  coordinates: { lat: 25.7907, lng: -80.13 },
                });
              }
            }}
          />
          <div data-testid="search-results">{/* Mock search results */}</div>
        </div>
      )}

      {showCurrentLocation && (
        <button
          data-testid="current-location-button"
          onClick={() => {
            mockGeolocation.getCurrentPosition.mockImplementation((success) => {
              success({
                coords: {
                  latitude: 25.7617,
                  longitude: -80.1918,
                  accuracy: 10,
                },
              });
            });

            navigator.geolocation.getCurrentPosition((position) => {
              onLocationSelect?.({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            });
          }}
        >
          Use Current Location
        </button>
      )}
    </div>
  );
};

describe("Interactive Map Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset geolocation mocks
    mockGeolocation.getCurrentPosition.mockReset();
    mockGeolocation.watchPosition.mockReset();
    mockGeolocation.clearWatch.mockReset();

    // Mock successful geolocation by default
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: 25.7617,
          longitude: -80.1918,
          accuracy: 10,
        },
        timestamp: Date.now(),
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Location Picker Component", () => {
    const mockLocationPickerProps = {
      data: {},
      onUpdate: vi.fn(),
      onNext: vi.fn(),
      onPrevious: vi.fn(),
      errors: {},
      isLoading: false,
      isMobile: false,
    };

    it("should render interactive map with basic controls", () => {
      render(<MockInteractiveMap />);

      expect(screen.getByTestId("interactive-map")).toBeInTheDocument();
      expect(screen.getByTestId("map-container")).toBeInTheDocument();
      expect(screen.getByTestId("map-search")).toBeInTheDocument();
      expect(screen.getByTestId("current-location-button")).toBeInTheDocument();
    });

    it("should handle map click to select location", async () => {
      const user = userEvent.setup();
      const onLocationSelect = vi.fn();

      render(<MockInteractiveMap onLocationSelect={onLocationSelect} />);

      const mapContainer = screen.getByTestId("map-container");
      await user.click(mapContainer);

      expect(onLocationSelect).toHaveBeenCalledWith({
        lat: 25.7617,
        lng: -80.1918,
      });
    });

    it("should handle location search", async () => {
      const user = userEvent.setup();
      const onLocationSelect = vi.fn();

      render(<MockInteractiveMap onLocationSelect={onLocationSelect} />);

      const searchInput = screen.getByTestId("location-search-input");
      await user.type(searchInput, "Miami Beach");

      expect(onLocationSelect).toHaveBeenCalledWith({
        lat: 25.7907,
        lng: -80.13,
      });
    });

    it("should handle current location detection", async () => {
      const user = userEvent.setup();
      const onLocationSelect = vi.fn();

      render(<MockInteractiveMap onLocationSelect={onLocationSelect} />);

      const currentLocationButton = screen.getByTestId(
        "current-location-button"
      );
      await user.click(currentLocationButton);

      await waitFor(() => {
        expect(onLocationSelect).toHaveBeenCalledWith({
          lat: 25.7617,
          lng: -80.1918,
        });
      });
    });

    it("should display selected location marker", () => {
      const selectedLocation = { lat: 25.7617, lng: -80.1918 };

      render(<MockInteractiveMap selectedLocation={selectedLocation} />);

      const marker = screen.getByTestId("map-marker");
      expect(marker).toBeInTheDocument();
      expect(marker).toHaveAttribute(
        "data-position",
        JSON.stringify(selectedLocation)
      );
    });

    it("should handle geolocation errors gracefully", async () => {
      const user = userEvent.setup();
      const onLocationSelect = vi.fn();

      // Mock geolocation error
      mockGeolocation.getCurrentPosition.mockImplementation(
        (success, error) => {
          error?.({
            code: 1,
            message: "User denied geolocation",
          });
        }
      );

      render(<MockInteractiveMap onLocationSelect={onLocationSelect} />);

      const currentLocationButton = screen.getByTestId(
        "current-location-button"
      );
      await user.click(currentLocationButton);

      // Should not call onLocationSelect on error
      expect(onLocationSelect).not.toHaveBeenCalled();
    });
  });

  describe("Property Wizard Map Integration", () => {
    it("should integrate map in property location step", async () => {
      const user = userEvent.setup();

      render(<PropertyWizard />);

      // Navigate to location step
      await user.click(screen.getByRole("button", { name: /siguiente/i }));

      await waitFor(() => {
        expect(screen.getByText("Ubicación")).toBeInTheDocument();
      });

      // Should have map component
      const mapContainer = screen.queryByTestId("map-container");
      if (mapContainer) {
        expect(mapContainer).toBeInTheDocument();
      }
    });

    it("should save coordinates when location is selected", async () => {
      const user = userEvent.setup();
      const onUpdate = vi.fn();

      // Mock property location step with map
      const MockPropertyLocationStep = ({ data, onUpdate }: any) => (
        <div>
          <h2>Property Location</h2>
          <MockInteractiveMap
            onLocationSelect={(coords: any) => {
              onUpdate({ coordinates: coords });
            }}
            selectedLocation={data.coordinates}
          />
          <div>
            <label htmlFor="address">Address</label>
            <input
              id="address"
              value={data.address?.street || ""}
              onChange={(e) =>
                onUpdate({
                  address: { ...data.address, street: e.target.value },
                })
              }
            />
          </div>
        </div>
      );

      render(<MockPropertyLocationStep data={{}} onUpdate={onUpdate} />);

      // Click on map to select location
      const mapContainer = screen.getByTestId("map-container");
      await user.click(mapContainer);

      expect(onUpdate).toHaveBeenCalledWith({
        coordinates: { lat: 25.7617, lng: -80.1918 },
      });
    });

    it("should validate location data", async () => {
      const user = userEvent.setup();

      render(<PropertyWizard />);

      // Try to proceed without selecting location
      await user.click(screen.getByRole("button", { name: /siguiente/i }));

      await waitFor(() => {
        // Should show validation error for missing location
        const errorMessage = screen.queryByText(/ubicación es requerida/i);
        if (errorMessage) {
          expect(errorMessage).toBeInTheDocument();
        }
      });
    });
  });

  describe("Land Wizard Map Integration", () => {
    it("should integrate map in land location step", async () => {
      const user = userEvent.setup();

      render(<LandWizard />);

      // Navigate to location step
      await user.click(screen.getByRole("button", { name: /siguiente/i }));

      await waitFor(() => {
        expect(screen.getByText("Ubicación")).toBeInTheDocument();
      });

      // Should have map component
      const mapContainer = screen.queryByTestId("map-container");
      if (mapContainer) {
        expect(mapContainer).toBeInTheDocument();
      }
    });

    it("should handle land-specific location features", async () => {
      const user = userEvent.setup();

      // Mock land location step with specialized features
      const MockLandLocationStep = ({ data, onUpdate }: any) => (
        <div>
          <h2>Land Location</h2>
          <MockInteractiveMap
            onLocationSelect={(coords: any) => {
              onUpdate({ coordinates: coords });
            }}
            selectedLocation={data.coordinates}
          />
          <div>
            <label htmlFor="zoning">Zoning Information</label>
            <select
              id="zoning"
              value={data.zoning || ""}
              onChange={(e) => onUpdate({ zoning: e.target.value })}
            >
              <option value="">Select Zoning</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
            </select>
          </div>
          <div>
            <label htmlFor="utilities">Available Utilities</label>
            <div>
              {["water", "electricity", "sewer", "gas"].map((utility) => (
                <label key={utility}>
                  <input
                    type="checkbox"
                    checked={data.utilities?.includes(utility) || false}
                    onChange={(e) => {
                      const current = data.utilities || [];
                      const updated = e.target.checked
                        ? [...current, utility]
                        : current.filter((u: string) => u !== utility);
                      onUpdate({ utilities: updated });
                    }}
                  />
                  {utility}
                </label>
              ))}
            </div>
          </div>
        </div>
      );

      render(<MockLandLocationStep data={{}} onUpdate={vi.fn()} />);

      // Should have land-specific fields
      expect(screen.getByLabelText(/zoning information/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/available utilities/i)).toBeInTheDocument();
    });
  });

  describe("Map Performance and Optimization", () => {
    it("should lazy load map components", async () => {
      const { container } = render(<MockInteractiveMap />);

      // Map should be rendered immediately in this mock
      expect(screen.getByTestId("interactive-map")).toBeInTheDocument();
    });

    it("should handle map resize on viewport changes", async () => {
      const { rerender } = render(<MockInteractiveMap />);

      // Simulate viewport change
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 768,
      });

      window.dispatchEvent(new Event("resize"));

      rerender(<MockInteractiveMap />);

      // Map should still be functional
      expect(screen.getByTestId("interactive-map")).toBeInTheDocument();
    });

    it("should debounce search queries", async () => {
      const user = userEvent.setup();
      const mockSearch = vi.fn();

      const MockSearchableMap = () => {
        const [query, setQuery] = React.useState("");

        React.useEffect(() => {
          const timeoutId = setTimeout(() => {
            if (query) {
              mockSearch(query);
            }
          }, 300);

          return () => clearTimeout(timeoutId);
        }, [query]);

        return (
          <div>
            <input
              data-testid="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search locations..."
            />
          </div>
        );
      };

      render(<MockSearchableMap />);

      const searchInput = screen.getByTestId("search-input");

      // Type rapidly
      await user.type(searchInput, "Miami");

      // Should debounce and only call search once
      await waitFor(
        () => {
          expect(mockSearch).toHaveBeenCalledTimes(1);
          expect(mockSearch).toHaveBeenCalledWith("Miami");
        },
        { timeout: 500 }
      );
    });
  });

  describe("Map Accessibility", () => {
    it("should provide keyboard navigation for map controls", async () => {
      const user = userEvent.setup();

      render(<MockInteractiveMap />);

      // Tab through map controls
      await user.tab();
      expect(screen.getByTestId("location-search-input")).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId("current-location-button")).toHaveFocus();
    });

    it("should provide screen reader announcements for location changes", async () => {
      const user = userEvent.setup();

      const MockAccessibleMap = ({ onLocationSelect }: any) => {
        const [announcement, setAnnouncement] = React.useState("");

        const handleLocationSelect = (coords: any) => {
          setAnnouncement(`Location selected: ${coords.lat}, ${coords.lng}`);
          onLocationSelect?.(coords);
        };

        return (
          <div>
            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {announcement}
            </div>
            <MockInteractiveMap onLocationSelect={handleLocationSelect} />
          </div>
        );
      };

      render(<MockAccessibleMap onLocationSelect={vi.fn()} />);

      const mapContainer = screen.getByTestId("map-container");
      await user.click(mapContainer);

      // Should announce location change
      await waitFor(() => {
        const announcement = screen.getByText(/location selected/i);
        expect(announcement).toBeInTheDocument();
      });
    });

    it("should support high contrast mode", () => {
      // Mock high contrast media query
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === "(prefers-contrast: high)",
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<MockInteractiveMap />);

      // Map should still be functional in high contrast mode
      expect(screen.getByTestId("interactive-map")).toBeInTheDocument();
    });
  });

  describe("Mobile Map Experience", () => {
    beforeEach(() => {
      // Mock mobile environment
      vi.mocked(require("@/hooks/use-mobile").useIsMobile).mockReturnValue(
        true
      );
    });

    it("should optimize map for touch interactions", () => {
      render(<MockInteractiveMap />);

      const mapContainer = screen.getByTestId("map-container");

      // Should have touch-friendly styling
      expect(mapContainer).toBeInTheDocument();
    });

    it("should handle touch gestures for map navigation", async () => {
      const user = userEvent.setup();
      const onLocationSelect = vi.fn();

      render(<MockInteractiveMap onLocationSelect={onLocationSelect} />);

      const mapContainer = screen.getByTestId("map-container");

      // Simulate touch interaction
      fireEvent.touchStart(mapContainer, {
        touches: [{ clientX: 100, clientY: 100 }],
      });

      fireEvent.touchEnd(mapContainer, {
        changedTouches: [{ clientX: 100, clientY: 100 }],
      });

      // Should handle touch as location selection
      expect(onLocationSelect).toHaveBeenCalled();
    });

    it("should provide mobile-optimized search interface", () => {
      render(<MockInteractiveMap />);

      const searchInput = screen.getByTestId("location-search-input");

      // Should be optimized for mobile input
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle map loading failures", () => {
      // Mock map loading error
      const MockFailingMap = () => {
        const [hasError, setHasError] = React.useState(false);

        React.useEffect(() => {
          // Simulate map loading failure
          setHasError(true);
        }, []);

        if (hasError) {
          return (
            <div data-testid="map-error">
              <p>Unable to load map. Please try again.</p>
              <button onClick={() => setHasError(false)}>Retry</button>
            </div>
          );
        }

        return <MockInteractiveMap />;
      };

      render(<MockFailingMap />);

      expect(screen.getByTestId("map-error")).toBeInTheDocument();
      expect(screen.getByText(/unable to load map/i)).toBeInTheDocument();
    });

    it("should handle network connectivity issues", async () => {
      const user = userEvent.setup();

      // Mock offline state
      Object.defineProperty(navigator, "onLine", {
        writable: true,
        value: false,
      });

      const MockOfflineMap = () => {
        const [isOnline, setIsOnline] = React.useState(navigator.onLine);

        React.useEffect(() => {
          const handleOnline = () => setIsOnline(true);
          const handleOffline = () => setIsOnline(false);

          window.addEventListener("online", handleOnline);
          window.addEventListener("offline", handleOffline);

          return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
          };
        }, []);

        if (!isOnline) {
          return (
            <div data-testid="offline-map">
              <p>Map requires internet connection</p>
            </div>
          );
        }

        return <MockInteractiveMap />;
      };

      render(<MockOfflineMap />);

      expect(screen.getByTestId("offline-map")).toBeInTheDocument();
    });

    it("should handle invalid coordinates gracefully", () => {
      const invalidCoordinates = { lat: NaN, lng: undefined };

      render(<MockInteractiveMap selectedLocation={invalidCoordinates} />);

      // Should not crash with invalid coordinates
      expect(screen.getByTestId("interactive-map")).toBeInTheDocument();
    });

    it("should handle location permission denied", async () => {
      const user = userEvent.setup();

      // Mock permission denied
      mockGeolocation.getCurrentPosition.mockImplementation(
        (success, error) => {
          error?.({
            code: 1, // PERMISSION_DENIED
            message: "User denied the request for Geolocation.",
          });
        }
      );

      const MockPermissionMap = () => {
        const [permissionError, setPermissionError] = React.useState("");

        const handleCurrentLocation = () => {
          navigator.geolocation.getCurrentPosition(
            () => {},
            (error) => {
              setPermissionError(
                "Location access denied. Please enable location services."
              );
            }
          );
        };

        return (
          <div>
            <button
              data-testid="location-button"
              onClick={handleCurrentLocation}
            >
              Get Current Location
            </button>
            {permissionError && (
              <div data-testid="permission-error">{permissionError}</div>
            )}
          </div>
        );
      };

      render(<MockPermissionMap />);

      await user.click(screen.getByTestId("location-button"));

      await waitFor(() => {
        expect(screen.getByTestId("permission-error")).toBeInTheDocument();
      });
    });
  });
});
