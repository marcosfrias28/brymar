import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropertyWizard } from "../optimized-property-wizard";
import { LandWizard } from "../land/land-wizard";
import { BlogWizard } from "../blog/blog-wizard";
import { createMockPropertyData, createMockFile } from "./test-utils";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock IndexedDB for offline storage
const indexedDBMock = {
  open: jest.fn().mockResolvedValue({
    transaction: jest.fn().mockReturnValue({
      objectStore: jest.fn().mockReturnValue({
        add: jest.fn().mockResolvedValue(undefined),
        get: jest.fn().mockResolvedValue({ data: {} }),
        put: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined),
      }),
    }),
  }),
};

Object.defineProperty(window, "indexedDB", {
  value: indexedDBMock,
});

// Mock draft actions
jest.mock("@/lib/actions/property-actions", () => ({
  saveDraft: jest
    .fn()
    .mockResolvedValue({ success: true, draftId: "draft-123" }),
  loadDraft: jest.fn().mockResolvedValue({
    success: true,
    data: { title: "Restored Property", price: 150000 },
  }),
  deleteDraft: jest.fn().mockResolvedValue({ success: true }),
  syncDrafts: jest.fn().mockResolvedValue({ success: true, synced: 1 }),
}));

jest.mock("@/lib/actions/land-wizard-actions", () => ({
  saveLandDraft: jest
    .fn()
    .mockResolvedValue({ success: true, draftId: "land-draft-123" }),
  loadLandDraft: jest.fn().mockResolvedValue({
    success: true,
    data: { name: "Restored Land", price: 75000 },
  }),
  deleteLandDraft: jest.fn().mockResolvedValue({ success: true }),
  syncLandDrafts: jest.fn().mockResolvedValue({ success: true, synced: 1 }),
}));

jest.mock("@/lib/actions/blog-wizard-actions", () => ({
  saveBlogDraft: jest
    .fn()
    .mockResolvedValue({ success: true, draftId: "blog-draft-123" }),
  loadBlogDraft: jest.fn().mockResolvedValue({
    success: true,
    data: { title: "Restored Blog", content: "Restored content" },
  }),
  deleteBlogDraft: jest.fn().mockResolvedValue({ success: true }),
  syncBlogDrafts: jest.fn().mockResolvedValue({ success: true, synced: 1 }),
}));

// Mock network status
const mockNetworkStatus = {
  online: true,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

Object.defineProperty(navigator, "onLine", {
  writable: true,
  value: true,
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("Draft Saving and Synchronization Tests", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
    localStorageMock.clear();
    // Reset network status
    Object.defineProperty(navigator, "onLine", { value: true });
  });

  describe("Auto-Save Functionality", () => {
    it("should auto-save property wizard data on field changes", async () => {
      const saveDraft = require("@/lib/actions/property-actions").saveDraft;

      render(
        <TestWrapper>
          <PropertyWizard />
        </TestWrapper>
      );

      // Fill form data
      await user.type(
        screen.getByLabelText(/title/i),
        "Auto-save Test Property"
      );
      await user.type(screen.getByLabelText(/price/i), "200000");

      // Trigger auto-save by blurring field
      await act(async () => {
        fireEvent.blur(screen.getByLabelText(/title/i));
        // Wait for debounced auto-save
        await new Promise((resolve) => setTimeout(resolve, 1000));
      });

      // Should have called save draft
      expect(saveDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Auto-save Test Property",
          price: 200000,
        })
      );

      // Should show draft saved indicator
      await waitFor(() => {
        expect(screen.getByText(/draft saved/i)).toBeInTheDocument();
      });
    });

    it("should auto-save land wizard data periodically", async () => {
      const saveLandDraft =
        require("@/lib/actions/land-wizard-actions").saveLandDraft;

      render(
        <TestWrapper>
          <LandWizard />
        </TestWrapper>
      );

      // Fill form data
      await user.type(screen.getByLabelText(/name/i), "Auto-save Test Land");
      await user.type(screen.getByLabelText(/price/i), "100000");

      // Wait for periodic auto-save (30 seconds interval)
      await act(async () => {
        jest.advanceTimersByTime(30000);
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(saveLandDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Auto-save Test Land",
          price: 100000,
        })
      );
    });

    it("should auto-save blog wizard content on typing", async () => {
      const saveBlogDraft =
        require("@/lib/actions/blog-wizard-actions").saveBlogDraft;

      render(
        <TestWrapper>
          <BlogWizard />
        </TestWrapper>
      );

      // Type in content field
      const contentField = screen.getByLabelText(/content/i);
      await user.type(contentField, "This is auto-saved blog content");

      // Wait for debounced save
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      });

      expect(saveBlogDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          content: "This is auto-saved blog content",
        })
      );
    });

    it("should handle auto-save failures gracefully", async () => {
      const saveDraft = require("@/lib/actions/property-actions").saveDraft;
      saveDraft.mockRejectedValueOnce(new Error("Save failed"));

      render(
        <TestWrapper>
          <PropertyWizard />
        </TestWrapper>
      );

      await user.type(screen.getByLabelText(/title/i), "Failed Save Test");

      await act(async () => {
        fireEvent.blur(screen.getByLabelText(/title/i));
        await new Promise((resolve) => setTimeout(resolve, 1000));
      });

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/failed to save draft/i)).toBeInTheDocument();
      });

      // Should offer retry option
      expect(
        screen.getByRole("button", { name: /retry save/i })
      ).toBeInTheDocument();
    });
  });

  describe("Draft Restoration", () => {
    it("should restore property draft on wizard initialization", async () => {
      const loadDraft = require("@/lib/actions/property-actions").loadDraft;

      render(
        <TestWrapper>
          <PropertyWizard draftId="draft-123" />
        </TestWrapper>
      );

      // Should load draft data
      expect(loadDraft).toHaveBeenCalledWith("draft-123");

      // Should populate form with restored data
      await waitFor(() => {
        expect(
          screen.getByDisplayValue("Restored Property")
        ).toBeInTheDocument();
        expect(screen.getByDisplayValue("150000")).toBeInTheDocument();
      });

      // Should show restoration notification
      expect(screen.getByText(/draft restored/i)).toBeInTheDocument();
    });

    it("should restore land draft with step progress", async () => {
      const loadLandDraft =
        require("@/lib/actions/land-wizard-actions").loadLandDraft;
      loadLandDraft.mockResolvedValueOnce({
        success: true,
        data: { name: "Restored Land", price: 75000 },
        stepCompleted: 2,
      });

      render(
        <TestWrapper>
          <LandWizard draftId="land-draft-123" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("Restored Land")).toBeInTheDocument();
      });

      // Should restore to correct step
      expect(screen.getByText(/step 3/i)).toBeInTheDocument();
    });

    it("should restore blog draft with rich content", async () => {
      const loadBlogDraft =
        require("@/lib/actions/blog-wizard-actions").loadBlogDraft;
      loadBlogDraft.mockResolvedValueOnce({
        success: true,
        data: {
          title: "Restored Blog",
          content: "**Bold** content with *italic* text",
          tags: ["restored", "draft"],
        },
      });

      render(
        <TestWrapper>
          <BlogWizard draftId="blog-draft-123" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("Restored Blog")).toBeInTheDocument();
        expect(
          screen.getByDisplayValue("**Bold** content with *italic* text")
        ).toBeInTheDocument();
      });

      // Should restore tags
      expect(screen.getByText("restored")).toBeInTheDocument();
      expect(screen.getByText("draft")).toBeInTheDocument();
    });

    it("should handle draft restoration failures", async () => {
      const loadDraft = require("@/lib/actions/property-actions").loadDraft;
      loadDraft.mockRejectedValueOnce(new Error("Draft not found"));

      render(
        <TestWrapper>
          <PropertyWizard draftId="invalid-draft" />
        </TestWrapper>
      );

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/failed to load draft/i)).toBeInTheDocument();
      });

      // Should start with empty form
      expect(screen.getByLabelText(/title/i)).toHaveValue("");
    });
  });

  describe("Offline Storage", () => {
    it("should save drafts locally when offline", async () => {
      // Simulate offline
      Object.defineProperty(navigator, "onLine", { value: false });

      render(
        <TestWrapper>
          <PropertyWizard />
        </TestWrapper>
      );

      await user.type(screen.getByLabelText(/title/i), "Offline Property");
      await user.type(screen.getByLabelText(/price/i), "180000");

      await act(async () => {
        fireEvent.blur(screen.getByLabelText(/title/i));
        await new Promise((resolve) => setTimeout(resolve, 1000));
      });

      // Should save to localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        expect.stringContaining("property-draft"),
        expect.stringContaining("Offline Property")
      );

      // Should show offline indicator
      expect(screen.getByText(/saved offline/i)).toBeInTheDocument();
    });

    it("should sync drafts when coming back online", async () => {
      const syncDrafts = require("@/lib/actions/property-actions").syncDrafts;

      // Start offline with saved draft
      Object.defineProperty(navigator, "onLine", { value: false });
      localStorageMock.setItem(
        "property-draft-offline",
        JSON.stringify({
          title: "Offline Property",
          price: 180000,
          timestamp: Date.now(),
        })
      );

      render(
        <TestWrapper>
          <PropertyWizard />
        </TestWrapper>
      );

      // Simulate coming back online
      Object.defineProperty(navigator, "onLine", { value: true });

      await act(async () => {
        // Trigger online event
        window.dispatchEvent(new Event("online"));
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // Should sync offline drafts
      expect(syncDrafts).toHaveBeenCalled();

      // Should show sync success message
      await waitFor(() => {
        expect(screen.getByText(/drafts synced/i)).toBeInTheDocument();
      });
    });

    it("should handle sync conflicts gracefully", async () => {
      const syncDrafts = require("@/lib/actions/property-actions").syncDrafts;
      syncDrafts.mockResolvedValueOnce({
        success: false,
        conflicts: [
          {
            localData: { title: "Local Version", price: 100000 },
            serverData: { title: "Server Version", price: 120000 },
          },
        ],
      });

      // Setup conflict scenario
      localStorageMock.setItem(
        "property-draft-conflict",
        JSON.stringify({
          title: "Local Version",
          price: 100000,
        })
      );

      render(
        <TestWrapper>
          <PropertyWizard />
        </TestWrapper>
      );

      await act(async () => {
        window.dispatchEvent(new Event("online"));
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // Should show conflict resolution dialog
      await waitFor(() => {
        expect(screen.getByText(/sync conflict/i)).toBeInTheDocument();
        expect(screen.getByText("Local Version")).toBeInTheDocument();
        expect(screen.getByText("Server Version")).toBeInTheDocument();
      });

      // Should offer resolution options
      expect(
        screen.getByRole("button", { name: /keep local/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /keep server/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /merge/i })
      ).toBeInTheDocument();
    });
  });

  describe("Cross-Device Synchronization", () => {
    it("should sync drafts across devices", async () => {
      const syncDrafts = require("@/lib/actions/property-actions").syncDrafts;

      render(
        <TestWrapper>
          <PropertyWizard />
        </TestWrapper>
      );

      // Fill form data
      await user.type(screen.getByLabelText(/title/i), "Cross-device Property");
      await user.type(screen.getByLabelText(/price/i), "250000");

      // Trigger manual sync
      const syncButton = screen.getByRole("button", { name: /sync/i });
      await user.click(syncButton);

      expect(syncDrafts).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Cross-device Property",
          price: 250000,
        })
      );

      // Should show sync success
      await waitFor(() => {
        expect(screen.getByText(/synced successfully/i)).toBeInTheDocument();
      });
    });

    it("should detect and merge changes from other devices", async () => {
      const loadDraft = require("@/lib/actions/property-actions").loadDraft;

      // Mock server returning updated draft
      loadDraft.mockResolvedValueOnce({
        success: true,
        data: {
          title: "Updated from Mobile",
          price: 300000,
          lastModified: new Date().toISOString(),
          modifiedBy: "mobile-device",
        },
      });

      render(
        <TestWrapper>
          <PropertyWizard draftId="draft-123" />
        </TestWrapper>
      );

      // Should show update notification
      await waitFor(() => {
        expect(
          screen.getByText(/updated from another device/i)
        ).toBeInTheDocument();
      });

      // Should offer to reload changes
      const reloadButton = screen.getByRole("button", {
        name: /reload changes/i,
      });
      await user.click(reloadButton);

      // Should update form with new data
      await waitFor(() => {
        expect(
          screen.getByDisplayValue("Updated from Mobile")
        ).toBeInTheDocument();
        expect(screen.getByDisplayValue("300000")).toBeInTheDocument();
      });
    });

    it("should handle concurrent editing conflicts", async () => {
      const saveDraft = require("@/lib/actions/property-actions").saveDraft;

      // Mock concurrent edit conflict
      saveDraft.mockRejectedValueOnce({
        error: "CONCURRENT_EDIT",
        serverData: {
          title: "Server Version",
          price: 280000,
          lastModified: new Date().toISOString(),
        },
      });

      render(
        <TestWrapper>
          <PropertyWizard draftId="draft-123" />
        </TestWrapper>
      );

      // Make changes
      await user.type(screen.getByLabelText(/title/i), "Local Changes");

      // Trigger save
      await act(async () => {
        fireEvent.blur(screen.getByLabelText(/title/i));
        await new Promise((resolve) => setTimeout(resolve, 1000));
      });

      // Should show conflict dialog
      await waitFor(() => {
        expect(
          screen.getByText(/concurrent edit detected/i)
        ).toBeInTheDocument();
        expect(screen.getByText("Local Changes")).toBeInTheDocument();
        expect(screen.getByText("Server Version")).toBeInTheDocument();
      });

      // Should offer merge options
      expect(
        screen.getByRole("button", { name: /merge changes/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /overwrite server/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /discard local/i })
      ).toBeInTheDocument();
    });
  });

  describe("Draft Management", () => {
    it("should list all user drafts", async () => {
      const loadDraft = require("@/lib/actions/property-actions").loadDraft;
      loadDraft.mockResolvedValueOnce({
        success: true,
        drafts: [
          {
            id: "draft-1",
            title: "Property Draft 1",
            lastModified: "2024-01-01",
          },
          {
            id: "draft-2",
            title: "Property Draft 2",
            lastModified: "2024-01-02",
          },
        ],
      });

      render(
        <TestWrapper>
          <PropertyWizard showDraftList={true} />
        </TestWrapper>
      );

      // Should show draft list
      await waitFor(() => {
        expect(screen.getByText("Property Draft 1")).toBeInTheDocument();
        expect(screen.getByText("Property Draft 2")).toBeInTheDocument();
      });

      // Should show last modified dates
      expect(screen.getByText("2024-01-01")).toBeInTheDocument();
      expect(screen.getByText("2024-01-02")).toBeInTheDocument();
    });

    it("should allow deleting drafts", async () => {
      const deleteDraft = require("@/lib/actions/property-actions").deleteDraft;

      render(
        <TestWrapper>
          <PropertyWizard showDraftList={true} />
        </TestWrapper>
      );

      // Find delete button for a draft
      const deleteButton = screen.getByRole("button", {
        name: /delete draft/i,
      });
      await user.click(deleteButton);

      // Should show confirmation dialog
      expect(screen.getByText(/delete this draft/i)).toBeInTheDocument();

      // Confirm deletion
      const confirmButton = screen.getByRole("button", {
        name: /confirm delete/i,
      });
      await user.click(confirmButton);

      expect(deleteDraft).toHaveBeenCalled();

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/draft deleted/i)).toBeInTheDocument();
      });
    });

    it("should handle draft cleanup for old drafts", async () => {
      const deleteDraft = require("@/lib/actions/property-actions").deleteDraft;

      // Mock old drafts
      localStorageMock.setItem(
        "property-draft-old",
        JSON.stringify({
          title: "Old Draft",
          timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days old
        })
      );

      render(
        <TestWrapper>
          <PropertyWizard />
        </TestWrapper>
      );

      // Should automatically clean up old drafts
      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith(
          "property-draft-old"
        );
      });
    });
  });

  describe("Data Integrity", () => {
    it("should validate draft data before saving", async () => {
      const saveDraft = require("@/lib/actions/property-actions").saveDraft;

      render(
        <TestWrapper>
          <PropertyWizard />
        </TestWrapper>
      );

      // Enter invalid data
      await user.type(screen.getByLabelText(/price/i), "-100");

      await act(async () => {
        fireEvent.blur(screen.getByLabelText(/price/i));
        await new Promise((resolve) => setTimeout(resolve, 1000));
      });

      // Should not save invalid data
      expect(saveDraft).not.toHaveBeenCalledWith(
        expect.objectContaining({ price: -100 })
      );

      // Should show validation error
      expect(screen.getByText(/price must be positive/i)).toBeInTheDocument();
    });

    it("should handle corrupted draft data", async () => {
      // Set corrupted data in localStorage
      localStorageMock.setItem("property-draft-corrupted", "invalid-json");

      render(
        <TestWrapper>
          <PropertyWizard />
        </TestWrapper>
      );

      // Should handle gracefully and start fresh
      expect(screen.getByLabelText(/title/i)).toHaveValue("");

      // Should show warning about corrupted data
      expect(screen.getByText(/corrupted draft data/i)).toBeInTheDocument();
    });

    it("should maintain data consistency across wizard steps", async () => {
      render(
        <TestWrapper>
          <PropertyWizard />
        </TestWrapper>
      );

      // Fill data in step 1
      await user.type(screen.getByLabelText(/title/i), "Consistency Test");
      await user.type(screen.getByLabelText(/price/i), "200000");

      // Navigate to step 2
      await user.click(screen.getByRole("button", { name: /next/i }));

      // Navigate back to step 1
      await user.click(screen.getByRole("button", { name: /previous/i }));

      // Data should be preserved
      expect(screen.getByDisplayValue("Consistency Test")).toBeInTheDocument();
      expect(screen.getByDisplayValue("200000")).toBeInTheDocument();
    });
  });
});
