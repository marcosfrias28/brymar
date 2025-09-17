"use client"

import { Bed, Bath, Square, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Property } from "@/utils/types/types"



interface PropertyCardProps {
  property: Property
  variant?: "horizontal" | "vertical"
}

export function PropertyCard({ property }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  return (
    <div className="relative rounded-2xl border border-dark/10 dark:border-white/10 group hover:shadow-3xl duration-300 dark:hover:shadow-white/20">
      <div className="overflow-hidden rounded-t-2xl">
        <Link href={`/properties/${property.id}`}>
          <div className="w-full h-[300px]">
            <Image
              alt={property.title}
              loading="lazy"
              width={440}
              height={300}
              className="w-full h-full object-cover rounded-t-2xl group-hover:brightness-50 group-hover:scale-125 transition duration-300 delay-75"
              src={property.imageUrl || "/placeholder.jpg"}
            />
          </div>
        </Link>
        <div className="absolute top-6 right-6 p-4 bg-secondary/90 backdrop-blur-sm rounded-full hidden group-hover:block border border-secondary">
          <ArrowRight className="w-6 h-6 text-secondary-foreground" />
        </div>
      </div>
      <div className="p-6">
        <div className="flex flex-col mobile:flex-row gap-5 mobile:gap-0 justify-between mb-6">
          <div>
            <Link href={`/properties/${property.id}`}>
              <h3 className="text-xl font-medium text-black dark:text-white duration-300 group-hover:text-primary">
                {property.title}
              </h3>
            </Link>
            <p className="text-base font-normal text-black/50 dark:text-white/50">
              {property.location}
            </p>
          </div>
          <div>
            <button className="text-base font-normal text-primary px-5 py-2 rounded-full bg-secondary/20 border border-secondary/30">
              {formatPrice(property.price)}
            </button>
          </div>
        </div>
        <div className="flex">
          <div className="flex flex-col gap-2 border-e border-black/10 dark:border-white/20 pr-2 xs:pr-4 mobile:pr-8">
            <Bed className="w-5 h-5 text-secondary" />
            <p className="text-sm mobile:text-base font-normal text-black dark:text-white">
              {property.bedrooms} Bedrooms
            </p>
          </div>
          <div className="flex flex-col gap-2 border-e border-black/10 dark:border-white/20 px-2 xs:px-4 mobile:px-8">
            <Bath className="w-5 h-5 text-secondary" />
            <p className="text-sm mobile:text-base font-normal text-black dark:text-white">
              {property.bathrooms} Bathrooms
            </p>
          </div>
          <div className="flex flex-col gap-2 pl-2 xs:pl-4 mobile:pl-8">
            <Square className="w-5 h-5 text-secondary" />
            <p className="text-sm mobile:text-base font-normal text-black dark:text-white">
              {property.sqm}m<sup>2</sup>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
