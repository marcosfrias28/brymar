import {
	Check,
	ChevronLeft,
	ChevronRight,
	HelpCircle,
	Save,
	X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/index";

const ANNOUNCEMENT_TIMEOUT = 3000;

type WizardDesktopNavigationProps = {
	canGoNext: boolean;
	canGoPrevious: boolean;
	canComplete: boolean;
	isLastStep: boolean;
	onNext: () => void;
	onPrevious: () => void;
	onComplete: () => void;
	onSaveDraft: () => void;
	onCancel?: () => void;
	isLoading: boolean;
	isSaving: boolean;
	enableKeyboardNavigation: boolean;
};

export function WizardDesktopNavigation({
	canGoNext,
	canGoPrevious,
	canComplete,
	isLastStep,
	onNext,
	onPrevious,
	onComplete,
	onSaveDraft,
	onCancel,
	isLoading,
	isSaving,
	enableKeyboardNavigation,
}: WizardDesktopNavigationProps) {
	return (
		<nav
			aria-label="Navegación del asistente"
			className="wizard-navigation-desktop"
		>
			<div className="flex items-center justify-between">
				{/* Left side - Previous button */}
				<div className="flex items-center gap-2">
					<Button
						aria-label={`Ir al paso anterior${
							canGoPrevious ? "" : " (deshabilitado)"
						}`}
						className={cn(
							"transition-opacity",
							!canGoPrevious && "pointer-events-none opacity-0"
						)}
						disabled={!canGoPrevious || isLoading}
						onClick={onPrevious}
						title="Ctrl+← para navegar al paso anterior"
						variant="outline"
					>
						<ChevronLeft aria-hidden="true" className="mr-2 h-4 w-4" />
						Anterior
					</Button>
				</div>

				{/* Center - Save draft and help buttons */}
				<div className="flex items-center gap-2">
					<Button
						aria-label={isSaving ? "Guardando borrador..." : "Guardar borrador"}
						className="text-muted-foreground hover:text-foreground"
						disabled={isSaving}
						onClick={onSaveDraft}
						size="sm"
						title="Ctrl+S para guardar borrador"
						variant="ghost"
					>
						{isSaving ? (
							<>
								<div
									aria-hidden="true"
									className="mr-2 h-3 w-3 animate-spin rounded-full border-current border-b-2"
								/>
								Guardando...
							</>
						) : (
							<>
								<Save aria-hidden="true" className="mr-2 h-4 w-4" />
								Guardar borrador
							</>
						)}
					</Button>

					{enableKeyboardNavigation && (
						<Button
							aria-label="Mostrar atajos de teclado"
							className="text-muted-foreground hover:text-foreground"
							onClick={() => {
								const announcement = document.createElement("div");
								announcement.setAttribute("aria-live", "polite");
								announcement.className = "sr-only";
								announcement.textContent =
									"Atajos de teclado: Ctrl+Flecha derecha para siguiente, Ctrl+Flecha izquierda para anterior, Ctrl+S para guardar, Escape para cancelar";
								document.body.appendChild(announcement);
								setTimeout(
									() => document.body.removeChild(announcement),
									ANNOUNCEMENT_TIMEOUT
								);
							}}
							size="sm"
							title="Alt+? para ver atajos de teclado"
							variant="ghost"
						>
							<HelpCircle aria-hidden="true" className="h-4 w-4" />
						</Button>
					)}

					{onCancel && (
						<Button
							aria-label="Cancelar asistente"
							className="text-muted-foreground hover:text-foreground"
							disabled={isLoading}
							onClick={onCancel}
							size="sm"
							title="Escape para cancelar"
							variant="ghost"
						>
							<X aria-hidden="true" className="mr-2 h-4 w-4" />
							Cancelar
						</Button>
					)}
				</div>

				{/* Right side - Next/Complete button */}
				<div className="flex items-center gap-2">
					{isLastStep ? (
						<Button
							aria-label={`Completar asistente${
								canComplete ? "" : " (deshabilitado)"
							}`}
							className="min-w-[120px]"
							disabled={!canComplete || isLoading}
							onClick={onComplete}
							title="Ctrl+Enter para completar el asistente"
						>
							{isLoading ? (
								<>
									<div
										aria-hidden="true"
										className="mr-2 h-4 w-4 animate-spin rounded-full border-white border-b-2"
									/>
									Completando...
								</>
							) : (
								<>
									<Check aria-hidden="true" className="mr-2 h-4 w-4" />
									Completar
								</>
							)}
						</Button>
					) : (
						<Button
							aria-label={`Ir al siguiente paso${
								canGoNext ? "" : " (deshabilitado)"
							}`}
							className="min-w-[120px]"
							disabled={!canGoNext || isLoading}
							onClick={onNext}
							title="Ctrl+→ para ir al siguiente paso"
						>
							{isLoading ? (
								<>
									<div
										aria-hidden="true"
										className="mr-2 h-4 w-4 animate-spin rounded-full border-white border-b-2"
									/>
									Validando...
								</>
							) : (
								<>
									Siguiente
									<ChevronRight aria-hidden="true" className="ml-2 h-4 w-4" />
								</>
							)}
						</Button>
					)}
				</div>
			</div>

			{/* Progress indicator for current action */}
			{(isLoading || isSaving) && (
				<div aria-live="polite" className="mt-3 text-center" role="status">
					<div className="text-muted-foreground text-xs">
						{isLoading && "Procesando..."}
						{isSaving && "Guardando borrador..."}
					</div>
				</div>
			)}
		</nav>
	);
}
