"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";
import type { User } from "@/lib/db/schema";

export type ProfileActivity = {
	id: string;
	type:
		| "view"
		| "favorite"
		| "search"
		| "contact"
		| "message"
		| "login"
		| "profile"
		| "favorites"
		| "settings";
	title: string;
	description: string;
	details?: string;
	timestamp: Date;
	metadata?: Record<string, any>;
};

export type ProfileFavorite = {
	id: string;
	type: "property" | "search";
	title: string;
	description?: string;
	url: string;
	thumbnail?: string;
	createdAt: Date;
};

export type ProfileNotification = {
	id: string;
	type: "info" | "success" | "warning" | "error";
	title: string;
	message: string;
	read: boolean;
	createdAt: Date;
	actionUrl?: string;
};

export type ProfileMessage = {
	id: string;
	senderId: string;
	senderName: string;
	senderAvatar?: string;
	subject: string;
	message: string;
	content: string;
	read: boolean;
	starred: boolean;
	archived: boolean;
	status: "sent" | "delivered" | "read";
	createdAt: Date;
	propertyId?: string;
	sender: {
		id: string;
		name: string;
		email: string;
		avatar?: string;
	};
	attachments?: {
		name: string;
		size: string;
		url: string;
	}[];
};

/**
 * Hook per la gestione del profilo utente
 */
export function useProfile() {
	const { user } = useUser();
	const [profile, setProfile] = useState<User | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (user) {
			setProfile({
				id: user.id,
				name: user.name || "",
				email: user.email || "",
				firstName: user.firstName || "",
				lastName: user.lastName || "",
				phone: user.phone || "",
				bio: user.bio || "",
				location: user.location || "",
				image: user.avatar || "",
				role: user.role || "",
				emailVerified: Boolean(user.emailVerified),
				createdAt: user.createdAt || null,
				updatedAt: user.updatedAt || null,
			});
		} else {
			setProfile(null);
		}
	}, [user]);

	const updateProfile = async (data: Partial<User>) => {
		try {
			setLoading(true);
			setProfile((prev) => (prev ? { ...prev, ...data } : null));
			toast.success("Perfil actualizado con éxito");
		} catch (_err) {
			setError("Error al actualizar el perfil");
			toast.error("Error al actualizar el perfil");
		} finally {
			setLoading(false);
		}
	};

	return {
		profile,
		loading,
		error,
		updateProfile,
	};
}

/**
 * Hook per la gestione delle attività del profilo
 */
export function useProfileActivity() {
	const { user } = useUser();
	const queryClient = useQueryClient();

	const {
		data: activitiesResult,
		isLoading: loading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["profile", "activities", user?.id],
		queryFn: async () => {
			if (!user?.id) {
				return { activities: [], total: 0 };
			}

			const response = await fetch(`/api/profile/activities?userId=${user.id}`);
			if (!response.ok) {
				throw new Error("Failed to fetch activities");
			}
			return response.json();
		},
		staleTime: 10 * 60 * 1000, // 10 minutes cache
		gcTime: 15 * 60 * 1000, // 15 minutes garbage collection
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		enabled: Boolean(user?.id),
	});

	const activities: ProfileActivity[] =
		activitiesResult?.activities?.map((activity: any) => ({
			id: activity.id,
			type: activity.type,
			title: activity.title,
			description: activity.description,
			details: activity.details,
			timestamp: new Date(activity.timestamp),
			metadata: activity.metadata,
		})) || [];

	const refreshActivities = async () => {
		await queryClient.invalidateQueries({
			queryKey: ["profile", "activities", user?.id],
		});
		await refetch();
	};

	return {
		activities,
		loading,
		error,
		refresh: refreshActivities,
	};
}

/**
 * Hook per la gestione dei preferiti
 */
export function useProfileFavorites() {
	const [favorites, setFavorites] = useState<ProfileFavorite[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Simula il caricamento dei preferiti
		setTimeout(() => {
			setFavorites([
				{
					id: "1",
					type: "property",
					title: "Villa Moderna Milano",
					description: "4 camere, 3 bagni, giardino",
					url: "/properties/villa-moderna-milano",
					thumbnail: "/optimized_villa/1.webp",
					createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
				},
				{
					id: "2",
					type: "search",
					title: "Appartamenti Milano Centro",
					description: "Ricerca salvata: 2-3 camere, €800-1200/mese",
					url: "/search?location=milano&rooms=2-3&price=800-1200",
					createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
				},
			]);
			setLoading(false);
		}, 600);
	}, []);

	const removeFavorite = async (id: string) => {
		try {
			setFavorites((prev) => prev.filter((fav) => fav.id !== id));
			toast.success("Rimosso dai preferiti");
		} catch (_err) {
			toast.error("Errore durante la rimozione");
		}
	};

	return {
		favorites,
		loading,
		removeFavorite,
	};
}

/**
 * Hook per la gestione delle notifiche
 */
export function useProfileNotifications() {
	const [notifications, setNotifications] = useState<ProfileNotification[]>([]);
	const [loading, setLoading] = useState(true);
	const [unreadCount, setUnreadCount] = useState(0);

	useEffect(() => {
		// Simula la carga de notificaciones
		setTimeout(() => {
			const mockNotifications = [
				{
					id: "1",
					type: "info" as const,
					title: "Nueva propiedad disponible",
					message:
						"Una nueva propiedad que coincide con tus criterios está disponible",
					read: false,
					createdAt: new Date(Date.now() - 1000 * 60 * 30),
					actionUrl: "/properties/new-property",
				},
				{
					id: "2",
					type: "success" as const,
					title: "Perfil actualizado",
					message: "Tu perfil se ha actualizado con éxito",
					read: true,
					createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
				},
			];
			setNotifications(mockNotifications);
			setUnreadCount(mockNotifications.filter((n) => !n.read).length);
			setLoading(false);
		}, 500);
	}, []);

	const markAsRead = async (id: string) => {
		setNotifications((prev) =>
			prev.map((notification) =>
				notification.id === id ? { ...notification, read: true } : notification
			)
		);
		setUnreadCount((prev) => Math.max(0, prev - 1));
	};

	const markAllAsRead = async () => {
		setNotifications((prev) =>
			prev.map((notification) => ({ ...notification, read: true }))
		);
		setUnreadCount(0);
	};

	return {
		notifications,
		loading,
		unreadCount,
		markAsRead,
		markAllAsRead,
	};
}

/**
 * Hook per la gestione dei messaggi
 */
export function useProfileMessages() {
	const [messages, setMessages] = useState<ProfileMessage[]>([]);
	const [loading, setLoading] = useState(true);
	const [unreadCount, setUnreadCount] = useState(0);

	useEffect(() => {
		// Simula la carga de mensajes
		setTimeout(() => {
			const mockMessages = [
				{
					id: "1",
					senderId: "agent-1",
					senderName: "Marco Rossi",
					senderAvatar: "/avatars/agent-1.jpg",
					subject: "Información Villa Milán",
					message:
						"Hola, he visto tu interés por la villa en Milán. Puedo proporcionarte más detalles.",
					content:
						"Hola, he visto tu interés por la villa en Milán. Puedo proporcionarte más detalles.",
					read: false,
					starred: false,
					archived: false,
					status: "delivered" as const,
					createdAt: new Date(Date.now() - 1000 * 60 * 45),
					propertyId: "villa-milano-1",
					sender: {
						id: "agent-1",
						name: "Marco Rossi",
						email: "marco.rossi@brymar.com",
						avatar: "/avatars/agent-1.jpg",
					},
					attachments: [],
				},
				{
					id: "2",
					senderId: "admin-1",
					senderName: "Soporte Brymar",
					subject: "Bienvenido a Brymar",
					message:
						"¡Bienvenido a nuestra plataforma! Estamos aquí para ayudarte a encontrar la casa de tus sueños.",
					content:
						"¡Bienvenido a nuestra plataforma! Estamos aquí para ayudarte a encontrar la casa de tus sueños.",
					read: true,
					starred: false,
					archived: false,
					status: "read" as const,
					createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
					sender: {
						id: "admin-1",
						name: "Soporte Brymar",
						email: "soporte@brymar.com",
						avatar: "/avatars/support.jpg",
					},
					attachments: [],
				},
			];
			setMessages(mockMessages);
			setUnreadCount(
				mockMessages.filter((m) => !(m.read || m.archived)).length
			);
			setLoading(false);
		}, 700);
	}, []);

	const markAsRead = async (id: string) => {
		setMessages((prev) =>
			prev.map((message) =>
				message.id === id
					? { ...message, read: true, status: "read" as const }
					: message
			)
		);
		setUnreadCount((prev) => Math.max(0, prev - 1));
	};

	const sendMessage = async (data: {
		to: string;
		subject: string;
		content: string;
	}) => {
		// Simulazione invio messaggio
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const newMessage: ProfileMessage = {
			id: Date.now().toString(),
			senderId: "current-user",
			senderName: "Tu",
			subject: data.subject,
			message: data.content,
			content: data.content,
			read: true,
			starred: false,
			archived: false,
			status: "sent",
			createdAt: new Date(),
			sender: {
				id: "current-user",
				name: "Tu",
				email: data.to,
				avatar: "/avatars/user.png",
			},
			attachments: [],
		};

		setMessages((prev) => [newMessage, ...prev]);
	};

	const toggleStar = async (id: string) => {
		// Simulazione toggle stella
		await new Promise((resolve) => setTimeout(resolve, 300));

		setMessages((prev) =>
			prev.map((message) =>
				message.id === id ? { ...message, starred: !message.starred } : message
			)
		);
	};

	const archiveMessage = async (id: string) => {
		// Simulazione archiviazione
		await new Promise((resolve) => setTimeout(resolve, 500));

		setMessages((prev) =>
			prev.map((message) =>
				message.id === id ? { ...message, archived: true } : message
			)
		);

		// Aggiorna il conteggio non letti se il messaggio era non letto
		const message = messages.find((m) => m.id === id);
		if (message && !message.read) {
			setUnreadCount((prev) => Math.max(0, prev - 1));
		}
	};

	return {
		messages,
		loading,
		unreadCount,
		markAsRead,
		sendMessage,
		toggleStar,
		archiveMessage,
	};
}
