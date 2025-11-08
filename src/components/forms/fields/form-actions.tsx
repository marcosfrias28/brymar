import { Button } from "@/components/ui/button";

type FormActionsProps = {
	onCancel?: () => void;
	isEditing: boolean;
};

export function FormActions({ onCancel, isEditing }: FormActionsProps) {
	return (
		<div className="flex justify-end space-x-4">
			{onCancel && (
				<Button onClick={onCancel} type="button" variant="outline">
					Cancelar
				</Button>
			)}
			<Button type="submit">{isEditing ? "Actualizar" : "Crear"}</Button>
		</div>
	);
}
