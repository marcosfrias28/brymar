"use client";

import { useCallback, useEffect, useState } from "react";

// import { createDraftManager } from "@/lib/utils/draft-management";

// Placeholder ClientDraftManager since draft functionality is disabled
const ClientDraftManager = {
	hasDraft: (_type: any, _userId: any, _draftId: any) => false,
	loadDraft: (_type: any, _userId: any, _draftId: any) => null,
	saveDraft: (_type: any, _userId: any, _data: any, _draftId?: any) => {},
	deleteDraft: (_type: any, _userId: any, _draftId: any) => {},
	clearExpiredDrafts: () => {},
};

type UseDraftPersistenceOptions = {
	type: "property" | "land" | "blog";
	userId: string;
	draftId?: string;
	autoSaveInterval?: number;
	enableLocalStorage?: boolean;
};

type DraftPersistenceState = {
	hasLocalDraft: boolean;
	localDraftTimestamp: Date | null;
	isAutoSaving: boolean;
	lastAutoSave: Date | null;
	autoSaveError: string | null;
};

export function useDraftPersistence(options: UseDraftPersistenceOptions) {
	const {
		type,
		userId,
		draftId,
		autoSaveInterval = 30_000, // 30 seconds
		enableLocalStorage = true,
	} = options;

	const [state, setState] = useState<DraftPersistenceState>({
		hasLocalDraft: false,
		localDraftTimestamp: null,
		isAutoSaving: false,
		lastAutoSave: null,
		autoSaveError: null,
	});

	// Check for existing local draft on mount
	useEffect(() => {
		if (!enableLocalStorage) {
			return;
		}

		try {
			const hasLocal = ClientDraftManager.hasDraft(type, userId, draftId);
			if (hasLocal) {
				const localData = ClientDraftManager.loadDraft(type, userId, draftId);
				if (
					localData &&
					typeof localData === "object" &&
					"timestamp" in localData
				) {
					setState((prev) => ({
						...prev,
						hasLocalDraft: true,
						localDraftTimestamp: new Date(
							(localData as any).timestamp || Date.now()
						),
					}));
				}
			}
		} catch (_error) {}
	}, [type, userId, draftId, enableLocalStorage]);

	// Clean up expired drafts on mount
	useEffect(() => {
		if (enableLocalStorage) {
			ClientDraftManager.clearExpiredDrafts();
		}
	}, [enableLocalStorage]);

	// Save draft to localStorage
	const saveLocalDraft = useCallback(
		(data: any) => {
			if (!enableLocalStorage) {
				return;
			}

			try {
				ClientDraftManager.saveDraft(type, userId, data, draftId);
				setState((prev) => ({
					...prev,
					lastAutoSave: new Date(),
					autoSaveError: null,
				}));
			} catch (_error) {
				setState((prev) => ({
					...prev,
					autoSaveError: "Error al guardar borrador local",
				}));
			}
		},
		[type, userId, draftId, enableLocalStorage]
	);

	// Load draft from localStorage
	const loadLocalDraft = useCallback(() => {
		if (!enableLocalStorage) {
			return null;
		}

		try {
			return ClientDraftManager.loadDraft(type, userId, draftId);
		} catch (_error) {
			return null;
		}
	}, [type, userId, draftId, enableLocalStorage]);

	// Delete local draft
	const deleteLocalDraft = useCallback(() => {
		if (!enableLocalStorage) {
			return;
		}

		try {
			ClientDraftManager.deleteDraft(type, userId, draftId);
			setState((prev) => ({
				...prev,
				hasLocalDraft: false,
				localDraftTimestamp: null,
			}));
		} catch (_error) {}
	}, [type, userId, draftId, enableLocalStorage]);

	// Auto-save functionality
	const startAutoSave = useCallback(
		(getData: () => any) => {
			if (!enableLocalStorage || autoSaveInterval <= 0) {
				return;
			}

			const interval = setInterval(() => {
				try {
					setState((prev) => ({ ...prev, isAutoSaving: true }));
					const data = getData();
					if (data) {
						saveLocalDraft(data);
					}
				} catch (_error) {
					setState((prev) => ({
						...prev,
						autoSaveError: "Error en guardado automático",
					}));
				} finally {
					setState((prev) => ({ ...prev, isAutoSaving: false }));
				}
			}, autoSaveInterval);

			return () => clearInterval(interval);
		},
		[autoSaveInterval, enableLocalStorage, saveLocalDraft]
	);

	// Manual save
	const manualSave = useCallback(
		(data: any) => {
			setState((prev) => ({ ...prev, isAutoSaving: true }));
			try {
				saveLocalDraft(data);
			} finally {
				setState((prev) => ({ ...prev, isAutoSaving: false }));
			}
		},
		[saveLocalDraft]
	);

	// Restore from local draft
	const restoreFromLocal = useCallback(() => {
		const localData = loadLocalDraft();
		if (localData) {
			setState((prev) => ({
				...prev,
				hasLocalDraft: false,
				localDraftTimestamp: null,
			}));
			return localData;
		}
		return null;
	}, [loadLocalDraft]);

	// Discard local draft
	const discardLocalDraft = useCallback(() => {
		deleteLocalDraft();
	}, [deleteLocalDraft]);

	return {
		// State
		...state,

		// Actions
		saveLocalDraft,
		loadLocalDraft,
		deleteLocalDraft,
		manualSave,
		startAutoSave,
		restoreFromLocal,
		discardLocalDraft,
	};
}

// Hook for cross-session draft recovery
export function useDraftRecovery(
	type: "property" | "land" | "blog",
	userId: string
) {
	const [availableDrafts, setAvailableDrafts] = useState<
		Array<{
			key: string;
			type: string;
			timestamp: Date;
			data: any;
		}>
	>([]);

	useEffect(() => {
		try {
			const drafts: Array<{
				key: string;
				type: string;
				timestamp: Date;
				data: any;
			}> = [];

			// Check localStorage for drafts
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key?.startsWith(`wizard_draft_${type}_${userId}`)) {
					try {
						const stored = localStorage.getItem(key);
						if (stored) {
							const draftData = JSON.parse(stored);
							drafts.push({
								key,
								type: draftData.type,
								timestamp: new Date(draftData.timestamp),
								data: draftData.data,
							});
						}
					} catch (_error) {}
				}
			}

			// Sort by timestamp (newest first)
			drafts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
			setAvailableDrafts(drafts);
		} catch (_error) {}
	}, [type, userId]);

	const restoreDraft = useCallback((key: string) => {
		try {
			const stored = localStorage.getItem(key);
			if (stored) {
				const draftData = JSON.parse(stored);
				return draftData.data;
			}
		} catch (_error) {}
		return null;
	}, []);

	const deleteDraft = useCallback((key: string) => {
		try {
			localStorage.removeItem(key);
			setAvailableDrafts((prev) => prev.filter((draft) => draft.key !== key));
		} catch (_error) {}
	}, []);

	return {
		availableDrafts,
		restoreDraft,
		deleteDraft,
	};
}

// Hook for draft synchronization between server and client
export function useDraftSync(
	type: "property" | "land" | "blog",
	userId: string,
	draftId?: string
) {
	const [syncState, setSyncState] = useState<{
		isSyncing: boolean;
		lastSync: Date | null;
		syncError: string | null;
		hasUnsyncedChanges: boolean;
	}>({
		isSyncing: false,
		lastSync: null,
		syncError: null,
		hasUnsyncedChanges: false,
	});

	// Sync local draft with server
	const syncWithServer = useCallback(
		async (
			serverSaveFunction: (
				data: any
			) => Promise<{ success: boolean; data?: any; message?: string }>
		) => {
			setSyncState((prev) => ({ ...prev, isSyncing: true, syncError: null }));

			try {
				const localData = ClientDraftManager.loadDraft(type, userId, draftId);
				if (localData) {
					const result = await serverSaveFunction(localData);
					if (result.success) {
						// Clear local draft after successful server save
						ClientDraftManager.deleteDraft(type, userId, draftId);
						setSyncState((prev) => ({
							...prev,
							lastSync: new Date(),
							hasUnsyncedChanges: false,
						}));
						return result.data;
					}
					throw new Error(result.message || "Sync failed");
				}
			} catch (error) {
				setSyncState((prev) => ({
					...prev,
					syncError:
						error instanceof Error ? error.message : "Error de sincronización",
				}));
				throw error;
			} finally {
				setSyncState((prev) => ({ ...prev, isSyncing: false }));
			}
		},
		[type, userId, draftId]
	);

	// Mark as having unsynced changes
	const markUnsyncedChanges = useCallback(() => {
		setSyncState((prev) => ({ ...prev, hasUnsyncedChanges: true }));
	}, []);

	return {
		...syncState,
		syncWithServer,
		markUnsyncedChanges,
	};
}
