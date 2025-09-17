"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  updateProfileSchema,
  notificationPreferencesSchema,
  privacyPreferencesSchema,
  changePasswordSchema,
  type UpdateProfileInput,
  type NotificationPreferencesInput,
  type PrivacyPreferencesInput,
  type ChangePasswordInput,
} from "@/lib/schemas/profile-schemas";

/**
 * Action per aggiornare il profilo utente
 */
export async function updateProfileAction(
  userId: string,
  data: UpdateProfileInput
) {
  try {
    // Validazione dei dati
    const validatedData = updateProfileSchema.parse(data);

    // Simula l'aggiornamento nel database
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In un'implementazione reale, qui aggiorneresti il database
    // const updatedUser = await db.user.update({
    //   where: { id: userId },
    //   data: validatedData,
    // });

    revalidatePath("/profile");
    
    return {
      success: true,
      message: "Profilo aggiornato con successo",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Dati non validi",
        errors: error.errors,
      };
    }

    return {
      success: false,
      message: "Errore durante l'aggiornamento del profilo",
    };
  }
}

/**
 * Action per aggiornare le preferenze di notifica
 */
export async function updateNotificationPreferencesAction(
  userId: string,
  preferences: NotificationPreferencesInput
) {
  try {
    const validatedPreferences = notificationPreferencesSchema.parse(preferences);

    // Simula l'aggiornamento nel database
    await new Promise(resolve => setTimeout(resolve, 500));

    revalidatePath("/profile/settings");
    
    return {
      success: true,
      message: "Preferenze di notifica aggiornate",
    };
  } catch (error) {
    return {
      success: false,
      message: "Errore durante l'aggiornamento delle preferenze",
    };
  }
}

/**
 * Action per aggiornare le preferenze di privacy
 */
export async function updatePrivacyPreferencesAction(
  userId: string,
  preferences: PrivacyPreferencesInput
) {
  try {
    const validatedPreferences = privacyPreferencesSchema.parse(preferences);

    // Simula l'aggiornamento nel database
    await new Promise(resolve => setTimeout(resolve, 500));

    revalidatePath("/profile/settings");
    
    return {
      success: true,
      message: "Preferenze di privacy aggiornate",
    };
  } catch (error) {
    return {
      success: false,
      message: "Errore durante l'aggiornamento delle preferenze",
    };
  }
}

/**
 * Action per cambiare la password
 */
export async function changePasswordAction(
  userId: string,
  data: ChangePasswordInput
) {
  try {
    const validatedData = changePasswordSchema.parse(data);

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
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Dati non validi",
        errors: error.errors,
      };
    }

    return {
      success: false,
      message: "Errore durante il cambio password",
    };
  }
}

/**
 * Action per rimuovere un preferito
 */
export async function removeFavoriteAction(
  userId: string,
  favoriteId: string
) {
  try {
    // Simula la rimozione dal database
    await new Promise(resolve => setTimeout(resolve, 300));

    revalidatePath("/profile/favorites");
    
    return {
      success: true,
      message: "Rimosso dai preferiti",
    };
  } catch (error) {
    return {
      success: false,
      message: "Errore durante la rimozione",
    };
  }
}

/**
 * Action per aggiungere un preferito
 */
export async function addFavoriteAction(
  userId: string,
  itemId: string,
  itemType: 'property' | 'search'
) {
  try {
    // Simula l'aggiunta al database
    await new Promise(resolve => setTimeout(resolve, 300));

    revalidatePath("/profile/favorites");
    
    return {
      success: true,
      message: "Aggiunto ai preferiti",
    };
  } catch (error) {
    return {
      success: false,
      message: "Errore durante l'aggiunta",
    };
  }
}

/**
 * Action per segnare una notifica come letta
 */
export async function markNotificationAsReadAction(
  userId: string,
  notificationId: string
) {
  try {
    // Simula l'aggiornamento nel database
    await new Promise(resolve => setTimeout(resolve, 200));

    revalidatePath("/profile/notifications");
    
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message: "Errore durante l'aggiornamento",
    };
  }
}

/**
 * Action per segnare tutte le notifiche come lette
 */
export async function markAllNotificationsAsReadAction(userId: string) {
  try {
    // Simula l'aggiornamento nel database
    await new Promise(resolve => setTimeout(resolve, 500));

    revalidatePath("/profile/notifications");
    
    return {
      success: true,
      message: "Tutte le notifiche sono state segnate come lette",
    };
  } catch (error) {
    return {
      success: false,
      message: "Errore durante l'aggiornamento",
    };
  }
}

/**
 * Action per segnare un messaggio come letto
 */
export async function markMessageAsReadAction(
  userId: string,
  messageId: string
) {
  try {
    // Simula l'aggiornamento nel database
    await new Promise(resolve => setTimeout(resolve, 200));

    revalidatePath("/profile/messages");
    
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message: "Errore durante l'aggiornamento",
    };
  }
}

/**
 * Action per eliminare un messaggio
 */
export async function deleteMessageAction(
  userId: string,
  messageId: string
) {
  try {
    // Simula l'eliminazione dal database
    await new Promise(resolve => setTimeout(resolve, 300));

    revalidatePath("/profile/messages");
    
    return {
      success: true,
      message: "Messaggio eliminato",
    };
  } catch (error) {
    return {
      success: false,
      message: "Errore durante l'eliminazione",
    };
  }
}

/**
 * Action per caricare l'avatar
 */
export async function uploadAvatarAction(
  userId: string,
  formData: FormData
) {
  try {
    const file = formData.get('avatar') as File;
    
    if (!file) {
      return {
        success: false,
        message: "Nessun file selezionato",
      };
    }

    // Validazione del file
    if (file.size > 5 * 1024 * 1024) { // 5MB
      return {
        success: false,
        message: "Il file è troppo grande (max 5MB)",
      };
    }

    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        message: "Il file deve essere un'immagine",
      };
    }

    // Simula l'upload e il salvataggio
    await new Promise(resolve => setTimeout(resolve, 2000));

    revalidatePath("/profile");
    
    return {
      success: true,
      message: "Avatar aggiornato con successo",
      avatarUrl: `/avatars/${userId}-${Date.now()}.jpg`, // URL simulato
    };
  } catch (error) {
    return {
      success: false,
      message: "Errore durante l'upload dell'avatar",
    };
  }
}