"use client";
import { useEffect, useRef, useState } from "react";
import { useSmartForm } from "./SmartFormContext";
import { Input } from "@/components/ui/input";
import { validateField } from "@/lib/services/validation/field-validation.service";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";

type SmartFieldProps = {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
  onChange: (v: string) => void;
};

export function SmartField({ name, label, placeholder, required, value = "", onChange }: SmartFieldProps) {
  const { setQuality, suggest, autoSave } = useSmartForm();
  const [internal, setInternal] = useState<string>(value);
  const [hint, setHint] = useState<string>("");
  const [validationMsg, setValidationMsg] = useState<string>("");
  const [validationSeverity, setValidationSeverity] = useState<"info" | "warning" | "error" | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInternal(value);
  }, [value]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (internal && internal.length > 2) {
        const s = await suggest(name, internal);
        setHint(s);
        const score = Math.min(1, internal.length / 80);
        setQuality(name, { score, confidence: 0.6, messages: [] });
      } else {
        setHint("");
        setQuality(name, { score: 0, confidence: 0.5, messages: [] });
      }
      const val = validateField(name, internal);
      if (val) {
        setValidationMsg(val.message);
        setValidationSeverity(val.severity);
      } else {
        setValidationMsg("");
        setValidationSeverity(null);
      }
    }, 350);
  }, [internal, name]);

  return (
    <Field className="space-y-2">
      <FieldLabel htmlFor={name}>{label}{required ? " *" : ""}</FieldLabel>
      <FieldContent>
        <Input
          id={name}
          aria-live="polite"
          placeholder={placeholder}
          value={internal}
          onChange={(e) => {
            const v = e.target.value;
            setInternal(v);
            onChange(v);
            autoSave({ [name]: v });
          }}
        />
      </FieldContent>
      {hint && (
        <div className="text-muted-foreground text-xs">{hint}</div>
      )}
      {validationMsg && (
        <div className={"text-xs " + (validationSeverity === "error" ? "text-destructive" : validationSeverity === "warning" ? "text-yellow-600" : "text-muted-foreground")}>{validationMsg}</div>
      )}
    </Field>
  );
}

