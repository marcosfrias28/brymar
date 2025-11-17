import type { Property } from "@/lib/db/schema/properties";

type PropertyMapProps = {
	properties: Property[];
};

export function PropertyMap({ properties }: PropertyMapProps) {
	return (
		<div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-200">
			<p className="text-muted-foreground">
				Map would render here ({properties.length} properties)
			</p>
		</div>
	);
}
