import { Button } from "@/components/ui/button";
import { Square, X } from "lucide-react";

type Video = {
	url: string;
	title?: string;
};

type VideoListProps = {
	videos: Video[];
	onRemove: (video: Video) => void;
};

export function VideoList({ videos, onRemove }: VideoListProps) {
	if (videos.length === 0) {
		return null;
	}

	return (
		<div className="space-y-2">
			{videos.map((video) => (
				<div
					className="flex items-center justify-between rounded-lg border p-3"
					key={video.url}
				>
					<div className="flex items-center space-x-3">
						<Square
							className="h-8 w-8 text-muted-foreground"
							strokeWidth={1.5}
						/>
						<div>
							<p className="font-medium">{video.title}</p>
							<p className="text-muted-foreground text-sm">
								Video de la propiedad
							</p>
						</div>
					</div>
					<Button
						onClick={() => onRemove(video)}
						size="sm"
						type="button"
						variant="outline"
					>
						<X className="h-4 w-4" strokeWidth={1.5} />
					</Button>
				</div>
			))}
		</div>
	);
}
