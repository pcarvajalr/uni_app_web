
import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth"
import { Loader2 } from "lucide-react"
import { PasswordStrengthIndicator } from "./password-strength-indicator"
import { strongPasswordSchema } from "@/lib/password-validation"

interface RegisterFormProps {
  onToggleMode: () => void
}

export function RegisterForm({ onToggleMode }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    studentId: "",
    university: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { register, isLoading } = useAuth()

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!formData.email || !formData.password || !formData.name || !formData.studentId || !formData.university) {
      setError("Por favor completa todos los campos")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    // Validar contraseña fuerte
    try {
      strongPasswordSchema.parse(formData.password)
    } catch (zodError: any) {
      setError(zodError.errors[0]?.message || "La contraseña no cumple con los requisitos de seguridad")
      return
    }

    try {
      const result = await register(formData.name, formData.email, formData.password)

      if (result?.needsEmailVerification) {
        setSuccess("¡Cuenta creada! Por favor verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada (y spam).")
        // Limpiar el formulario
        setFormData({
          email: "",
          password: "",
          confirmPassword: "",
          name: "",
          studentId: "",
          university: "",
        })
      }
    } catch (err: any) {
      setError(err.message || "Error al crear la cuenta")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">Registro</CardTitle>
        <CardDescription>Crea tu cuenta universitaria</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input
              id="name"
              type="text"
              placeholder="Juan Pérez"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@universidad.edu"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studentId">Código Estudiantil</Label>
            <Input
              id="studentId"
              type="text"
              placeholder="2024001"
              value={formData.studentId}
              onChange={(e) => handleChange("studentId", e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="university">Universidad</Label>
            <Input
              id="university"
              type="text"
              placeholder="Universidad Nacional"
              value={formData.university}
              onChange={(e) => handleChange("university", e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              disabled={isLoading}
            />
            <PasswordStrengthIndicator password={formData.password} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{success}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              "Crear Cuenta"
            )}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Button variant="link" onClick={onToggleMode} className="text-sm">
            ¿Ya tienes cuenta? Inicia sesión aquí
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
