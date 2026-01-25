import { useAuth } from "@/lib/auth"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      navigate("/dashboard", { replace: true })
    } else {
      navigate("/auth", { replace: true })
    }
  }, [user, isLoading, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    </div>
  )
}
