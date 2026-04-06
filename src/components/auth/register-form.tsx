
import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth"
import { Loader2, ExternalLink } from "lucide-react"
import { useNavigate } from "react-router-dom"
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

const REGISTER_FORM_KEY = "register_form_draft"

export function RegisterForm({ onToggleMode }: RegisterFormProps) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem(REGISTER_FORM_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return {
          email: parsed.email || "",
          password: "",
          confirmPassword: "",
          name: parsed.name || "",
          studentId: parsed.studentId || "",
          university: parsed.university || "",
        }
      } catch { /* ignore */ }
    }
    return { email: "", password: "", confirmPassword: "", name: "", studentId: "", university: "" }
  })
  const [acceptances, setAcceptances] = useState(() => {
    const saved = sessionStorage.getItem(REGISTER_FORM_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return {
          privacyPolicy: parsed.acceptances?.privacyPolicy || false,
          dataTreatment: parsed.acceptances?.dataTreatment || false,
          dataAuthorization: parsed.acceptances?.dataAuthorization || false,
        }
      } catch { /* ignore */ }
    }
    return { privacyPolicy: false, dataTreatment: false, dataAuthorization: false }
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { register, isLoading } = useAuth()

  const saveToSession = useCallback(() => {
    sessionStorage.setItem(REGISTER_FORM_KEY, JSON.stringify({
      email: formData.email,
      name: formData.name,
      studentId: formData.studentId,
      university: formData.university,
      acceptances,
    }))
  }, [formData, acceptances])

  useEffect(() => {
    saveToSession()
  }, [saveToSession])

  const handleNavigateToPolicy = (path: string) => {
    saveToSession()
    navigate(path, { state: { from: "/auth?mode=register" } })
  }

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
        sessionStorage.removeItem(REGISTER_FORM_KEY)
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
          {/* Checkboxes de aceptación */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Para crear tu cuenta, acepta los siguientes documentos:</p>

            <div className="rounded-lg border bg-muted/30 divide-y">
              <label htmlFor="privacyPolicy" className="flex items-center gap-3 px-3 py-3 cursor-pointer active:bg-muted/50 transition-colors">
                <Checkbox
                  id="privacyPolicy"
                  checked={acceptances.privacyPolicy}
                  onCheckedChange={(checked) =>
                    setAcceptances((prev) => ({ ...prev, privacyPolicy: checked === true }))
                  }
                  disabled={isLoading}
                  className="shrink-0"
                />
                <span className="text-sm leading-tight flex-1">
                  Acepto el Aviso de Privacidad
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); handleNavigateToPolicy("/privacy-policy") }}
                  className="shrink-0 text-primary p-1.5 rounded-md hover:bg-primary/10 active:bg-primary/20 transition-colors"
                  aria-label="Ver Aviso de Privacidad"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </label>

              <label htmlFor="dataTreatment" className="flex items-center gap-3 px-3 py-3 cursor-pointer active:bg-muted/50 transition-colors">
                <Checkbox
                  id="dataTreatment"
                  checked={acceptances.dataTreatment}
                  onCheckedChange={(checked) =>
                    setAcceptances((prev) => ({ ...prev, dataTreatment: checked === true }))
                  }
                  disabled={isLoading}
                  className="shrink-0"
                />
                <span className="text-sm leading-tight flex-1">
                  Acepto la Política de Tratamiento de Datos
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); handleNavigateToPolicy("/data-treatment") }}
                  className="shrink-0 text-primary p-1.5 rounded-md hover:bg-primary/10 active:bg-primary/20 transition-colors"
                  aria-label="Ver Política de Tratamiento de Datos"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </label>

              <label htmlFor="dataAuthorization" className="flex items-center gap-3 px-3 py-3 cursor-pointer active:bg-muted/50 transition-colors">
                <Checkbox
                  id="dataAuthorization"
                  checked={acceptances.dataAuthorization}
                  onCheckedChange={(checked) =>
                    setAcceptances((prev) => ({ ...prev, dataAuthorization: checked === true }))
                  }
                  disabled={isLoading}
                  className="shrink-0"
                />
                <span className="text-sm leading-tight flex-1">
                  Autorizo el Tratamiento de mis Datos Personales
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); handleNavigateToPolicy("/data-authorization") }}
                  className="shrink-0 text-primary p-1.5 rounded-md hover:bg-primary/10 active:bg-primary/20 transition-colors"
                  aria-label="Ver Autorización de Datos"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{success}</p>}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !acceptances.privacyPolicy || !acceptances.dataTreatment || !acceptances.dataAuthorization}
          >
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
