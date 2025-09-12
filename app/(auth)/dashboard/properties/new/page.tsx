"use client"

import { PropertyForm } from "@/components/properties/property-form"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NewPropertyPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild className="text-blackCoral hover:bg-blackCoral hover:text-white">
          <Link href="/dashboard/properties">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-arsenic font-serif">Agregar Propiedad</h1>
          <p className="text-blackCoral">Completa la información de la nueva propiedad</p>
        </div>
      </div>

      {/* Form */}
      <PropertyForm />
    </div>
  )
}