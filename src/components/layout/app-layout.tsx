import type { ReactNode } from "react"
import { useAuth } from "@/lib/auth"
import { Header } from "./header"
import { MobileNav } from "./mobile-nav"
import { Loader2 } from "lucide-react"

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // This will be handled by the auth redirect
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main
        className="pb-20 px-2 py-6"
        style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
      >
        {children}
      </main>
      <MobileNav />
    </div>
  )
}
