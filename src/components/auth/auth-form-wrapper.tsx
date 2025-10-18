"use client";

import { useActionState, useEffect, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActionState } from "@/lib/validations";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "@/lib/db/schema";

interface AuthFormField {
  id: string;
  name: string;
  type: string;
  label: string | ReactNode;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

interface AuthFormWrapperProps<T = void> {
  title: string;
  subtitle: string;
  action: (formData: FormData) => Promise<ActionState<T>>;
  fields: AuthFormField[];
  submitText: string;
  loadingText: string;
  footerContent?: ReactNode;
  onSuccess?: (state: ActionState<T>) => void;
  onError?: (error: string) => void;
  className?: string;
  hiddenFields?: { name: string; value: string }[];
}

export function AuthFormWrapper<T = void>({
  title,
  subtitle,
  action,
  fields,
  submitText,
  loadingText,
  footerContent,
  onSuccess,
  onError,
  className,
  hiddenFields = [],
}: AuthFormWrapperProps<T>) {
  const initialState: ActionState<T> = {
    error: "",
    success: false,
    message: "",
  };

  const [state, formAction, pending] = useActionState(
    async (prevState: ActionState<T>, formData: FormData) => {
      return await action(formData);
    },
    initialState
  );

  const router = useRouter();

  // Manejo de errores con toast
  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
      onError?.(state.error);
    }
  }, [state?.error, onError]);

  // Manejo de éxito y redirección
  useEffect(() => {
    if (state?.success) {
      toast.success(state.message || "Operación exitosa");

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(state);
      }

      // Handle redirect if specified
      if (state.redirect && state.url) {
        router.push(state.url);
      }
    }
  }, [
    state?.success,
    state?.message,
    state?.redirect,
    state?.url,
    router,
    onSuccess,
  ]);

  // Redirección específica para email no verificado
  useEffect(() => {
    if (
      state?.error === "Email not verified" &&
      state?.data &&
      typeof state.data === "object" &&
      "email" in state.data
    ) {
      router.push(`/verify-email?email=${(state.data as any).email}`);
    }
  }, [state?.error, state?.data, router]);

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-balance text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <form action={formAction} className="grid gap-6">
        {hiddenFields.map((field) => (
          <input
            key={field.name}
            type="hidden"
            name={field.name}
            value={field.value}
          />
        ))}
        {fields.map((field) => (
          <div key={field.id} className="grid gap-2">
            {typeof field.label === "string" ? (
              <Label htmlFor={field.id}>{field.label}</Label>
            ) : (
              field.label
            )}
            <Input
              id={field.id}
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              required={field.required}
              autoComplete={field.autoComplete}
              minLength={field.minLength}
              maxLength={field.maxLength}
              pattern={field.pattern}
            />
          </div>
        ))}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              {loadingText}
            </>
          ) : (
            submitText
          )}
        </Button>
      </form>

      {footerContent && (
        <div className="text-center text-sm">{footerContent}</div>
      )}
    </div>
  );
}

// Hook personalizado para campos comunes
export const useAuthFields = () => {
  const emailField: AuthFormField = {
    id: "email",
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "m@example.com",
    required: true,
    autoComplete: "email",
  };

  const passwordField: AuthFormField = {
    id: "password",
    name: "password",
    type: "password",
    label: "Contraseña",
    placeholder: "Ingresa tu contraseña",
    required: true,
    minLength: 8,
    autoComplete: "current-password",
  };

  const newPasswordField: AuthFormField = {
    id: "password",
    name: "password",
    type: "password",
    label: "Nueva Contraseña",
    required: true,
    autoComplete: "new-password",
  };

  const confirmPasswordField: AuthFormField = {
    id: "confirmPassword",
    name: "confirmPassword",
    type: "password",
    label: "Confirmar Contraseña",
    placeholder: "Confirma tu contraseña",
    required: true,
    minLength: 8,
    autoComplete: "new-password",
  };

  const nameField: AuthFormField = {
    id: "name",
    name: "name",
    type: "text",
    label: "Nombre completo",
    placeholder: "Juan Pérez",
    required: true,
    autoComplete: "name",
  };

  const tokenField: AuthFormField = {
    id: "token",
    name: "token",
    type: "text",
    label: "Código de verificación",
    placeholder: "123456",
    required: true,
  };

  return {
    emailField,
    passwordField,
    newPasswordField,
    confirmPasswordField,
    nameField,
    tokenField,
  };
};

// Componente para enlaces de navegación
interface AuthLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function AuthLink({ href, children, className }: AuthLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "underline underline-offset-4 hover:text-primary",
        className
      )}
    >
      {children}
    </Link>
  );
}
