import { WavyBackground } from "@/components/ui/wavy-background";
import { cn } from "@/lib/utils";

export function LoginWrapper({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	const colors = [
		"hsl(var(--color-2))",
		"hsl(var(--color-1))",
		"hsl(var(--color-5))",
		"hsl(var(--color-3))",
		"hsl(var(--color-4))",
	];

	return (
		<div
			className={cn(
				"relative flex h-auto min-h-screen w-screen items-center justify-center overflow-hidden",
				"bg-gradient-to-br from-blue-50 via-white to-cyan-50",
				"dark:from-gray-900 dark:via-gray-800 dark:to-blue-900",
				className
			)}
		>
			<WavyBackground
				backgroundFill="transparent"
				blur={10}
				className="absolute inset-0 z-0"
				colors={colors}
				speed="fast"
				waveOpacity={0.5}
				waveWidth={50}
			/>
			<div className="relative z-10 flex w-full items-center justify-center p-4">
				{children}
			</div>
		</div>
	);
}
