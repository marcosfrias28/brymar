"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CustomInputProps {
  id: string;
  name: string;
  type: string;
  placeholder?: string;
  label?: string;
  children?: string;
  required?: boolean;
}

export function CustomInput({
  id,
  name,
  type,
  placeholder,
  label,
  children,
  required,
}: CustomInputProps) {
  return (
    <div>
      <Label
        htmlFor={id}
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {children}
        {label && (
          <span className="block text-sm text-gray-500 dark:text-gray-400">
            {label}
          </span>
        )}
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className={cn(
          "mt-1 w-full px-3 py-2 border rounded-lg",
          "focus:ring-blue-500 focus:border-blue-500",
          "dark:focus:ring-blue-400 dark:focus:border-blue-400",
          "border-gray-300 dark:border-gray-600",
          "bg-white dark:bg-gray-700"
        )}
      />
    </div>
  );
}
