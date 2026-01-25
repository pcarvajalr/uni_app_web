import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { useAuth } from "@/lib/auth"
import AppIcon from "@/assets/AppIcon_Principal.png"

type AuthMode = 'login' | 'register' | 'forgot-password'

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  // Redirigir al dashboard si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  // Prevenir renderizado del formulario si ya está autenticado
  if (isAuthenticated && !isLoading) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img
              src={AppIcon}
              alt="BLE"
              className="h-10 w-10 rounded-lg"
            />
            <h1
              className="text-3xl font-extrabold tracking-wide"
              style={{
                background: "linear-gradient(135deg, #2E4A7D 0%, #4A6FA5 50%, #6B8FBF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "0.15em"
              }}
            >
              BLE
            </h1>
          </div>
          <p className="text-muted-foreground">Tu aplicación universitaria</p>
        </div>

        {mode === 'login' && (
          <LoginForm
            onToggleMode={() => setMode('register')}
            onForgotPassword={() => setMode('forgot-password')}
          />
        )}

        {mode === 'register' && (
          <RegisterForm onToggleMode={() => setMode('login')} />
        )}

        {mode === 'forgot-password' && (
          <ForgotPasswordForm onBackToLogin={() => setMode('login')} />
        )}
      </div>
    </div>
  )
}
