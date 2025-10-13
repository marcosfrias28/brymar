import { z } from "zod";

// Schema per l'aggiornamento del profilo
export const updateProfileSchema = z.object({
  name: z.string().min(2, "Il nome deve contenere almeno 2 caratteri"),
  email: z.string().email("Email non valida"),
  phone: z.string().optional(),
  bio: z.string().max(500, "La bio non può superare i 500 caratteri").optional(),
  location: z.string().optional(),
  website: z.string().url("URL non valido").optional().or(z.literal("")),
});

// Schema per le preferenze di notifica
export const notificationPreferencesSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  marketing: z.boolean(),
});

// Schema per le preferenze di privacy
export const privacyPreferencesSchema = z.object({
  profileVisible: z.boolean(),
  showEmail: z.boolean(),
  showPhone: z.boolean(),
});

// Schema per il cambio password
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password attuale richiesta"),
  newPassword: z.string().min(8, "La nuova password deve contenere almeno 8 caratteri"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Le password non corrispondono",
  path: ["confirmPassword"],
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;
export type PrivacyPreferencesInput = z.infer<typeof privacyPreferencesSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;