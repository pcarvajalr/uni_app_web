
import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth"
import { Loader2, AlertTriangle } from "lucide-react"
import { checkLoginLock, recordFailedLogin, resetLoginAttempts } from "@/lib/rate-limiter"

interface LoginFormProps {
  onToggleMode: () => void
  onForgotPassword: () => void
}

export function LoginForm({ onToggleMode, onForgotPassword }: LoginFormProps) {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLocked, setIsLocked] = useState(false)
  const [lockTime, setLockTime] = useState(0)
  const [attemptsRemaining, setAttemptsRemaining] = useState(5)
  const { login, isLoading } = useAuth()

  // Verificar bloqueo cuando cambia el email
  useEffect(() => {
    if (email) {
      const lockStatus = checkLoginLock(email)
      setIsLocked(lockStatus.isLocked)
      setLockTime(lockStatus.remainingTime)
      setAttemptsRemaining(lockStatus.attemptsRemaining)
    }
  }, [email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Por favor completa todos los campos")
      return
    }

    // Verificar si está bloqueado
    const lockStatus = checkLoginLock(email)
    if (lockStatus.isLocked) {
      setIsLocked(true)
      setLockTime(lockStatus.remainingTime)
      setError(`Demasiados intentos fallidos. Intenta de nuevo en ${lockStatus.remainingTime} minuto${lockStatus.remainingTime > 1 ? 's' : ''}.`)
      return
    }

    try {
      await login(email, password)
      // Si el login fue exitoso, resetear intentos
      resetLoginAttempts(email)
      setAttemptsRemaining(5)
      // Redirigir al dashboard
      navigate('/dashboard')
    } catch (err: any) {
      // Registrar intento fallido
      recordFailedLogin(email)

      // Actualizar estado de bloqueo
      const newLockStatus = checkLoginLock(email)
      setIsLocked(newLockStatus.isLocked)
      setLockTime(newLockStatus.remainingTime)
      setAttemptsRemaining(newLockStatus.attemptsRemaining)

      // Mostrar mensaje de error
      if (newLockStatus.isLocked) {
        setError(`Demasiados intentos fallidos. Tu cuenta ha sido bloqueada temporalmente por ${newLockStatus.remainingTime} minuto${newLockStatus.remainingTime > 1 ? 's' : ''}.`)
      } else {
        setError(err.message || "Error al iniciar sesión")
      }
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">Iniciar Sesión</CardTitle>
        <CardDescription>Accede a tu cuenta universitaria</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@universidad.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <Button
                type="button"
                variant="link"
                onClick={onForgotPassword}
                className="text-xs p-0 h-auto"
                disabled={isLoading}
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {error && (
            <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          {!isLocked && attemptsRemaining < 5 && attemptsRemaining > 0 && (
            <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded-md text-center">
              {attemptsRemaining} intento{attemptsRemaining > 1 ? 's' : ''} restante{attemptsRemaining > 1 ? 's' : ''}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={isLoading || isLocked}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Button variant="link" onClick={onToggleMode} className="text-sm">
            ¿No tienes cuenta? Regístrate aquí
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
