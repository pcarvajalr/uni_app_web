
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
import { z } from "zod"

// Schema de validación para el formulario de registro
const registerFormSchema = z.object({
  name: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  email: z.string()
    .email("Por favor ingresa un correo electrónico válido"),
  studentId: z.string()
    .max(50, "El código estudiantil no puede exceder 50 caracteres")
    .optional()
    .or(z.literal("")), // Permite string vacío
  university: z.string()
    .max(100, "El nombre de la universidad no puede exceder 100 caracteres")
    .optional()
    .or(z.literal("")), // Permite string vacío
  password: strongPasswordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { register, isLoading } = useAuth()

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Limpiar error del campo al escribir
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setFieldErrors({})

    // Validar con Zod
    const validationResult = registerFormSchema.safeParse(formData)

    if (!validationResult.success) {
      const errors: Record<string, string> = {}
      validationResult.error.errors.forEach((err) => {
        const field = err.path[0] as string
        if (!errors[field]) {
          errors[field] = err.message
        }
      })
      setFieldErrors(errors)
      return
    }

    try {
      const result = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.studentId || undefined,
        formData.university || undefined
      )

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
              className={fieldErrors.name ? "border-destructive" : ""}
            />
            {fieldErrors.name && <p className="text-sm text-destructive">{fieldErrors.name}</p>}
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
              className={fieldErrors.email ? "border-destructive" : ""}
            />
            {fieldErrors.email && <p className="text-sm text-destructive">{fieldErrors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="studentId">Código Estudiantil <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <Input
              id="studentId"
              type="text"
              placeholder="2024001"
              value={formData.studentId}
              onChange={(e) => handleChange("studentId", e.target.value)}
              disabled={isLoading}
              className={fieldErrors.studentId ? "border-destructive" : ""}
            />
            {fieldErrors.studentId && <p className="text-sm text-destructive">{fieldErrors.studentId}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="university">Universidad <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <Input
              id="university"
              type="text"
              placeholder="Universidad Nacional"
              value={formData.university}
              onChange={(e) => handleChange("university", e.target.value)}
              disabled={isLoading}
              className={fieldErrors.university ? "border-destructive" : ""}
            />
            {fieldErrors.university && <p className="text-sm text-destructive">{fieldErrors.university}</p>}
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
              className={fieldErrors.password ? "border-destructive" : ""}
            />
            <PasswordStrengthIndicator password={formData.password} />
            {fieldErrors.password && <p className="text-sm text-destructive">{fieldErrors.password}</p>}
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
              className={fieldErrors.confirmPassword ? "border-destructive" : ""}
            />
            {fieldErrors.confirmPassword && <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>}
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
