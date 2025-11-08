import process from "node:process";

interface WizardKeyboardHelpProps {
	enableKeyboardNavigation: boolean;
}

export function WizardKeyboardHelp({
	enableKeyboardNavigation,
}: WizardKeyboardHelpProps) {
	if (
		process.env.NODE_ENV !== "development" ||
		!enableKeyboardNavigation
	) {
		return null;
	}

	return (
		<div className="fixed right-4 bottom-4 z-50">
			<details className="rounded-lg border border-border bg-background shadow-lg">
				<summary className="cursor-pointer p-2 text-xs">
					Atajos de teclado
				</summary>
				<div className="min-w-48 space-y-1 p-3 text-xs">
					<div>
						<kbd>Ctrl/Cmd + →</kbd> Siguiente paso
					</div>
					<div>
						<kbd>Ctrl/Cmd + ←</kbd> Paso anterior
					</div>
					<div>
						<kbd>Ctrl/Cmd + S</kbd> Guardar borrador
					</div>
					<div>
						<kbd>Ctrl/Cmd + Enter</kbd> Completar/Siguiente
					</div>
					<div>
						<kbd>Esc</kbd> Cancelar
					</div>
				</div>
			</details>
		</div>
	);
}
