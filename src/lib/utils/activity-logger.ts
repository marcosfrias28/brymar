import type { ActivityData } from "@/lib/actions/activities";
import { createActivity } from "@/lib/actions/activities";

/**
 * Utility function to log user activities
 * This can be used throughout the app to track user actions
 */
export class ActivityLogger {
	/**
	 * Log a property view
	 */
	static async logPropertyView(propertyId: string, propertyTitle: string) {
		await createActivity({
			type: "view",
			title: "Visualizzazione proprietà",
			description: `Hai visualizzato ${propertyTitle}`,
			details: `Proprietà ID: ${propertyId}`,
			metadata: { propertyId, action: "view" },
		});
	}

	/**
	 * Log a property favorite
	 */
	static async logPropertyFavorite(
		propertyId: string,
		propertyTitle: string,
		action: "add" | "remove"
	) {
		await createActivity({
			type: "favorite",
			title:
				action === "add" ? "Aggiunto ai preferiti" : "Rimosso dai preferiti",
			description: `${propertyTitle} ${action === "add" ? "aggiunto a" : "rimosso da"} i preferiti`,
			details: `Proprietà ID: ${propertyId}`,
			metadata: { propertyId, action },
		});
	}

	/**
	 * Log a search
	 */
	static async logSearch(
		searchTerm: string,
		filters: Record<string, any>,
		resultsCount: number
	) {
		await createActivity({
			type: "search",
			title: "Nuova ricerca",
			description: `Ricerca: ${searchTerm}`,
			details: `Trovati ${resultsCount} risultati`,
			metadata: { searchTerm, filters, resultsCount },
		});
	}

	/**
	 * Log a contact/inquiry
	 */
	static async logContact(
		propertyId: string,
		propertyTitle: string,
		contactType: "inquiry" | "call" | "email"
	) {
		await createActivity({
			type: "contact",
			title: "Contatto proprietario",
			description: `Hai contattato il proprietario di ${propertyTitle}`,
			details: `Tipo: ${contactType}, Proprietà ID: ${propertyId}`,
			metadata: { propertyId, contactType },
		});
	}

	/**
	 * Log a message
	 */
	static async logMessage(
		recipientId: string,
		recipientName: string,
		messageType: "sent" | "received"
	) {
		await createActivity({
			type: "message",
			title:
				messageType === "sent" ? "Messaggio inviato" : "Messaggio ricevuto",
			description: `${messageType === "sent" ? "Hai inviato" : "Hai ricevuto"} un messaggio da ${recipientName}`,
			details: `Destinatario: ${recipientName}`,
			metadata: { recipientId, messageType },
		});
	}

	/**
	 * Log a login
	 */
	static async logLogin(deviceInfo?: string, ipAddress?: string) {
		await createActivity({
			type: "login",
			title: "Accesso effettuato",
			description: `Login ${deviceInfo ? `da ${deviceInfo}` : "effettuato"}`,
			details: ipAddress ? `IP: ${ipAddress}` : undefined,
			metadata: { deviceInfo, ipAddress },
		});
	}

	/**
	 * Log a profile update
	 */
	static async logProfileUpdate(updatedFields: string[]) {
		await createActivity({
			type: "profile",
			title: "Profilo aggiornato",
			description: "Modificate informazioni personali",
			details: `Campi aggiornati: ${updatedFields.join(", ")}`,
			metadata: { updatedFields },
		});
	}

	/**
	 * Log a settings change
	 */
	static async logSettingsChange(
		settingName: string,
		oldValue: any,
		newValue: any
	) {
		await createActivity({
			type: "settings",
			title: "Impostazioni modificate",
			description: `Modificata impostazione: ${settingName}`,
			details: `Da: ${oldValue} → A: ${newValue}`,
			metadata: { settingName, oldValue, newValue },
		});
	}

	/**
	 * Log a custom activity
	 */
	static async logCustom(activityData: ActivityData) {
		await createActivity(activityData);
	}
}
