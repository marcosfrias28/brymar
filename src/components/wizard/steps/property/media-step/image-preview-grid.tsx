import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

type ImageFile = {
	url: string;
	filename: string;
	size: number;
	contentType: string;
};

type ImagePreviewGridProps = {
	images: ImageFile[];
	onRemove: (image: ImageFile) => void;
};

export function ImagePreviewGrid({ images, onRemove }: ImagePreviewGridProps) {
	if (images.length === 0) {
		return null;
	}

	return (
		<ScrollArea className="w-full whitespace-nowrap rounded-md border">
			<div className="flex w-max space-x-4 p-4">
				{images.map((image) => (
					<div className="group relative" key={image.url}>
						<div
							aria-label={`Imagen ${image.filename}`}
							className="h-32 w-32 rounded-md border bg-center bg-cover object-cover"
							role="img"
							style={{
								backgroundImage: `url(${image.url})`,
							}}
						/>
						<Button
							className="absolute top-1 right-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
							onClick={() => onRemove(image)}
							size="icon"
							type="button"
							variant="destructive"
						>
							<X className="h-3 w-3" strokeWidth={1.5} />
						</Button>
					</div>
				))}
			</div>
			<ScrollBar orientation="horizontal" />
		</ScrollArea>
	);
}
