"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormState } from "@/lib/types/forms";
import { cn } from "@/lib/utils";

type AuthFormField = {
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
};

type AuthFormWrapperProps<T = any> = {
	title: string;
	subtitle: string;
	action: (
		prevState: FormState<T>,
		formData: FormData
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
};

const useAuthFormFeedback = <T,>({
	state,
	onSuccess,
	onError,
}: {
	state: FormState<T>;
	onSuccess?: (data?: T) => void;
	onError?: (error: string) => void;
}) => {
	useEffect(() => {
		if (state?.message && !state.success) {
			toast.error(state.message);
			onError?.(state.message);
		}
	}, [state?.message, state?.success, onError]);

	useEffect(() => {
		if (state?.success) {
			toast.success(state.message || "Operación exitosa");
			onSuccess?.(state.data);
		}
	}, [state?.success, state?.message, state?.data, onSuccess]);
};

type HiddenAuthField = NonNullable<AuthFormWrapperProps["hiddenFields"]>[number];

const HiddenFieldInputs = ({
	hiddenFields = [],
}: {
	hiddenFields?: HiddenAuthField[];
}) => {
	if (!hiddenFields.length) {
		return null;
	}

	return hiddenFields.map((field) => (
		<input name={field.name} type="hidden" value={field.value} key={field.name} />
	));
};

const AuthField = ({
	field,
	error,
}: {
	field: AuthFormField;
	error?: string[];
}) => {
	const errorMessage = error?.[0];
	const errorId = errorMessage ? `${field.id}-error` : undefined;

	return (
		<div className="grid gap-2">
			{typeof field.label === "string" ? (
				<Label htmlFor={field.id}>{field.label}</Label>
			) : (
				field.label
			)}
			<Input
				aria-describedby={errorId}
				aria-invalid={errorMessage ? "true" : "false"}
				autoComplete={field.autoComplete}
				id={field.id}
				maxLength={field.maxLength}
				minLength={field.minLength}
				name={field.name}
				pattern={field.pattern}
				placeholder={field.placeholder}
				required={field.required}
				type={field.type}
			/>
			{errorMessage && (
				<p className="text-destructive text-sm" id={errorId}>
					{errorMessage}
				</p>
			)}
		</div>
	);
};

const SubmitButton = ({
	isDisabled,
	isLoading,
	loadingText,
	submitText,
}: {
	isDisabled: boolean;
	isLoading: boolean;
	loadingText: string;
	submitText: string;
}) => (
	<Button className="w-full" disabled={isDisabled} type="submit">
		{isLoading ? (
			<>
				<Loader2 className="mr-2 h-4 w-4 animate-spin" />
				{loadingText}
			</>
		) : (
			submitText
		)}
	</Button>
);

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
	const initialState: FormState<T> = { success: false };
	const [state, formAction, isPending] = useActionState(action, initialState);

	useAuthFormFeedback({ state, onSuccess, onError });

	return (
		<div className={cn("flex flex-col gap-6", className)}>
			<div className="space-y-2 text-center">
				<h1 className="font-bold text-2xl">{title}</h1>
				<p className="text-balance text-muted-foreground text-sm">{subtitle}</p>
			</div>

			<form action={formAction} className="grid gap-6">
				<HiddenFieldInputs hiddenFields={hiddenFields} />
				{fields.map((field) => (
					<AuthField
						field={field}
						error={state?.errors?.[field.name]}
						key={field.id}
					/>
				))}
				<SubmitButton
					isDisabled={isPending || isLoading}
					isLoading={isPending || isLoading}
					loadingText={loadingText}
					submitText={submitText}
				/>
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
type AuthLinkProps = {
	href: string;
	children: ReactNode;
	className?: string;
};

export function AuthLink({ href, children, className }: AuthLinkProps) {
	return (
		<Link
			className={cn(
				"underline underline-offset-4 hover:text-primary",
				className
			)}
			href={href}
		>
			{children}
		</Link>
	);
}
