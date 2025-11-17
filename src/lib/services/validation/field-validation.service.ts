import { z } from "zod";

export type FieldValidationResult = { severity: "error" | "warning" | "info"; message: string } | null;

const validators: Record<string, (value: unknown) => FieldValidationResult> = {
  title: (v) => {
    const schema = z.string().min(6);
    const res = schema.safeParse(v);
    if (!res.success) return { severity: "error", message: "Título mínimo 6 caracteres" };
    if (String(v).length < 12) return { severity: "warning", message: "Mejora el título para SEO" };
    return null;
  },
  description: (v) => {
    const schema = z.string().min(20);
    const res = schema.safeParse(v);
    if (!res.success) return { severity: "error", message: "Descripción mínima 20 caracteres" };
    return null;
  },
  price: (v) => {
    const num = Number(v);
    if (Number.isNaN(num) || num <= 0) return { severity: "error", message: "Precio inválido" };
    return null;
  },
  surface: (v) => {
    const num = Number(v);
    if (Number.isNaN(num) || num <= 0) return { severity: "error", message: "Superficie inválida" };
    return null;
  },
};

export function validateField(name: string, value: unknown): FieldValidationResult {
  const fn = validators[name];
  if (!fn) return null;
  return fn(value);
}

