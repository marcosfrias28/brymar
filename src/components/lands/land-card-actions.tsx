import { Edit, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	interactiveClasses,
	secondaryColorClasses,
} from "@/lib/utils/secondary-colors";

type LandCardActionsProps = {
	onView?: (id: string) => void;
	onEdit?: (id: string) => void;
	onDelete: () => void;
	isDeletePending: boolean;
	landId: string;
};

export function LandCardActions({
	onView,
	onEdit,
	onDelete,
	isDeletePending,
	landId,
}: LandCardActionsProps) {
	const handleView = () => {
		if (onView) {
			onView(landId);
		}
	};

	const handleEdit = () => {
		if (onEdit) {
			onEdit(landId);
		}
	};

	return (
		<div className="mt-3 flex gap-2">
			<Button
				className={cn(
					"h-7 bg-transparent px-2 text-xs",
					interactiveClasses.button
				)}
				onClick={handleView}
				size="sm"
				variant="outline"
			>
				<Eye className="mr-1 h-3 w-3" />
				Ver
			</Button>
			<Button
				className={cn(
					"h-7 bg-transparent px-2 text-xs",
					interactiveClasses.button
				)}
				onClick={handleEdit}
				size="sm"
				variant="outline"
			>
				<Edit className="mr-1 h-3 w-3" />
				Editar
			</Button>
			<Button
				className={cn(
					"h-7 bg-transparent px-2 text-red-600 text-xs hover:text-red-700",
					secondaryColorClasses.focusRing
				)}
				disabled={isDeletePending}
				onClick={onDelete}
				size="sm"
				variant="outline"
			>
				<Trash2 className="h-3 w-3" />
			</Button>
		</div>
	);
}
