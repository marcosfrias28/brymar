"use client"

import { BlogForm } from "@/components/blog/blog-form"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"


export default function NewBlogPage() {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild className="text-blackCoral hover:bg-blackCoral hover:text-white">
          <Link href="/dashboard/blog">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-arsenic font-serif">Crear Nueva Entrada</h1>
          <p className="text-blackCoral">Crea y publica una nueva entrada en el blog</p>
        </div>
      </div>

      {/* Form */}
      <BlogForm />
    </div>
  )
}