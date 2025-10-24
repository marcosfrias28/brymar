/**
 * Routes del profilo utente
 * Definisce tutte le routes relative al profilo utente organizzate come array di stringhe
 */

// Routes base del profilo
export const PROFILE_ROUTES = [
	"/profile",
	"/profile/settings",
	"/profile/favorites",
	"/profile/activity",
	"/profile/notifications",
	"/profile/messages",
] as const;

// Tipo per le routes del profilo
export type ProfileRoute = (typeof PROFILE_ROUTES)[number];

// Routes organizzate per categoria
export const PROFILE_ROUTES_CONFIG = {
	base: "/profile",
	settings: "/profile/settings",
	favorites: "/profile/favorites",
	activity: "/profile/activity",
	notifications: "/profile/notifications",
	messages: "/profile/messages",
} as const;

// Metadata delle routes per navigazione
export const PROFILE_ROUTES_METADATA = [
	{
		path: "/profile",
		title: "Profilo",
		description: "Visualizza e modifica il tuo profilo",
		icon: "User",
	},
	{
		path: "/profile/settings",
		title: "Impostazioni",
		description: "Gestisci le impostazioni del tuo account",
		icon: "Settings",
	},
	{
		path: "/profile/favorites",
		title: "Preferiti",
		description: "Le tue proprietà e ricerche salvate",
		icon: "Heart",
	},
	{
		path: "/profile/activity",
		title: "Attività",
		description: "Cronologia delle tue attività",
		icon: "Activity",
	},
	{
		path: "/profile/notifications",
		title: "Notifiche",
		description: "Gestisci le tue notifiche",
		icon: "Bell",
	},
	{
		path: "/profile/messages",
		title: "Messaggi",
		description: "I tuoi messaggi e conversazioni",
		icon: "MessageSquare",
	},
] as const;

/**
 * Verifica se una route è una route del profilo
 * @param pathname - Il percorso da verificare
 * @returns true se è una route del profilo
 */
export function isProfileRoute(pathname: string): boolean {
	return PROFILE_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Ottiene i metadata di una route del profilo
 * @param pathname - Il percorso della route
 * @returns I metadata della route o undefined
 */
export function getProfileRouteMetadata(pathname: string) {
	return PROFILE_ROUTES_METADATA.find((route) => route.path === pathname);
}

/**
 * Ottiene tutte le routes del profilo con i loro metadata
 * @returns Array di routes con metadata
 */
export function getAllProfileRoutes() {
	return PROFILE_ROUTES_METADATA;
}
