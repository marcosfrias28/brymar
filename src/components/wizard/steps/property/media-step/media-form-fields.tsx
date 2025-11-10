import type { Control } from "react-hook-form";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import type { PropertyWizardData } from "../types";
import { FileUploadZone } from "./file-upload-zone";
import { ImagePreviewGrid } from "./image-preview-grid";
import { VideoList } from "./video-list";

type ImageFile = {
	url: string;
	filename: string;
	size: number;
	contentType: string;
};

type Video = {
	url: string;
	title?: string;
};

type MediaFormFieldsProps = {
	control: Control<PropertyWizardData>;
	images: ImageFile[];
	videos: Video[];
	isUploading: boolean;
	onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onRemoveImage: (image: ImageFile) => void;
	onVideoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onRemoveVideo: (video: Video) => void;
};

export function MediaFormFields({
	control,
	images,
	videos,
	isUploading,
	onImageUpload,
	onRemoveImage,
	onVideoUpload,
	onRemoveVideo,
}: MediaFormFieldsProps) {
	return (
		<>
			<FormField
				control={control}
				name="images"
				render={() => (
					<FormItem>
						<FormLabel>Fotos</FormLabel>
						<FormControl>
							<div className="space-y-4">
								<FileUploadZone
									accept="image/*"
									description="PNG, JPG, GIF (MAX. 10MB)"
									disabled={isUploading}
									id="image-upload"
									label="Haz clic para subir"
									onChange={onImageUpload}
								/>
								<ImagePreviewGrid images={images} onRemove={onRemoveImage} />
							</div>
						</FormControl>
						<FormDescription>
							Añade al menos una foto de buena calidad. La primera foto será la
							principal.
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={control}
				name="videos"
				render={() => (
					<FormItem>
						<FormLabel>Videos (Opcional)</FormLabel>
						<FormControl>
							<div className="space-y-4">
								<FileUploadZone
									accept="video/*"
									description="MP4, WebM, OGG (MAX. 50MB)"
									disabled={isUploading}
									id="video-upload"
									label="Haz clic para subir"
									onChange={onVideoUpload}
								/>
								<VideoList onRemove={onRemoveVideo} videos={videos} />
							</div>
						</FormControl>
						<FormDescription>
							Los videos ayudan a mostrar mejor la distribución y los espacios
							de la propiedad.
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
}
