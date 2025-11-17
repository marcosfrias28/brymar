"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PropertyForm = {
  title: string;
  description: string;
  price: number;
  surface: number;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  amenities: string;
  features: string;
  tags: string;
  status: string;
  location: string;
  images: Array<{ url: string }>;
};

type UpdatePayload = Partial<PropertyForm>;

export type PropertyCreatorStore = {
  /**
   * Estado del formulario del creador de propiedades
   */
  form: Partial<PropertyForm>;

  /**
   * Actualiza un campo específico del formulario
   * @example setField("title", "Casa en la playa")
   */
  setField: (field: keyof PropertyForm, value: unknown) => void;

  /**
   * Actualiza múltiples campos simultáneamente
   * @example updateFields({ price: 250000, surface: 120 })
   */
  updateFields: (updates: UpdatePayload) => void;

  /**
   * Establece todo el formulario en un único paso
   * @example setForm({ title: "Casa", price: 100000 })
   */
  setForm: (next: Partial<PropertyForm>) => void;

  /**
   * Reinicia el formulario a su estado vacío
   */
  resetForm: () => void;

  /**
   * Añade una imagen al arreglo de imágenes
   * @example addImage({ url: "https://..." })
   */
  addImage: (image: { url: string }) => void;

  /**
   * Elimina una imagen por su URL
   * @example removeImageByUrl("https://...")
   */
  removeImageByUrl: (url: string) => void;

  /**
   * Limpia todas las imágenes
   */
  clearImages: () => void;
};

export const usePropertyCreatorStore = create<PropertyCreatorStore>()(
  persist(
    (set, get) => ({
      form: {},

      setField: (field, value) => {
        set((state) => ({
          form: {
            ...state.form,
            [field]: value as never,
          },
        }));
      },

      updateFields: (updates) => {
        set((state) => ({
          form: {
            ...state.form,
            ...updates,
          },
        }));
      },

      setForm: (next) => {
        set(() => ({ form: { ...next } }));
      },

      resetForm: () => set({ form: {} }),

      addImage: (image) => {
        set((state) => ({
          form: {
            ...state.form,
            images: [...((state.form.images as Array<{ url: string }>) || []), image],
          },
        }));
      },

      removeImageByUrl: (url) => {
        const current = (get().form.images as Array<{ url: string }>) || [];
        const next = current.filter((img) => img.url !== url);
        set((state) => ({ form: { ...state.form, images: next } }));
      },

      clearImages: () => {
        set((state) => ({ form: { ...state.form, images: [] } }));
      },
    }),
    {
      name: "creator:property",
      version: 1,
      // Persist solo el formulario
      partialize: (state) => ({ form: state.form }),
    }
  )
);

/**
 * Ejemplos de uso:
 *
 * const store = usePropertyCreatorStore.getState();
 * store.setField("title", "Casa en la montaña");
 * store.updateFields({ price: 300000, surface: 95 });
 * store.addImage({ url: "https://.../img1.jpg" });
 * store.removeImageByUrl("https://.../img1.jpg");
 * store.clearImages();
 * store.resetForm();
 */
