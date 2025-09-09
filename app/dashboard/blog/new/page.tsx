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
        <Button variant="ghost" asChild className="text-black-coral hover:bg-black-coral hover:text-white">
          <Link href="/dashboard/blog">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-arsenic font-serif">Crear Post</h1>
          <p className="text-black-coral">Escribe un nuevo artículo para el blog</p>
        </div>
      </div>

      {/* Form */}
      <BlogForm />
    </div>
  )
}
