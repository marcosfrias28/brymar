"use client";

import {
	AlertCircle,
	AlertTriangle,
	CheckCircle2,
	Clock,
	XCircle,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface ValidationError {
	field: string;
	message: string;
	type: "error" | "warning";
}

export interface StepValidationState {
	isValid: boolean;
	completion: number;
	errors: ValidationError[];
	warnings: ValidationError[];
	requiredFields: string[];
	missingFields: string[];
}

interface StepValidationProps {
	stepNumber: number;
	stepTitle: string;
	validation: StepValidationState;
	children: ReactNode;
	showProgress?: boolean;
	showErrors?: boolean;
	showWarnings?: boolean;
	isMobile?: boolean;
	className?: string;
}

export function StepValidation({
	stepNumber,
	stepTitle,
	validation,
	children,
	showProgress = true,
	showErrors = true,
	showWarnings = true,
	isMobile = false,
	className,
}: StepValidationProps) {
	const [animateProgress, setAnimateProgress] = useState(false);

	// Animate progress changes
	useEffect(() => {
		setAnimateProgress(true);
		const timer = setTimeout(() => setAnimateProgress(false), 300);
		return () => clearTimeout(timer);
	}, []);

	const getValidationIcon = () => {
		if (validation.isValid) {
			return <CheckCircle2 className="w-5 h-5 text-green-500" />;
		}
		if (validation.errors.length > 0) {
			return <XCircle className="w-5 h-5 text-red-500" />;
		}
		if (validation.warnings.length > 0) {
			return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
		}
		return <Clock className="w-5 h-5 text-gray-400" />;
	};

	const getValidationStatus = () => {
		if (validation.isValid) return "Completo";
		if (validation.completion > 0) return "En progreso";
		return "Pendiente";
	};

	const getValidationColor = () => {
		if (validation.isValid) return "text-green-600";
		if (validation.errors.length > 0) return "text-red-600";
		if (validation.warnings.length > 0) return "text-yellow-600";
		return "text-gray-500";
	};

	const getProgressColor = () => {
		if (validation.isValid) return "bg-green-500";
		if (validation.errors.length > 0) return "bg-red-500";
		if (validation.warnings.length > 0) return "bg-yellow-500";
		return "bg-blue-500";
	};

	return (
		<div className={cn("space-y-4", className)}>
			{/* Step Header with Validation Status */}
			<div
				className={cn(
					"flex items-center justify-between p-4 bg-card border rounded-lg",
					isMobile ? "flex-col space-y-2" : "flex-row",
				)}
			>
				<div
					className={cn(
						"flex items-center space-x-3",
						isMobile ? "w-full justify-center" : "",
					)}
				>
					<div className="flex items-center space-x-2">
						<span
							className={cn(
								"flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
								validation.isValid
									? "bg-green-100 text-green-700"
									: "bg-gray-100 text-gray-700",
							)}
						>
							{stepNumber}
						</span>
						<div>
							<h3
								className={cn(
									"font-semibold",
									isMobile ? "text-base" : "text-lg",
								)}
							>
								{stepTitle}
							</h3>
							<div className="flex items-center space-x-2 mt-1">
								{getValidationIcon()}
								<span
									className={cn("text-sm font-medium", getValidationColor())}
								>
									{getValidationStatus()}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Progress and Status Badges */}
				<div
					className={cn(
						"flex items-center space-x-3",
						isMobile ? "w-full justify-center" : "",
					)}
				>
					{showProgress && (
						<div
							className={cn(
								"flex items-center space-x-2",
								isMobile ? "flex-1" : "min-w-[120px]",
							)}
						>
							<Progress
								value={validation.completion}
								className={cn(
									"h-2 transition-all duration-300",
									animateProgress && "animate-pulse",
									isMobile ? "flex-1" : "w-20",
								)}
								style={
									{
										"--progress-background": getProgressColor(),
									} as React.CSSProperties
								}
							/>
							<span className="text-sm font-medium text-muted-foreground min-w-[40px]">
								{validation.completion}%
							</span>
						</div>
					)}

					<div className="flex space-x-1">
						{validation.errors.length > 0 && (
							<Badge variant="destructive" className="text-xs">
								{validation.errors.length} error
								{validation.errors.length !== 1 ? "es" : ""}
							</Badge>
						)}
						{validation.warnings.length > 0 && (
							<Badge
								variant="secondary"
								className="text-xs bg-yellow-100 text-yellow-800"
							>
								{validation.warnings.length} aviso
								{validation.warnings.length !== 1 ? "s" : ""}
							</Badge>
						)}
					</div>
				</div>
			</div>

			{/* Error Messages */}
			{showErrors && validation.errors.length > 0 && (
				<Alert variant="destructive" className="animate-in slide-in-from-top-2">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						<div className="space-y-1">
							<p className="font-medium">Errores que deben corregirse:</p>
							<ul className="list-disc list-inside space-y-1 text-sm">
								{validation.errors.map((error, index) => (
									<li key={index}>
										<span className="font-medium">{error.field}:</span>{" "}
										{error.message}
									</li>
								))}
							</ul>
						</div>
					</AlertDescription>
				</Alert>
			)}

			{/* Warning Messages */}
			{showWarnings && validation.warnings.length > 0 && (
				<Alert className="border-yellow-200 bg-yellow-50 animate-in slide-in-from-top-2">
					<AlertTriangle className="h-4 w-4 text-yellow-600" />
					<AlertDescription className="text-yellow-800">
						<div className="space-y-1">
							<p className="font-medium">Recomendaciones para mejorar:</p>
							<ul className="list-disc list-inside space-y-1 text-sm">
								{validation.warnings.map((warning, index) => (
									<li key={index}>
										<span className="font-medium">{warning.field}:</span>{" "}
										{warning.message}
									</li>
								))}
							</ul>
						</div>
					</AlertDescription>
				</Alert>
			)}

			{/* Missing Required Fields */}
			{validation.missingFields.length > 0 && (
				<Alert className="border-blue-200 bg-blue-50">
					<AlertCircle className="h-4 w-4 text-blue-600" />
					<AlertDescription className="text-blue-800">
						<div className="space-y-1">
							<p className="font-medium">Campos requeridos pendientes:</p>
							<div className="flex flex-wrap gap-1 mt-2">
								{validation.missingFields.map((field, index) => (
									<Badge key={index} variant="outline" className="text-xs">
										{field}
									</Badge>
								))}
							</div>
						</div>
					</AlertDescription>
				</Alert>
			)}

			{/* Step Content */}
			<div
				className={cn(
					"transition-opacity duration-200",
					validation.errors.length > 0 ? "opacity-90" : "opacity-100",
				)}
			>
				{children}
			</div>
		</div>
	);
}

// Field-level validation component
interface FieldValidationProps {
	fieldName: string;
	error?: string;
	warning?: string;
	isRequired?: boolean;
	isValid?: boolean;
	children: ReactNode;
	className?: string;
}

export function FieldValidation({
	fieldName,
	error,
	warning,
	isRequired = false,
	isValid = true,
	children,
	className,
}: FieldValidationProps) {
	return (
		<div className={cn("space-y-1", className)}>
			<div className="relative">
				{children}

				{/* Field status indicator */}
				<div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
					{error && <XCircle className="w-4 h-4 text-red-500" />}
					{!error && warning && (
						<AlertTriangle className="w-4 h-4 text-yellow-500" />
					)}
					{!error && !warning && isValid && isRequired && (
						<CheckCircle2 className="w-4 h-4 text-green-500" />
					)}
				</div>
			</div>

			{/* Field-level error message */}
			{error && (
				<p className="text-sm text-red-600 animate-in slide-in-from-top-1">
					{error}
				</p>
			)}

			{/* Field-level warning message */}
			{!error && warning && (
				<p className="text-sm text-yellow-600 animate-in slide-in-from-top-1">
					{warning}
				</p>
			)}
		</div>
	);
}
