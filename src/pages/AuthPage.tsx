import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { useAuth } from "@/lib/auth"

type AuthMode = 'login' | 'register' | 'forgot-password'

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirigir al dashboard si ya está autenticado
  if (isAuthenticated) {
    navigate('/dashboard')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">UniApp</h1>
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
