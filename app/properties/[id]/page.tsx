import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin, Bed, Bath, Square, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Mock data - en una aplicación real, esto vendría de la base de datos
const mockProperties = [
  {
    id: "1",
    title: "Serenity Residential Home",
    location: "15 S Aurora Ave, Miami",
    price: 570000,
    bedrooms: 4,
    bathrooms: 3,
    sqm: 120,
    images: ["/villa/1.jpg", "/villa/2.jpg", "/villa/3.jpg", "/villa/4.jpg"],
    type: "residential" as const,
    description: "Beautiful residential home with modern amenities and spacious rooms.",
    fullDescription: "Nestled in the heart of miami, the modern luxe villa at 15 s aurora ave offers a perfect blend of contemporary elegance and smart-home innovation. priced at $570000, this 120 ft² residence features 4 spacious bedrooms, 3 luxurious bathrooms, and expansive living areas designed for comfort and style. built in 2025, the home boasts energy-efficient systems, abundant natural light, and state-of-the-art security features. outdoor spaces include two stylish bar areas, perfect for entertaining 8+ guests. enjoy the ultimate in modern living with premium amenities and a prime location.",
    features: [
      "Smart Home Integration",
      "Spacious Living Areas", 
      "Energy Efficiency",
      "Natural Light",
      "Security Systems",
      "Outdoor Spaces"
    ],
    amenities: [
      {
        icon: "/images/SVGs/property-details.svg",
        iconWhite: "/images/SVGs/property-details-white.svg",
        title: "Property details",
        description: "One of the few homes in the area with a private pool."
      },
      {
        icon: "/images/SVGs/smart-home-access.svg",
        iconWhite: "/images/SVGs/smart-home-access-white.svg",
        title: "Smart home access",
        description: "Easily check yourself in with a modern keypad system."
      },
      {
        icon: "/images/SVGs/energyefficient.svg",
        iconWhite: "/images/SVGs/energyefficient-white.svg",
        title: "Energy efficient",
        description: "Built in 2025 with sustainable and smart-home features."
      }
    ]
  },
  {
    id: "2",
    title: "Mountain View Villa",
    location: "18 S Aurora Ave, Miami",
    price: 575000,
    bedrooms: 5,
    bathrooms: 2,
    sqm: 150,
    images: ["/villa2/1.jpg", "/villa2/2.jpg", "/villa2/3.jpg", "/villa2/4.jpg"],
    type: "residential" as const,
    description: "Stunning villa with breathtaking mountain views and luxury finishes.",
    fullDescription: "Nestled in the heart of miami, the modern luxe villa at 18 s aurora ave offers a perfect blend of contemporary elegance and smart-home innovation. priced at $575000, this 150 ft² residence features 5 spacious bedrooms, 2 luxurious bathrooms, and expansive living areas designed for comfort and style. built in 2025, the home boasts energy-efficient systems, abundant natural light, and state-of-the-art security features. outdoor spaces include two stylish bar areas, perfect for entertaining 8+ guests. enjoy the ultimate in modern living with premium amenities and a prime location.",
    features: [
      "Smart Home Integration",
      "Spacious Living Areas", 
      "Energy Efficiency",
      "Natural Light",
      "Security Systems",
      "Outdoor Spaces"
    ],
    amenities: [
      {
        icon: "/images/SVGs/property-details.svg",
        iconWhite: "/images/SVGs/property-details-white.svg",
        title: "Property details",
        description: "One of the few homes in the area with a private pool."
      },
      {
        icon: "/images/SVGs/smart-home-access.svg",
        iconWhite: "/images/SVGs/smart-home-access-white.svg",
        title: "Smart home access",
        description: "Easily check yourself in with a modern keypad system."
      },
      {
        icon: "/images/SVGs/energyefficient.svg",
        iconWhite: "/images/SVGs/energyefficient-white.svg",
        title: "Energy efficient",
        description: "Built in 2025 with sustainable and smart-home features."
      }
    ]
  },
  {
    id: "3",
    title: "Modern Luxe Apartment",
    location: "20 S Aurora Ave, Miami",
    price: 580000,
    bedrooms: 3,
    bathrooms: 2,
    sqm: 110,
    images: ["/villa3/1.jpg", "/villa3/2.jpg", "/villa3/3.jpg", "/villa3/4.jpg"],
    type: "residential" as const,
    description: "Contemporary apartment with high-end appliances and elegant design.",
    fullDescription: "Nestled in the heart of miami, the modern luxe villa at 20 s aurora ave offers a perfect blend of contemporary elegance and smart-home innovation. priced at $580000, this 110 ft² residence features 3 spacious bedrooms, 2 luxurious bathrooms, and expansive living areas designed for comfort and style. built in 2025, the home boasts energy-efficient systems, abundant natural light, and state-of-the-art security features. outdoor spaces include two stylish bar areas, perfect for entertaining 8+ guests. enjoy the ultimate in modern living with premium amenities and a prime location.",
    features: [
      "Smart Home Integration",
      "Spacious Living Areas", 
      "Energy Efficiency",
      "Natural Light",
      "Security Systems",
      "Outdoor Spaces"
    ],
    amenities: [
      {
        icon: "/images/SVGs/property-details.svg",
        iconWhite: "/images/SVGs/property-details-white.svg",
        title: "Property details",
        description: "One of the few homes in the area with a private pool."
      },
      {
        icon: "/images/SVGs/smart-home-access.svg",
        iconWhite: "/images/SVGs/smart-home-access-white.svg",
        title: "Smart home access",
        description: "Easily check yourself in with a modern keypad system."
      },
      {
        icon: "/images/SVGs/energyefficient.svg",
        iconWhite: "/images/SVGs/energyefficient-white.svg",
        title: "Energy efficient",
        description: "Built in 2025 with sustainable and smart-home features."
      }
    ]
  }
];

interface PropertyDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = await params;
  const property = mockProperties.find(p => p.id === id);

  if (!property) {
    notFound();
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section className="!pt-44 pb-20 relative">
      <div className="container mx-auto max-w-8xl px-5 2xl:px-0">
        {/* Header */}
        <div className="grid grid-cols-12 items-end gap-6">
          <div className="lg:col-span-8 col-span-12">
            <div className="mb-4">
              <Link href="/properties">
                <Button variant="ghost" size="sm" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a propiedades
                </Button>
              </Link>
            </div>
            <h1 className="lg:text-52 text-40 font-semibold text-dark dark:text-white">
              {property.title}
            </h1>
            <div className="flex gap-2.5">
              <MapPin className="text-dark/50 dark:text-white/50 w-6 h-6" />
              <p className="text-dark/50 dark:text-white/50 text-xm">{property.location}</p>
            </div>
          </div>
          <div className="lg:col-span-4 col-span-12">
            <div className="flex">
              <div className="flex flex-col gap-2 border-e border-black/10 dark:border-white/20 pr-2 xs:pr-4 mobile:pr-8">
                <Bed className="w-5 h-5" />
                <p className="text-sm mobile:text-base font-normal text-black dark:text-white">
                  {property.bedrooms} Bedrooms
                </p>
              </div>
              <div className="flex flex-col gap-2 border-e border-black/10 dark:border-white/20 px-2 xs:px-4 mobile:px-8">
                <Bath className="w-5 h-5" />
                <p className="text-sm mobile:text-base font-normal text-black dark:text-white">
                  {property.bathrooms} Bathrooms
                </p>
              </div>
              <div className="flex flex-col gap-2 pl-2 xs:pl-4 mobile:pl-8">
                <Square className="w-5 h-5" />
                <p className="text-sm mobile:text-base font-normal text-black dark:text-white">
                  {property.sqm}m<sup>2</sup>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-12 mt-8 gap-8">
          <div className="lg:col-span-8 col-span-12 row-span-2">
            <div className="w-full h-[540px]">
              <Image
                alt="Main Property Image"
                width={800}
                height={540}
                className="rounded-2xl w-full h-full object-cover"
                src={property.images[0]}
              />
            </div>
          </div>
          <div className="lg:col-span-4 lg:block hidden w-full h-[335px]">
            <Image
              alt="Property Image 2"
              width={400}
              height={335}
              className="rounded-2xl w-full h-full object-cover"
              src={property.images[1] || property.images[0]}
            />
          </div>
          <div className="lg:col-span-2 col-span-6 w-full h-[155px]">
            <Image
              alt="Property Image 3"
              width={200}
              height={155}
              className="rounded-2xl w-full h-full object-cover"
              src={property.images[2] || property.images[0]}
            />
          </div>
          <div className="lg:col-span-2 col-span-6 w-full h-[155px]">
            <Image
              alt="Property Image 4"
              width={200}
              height={155}
              className="rounded-2xl w-full h-full object-cover"
              src={property.images[3] || property.images[0]}
            />
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-12 gap-8 mt-10">
          <div className="lg:col-span-8 col-span-12">
            <h3 className="text-xl font-medium">Property details</h3>
            
            {/* Amenities */}
            <div className="py-8 my-8 border-y border-dark/10 dark:border-white/20 flex flex-col gap-8">
              {property.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-6">
                  <div>
                    <Image
                      alt=""
                      width={32}
                      height={32}
                      className="w-8 h-8 dark:hidden"
                      src={amenity.icon}
                    />
                    <Image
                      alt=""
                      width={32}
                      height={32}
                      className="w-8 h-8 dark:block hidden"
                      src={amenity.iconWhite}
                    />
                  </div>
                  <div>
                    <h3 className="text-dark dark:text-white text-xm">{amenity.title}</h3>
                    <p className="text-base text-dark/50 dark:text-white/50">
                      {amenity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-5">
              <p className="text-dark dark:text-white text-xm">
                {property.fullDescription}
              </p>
              <p className="text-dark dark:text-white text-xm">
                Step inside to discover an open-concept layout that seamlessly connects the kitchen, dining, and living spaces. the gourmet kitchen is equipped with top-of-the-line appliances, sleek cabinetry, and a large island perfect for casual dining or meal prep. the sunlit living room offers floor-to-ceiling windows, creating a bright and airy atmosphere while providing stunning views of the outdoor space.
              </p>
              <p className="text-dark dark:text-white text-xm">
                The primary suite serves as a private retreat with a spa-like ensuite bathroom and a spacious walk-in closet. each additional bedroom is thoughtfully designed with comfort and style in mind, offering ample space and modern finishes. the home&apos;s bathrooms feature high-end fixtures, custom vanities, and elegant tiling.
              </p>
              <p className="text-dark dark:text-white text-xm">
                Outdoor living is equally impressive, with a beautifully landscaped backyard, multiple lounge areas, and two fully equipped bar spaces.
              </p>
            </div>

            {/* Features */}
            <div className="py-8 mt-8 border-t border-dark/5 dark:border-white/15">
              <h3 className="text-xl font-medium">What this property offers</h3>
              <div className="grid grid-cols-3 mt-5 gap-6">
                {property.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                    </div>
                    <p className="text-base dark:text-white text-dark">{feature}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="mt-8">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d938779.7831767448!2d71.05098621661072!3d23.20271516446136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e82dd003ff749%3A0x359e803f537cea25!2sGANESH%20GLORY%2C%20Gota%2C%20Ahmedabad%2C%20Gujarat%20382481!5e0!3m2!1sen!2sin!4v1715676641521!5m2!1sen!2sin"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-2xl"
              ></iframe>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 col-span-12">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-primary mb-4">
                  {formatPrice(property.price)}
                </div>
                <div className="flex flex-col gap-4 items-center justify-center">
                  <Button className="max-lg:w-fit w-full" size="lg">
                    Contact Agent
                  </Button>
                  <Button variant="outline" className="max-lg:w-fit w-full" size="lg">
                    Schedule Tour
                  </Button>
                  <Button variant="ghost" className="max-lg:w-fit w-full" size="lg">
                    Save Property
                  </Button>
                </div>

              </div>
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold mb-3">Property Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                      <span className="capitalize">{property.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Bedrooms:</span>
                      <span>{property.bedrooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Bathrooms:</span>
                      <span>{property.bathrooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Area:</span>
                      <span>{property.sqm}m²</span>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Generar metadata dinámica
export async function generateMetadata({ params }: PropertyDetailPageProps) {
  const { id } = await params;
  const property = mockProperties.find(p => p.id === id);
  
  if (!property) {
    return {
      title: 'Property Not Found',
    };
  }

  return {
    title: `${property.title} - Brymar Properties`,
    description: property.description,
  };
}

// Generar rutas estáticas
export async function generateStaticParams() {
  return mockProperties.map((property) => ({
    id: property.id,
  }));
}