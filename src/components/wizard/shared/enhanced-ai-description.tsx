"use client";

import {
	AlertTriangle,
	CheckCircle,
	Edit3,
	Loader2,
	Sparkles,
	Wand2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdvancedRichTextEditor } from "@/components/ui/advanced-rich-text-editor";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Textarea } from "@/components/ui/textarea";
import {
	type RichTextContent,
	useAIGeneration,
} from "@/hooks/use-ai-generation";
import { cn } from "@/lib/utils/index";
import type { PropertyBasicInfo } from "@/types/wizard";

type EnhancedAIDescriptionProps = {
	value: string;
	onChange: (value: string) => void;
	propertyData: PropertyBasicInfo | null;
	placeholder?: string;
	className?: string;
	isMobile?: boolean;
	disabled?: boolean;
};

export function EnhancedAIDescription({
	value,
	onChange,
	propertyData,
	placeholder = "Describe las características principales de la propiedad...",
	className,
	isMobile = false,
	disabled = false,
}: EnhancedAIDescriptionProps) {
	const [isRichTextMode, setIsRichTextMode] = useState(false);
	const [richContent, setRichContent] = useState<RichTextContent>({
		html: "",
		plainText: value,
		formatted: false,
	});
	const [showFallbackWarning, setShowFallbackWarning] = useState(false);

	// AI Generation with rich text support
	const {
		isGenerating,
		error: aiError,
		generateDescription,
		clearState: clearAIState,
	} = useAIGeneration({
		language: "es",
		useRichText: true,
		onSuccess: (type, content) => {
			if (type === "description") {
				if (typeof content === "object" && content.html) {
					// Rich text content
					setRichContent(content as RichTextContent);
					setIsRichTextMode(true);
					onChange(content.plainText);
					setShowFallbackWarning(!content.formatted);
				} else if (typeof content === "string") {
					// Plain text fallback
					onChange(content);
					setShowFallbackWarning(true);
				}
			}
		},
		onError: (_error) => {
			setShowFallbackWarning(true);
		},
	});

	// Update rich content when value changes externally
	useEffect(() => {
		if (!isRichTextMode) {
			setRichContent((prev) => ({
				...prev,
				plainText: value,
			}));
		}
	}, [value, isRichTextMode]);

	const canGenerateAI = useCallback(
		() => Boolean(propertyData?.type),
		[propertyData]
	);

	const handleGenerateDescription = useCallback(async () => {
		if (!(propertyData && canGenerateAI())) {
			return;
		}

		setShowFallbackWarning(false);
		clearAIState();
		await generateDescription(propertyData);
	}, [propertyData, canGenerateAI, clearAIState, generateDescription]);

	const handleRichTextChange = useCallback(
		(html: string) => {
			// Convert HTML to plain text for form submission
			const tempDiv = document.createElement("div");
			tempDiv.innerHTML = html;
			const plainText = tempDiv.textContent || tempDiv.innerText || "";

			setRichContent((prev) => ({
				...prev,
				html,
				plainText,
				formatted: true,
			}));

			onChange(plainText);
		},
		[onChange]
	);

	const handleSaveRichText = useCallback(() => {
		// Rich text is already saved via onChange
		setIsRichTextMode(false);
	}, []);

	const handleCancelRichText = useCallback(() => {
		// Revert to plain text mode without saving changes
		setRichContent((prev) => ({
			...prev,
			html: "",
			formatted: false,
		}));
		setIsRichTextMode(false);
	}, []);

	const handleSwitchToRichText = useCallback(() => {
		// Convert current plain text to rich text
		const html = value
			.split("\n\n")
			.map((paragraph) =>
				paragraph.trim() ? `<p>${paragraph.trim()}</p>` : ""
			)
			.filter(Boolean)
			.join("\n");

		setRichContent({
			html: html || `<p>${value}</p>`,
			plainText: value,
			formatted: true,
		});
		setIsRichTextMode(true);
	}, [value]);

	return (
		<div className={cn("space-y-4", className)}>
			{/* AI Generation Section */}
			<Card
				className={cn(
					"border-primary/20 border-dashed bg-primary/5",
					isMobile && "border-0 shadow-none"
				)}
			>
				<CardHeader className={cn(isMobile ? "px-0 pb-3" : "")}>
					<CardTitle
						className={cn(
							"flex items-center gap-2",
							isMobile ? "text-base" : "text-lg"
						)}
					>
						<Wand2
							className={cn("text-primary", isMobile ? "h-4 w-4" : "h-5 w-5")}
						/>
						Generación Inteligente de Descripción
					</CardTitle>
					<p
						className={cn(
							"text-muted-foreground",
							isMobile ? "text-xs" : "text-sm"
						)}
					>
						Genera descripciones detalladas y profesionales con formato rico
						usando IA
					</p>
				</CardHeader>
				<CardContent className={cn(isMobile ? "space-y-3 px-0" : "space-y-4")}>
					{aiError && (
						<div className="rounded-md border border-destructive/20 bg-destructive/10 p-3">
							<div className="flex items-center gap-2">
								<AlertTriangle className="h-4 w-4 text-destructive" />
								<p className="text-destructive text-sm">{aiError}</p>
							</div>
						</div>
					)}

					{showFallbackWarning && (
						<div className="rounded-md border border-amber-200 bg-amber-50 p-3">
							<div className="flex items-center gap-2">
								<AlertTriangle className="h-4 w-4 text-amber-600" />
								<p className="text-amber-800 text-sm">
									Se usó contenido de respaldo. La IA podría no estar disponible
									temporalmente.
								</p>
							</div>
						</div>
					)}

					<div className="flex flex-col gap-3 sm:flex-row">
						<Button
							className={cn("flex-1", isMobile && "min-h-[48px] text-base")}
							disabled={!canGenerateAI() || isGenerating || disabled}
							onClick={handleGenerateDescription}
							type="button"
						>
							{isGenerating ? (
								<Loader2
									className={cn(
										"mr-2 animate-spin",
										isMobile ? "h-5 w-5" : "h-4 w-4"
									)}
								/>
							) : (
								<Sparkles
									className={cn("mr-2", isMobile ? "h-5 w-5" : "h-4 w-4")}
								/>
							)}
							{isGenerating ? "Generando..." : "Generar Descripción Rica"}
						</Button>

						{!isRichTextMode && value && (
							<Button
								className={cn(isMobile && "min-h-[48px]")}
								disabled={disabled}
								onClick={handleSwitchToRichText}
								type="button"
								variant="outline"
							>
								<Edit3 className={cn("mr-2", isMobile ? "h-5 w-5" : "h-4 w-4")} />
								Editar con Formato
							</Button>
						)}
					</div>

					{!canGenerateAI() && (
						<p
							className={cn(
								"text-center text-muted-foreground",
								isMobile ? "px-2 text-xs" : "text-xs"
							)}
						>
							Completa el tipo de propiedad, precio y superficie para usar la IA
						</p>
					)}
				</CardContent>
			</Card>

			{/* Description Input */}
			<div>
				<Label
					className={cn(isMobile ? "font-medium text-sm" : "")}
					htmlFor="description"
				>
					Descripción de la Propiedad *
				</Label>

				{isRichTextMode ? (
					<div className="mt-2">
						<AdvancedRichTextEditor
							className="min-h-[300px]"
							content={richContent.html}
							onCancel={handleCancelRichText}
							onChange={handleRichTextChange}
							onSave={handleSaveRichText}
							placeholder={placeholder}
						/>
						<div className="mt-2 flex items-center gap-2 text-muted-foreground text-sm">
							<CheckCircle className="h-4 w-4 text-green-600" />
							Modo de edición rica activado. Los cambios se guardan
							automáticamente.
						</div>
					</div>
				) : (
					<div className="space-y-2">
						<Textarea
							className={cn("mt-2", isMobile && "text-base")}
							disabled={disabled}
							id="description"
							onChange={(e) => onChange(e.target.value)}
							placeholder={placeholder}
							rows={isMobile ? 4 : 6}
							value={value}
						/>
						{value?.trim() && (
							<div className="mt-3 rounded-md border bg-muted/50 p-3">
								<div className="mb-2 flex items-center gap-2">
									<CheckCircle className="h-4 w-4 text-green-600" />
									<span className="font-medium text-muted-foreground text-sm">
										Vista previa con formato:
									</span>
								</div>
								<MarkdownRenderer
									className="text-sm"
									content={value}
									variant="compact"
								/>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
