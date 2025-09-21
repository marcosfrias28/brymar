"use client"

import { useState } from "react"
import { signIn } from "@/lib/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function TestAuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setUserInfo(null)

    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)

      const result = await signIn(formData)

      if (result.error) {
        toast.error(result.error)
      } else if (result.success && result.data?.user) {
        // Mostrar información del usuario
        setUserInfo({
          ...result.data.user,
          redirectUrl: result.url
        })
        
        // Toast con información del rol
        toast.success(`¡Bienvenido! Rol: ${result.data.user.role}. Redirigiendo a ${result.url}...`)
        
        // Redirección con delay para mostrar la información
        setTimeout(() => {
          if (result.url) {
            router.push(result.url)
          }
        }, 2000)
      }
    } catch (error) {
      console.error("Error durante el login:", error)
      toast.error("Error inesperado durante el login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Prueba de Autenticación con Roles
            </CardTitle>
            <CardDescription className="text-center">
              Prueba el sistema de login con redirección basada en roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Tu contraseña"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            {/* Información del usuario después del login */}
            {userInfo && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">¡Login Exitoso!</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>ID:</strong> {userInfo.id}</p>
                  <p><strong>Nombre:</strong> {userInfo.name}</p>
                  <p><strong>Email:</strong> {userInfo.email}</p>
                  <p><strong>Rol:</strong> <span className="font-semibold">{userInfo.role}</span></p>
                  <p><strong>Redirección:</strong> {userInfo.redirectUrl}</p>
                </div>
                <p className="text-xs text-green-600 mt-2">
                  Serás redirigido automáticamente en 2 segundos...
                </p>
              </div>
            )}

            <div className="mt-4 text-xs text-gray-500">
              <p><strong>Nota:</strong> Usa credenciales válidas para probar los diferentes roles:</p>
              <ul className="list-disc list-inside mt-1">
                <li>admin → /admin/dashboard</li>
                <li>agent → /agent/dashboard</li>
                <li>user → /profile</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}