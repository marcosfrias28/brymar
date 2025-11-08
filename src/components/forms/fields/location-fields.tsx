import { InteractiveMap } from "@/components/wizard/shared/interactive-map";
import type { Coordinates, Address } from "@/types/property-wizard";

type LocationFieldsProps = {
	address?: Address;
	coordinates?: Coordinates;
	onAddressChange: (address: Address | undefined) => void;
	onCoordinatesChange: (coordinates: Coordinates | undefined) => void;
};

export function LocationFields({
	coordinates,
	onAddressChange,
	onCoordinatesChange,
}: LocationFieldsProps) {
	return (
		<InteractiveMap
			coordinates={coordinates}
			onAddressChange={onAddressChange}
			onCoordinatesChange={onCoordinatesChange}
		/>
	);
}
