/**
 * Modern Wizard Form Field Component with AI Integration
 * Provides consistent form field styling and AI generation capabilities
 */

"use client";

import React, { useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Eye,
  EyeOff,
  DollarSign,
  Ruler,
  MapPin,
  Home,
  Tag,
  FileText,
  Hash,
  Calendar,
  Mail,
  Phone,
  User,
  Building,
  TreePine,
  LucideIcon,
} from "lucide-react";
import { ModernAIButton } from "./modern-step-layout";
import {
  useEnhancedAIGeneration,
  AIContentData,
} from "@/hooks/use-enhanced-ai-generation";

// Icon mapping for different field types
const fieldIcons: Record<string, LucideIcon> = {
  price: DollarSign,
  surface: Ruler,
  location: MapPin,
  address: MapPin,
  title: Home,
  name: Tag,
  description: FileText,
  content: FileText,
  tags: Hash,
  date: Calendar,
  email: Mail,
  phone: Phone,
  user: User,
  property: Building,
  land: TreePine,
};

interface ModernWizardFormFieldProps {
  label: string;
  description?: string;
  type?: "text" | "email" | "password" | "number" | "textarea" | "tel";
  placeholder?: string;
  required?: boolean;
  error?: string;
  icon?: LucideIcon | string;
  register?: UseFormRegisterReturn;
  value?: string | number;
  onChange?: (value: string | number) => void;
  className?: string;

  // AI Generation props
  aiEnabled?: boolean;
  aiType?: "title" | "description" | "tags" | "content";
  aiData?: AIContentData;
  onAIGenerated?: (content: string) => void;

  // Additional props
  suffix?: string;
  prefix?: string;
  maxLength?: number;
  rows?: number;
  disabled?: boolean;
}

export function ModernWizardFormField({
  label,
  description,
  type = "text",
  placeholder,
  required = false,
  error,
  icon,
  register,
  value,
  onChange,
  className,
  aiEnabled = false,
  aiType,
  aiData,
  onAIGenerated,
  suffix,
  prefix,
  maxLength,
  rows = 4,
  disabled = false,
}: ModernWizardFormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const { generateTitle, generateDescription, generateTags, isGenerating } =
    useEnhancedAIGeneration({
      onSuccess: (generationType, content) => {
        if (onAIGenerated && typeof content === "string") {
          onAIGenerated(content);
        }
      },
    });

  // Determine icon
  const IconComponent =
    typeof icon === "string"
      ? fieldIcons[icon] || Tag
      : icon || fieldIcons[type] || Tag;

  // Handle AI generation
  const handleAIGeneration = async () => {
    if (!aiData || !aiType) return;

    try {
      let result: string | null = null;

      switch (aiType) {
        case "title":
          result = await generateTitle(aiData);
          break;
        case "description":
        case "content":
          const desc = await generateDescription(aiData);
          result = typeof desc === "string" ? desc : desc?.plainText || null;
          break;
        case "tags":
          const tags = await generateTags(aiData);
          result = tags?.join(", ") || null;
          break;
      }

      if (result && onAIGenerated) {
        onAIGenerated(result);
      }
    } catch (error) {
      }
  };

  // Input props
  const inputProps = {
    placeholder,
    disabled: disabled || isGenerating,
    maxLength,
    className: cn(
      "pl-10 transition-all duration-200",
      suffix && "pr-16",
      error && "border-red-500 focus:border-red-500",
      isFocused && !error && "border-primary",
      className,
    ),
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    ...register,
  };

  // Handle controlled vs uncontrolled
  const controlledProps =
    value !== undefined && onChange
      ? {
          value: value,
          onChange: (
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
          ) => {
            const newValue =
              type === "number" ? Number(e.target.value) : e.target.value;
            onChange(newValue);
          },
        }
      : {};

  const finalInputProps = { ...inputProps, ...controlledProps };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      {/* Label */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-2">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>

        {/* AI Generation Button */}
        {aiEnabled && aiData && (
          <ModernAIButton
            onGenerate={handleAIGeneration}
            isGenerating={isGenerating}
            label={`Generar ${aiType}`}
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
          />
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
          <IconComponent
            className={cn(
              "h-4 w-4 transition-colors duration-200",
              isFocused ? "text-primary" : "text-muted-foreground",
              error && "text-red-500",
            )}
          />
        </div>

        {/* Prefix */}
        {prefix && (
          <div className="absolute left-10 top-1/2 -translate-y-1/2 z-10">
            <span className="text-sm text-muted-foreground">{prefix}</span>
          </div>
        )}

        {/* Input Field */}
        {type === "textarea" ? (
          <Textarea
            {...finalInputProps}
            rows={rows}
            className={cn(finalInputProps.className, "resize-none")}
          />
        ) : (
          <Input
            {...finalInputProps}
            type={
              type === "password" ? (showPassword ? "text" : "password") : type
            }
          />
        )}

        {/* Password Toggle */}
        {type === "password" && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* Suffix */}
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Badge variant="secondary" className="text-xs">
              {suffix}
            </Badge>
          </div>
        )}
      </div>

      {/* Character Count */}
      {maxLength && type === "textarea" && (
        <div className="flex justify-end">
          <span className="text-xs text-muted-foreground">
            {value?.toString().length || 0} / {maxLength}
          </span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="text-sm text-red-500 flex items-center gap-1"
        >
          <span className="h-1 w-1 bg-red-500 rounded-full" />
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}

// Specialized form fields for common use cases
export function ModernPriceField(
  props: Omit<ModernWizardFormFieldProps, "type" | "icon" | "prefix">,
) {
  return (
    <ModernWizardFormField
      {...props}
      type="number"
      icon="price"
      prefix="$"
      placeholder="150,000"
    />
  );
}

export function ModernSurfaceField(
  props: Omit<ModernWizardFormFieldProps, "type" | "icon" | "suffix">,
) {
  return (
    <ModernWizardFormField
      {...props}
      type="number"
      icon="surface"
      suffix="m²"
      placeholder="200"
    />
  );
}

export function ModernTitleField(
  props: Omit<ModernWizardFormFieldProps, "type" | "icon" | "aiType">,
) {
  return (
    <ModernWizardFormField
      {...props}
      type="text"
      icon="title"
      aiType="title"
      maxLength={100}
      placeholder="Hermosa casa con jardín en zona residencial"
    />
  );
}

export function ModernDescriptionField(
  props: Omit<ModernWizardFormFieldProps, "type" | "icon" | "aiType">,
) {
  return (
    <ModernWizardFormField
      {...props}
      type="textarea"
      icon="description"
      aiType="description"
      maxLength={2000}
      rows={6}
      placeholder="Describe las características principales de la propiedad..."
    />
  );
}

export function ModernTagsField(
  props: Omit<ModernWizardFormFieldProps, "type" | "icon" | "aiType">,
) {
  return (
    <ModernWizardFormField
      {...props}
      type="text"
      icon="tags"
      aiType="tags"
      placeholder="piscina, jardín, garaje, cerca del metro"
      description="Separa las etiquetas con comas"
    />
  );
}

export function ModernLocationField(
  props: Omit<ModernWizardFormFieldProps, "type" | "icon">,
) {
  return (
    <ModernWizardFormField
      {...props}
      type="text"
      icon="location"
      placeholder="Santo Domingo, Distrito Nacional"
    />
  );
}
