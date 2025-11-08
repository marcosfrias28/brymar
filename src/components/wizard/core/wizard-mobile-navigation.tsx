import { Check, ChevronLeft, ChevronRight, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/index";
import { mobileClasses } from "@/lib/utils/mobile-utils";

type WizardMobileNavigationProps = {
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
	enableTouchGestures: boolean;
	isTouchDevice: boolean;
	handlers: Record<string, (event: any) => void>;
};

export function WizardMobileNavigation({
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
	enableTouchGestures,
	isTouchDevice,
	handlers,
}: WizardMobileNavigationProps) {
	return (
		<nav
			aria-label="Navegación del asistente"
			className="wizard-navigation-mobile"
			{...(enableTouchGestures && isTouchDevice ? handlers : {})}
		>
			{/* Primary Actions Row */}
			<div className="mb-3 flex gap-2">
				{isLastStep ? (
					<Button
						aria-describedby="complete-help"
						aria-label={`Completar asistente${
							canComplete ? "" : " (deshabilitado)"
						}`}
						className={cn("flex-1", mobileClasses.touchButton)}
						disabled={!canComplete || isLoading}
						onClick={onComplete}
						size="lg"
					>
						{isLoading ? (
							<div
								aria-hidden="true"
								className="mr-2 h-4 w-4 animate-spin rounded-full border-white border-b-2"
							/>
						) : (
							<Check aria-hidden="true" className="mr-2 h-4 w-4" />
						)}
						Completar
					</Button>
				) : (
					<Button
						aria-describedby="next-step-help"
						aria-label={`Ir al siguiente paso${
							canGoNext ? "" : " (deshabilitado)"
						}`}
						className={cn("flex-1", mobileClasses.touchButton)}
						disabled={!canGoNext || isLoading}
						onClick={onNext}
						size="lg"
					>
						{isLoading ? (
							<div
								aria-hidden="true"
								className="mr-2 h-4 w-4 animate-spin rounded-full border-white border-b-2"
							/>
						) : (
							<ChevronRight aria-hidden="true" className="mr-2 h-4 w-4" />
						)}
						Siguiente
					</Button>
				)}
			</div>

			{/* Secondary Actions Row */}
			<div className="flex gap-2">
				<Button
					aria-label={`Ir al paso anterior${
						canGoPrevious ? "" : " (deshabilitado)"
					}`}
					className={cn("flex-1", mobileClasses.touchButton)}
					disabled={!canGoPrevious || isLoading}
					onClick={onPrevious}
					size="sm"
					variant="outline"
				>
					<ChevronLeft aria-hidden="true" className="mr-1 h-4 w-4" />
					Anterior
				</Button>

				<Button
					aria-label={isSaving ? "Guardando borrador..." : "Guardar borrador"}
					className={cn("flex-1", mobileClasses.touchButton)}
					disabled={isSaving}
					onClick={onSaveDraft}
					size="sm"
					variant="outline"
				>
					{isSaving ? (
						<div
							aria-hidden="true"
							className="mr-1 h-3 w-3 animate-spin rounded-full border-current border-b-2"
						/>
					) : (
						<Save aria-hidden="true" className="mr-1 h-4 w-4" />
					)}
					Guardar
				</Button>

				{onCancel && (
					<Button
						aria-label="Cancelar asistente"
						className={mobileClasses.touchButton}
						disabled={isLoading}
						onClick={onCancel}
						size="sm"
						variant="ghost"
					>
						<X aria-hidden="true" className="h-4 w-4" />
					</Button>
				)}
			</div>

			{/* Touch gesture hint */}
			{enableTouchGestures && isTouchDevice && (
				<div className="mt-2 py-1 text-center text-muted-foreground text-xs">
					<span aria-live="polite" className="sr-only">
						Puedes deslizar hacia la izquierda o derecha para navegar entre
						pasos
					</span>
					Desliza ← → para navegar
				</div>
			)}

			{/* Hidden help text for screen readers */}
			<div className="sr-only">
				<div id="next-step-help">
					Presiona Ctrl+Flecha derecha o desliza hacia la izquierda para avanzar
				</div>
				<div id="complete-help">
					Presiona Ctrl+Enter para completar el asistente
				</div>
			</div>
		</nav>
	);
}
