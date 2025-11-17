"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type LandCreatorState = {
  form: Record<string, any>;
  setField: (name: string, value: any) => void;
  reset: () => void;
};

export const useLandCreatorStore = create<LandCreatorState>()(
  persist(
    (set) => ({
      form: {},
      setField: (name, value) => set((s) => ({ form: { ...s.form, [name]: value } })),
      reset: () => set({ form: {} }),
    }),
    { name: "creator:land" }
  )
);

