"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type BlogCreatorState = {
  form: Record<string, any>;
  setField: (name: string, value: any) => void;
  reset: () => void;
};

export const useBlogCreatorStore = create<BlogCreatorState>()(
  persist(
    (set) => ({
      form: {},
      setField: (name, value) => set((s) => ({ form: { ...s.form, [name]: value } })),
      reset: () => set({ form: {} }),
    }),
    { name: "creator:blog" }
  )
);

