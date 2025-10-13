import { PageHeader } from '@/components/sections/page-header';
import { PropertyCard } from '@/components/properties/property-card';
import { Home } from "lucide-react";

// Mock data - in a real app, this would come from your database
const mockProperties = [
  {
    id: "1",
    title: "Serenity Residential Home",
    location: "15 S Aurora Ave, Miami",
    price: 570000,
    bedrooms: 4,
    bathrooms: 3,
    sqm: 120,
    imageUrl: "/villa/1.jpg",
    type: "residential" as const,
    description:
      "Beautiful residential home with modern amenities and spacious rooms.",
  },
  {
    id: "2",
    title: "Mountain View Villa",
    location: "18 S Aurora Ave, Miami",
    price: 575000,
    bedrooms: 5,
    bathrooms: 2,
    sqm: 150,
    imageUrl: "/villa2/1.jpg",
    type: "residential" as const,
    description:
      "Stunning villa with breathtaking mountain views and luxury finishes.",
  },
  {
    id: "3",
    title: "Modern Luxe Apartment",
    location: "20 S Aurora Ave, Miami",
    price: 580000,
    bedrooms: 3,
    bathrooms: 2,
    sqm: 110,
    imageUrl: "/villa3/1.jpg",
    type: "residential" as const,
    description:
      "Contemporary apartment with high-end appliances and elegant design.",
  },
  {
    id: "4",
    title: "Sunset Grove Home",
    location: "90 Maple Leaf Lane, Orlando",
    price: 540000,
    bedrooms: 3,
    bathrooms: 2,
    sqm: 110,
    imageUrl: "/residencial/1.webp",
    type: "residential" as const,
    description:
      "Charming home in a peaceful neighborhood with beautiful sunset views.",
  },
  {
    id: "5",
    title: "Ocean Breeze Villa",
    location: "25 Coastal Drive, Miami Beach",
    price: 650000,
    bedrooms: 4,
    bathrooms: 3,
    sqm: 180,
    imageUrl: "/residencial/2.webp",
    type: "residential" as const,
    description:
      "Luxurious beachfront villa with panoramic ocean views and private beach access.",
  },
  {
    id: "6",
    title: "Downtown Penthouse",
    location: "100 City Center, Miami",
    price: 750000,
    bedrooms: 2,
    bathrooms: 2,
    sqm: 95,
    imageUrl: "/residencial/3.webp",
    type: "residential" as const,
    description:
      "Exclusive penthouse in the heart of downtown with city skyline views.",
  },
];

export default function PropertiesPage() {
  return (
    <>
      <PageHeader
        title="Properties"
        subtitle="Experience elegance and comfort with our exclusive luxury villas, designed for sophisticated living."
        icon={<Home className="w-5 h-5 text-primary" />}
      />

      <section className="pt-0! relative">
        {/* Elementi decorativi con colore secondario */}
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-secondary/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-1/3 w-24 h-24 bg-secondary/8 rounded-full blur-xl"></div>

        <div className="container max-w-8xl mx-auto px-5 2xl:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {mockProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
