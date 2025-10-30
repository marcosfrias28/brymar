"use client";

import { CircleUserRoundIcon, Upload } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { Label } from "@/components/ui/label";
import { uploadAvatarAction } from "@/lib/actions/file-upload-actions";
import { cn } from "@/lib/utils";

type AvatarUploadProps = {
	label?: string;
	name?: string;
	defaultValue?: string;
	onFileChange?: (file: File | null) => void;
	className?: string;
	error?: string;
	compact?: boolean;
};

export function AvatarUpload({
	label = "Avatar",
	name = "avatar",
	defaultValue,
	onFileChange,
	className,
	error,
	compact = false,
}: AvatarUploadProps) {
	const [isPending, startTransition] = useTransition();
	const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

	const handleFileUpload = async (file: File) => {
		const formData = new FormData();
		formData.append(name, file);

		startTransition(async () => {
			try {
				const result = await uploadAvatarAction({}, formData);
				if (result.success && result.data?.url) {
					setUploadedUrl(result.data.url);
					// Notify change after the URL is set
					setTimeout(() => onFileChange?.(null), 100);
				}
			} catch (_error) {}
		});
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleFileUpload(file);
			onFileChange?.(file);
		}
	};

	// Notify parent when uploadedUrl changes (after successful upload)
	useEffect(() => {
		if (uploadedUrl) {
			onFileChange?.(null);
		}
	}, [uploadedUrl, onFileChange]);

	if (compact) {
		return (
			<div className={cn("", className)}>
				<input
					name={name}
					type="hidden"
					value={uploadedUrl || defaultValue || ""}
				/>
				<label className="relative flex size-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
					<input
						accept="image/*"
						className="absolute inset-0 size-full cursor-pointer opacity-0"
						disabled={isPending}
						onChange={handleFileChange}
						type="file"
					/>
					{isPending ? (
						<Upload className="size-4 animate-bounce" />
					) : (
						<Upload className="size-4" />
					)}
				</label>
			</div>
		);
	}

	return (
		<div className={cn("space-y-2", className)}>
			{label && <Label>{label}</Label>}
			<input
				name={name}
				type="hidden"
				value={uploadedUrl || defaultValue || ""}
			/>
			<div className="flex flex-col items-center gap-2">
				<div className="relative inline-flex">
					<label className="relative flex size-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-input border-dashed outline-none transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 hover:bg-accent/50">
						<input
							accept="image/*"
							className="absolute inset-0 size-full cursor-pointer opacity-0"
							disabled={isPending}
							onChange={handleFileChange}
							type="file"
						/>
						{isPending ? (
							<div className="flex flex-col items-center">
								<Upload className="size-6 animate-bounce" />
								<span className="mt-1 text-xs">Subiendo...</span>
							</div>
						) : (
							<div className="flex flex-col items-center">
								<CircleUserRoundIcon className="size-8 opacity-60" />
								<span className="mt-1 text-xs">Subir avatar</span>
							</div>
						)}
					</label>
				</div>
				<p className="max-w-[200px] text-center text-muted-foreground text-xs">
					Haz clic para seleccionar una imagen
				</p>
				{error && <p className="text-red-500 text-sm">{error}</p>}
			</div>
		</div>
	);
}
