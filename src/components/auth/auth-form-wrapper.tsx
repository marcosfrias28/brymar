"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormState } from "@/lib/types/forms";
import { cn } from "@/lib/utils";

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

interface AuthFormWrapperProps<T = any> {
	title: string;
	subtitle: string;
	action: (
		prevState: FormState<T>,
		formData: FormData,
	) => Promise<FormState<T>>;
	fields: AuthFormField[];
	submitText: string;
	loadingText: string;
	footerContent?: ReactNode;
	onSuccess?: (data?: T) => void;
	onError?: (error: string) => void;
	className?: string;
	hiddenFields?: { name: string; value: string }[];
	isLoading?: boolean; // New prop for external loading state
}

export function AuthFormWrapper<T = any>({
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
	isLoading = false, // New prop with default value
}: AuthFormWrapperProps<T>) {
	const initialState: FormState<T> = {
		success: false,
	};

	const [state, formAction, isPending] = useActionState(action, initialState);

	const _router = useRouter();

	// Handle general error message
	useEffect(() => {
		if (state?.message && !state.success) {
			toast.error(state.message);
			onError?.(state.message);
		}
	}, [state?.message, state?.success, onError]);

	// Handle success
	useEffect(() => {
		if (state?.success) {
			toast.success(state.message || "Operación exitosa");

			if (onSuccess) {
				onSuccess(state.data);
			}
		}
	}, [state?.success, state?.message, state?.data, onSuccess]);

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
							aria-invalid={state?.errors?.[field.name] ? "true" : "false"}
							aria-describedby={
								state?.errors?.[field.name] ? `${field.id}-error` : undefined
							}
						/>
						{state?.errors?.[field.name] && (
							<p id={`${field.id}-error`} className="text-sm text-red-500">
								{state.errors[field.name][0]}
							</p>
						)}
					</div>
				))}
				<Button type="submit" className="w-full" disabled={isPending || isLoading}>
					{(isPending || isLoading) ? (
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
				className,
			)}
		>
			{children}
		</Link>
	);
}
