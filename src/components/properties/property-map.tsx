import { PropertySearchResult } from "@/lib/types/properties";

interface PropertyMapProps {
  properties: PropertySearchResult[];
}

export function PropertyMap({ properties }: PropertyMapProps) {
  return (
    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground">
        Map would render here ({properties.length} properties)
      </p>
    </div>
  );
}
