"use client";
import { createContext, useContext, type ReactNode } from "react";

type SmartFormContextType = {
  onSave: (payload: Record<string, any>) => Promise<void>;
};

const SmartFormContext = createContext<SmartFormContextType | null>(null);

export function SmartFormProvider({
  children,
  onSave,
}: {
  children: ReactNode;
  onSave: (payload: Record<string, any>) => Promise<void>;
}) {
  return (
    <SmartFormContext.Provider value={{ onSave }}>
      {children}
    </SmartFormContext.Provider>
  );
}

export function useSmartForm() {
  const context = useContext(SmartFormContext);
  if (!context) {
    throw new Error("useSmartForm debe usarse dentro de SmartFormProvider");
  }
  return context;
}
