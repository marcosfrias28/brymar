"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type PropertyCreatorState = {
  form: Record<string, any>;
  setField: (name: string, value: any) => void;
  reset: () => void;
};

export const usePropertyCreatorStore = create<PropertyCreatorState>()(
  persist(
    (set) => ({
      form: {},
      setField: (name, value) => set((s) => ({ form: { ...s.form, [name]: value } })),
      reset: () => set({ form: {} }),
    }),
    { name: "creator:property" }
  )
);

