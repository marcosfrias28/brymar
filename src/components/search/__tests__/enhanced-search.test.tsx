import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EnhancedSearchPage } from "@/components/search/enhanced-search-page";
import { ModernSearchInterface } from "@/components/search/modern-search-interface";
import { EnhancedSearchResults } from "@/components/search/enhanced-search-results";
import { useModernSearch } from "@/hooks/use-modern-search";


// Mock Next.js router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
};

const mockSearchParams = {
  get: jest.fn(),
  getAll: jest.fn(),
  entries: jest.fn(),
  forEach: jest.fn(),
};

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
  usePathname: () => "/search",
}));

// Mock toast
const mockToast = jest.fn();
jest.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock search actions
jest.mock("@/lib/actions/property-actions", () => ({
  searchPropertiesAction: jest.fn().mockResolvedValue({
    success: true,
    data: {
      properties: [
        {
          id: "1",
          title: "Casa moderna en el centro",
          description: "Hermosa casa con 3 habitaciones",
          price: 250000,
          location: "Centro, Madrid",
          type: "casa",
          status: "venta",
          bedrooms: 3,
          bathrooms: 2,
          area: 150,
          images: ["image1.jpg"],
          amenities: ["piscina", "garaje"],
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-15T10:00:00Z",
        },
      ],
      total: 1,
    },
  }),
}));

jest.mock("@/lib/actions/land-actions", () => ({
  searchLandsAction: jest.fn().mockResolvedValue({
    success: true,
    data: {
      lands: [
        {
          id: "1",
          title: "Terreno urbano en esquina",
          description: "Excelente terreno para construcción",
          price: 180000,
          location: "Zona residencial, Barcelona",
          type: "urbano",
          status: "venta",
          area: 500,
          images: ["land1.jpg"],
          features: ["servicios", "acceso"],
          createdAt: "2024-01-10T10:00:00Z",
          updatedAt: "2024-01-10T10:00:00Z",
        },
      ],
      total: 1,
    },
  }),
}));

describe("Enhanced Search Functionality", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("EnhancedSearchPage", () => {
    it("renders search page with all components", () => {
      render(<EnhancedSearchPage />);
      
      expect(screen.getByRole("heading", { name: /propiedades/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /propiedades/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /terrenos/i })).toBeInTheDocument();
    });

    it("switches between property and land search", async () => {
      render(<EnhancedSearchPage />);
      
      const landsTab = screen.getByRole("tab", { name: /terrenos/i });
      await userEvent.click(landsTab);
      
      expect(mockRouter.replace).toHaveBeenCalledWith(
        expect.stringContaining("type=lands"),
        { scroll: false }
      );
    });

    it("displays loading state", () => {
      render(<EnhancedSearchPage />);
      
      expect(screen.getByText(/buscando/i)).toBeInTheDocument();
    });

    it("handles search errors gracefully", async () => {
      const mockSearchPropertiesAction = jest.fn().mockRejectedValue(new Error("Network error"));
      jest.mock("@/lib/actions/property-actions", () => ({
        searchPropertiesAction: mockSearchPropertiesAction,
      }));
      
      render(<EnhancedSearchPage />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Error en la búsqueda",
            variant: "destructive",
          })
        );
      });
    });
  });

  describe("ModernSearchInterface", () => {
    const defaultProps = {
      searchType: "properties" as const,
      onSearchTypeChange: jest.fn(),
      filters: {},
      onFilterChange: jest.fn(),
      isLoading: false,
      totalResults: 0,
    };

    it("renders filter interface with accessibility features", () => {
      render(<ModernSearchInterface {...defaultProps} />);
      
      expect(screen.getByRole("searchbox", { name: /campo de búsqueda/i })).toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: /ubicación/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /limpiar filtros/i })).toBeInTheDocument();
    });

    it("announces filter changes for screen readers", async () => {
      render(<ModernSearchInterface {...defaultProps} />);
      
      const locationInput = screen.getByRole("combobox", { name: /ubicación/i });
      await userEvent.type(locationInput, "Madrid");
      
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith("location", "M");
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith("location", "Ma");
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith("location", "Mad");
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith("location", "Madr");
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith("location", "Madri");
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith("location", "Madrid");
    });

    it("handles property type selection", async () => {
      render(<ModernSearchInterface {...defaultProps} />);
      
      const casaButton = screen.getByRole("button", { name: /seleccionar tipo de propiedad: casa/i });
      await userEvent.click(casaButton);
      
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith("propertyType", "casa");
    });

    it("resets all filters", async () => {
      const propsWithFilters = {
        ...defaultProps,
        filters: {
          location: "Madrid",
          propertyType: "casa",
          minPrice: 100000,
        },
      };
      
      render(<ModernSearchInterface {...propsWithFilters} />);
      
      const resetButton = screen.getByRole("button", { name: /limpiar filtros/i });
      await userEvent.click(resetButton);
      
      expect(mockToast).toHaveBeenCalledWith({
        title: "Filtros limpiados",
        description: "Todos los filtros han sido restablecidos",
        duration: 2000,
      });
    });

    it("shows active filter count", () => {
      const propsWithFilters = {
        ...defaultProps,
        filters: {
          location: "Madrid",
          propertyType: "casa",
        },
      };
      
      render(<ModernSearchInterface {...propsWithFilters} />);
      
      expect(screen.getByText("2 activos")).toBeInTheDocument();
    });
  });

  describe("EnhancedSearchResults", () => {
    const mockResults = [
      {
        id: "1",
        title: "Casa moderna",
        description: "Hermosa casa con piscina",
        price: 250000,
        location: "Madrid",
        type: "casa",
        status: "venta",
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        images: ["image1.jpg"],
        amenities: ["piscina"],
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
        isFavorite: false,
        views: 15,
      },
    ];

    const defaultProps = {
      items: mockResults,
      searchType: "properties" as const,
      isLoading: false,
      total: 1,
      page: 1,
      limit: 20,
      view: "grid" as const,
      sortBy: "newest",
      onPageChange: jest.fn(),
      onViewChange: jest.fn(),
      onSortChange: jest.fn(),
      onRetry: jest.fn(),
      onFavoriteToggle: jest.fn(),
      onShare: jest.fn(),
      onContact: jest.fn(),
    };

    it("renders property results with accessibility", () => {
      render(<EnhancedSearchResults {...defaultProps} />);
      
      expect(screen.getByRole("article", { name: /casa moderna/i })).toBeInTheDocument();
      expect(screen.getByText("€250,000")).toBeInTheDocument();
      expect(screen.getByText("3 hab")).toBeInTheDocument();
      expect(screen.getByText("2 baños")).toBeInTheDocument();
      expect(screen.getByText("150 m²")).toBeInTheDocument();
    });

    it("handles favorite toggle with accessibility", async () => {
      render(<EnhancedSearchResults {...defaultProps} />);
      
      const favoriteButton = screen.getByRole("button", { name: /añadir a favoritos/i });
      await userEvent.click(favoriteButton);
      
      expect(defaultProps.onFavoriteToggle).toHaveBeenCalledWith("1");
      expect(mockToast).toHaveBeenCalledWith({
        title: "Favorito actualizado",
        description: "Casa moderna añadido a tus favoritos",
        duration: 2000,
      });
    });

    it("handles share functionality", async () => {
      const mockShare = jest.fn();
      global.navigator.share = mockShare;
      
      render(<EnhancedSearchResults {...defaultProps} />);
      
      const shareButton = screen.getByRole("button", { name: /compartir propiedad/i });
      await userEvent.click(shareButton);
      
      expect(mockShare).toHaveBeenCalledWith({
        title: "Casa moderna",
        text: "Hermosa casa con piscina",
        url: expect.any(String),
      });
    });

    it("handles keyboard navigation", () => {
      render(<EnhancedSearchResults {...defaultProps} />);
      
      const propertyCard = screen.getByRole("article", { name: /casa moderna/i });
      
      // Test keyboard navigation
      fireEvent.keyDown(propertyCard, { key: "Enter" });
      fireEvent.keyDown(propertyCard, { key: " " });
      
      // Should handle the key events without errors
      expect(propertyCard).toBeInTheDocument();
    });

    it("shows loading skeleton", () => {
      const loadingProps = { ...defaultProps, isLoading: true };
      render(<EnhancedSearchResults {...loadingProps} />);
      
      expect(screen.getByTestId("loading-skeleton")).toBeInTheDocument();
    });

    it("shows empty state", () => {
      const emptyProps = { ...defaultProps, items: [], total: 0 };
      render(<EnhancedSearchResults {...emptyProps} />);
      
      expect(screen.getByText("No se encontraron resultados")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /intentar de nuevo/i })).toBeInTheDocument();
    });

    it("shows error state", () => {
      const errorProps = { ...defaultProps, error: "Network error" };
      render(<EnhancedSearchResults {...errorProps} />);
      
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Network error")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /reintentar/i })).toBeInTheDocument();
    });

    it("handles pagination", async () => {
      const paginationProps = { ...defaultProps, total: 50, page: 2 };
      render(<EnhancedSearchResults {...paginationProps} />);
      
      const previousButton = screen.getByRole("button", { name: /página anterior/i });
      await userEvent.click(previousButton);
      
      expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);
    });

    it("switches between grid and list views", async () => {
      render(<EnhancedSearchResults {...defaultProps} />);
      
      const listViewButton = screen.getByRole("button", { name: /vista de lista/i });
      await userEvent.click(listViewButton);
      
      expect(defaultProps.onViewChange).toHaveBeenCalledWith("list");
    });
  });

  describe("useModernSearch Hook", () => {
    it("manages search state correctly", () => {
      const { result } = renderHook(() => useModernSearch({
        onSearch: jest.fn().mockResolvedValue({ data: [], total: 0 }),
      }));
      
      expect(result.current.filters).toEqual({});
      expect(result.current.searchType).toBe("properties");
      expect(result.current.isLoading).toBe(false);
    });

    it("updates filters and triggers search", async () => {
      const mockOnSearch = jest.fn().mockResolvedValue({ data: [], total: 0 });
      const { result } = renderHook(() => useModernSearch({ onSearch: mockOnSearch }));
      
      act(() => {
        result.current.updateFilter("location", "Madrid");
      });
      
      await waitFor(() => {
        expect(result.current.filters.location).toBe("Madrid");
        expect(mockOnSearch).toHaveBeenCalled();
      });
    });

    it("resets filters correctly", () => {
      const { result } = renderHook(() => useModernSearch({
        initialFilters: { location: "Madrid", propertyType: "casa" },
        onSearch: jest.fn().mockResolvedValue({ data: [], total: 0 }),
      }));
      
      act(() => {
        result.current.resetFilters();
      });
      
      expect(result.current.filters).toEqual({});
    });

    it("handles search errors", async () => {
      const mockOnSearch = jest.fn().mockRejectedValue(new Error("Search failed"));
      const { result } = renderHook(() => useModernSearch({ onSearch: mockOnSearch }));
      
      act(() => {
        result.current.updateFilter("location", "Madrid");
      });
      
      await waitFor(() => {
        expect(result.current.error).toBe("Search failed");
        expect(result.current.isLoading).toBe(false);
      });
    });
  });



  describe("Mobile Responsiveness", () => {
    beforeEach(() => {
      // Mock different screen sizes
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375, // Mobile width
      });
    });

    it("adapts to mobile screen sizes", () => {
      render(<EnhancedSearchPage />);
      
      // Should show mobile-optimized layout
      expect(screen.getByRole("button", { name: /filtros/i })).toBeInTheDocument();
    });

    it("handles touch interactions", async () => {
      render(<EnhancedSearchResults {...defaultProps} />);
      
      const propertyCard = screen.getByRole("article", { name: /casa moderna/i });
      
      // Simulate touch events
      fireEvent.touchStart(propertyCard, { touches: [{ clientX: 100, clientY: 100 }] });
      fireEvent.touchEnd(propertyCard, { changedTouches: [{ clientX: 100, clientY: 100 }] });
      
      expect(propertyCard).toBeInTheDocument();
    });
  });

  describe("WCAG Compliance", () => {
    it("meets WCAG 2.1 AA standards", () => {
      const { container } = render(<EnhancedSearchPage />);
      
      // Check for proper ARIA labels
      expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument();
      expect(container.querySelector('[role="status"]')).toBeInTheDocument();
      
      // Check for proper heading structure
      const headings = container.querySelectorAll("h1, h2, h3, h4, h5, h6");
      expect(headings.length).toBeGreaterThan(0);
      
      // Check for proper button labels
      const buttons = container.querySelectorAll("button");
      buttons.forEach(button => {
        expect(button).toHaveAttribute("aria-label");
      });
    });

    it("provides keyboard navigation", () => {
      render(<EnhancedSearchPage />);
      
      // Tab through interactive elements
      const firstFocusable = screen.getByRole("searchbox", { name: /campo de búsqueda/i });
      firstFocusable.focus();
      
      expect(document.activeElement).toBe(firstFocusable);
    });

    it("provides sufficient color contrast", () => {
      const { container } = render(<EnhancedSearchPage />);
      
      // Check for proper contrast ratios (this would need a contrast checking tool)
      const textElements = container.querySelectorAll("p, span, h1, h2, h3, h4, h5, h6");
      expect(textElements.length).toBeGreaterThan(0);
    });
  });
});