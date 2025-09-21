"use server";

import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation"; // Unused
import { z } from "zod";
import { createValidatedAction, handleAPIError, createSuccessResponse } from "@/lib/validations";
import {
  updateProfileSchema,
  notificationPreferencesSchema,
  privacyPreferencesSchema,
  // changePasswordSchema, // Unused
  type UpdateProfileInput,
  type NotificationPreferencesInput,
  type PrivacyPreferencesInput,
  // type ChangePasswordInput, // Unused
} from "@/lib/schemas/profile-schemas";

/**
 * Action per aggiornare il profilo utente
 */
export const updateProfileAction = createValidatedAction(
  updateProfileSchema,
  async (data: UpdateProfileInput, user) => {
    try {
      // Simula l'aggiornamento nel database
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In un'implementazione reale, qui aggiorneresti il database
      // const updatedUser = await db.user.update({
      //   where: { id: user.id },
      //   data: data,
      // });

      revalidatePath("/profile");
      
      return {
        success: true,
        message: "Profilo aggiornato con successo",
      };
    } catch (error) {
      return handleAPIError(error, "Errore durante l'aggiornamento del profilo");
    }
  },
  { withUser: true }
);

/**
 * Action per aggiornare le preferenze di notifica
 */
export const updateNotificationPreferencesAction = createValidatedAction(
  notificationPreferencesSchema.extend({ userId: z.string() }),
  async (data: NotificationPreferencesInput & { userId: string }) => {
    try {
      // Simula l'aggiornamento nel database
      await new Promise(resolve => setTimeout(resolve, 500));

      revalidatePath("/profile/settings");
      
      return {
        success: true,
        message: "Preferenze di notifica aggiornate",
      };
    } catch (error) {
      return handleAPIError(error, "Errore durante l'aggiornamento delle preferenze");
    }
  }
);

/**
 * Action per aggiornare le preferenze di privacy
 */
export const updatePrivacyPreferencesAction = createValidatedAction(
  privacyPreferencesSchema.extend({ userId: z.string() }),
  async (data: PrivacyPreferencesInput & { userId: string }) => {
    try {
      // Simula l'aggiornamento nel database
      await new Promise(resolve => setTimeout(resolve, 500));

      revalidatePath("/profile/settings");
      
      return {
        success: true,
        message: "Preferenze di privacy aggiornate",
      };
    } catch (error) {
      return handleAPIError(error, "Errore durante l'aggiornamento delle preferenze");
    }
  }
);

/**
 * Action per cambiare la password
 */
export const changePasswordAction = createValidatedAction(
  z.object({
    userId: z.string(),
    currentPassword: z.string(),
    newPassword: z.string(),
    confirmPassword: z.string(),
  }),
  async (data: { userId: string; currentPassword: string; newPassword: string; confirmPassword: string }) => {
    try {
      // Simula la verifica della password attuale e l'aggiornamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In un'implementazione reale:
      // 1. Verifica la password attuale
      // 2. Hash della nuova password
      // 3. Aggiorna nel database

      return {
        success: true,
        message: "Password cambiata con successo",
      };
    } catch (error) {
      return handleAPIError(error, "Errore durante il cambio password");
    }
  }
);

const removeFavoriteSchema = z.object({
  userId: z.string(),
  favoriteId: z.string(),
});

/**
 * Action per rimuovere un preferito
 */
export const removeFavoriteAction = createValidatedAction(
  removeFavoriteSchema,
  async (data: { userId: string; favoriteId: string }) => {
    try {
      // Simula la rimozione dal database
      await new Promise(resolve => setTimeout(resolve, 300));

      revalidatePath("/profile/favorites");
      
      return createSuccessResponse(undefined, "Rimosso dai preferiti");
    } catch (error) {
      return handleAPIError(error, "Errore durante la rimozione");
    }
  }
);

const addFavoriteSchema = z.object({
  userId: z.string(),
  itemId: z.string(),
  itemType: z.enum(['property', 'search']),
});

/**
 * Action per aggiungere un preferito
 */
export const addFavoriteAction = createValidatedAction(
  addFavoriteSchema,
  async (data: { userId: string; itemId: string; itemType: 'property' | 'search' }) => {
    try {
      // Simula l'aggiunta al database
      await new Promise(resolve => setTimeout(resolve, 300));

      revalidatePath("/profile/favorites");
      
      return createSuccessResponse(undefined, "Aggiunto ai preferiti");
    } catch (error) {
      return handleAPIError(error, "Errore durante l'aggiunta");
    }
  }
);

const markNotificationAsReadSchema = z.object({
  userId: z.string(),
  notificationId: z.string(),
});

/**
 * Action per segnare una notifica come letta
 */
export const markNotificationAsReadAction = createValidatedAction(
  markNotificationAsReadSchema,
  async (data: { userId: string; notificationId: string }) => {
    try {
      // Simula l'aggiornamento nel database
      await new Promise(resolve => setTimeout(resolve, 200));

      revalidatePath("/profile/notifications");
      
      return createSuccessResponse();
    } catch (error) {
      return handleAPIError(error, "Errore durante l'aggiornamento");
    }
  }
);

const markAllNotificationsAsReadSchema = z.object({
  userId: z.string(),
});

/**
 * Action per segnare tutte le notifiche come lette
 */
export const markAllNotificationsAsReadAction = createValidatedAction(
  markAllNotificationsAsReadSchema,
  async (data: { userId: string }) => {
    try {
      // Simula l'aggiornamento nel database
      await new Promise(resolve => setTimeout(resolve, 500));

      revalidatePath("/profile/notifications");
      
      return createSuccessResponse(undefined, "Tutte le notifiche sono state segnate come lette");
    } catch (error) {
      return handleAPIError(error, "Errore durante l'aggiornamento");
    }
  }
);

const markMessageAsReadSchema = z.object({
  userId: z.string(),
  messageId: z.string(),
});

/**
 * Action per segnare un messaggio come letto
 */
export const markMessageAsReadAction = createValidatedAction(
  markMessageAsReadSchema,
  async (data: { userId: string; messageId: string }) => {
    try {
      // Simula l'aggiornamento nel database
      await new Promise(resolve => setTimeout(resolve, 200));

      revalidatePath("/profile/messages");
      
      return createSuccessResponse();
    } catch (error) {
      return handleAPIError(error, "Errore durante l'aggiornamento");
    }
  }
);

const deleteMessageSchema = z.object({
  userId: z.string(),
  messageId: z.string(),
});

/**
 * Action per eliminare un messaggio
 */
export const deleteMessageAction = createValidatedAction(
  deleteMessageSchema,
  async (data: { userId: string; messageId: string }) => {
    try {
      // Simula l'eliminazione dal database
      await new Promise(resolve => setTimeout(resolve, 300));

      revalidatePath("/profile/messages");
      
      return createSuccessResponse(undefined, "Messaggio eliminato");
    } catch (error) {
      return handleAPIError(error, "Errore durante l'eliminazione");
    }
  }
);

// Schema for avatar upload
const avatarUploadSchema = z.object({
  avatar: z.any().optional(),
});

/**
 * Action per caricare l'avatar
 */
export const uploadAvatarAction = createValidatedAction(
  avatarUploadSchema,
  async (data, user) => {
    try {
      // The file will be in the FormData, not in the validated data
      // This is a limitation of the current system for file uploads
      // In a real implementation, you'd handle file uploads differently
      
      // Simula l'upload e il salvataggio
      await new Promise(resolve => setTimeout(resolve, 2000));

      revalidatePath("/profile");
      
      return {
        success: true,
        message: "Avatar aggiornato con successo",
        data: {
          avatarUrl: `/avatars/${user?.id}-${Date.now()}.jpg`, // URL simulato
        }
      };
    } catch (error) {
      return handleAPIError(error, "Errore durante l'upload dell'avatar");
    }
  },
  { withUser: true }
);