import { notFound } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PropertyContactForm } from "@/components/properties/property-contact-form";

export default async function PropertyPage({ params }: any) {
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, params.id))
    .limit(1);

  if (!property || property.status !== "published") {
    notFound();
  }

  const images = Array.isArray(property.images)
    ? property.images.map((img: any) => (typeof img === "string" ? img : img.url))
    : [];

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <h1 className="mb-2 font-bold text-3xl">{property.title}</h1>
      <p className="mb-4 text-muted-foreground">{property.type}</p>

      {images.length > 0 && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.slice(0, 6).map((src: string, i: number) => (
            <div key={i} className="relative h-48 w-full overflow-hidden rounded-lg">
              <Image src={src} alt={property.title} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h2 className="font-semibold text-xl">Descripción</h2>
            <p className="mt-2 whitespace-pre-line">{property.description}</p>
          </div>
          <div>
            <h2 className="font-semibold text-xl">Características</h2>
            <ul className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <li>Área: {(property.features as any)?.area}</li>
              <li>Dormitorios: {(property.features as any)?.bedrooms}</li>
              <li>Baños: {(property.features as any)?.bathrooms}</li>
              <li>Tipo: {property.type}</li>
            </ul>
          </div>
        </div>

        <div>
          <PropertyContactForm propertyId={property.id} />
        </div>
      </div>
    </div>
  );
}
