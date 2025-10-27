"use client";

import { CircleUserRoundIcon, Upload, XIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { uploadAvatarAction } from "@/lib/actions/file-upload-actions";
import { useTransition, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface AvatarUploadProps {
	label?: string;
	name?: string;
	defaultValue?: string;
	onFileChange?: (file: File | null) => void;
	className?: string;
	error?: string;
	compact?: boolean;
}

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
			} catch (error) {
				console.error("Upload error:", error);
			}
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
				<input type="hidden" name={name} value={uploadedUrl || defaultValue || ""} />
				<label className="bg-primary hover:bg-primary/90 text-primary-foreground relative flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors shadow-sm">
					<input
						type="file"
						accept="image/*"
						onChange={handleFileChange}
						disabled={isPending}
						className="absolute inset-0 size-full opacity-0 cursor-pointer"
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
			<input type="hidden" name={name} value={uploadedUrl || defaultValue || ""} />
			<div className="flex flex-col items-center gap-2">
				<div className="relative inline-flex">
					<label className="border-input hover:bg-accent/50 focus-within:border-ring focus-within:ring-ring/50 relative flex size-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed transition-colors outline-none focus-within:ring-[3px]">
						<input
							type="file"
							accept="image/*"
							onChange={handleFileChange}
							disabled={isPending}
							className="absolute inset-0 size-full opacity-0 cursor-pointer"
						/>
						{isPending ? (
							<div className="flex flex-col items-center">
								<Upload className="size-6 animate-bounce" />
								<span className="text-xs mt-1">Subiendo...</span>
							</div>
						) : (
							<div className="flex flex-col items-center">
								<CircleUserRoundIcon className="size-8 opacity-60" />
								<span className="text-xs mt-1">Subir avatar</span>
							</div>
						)}
					</label>
				</div>
				<p className="text-muted-foreground text-xs text-center max-w-[200px]">
					Haz clic para seleccionar una imagen
				</p>
				{error && <p className="text-sm text-red-500">{error}</p>}
			</div>
		</div>
	);
}
