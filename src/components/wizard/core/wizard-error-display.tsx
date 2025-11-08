import { cn } from "@/lib/utils/index";

interface WizardErrorDisplayProps {
	error: string | null;
	mobileOptimizations: boolean;
}

export function WizardErrorDisplay({ error, mobileOptimizations }: WizardErrorDisplayProps) {
	if (!error) {
		return null;
	}

	return (
		<div
			aria-live="polite"
			className={cn(
				"wizard-error-container",
				"border-destructive/20 border-t bg-destructive/10 p-4",
				(mobileOptimizations && "px-4") || "px-6"
			)}
			role="alert"
		>
			<p className="text-destructive text-sm">{error}</p>
		</div>
	);
}
