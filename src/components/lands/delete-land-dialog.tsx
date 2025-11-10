import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type DeleteLandDialogProps = {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isDeleting: boolean;
};

export function DeleteLandDialog({
	isOpen,
	onOpenChange,
	onConfirm,
	isDeleting,
}: DeleteLandDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Eliminar Terreno</DialogTitle>
					<DialogDescription>
						¿Estás seguro de que quieres eliminar este terreno? Esta acción no se puede deshacer.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isDeleting}
					>
						Cancelar
					</Button>
					<Button
						variant="destructive"
						onClick={onConfirm}
						disabled={isDeleting}
					>
						{isDeleting ? "Eliminando..." : "Eliminar"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
