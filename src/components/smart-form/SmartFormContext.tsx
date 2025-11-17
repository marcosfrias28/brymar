"use client";
import { createContext, useContext, type ReactNode } from "react";

type SmartFormContextType = {
  onSave: (payload: Record<string, any>) => Promise<void>;
  setQuality: (name: string, quality: { score: number; confidence: number; messages: string[] }) => void;
  suggest: (name: string, value: string) => Promise<string>;
  autoSave: (payload: Record<string, any>) => void;
};

const SmartFormContext = createContext<SmartFormContextType | null>(null);

export function SmartFormProvider({ children, onSave }: { children: ReactNode; onSave: (payload: Record<string, any>) => Promise<void> }) {
  const setQuality: SmartFormContextType["setQuality"] = () => {};
  const suggest: SmartFormContextType["suggest"] = async (_name, _value) => "";
  const autoSave: SmartFormContextType["autoSave"] = () => {};
  return (
    <SmartFormContext.Provider value={{ onSave, setQuality, suggest, autoSave }}>
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
