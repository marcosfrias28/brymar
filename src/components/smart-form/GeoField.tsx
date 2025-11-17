"use client";
import { Input } from "@/components/smart-form/input";

type GeoFieldProps = {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function GeoField({ name, label, value, onChange }: GeoFieldProps) {
  return (
    <Input
      id={name}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Ciudad, País"
    />
  );
}
