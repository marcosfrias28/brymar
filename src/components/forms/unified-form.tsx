"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FormAction } from "@/lib/types/forms";

export type FormField = {
	name: string;
	label?: string; // Opzionale per i campi hidden
	type: "text" | "number" | "textarea" | "select" | "hidden";
	required?: boolean;
	placeholder?: string;
	options?: { value: string; label: string }[];
	rows?: number;
	defaultValue?: string | number;
};

export type FormConfig = {
	title: string;
	description?: string;
	fields: FormField[];
	submitText: string;
	cancelText?: string;
	cancelUrl?: string;
};

type UnifiedFormProps = {
	config: FormConfig;
	initialData?: Record<string, any>;
	isEditing?: boolean;
	action: FormAction<any>;
};

export function UnifiedForm({
	config,
	initialData = {},
	isEditing = false,
	action,
}: UnifiedFormProps) {
	const [state, formAction, isPending] = useActionState(action, {
		success: false,
	});

	const renderField = (field: FormField) => {
		const defaultValue = initialData[field.name] || field.defaultValue || "";
		const hasError = state?.errors?.[field.name];

		switch (field.type) {
			case "hidden":
				return (
					<input
						defaultValue={defaultValue}
						key={field.name}
						name={field.name}
						type="hidden"
					/>
				);

			case "text":
			case "number":
				return (
					<div className="space-y-2" key={field.name}>
						{field.label && (
							<Label htmlFor={field.name}>
								{field.label} {field.required && "*"}
							</Label>
						)}
						<Input
							className={hasError ? "border-destructive" : ""}
							defaultValue={defaultValue}
							id={field.name}
							name={field.name}
							placeholder={field.placeholder}
							required={field.required}
							type={field.type}
						/>
						{hasError && (
							<p className="text-destructive text-sm">{hasError[0]}</p>
						)}
					</div>
				);

			case "textarea":
				return (
					<div className="space-y-2" key={field.name}>
						{field.label && (
							<Label htmlFor={field.name}>
								{field.label} {field.required && "*"}
							</Label>
						)}
						<Textarea
							className={hasError ? "border-destructive" : ""}
							defaultValue={defaultValue}
							id={field.name}
							name={field.name}
							placeholder={field.placeholder}
							required={field.required}
							rows={field.rows || 3}
						/>
						{hasError && (
							<p className="text-destructive text-sm">{hasError[0]}</p>
						)}
					</div>
				);

			case "select":
				return (
					<div className="space-y-2" key={field.name}>
						{field.label && (
							<Label htmlFor={field.name}>
								{field.label} {field.required && "*"}
							</Label>
						)}
						<Select defaultValue={defaultValue} name={field.name}>
							<SelectTrigger className={hasError ? "border-destructive" : ""}>
								<SelectValue placeholder={field.placeholder} />
							</SelectTrigger>
							<SelectContent>
								{field.options?.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{hasError && (
							<p className="text-destructive text-sm">{hasError[0]}</p>
						)}
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>{config.title}</CardTitle>
				{config.description && (
					<p className="text-muted-foreground text-sm">{config.description}</p>
				)}
			</CardHeader>
			<CardContent>
				<form action={formAction} className="space-y-6">
					{/* Render hidden fields first */}
					{config.fields
						.filter((field) => field.type === "hidden")
						.map((field) => renderField(field))}

					{/* Render visible fields */}
					{config.fields
						.filter((field) => field.type !== "hidden")
						.map((field) => renderField(field))}

					{/* Display general error message */}
					{state?.errors?.general && (
						<div className="rounded-md bg-destructive/15 p-3">
							<p className="text-destructive text-sm">
								{state.errors.general[0]}
							</p>
						</div>
					)}

					{/* Display success message */}
					{state?.success && state?.message && (
						<div className="rounded-md bg-green-50 p-3">
							<p className="text-green-700 text-sm">{state.message}</p>
						</div>
					)}

					{/* Action buttons */}
					<div className="flex gap-4">
						<Button disabled={isPending} type="submit">
							{isPending ? "Guardando..." : config.submitText}
						</Button>

						{config.cancelUrl ? (
							<Button asChild variant="outline">
								<Link href={config.cancelUrl}>
									{config.cancelText || "Cancelar"}
								</Link>
							</Button>
						) : (
							<Button type="button" variant="outline">
								{config.cancelText || "Cancelar"}
							</Button>
						)}
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
