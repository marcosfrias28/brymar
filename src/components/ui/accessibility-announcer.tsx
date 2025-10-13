"use client";

import { useEffect, useRef } from "react";

interface AccessibilityAnnouncerProps {
  message: string;
  priority?: "polite" | "assertive";
  clearAfter?: number;
}

/**
 * Component for announcing messages to screen readers
 * Uses aria-live regions to communicate dynamic content changes
 */
export function AccessibilityAnnouncer({
  message,
  priority = "polite",
  clearAfter = 1000,
}: AccessibilityAnnouncerProps) {
  const announcementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message && announcementRef.current) {
      // Clear any existing timeout
      const timeoutId = setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = "";
        }
      }, clearAfter);

      return () => clearTimeout(timeoutId);
    }
  }, [message, clearAfter]);

  if (!message) return null;

  return (
    <div
      ref={announcementRef}
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {message}
    </div>
  );
}

/**
 * Hook for programmatically announcing messages to screen readers
 */
export function useAccessibilityAnnouncer() {
  const announce = (
    message: string,
    priority: "polite" | "assertive" = "polite"
  ) => {
    // Create temporary announcement element
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", priority);
    announcement.setAttribute("aria-atomic", "true");
    announcement.setAttribute("role", "status");
    announcement.className = "sr-only";
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  };

  return { announce };
}

/**
 * Global live region for application-wide announcements
 */
export function GlobalLiveRegion() {
  return (
    <>
      {/* Polite announcements */}
      <div
        id="polite-announcer"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      />

      {/* Assertive announcements */}
      <div
        id="assertive-announcer"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        role="alert"
      />
    </>
  );
}

/**
 * Utility function to announce to global live regions
 */
export const announceGlobally = (
  message: string,
  priority: "polite" | "assertive" = "polite"
) => {
  const announcerId =
    priority === "assertive" ? "assertive-announcer" : "polite-announcer";
  const announcer = document.getElementById(announcerId);

  if (announcer) {
    announcer.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (announcer.textContent === message) {
        announcer.textContent = "";
      }
    }, 1000);
  }
};
