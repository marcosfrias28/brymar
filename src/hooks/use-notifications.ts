"use client";

import { useCallback, useRef } from "react";
import { toast } from "sonner";

export interface NotificationOptions {
	type: "success" | "error" | "loading" | "info";
	title: string;
	description?: string;
	duration?: number;
	action?: {
		label: string;
		onClick: () => void;
	};
}

export interface UseNotificationsReturn {
	notify: (options: NotificationOptions) => any;
	dismiss: (id: string) => void;
	dismissAll: () => void;
	update: (id: string, options: Partial<NotificationOptions>) => void;
	notifyMutation: {
		loading: (message?: string) => any;
		success: (message?: string) => void;
		error: (message?: string) => void;
	};
	notifyQuery: {
		error: (message?: string) => void;
		refetchSuccess: (message?: string) => void;
	};
}

export function useNotifications(): UseNotificationsReturn {
	const activeToasts = useRef<Set<string>>(new Set());
	const loadingToasts = useRef<Map<string, string>>(new Map());

	const notify = useCallback((options: NotificationOptions): any => {
		const { type, title, description, duration, action } = options;

		let toastId: any;

		switch (type) {
			case "success":
				toastId = toast.success(title, {
					description,
					duration: duration || 4000,
					action: action
						? {
								label: action.label,
								onClick: action.onClick,
							}
						: undefined,
				});
				break;

			case "error":
				toastId = toast.error(title, {
					description,
					duration: duration || 6000,
					action: action
						? {
								label: action.label,
								onClick: action.onClick,
							}
						: undefined,
				});
				break;

			case "loading":
				toastId = toast.loading(title, {
					description,
					duration: Infinity, // Loading toasts don't auto-dismiss
				});
				break;
			default:
				toastId = toast.info(title, {
					description,
					duration: duration || 4000,
					action: action
						? {
								label: action.label,
								onClick: action.onClick,
							}
						: undefined,
				});
				break;
		}

		activeToasts.current.add(toastId);
		return toastId;
	}, []);

	const dismiss = useCallback((id: string) => {
		toast.dismiss(id);
		activeToasts.current.delete(id);
		loadingToasts.current.delete(id);
	}, []);

	const dismissAll = useCallback(() => {
		toast.dismiss();
		activeToasts.current.clear();
		loadingToasts.current.clear();
	}, []);

	const update = useCallback(
		(id: string, options: Partial<NotificationOptions>) => {
			// Sonner doesn't have a direct update method, so we dismiss and create new
			dismiss(id);
			if (options.type && options.title) {
				return notify(options as NotificationOptions);
			}
		},
		[dismiss, notify],
	);

	// Specialized methods for common mutation patterns
	const notifyMutation = {
		loading: (message = "Guardando cambios...") => {
			const id = notify({
				type: "loading",
				title: message,
			});
			loadingToasts.current.set("mutation", id);
			return id;
		},

		success: (message = "Cambios guardados exitosamente") => {
			const loadingId = loadingToasts.current.get("mutation");
			if (loadingId) {
				dismiss(loadingId);
				loadingToasts.current.delete("mutation");
			}
			notify({
				type: "success",
				title: message,
			});
		},

		error: (message = "Error al guardar los cambios") => {
			const loadingId = loadingToasts.current.get("mutation");
			if (loadingId) {
				dismiss(loadingId);
				loadingToasts.current.delete("mutation");
			}
			notify({
				type: "error",
				title: message,
				action: {
					label: "Reintentar",
					onClick: () => {
						// This will be overridden by the specific mutation
					},
				},
			});
		},
	};

	// Specialized methods for query patterns
	const notifyQuery = {
		error: (message = "Error al cargar los datos") => {
			notify({
				type: "error",
				title: message,
				action: {
					label: "Reintentar",
					onClick: () => {
						// This will be overridden by the specific query
					},
				},
			});
		},

		refetchSuccess: (message = "Datos actualizados") => {
			notify({
				type: "success",
				title: message,
				duration: 2000, // Shorter duration for background updates
			});
		},
	};

	return {
		notify,
		dismiss,
		dismissAll,
		update,
		notifyMutation,
		notifyQuery,
	};
}
