"use client";

import type { PropertyFormData } from "@/types/wizard";

const WIZARD_STORAGE_KEY = "wizard_form_data";
const WIZARD_STEP_KEY = "wizard_current_step";
const WIZARD_HISTORY_KEY = "wizard_history";

interface WizardPersistenceData {
	formData: Partial<PropertyFormData>;
	currentStep: number;
	timestamp: number;
	draftId?: string;
}

interface WizardHistoryEntry {
	formData: Partial<PropertyFormData>;
	currentStep: number;
	timestamp: number;
	action: string; // Description of the action that created this entry
}

export class WizardPersistence {
	private static isClient = typeof window !== "undefined";

	/**
	 * Save wizard data to localStorage
	 */
	static saveWizardData(
		formData: Partial<PropertyFormData>,
		currentStep: number,
		draftId?: string,
	): void {
		if (!WizardPersistence.isClient) return;

		try {
			const data: WizardPersistenceData = {
				formData,
				currentStep,
				timestamp: Date.now(),
				draftId,
			};

			localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(data));
		} catch (error) {
			console.warn("Failed to save wizard data to localStorage:", error);
		}
	}

	/**
	 * Load wizard data from localStorage
	 */
	static loadWizardData(): WizardPersistenceData | null {
		if (!WizardPersistence.isClient) return null;

		try {
			const data = localStorage.getItem(WIZARD_STORAGE_KEY);
			if (!data) return null;

			const parsed = JSON.parse(data) as WizardPersistenceData;

			// Check if data is not too old (24 hours)
			const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
			if (Date.now() - parsed.timestamp > maxAge) {
				WizardPersistence.clearWizardData();
				return null;
			}

			return parsed;
		} catch (error) {
			console.warn("Failed to load wizard data from localStorage:", error);
			return null;
		}
	}

	/**
	 * Clear wizard data from localStorage
	 */
	static clearWizardData(): void {
		if (!WizardPersistence.isClient) return;

		try {
			localStorage.removeItem(WIZARD_STORAGE_KEY);
			localStorage.removeItem(WIZARD_STEP_KEY);
		} catch (error) {
			console.warn("Failed to clear wizard data from localStorage:", error);
		}
	}

	/**
	 * Save wizard history for undo/redo functionality
	 */
	static saveWizardHistory(history: WizardHistoryEntry[]): void {
		if (!WizardPersistence.isClient) return;

		try {
			// Limit history size to prevent localStorage bloat
			const maxHistorySize = 50;
			const limitedHistory = history.slice(-maxHistorySize);

			localStorage.setItem(WIZARD_HISTORY_KEY, JSON.stringify(limitedHistory));
		} catch (error) {
			console.warn("Failed to save wizard history to localStorage:", error);
		}
	}

	/**
	 * Load wizard history from localStorage
	 */
	static loadWizardHistory(): WizardHistoryEntry[] {
		if (!WizardPersistence.isClient) return [];

		try {
			const data = localStorage.getItem(WIZARD_HISTORY_KEY);
			if (!data) return [];

			return JSON.parse(data) as WizardHistoryEntry[];
		} catch (error) {
			console.warn("Failed to load wizard history from localStorage:", error);
			return [];
		}
	}

	/**
	 * Clear wizard history from localStorage
	 */
	static clearWizardHistory(): void {
		if (!WizardPersistence.isClient) return;

		try {
			localStorage.removeItem(WIZARD_HISTORY_KEY);
		} catch (error) {
			console.warn("Failed to clear wizard history from localStorage:", error);
		}
	}

	/**
	 * Check if there's existing wizard data
	 */
	static hasExistingData(): boolean {
		if (!WizardPersistence.isClient) return false;

		try {
			const data = localStorage.getItem(WIZARD_STORAGE_KEY);
			return !!data;
		} catch (_error) {
			return false;
		}
	}

	/**
	 * Get the age of stored wizard data in milliseconds
	 */
	static getDataAge(): number | null {
		if (!WizardPersistence.isClient) return null;

		try {
			const data = localStorage.getItem(WIZARD_STORAGE_KEY);
			if (!data) return null;

			const parsed = JSON.parse(data) as WizardPersistenceData;
			return Date.now() - parsed.timestamp;
		} catch (_error) {
			return null;
		}
	}

	/**
	 * Create a backup of current wizard state
	 */
	static createBackup(
		formData: Partial<PropertyFormData>,
		currentStep: number,
		action: string = "manual_backup",
	): void {
		if (!WizardPersistence.isClient) return;

		try {
			const history = WizardPersistence.loadWizardHistory();
			const newEntry: WizardHistoryEntry = {
				formData: JSON.parse(JSON.stringify(formData)), // Deep clone
				currentStep,
				timestamp: Date.now(),
				action,
			};

			history.push(newEntry);
			WizardPersistence.saveWizardHistory(history);
		} catch (error) {
			console.warn("Failed to create wizard backup:", error);
		}
	}

	/**
	 * Restore wizard state from a specific backup
	 */
	static restoreFromBackup(index: number): WizardPersistenceData | null {
		if (!WizardPersistence.isClient) return null;

		try {
			const history = WizardPersistence.loadWizardHistory();
			if (index < 0 || index >= history.length) return null;

			const entry = history[index];
			return {
				formData: entry.formData,
				currentStep: entry.currentStep,
				timestamp: entry.timestamp,
			};
		} catch (error) {
			console.warn("Failed to restore from backup:", error);
			return null;
		}
	}

	/**
	 * Get list of available backups
	 */
	static getAvailableBackups(): Array<{
		index: number;
		timestamp: number;
		action: string;
		age: string;
	}> {
		if (!WizardPersistence.isClient) return [];

		try {
			const history = WizardPersistence.loadWizardHistory();
			const now = Date.now();

			return history.map((entry, index) => ({
				index,
				timestamp: entry.timestamp,
				action: entry.action,
				age: WizardPersistence.formatAge(now - entry.timestamp),
			}));
		} catch (error) {
			console.warn("Failed to get available backups:", error);
			return [];
		}
	}

	/**
	 * Format age in human-readable format
	 */
	private static formatAge(ageMs: number): string {
		const minutes = Math.floor(ageMs / (1000 * 60));
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) return `${days}d ago`;
		if (hours > 0) return `${hours}h ago`;
		if (minutes > 0) return `${minutes}m ago`;
		return "Just now";
	}

	/**
	 * Export wizard data as JSON for external backup
	 */
	static exportWizardData(): string | null {
		if (!WizardPersistence.isClient) return null;

		try {
			const data = WizardPersistence.loadWizardData();
			const history = WizardPersistence.loadWizardHistory();

			const exportData = {
				currentData: data,
				history,
				exportTimestamp: Date.now(),
				version: "1.0",
			};

			return JSON.stringify(exportData, null, 2);
		} catch (error) {
			console.warn("Failed to export wizard data:", error);
			return null;
		}
	}

	/**
	 * Import wizard data from JSON
	 */
	static importWizardData(jsonData: string): boolean {
		if (!WizardPersistence.isClient) return false;

		try {
			const importData = JSON.parse(jsonData);

			if (importData.currentData) {
				localStorage.setItem(
					WIZARD_STORAGE_KEY,
					JSON.stringify(importData.currentData),
				);
			}

			if (importData.history && Array.isArray(importData.history)) {
				WizardPersistence.saveWizardHistory(importData.history);
			}

			return true;
		} catch (error) {
			console.warn("Failed to import wizard data:", error);
			return false;
		}
	}
}
