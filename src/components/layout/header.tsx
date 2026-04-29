import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth"
import { useUnreadNotificationsCount } from "@/hooks/useNotifications"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LogOut, Settings, User, Bell, HelpCircle } from "lucide-react"
import AppIcon from "@/assets/AppIcon_Principal.png"
import { Link } from "react-router-dom"
import { useState } from "react"

export function Header() {
  const { user, logout } = useAuth()
  const [openDialog, setOpenDialog] = useState<"notifications" | "user" | null>(null)
  const { data: unreadCount = 0 } = useUnreadNotificationsCount(user?.id)
  const hasUnread = unreadCount > 0

  if (!user) return null

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <header
      className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center overflow-hidden max-w-xs sm:max-w-sm md:max-w-md hover:opacity-80 transition-opacity">
          <div>
            <div className="flex items-center">
              <img
                src={AppIcon}
                alt="BLE"
                className="h-7 w-7 flex-shrink-0 mr-2 rounded-md"
              />
              <div className="min-w-0">
                <h1
                  className="text-xl font-extrabold whitespace-nowrap tracking-wide"
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
            </div>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>
        </Link>

        <div className="flex-1" />

        <div className="flex items-center gap-2 flex-shrink-0">
          <Dialog
            open={openDialog === "notifications"}
            onOpenChange={(open) => setOpenDialog(open ? "notifications" : null)}
          >
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                <Bell className="h-5 w-5" />
                {hasUnread && (
                  <span
                    aria-label={`${unreadCount} notificaciones sin leer`}
                    className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background"
                  />
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  Notificaciones
                  {hasUnread && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({unreadCount} sin leer)
                    </span>
                  )}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <Link to="/notifications" onClick={() => setOpenDialog(null)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Bell className="mr-2 h-4 w-4" />
                    Ver todas las notificaciones
                  </Button>
                </Link>
              </div>
            </DialogContent>
          </Dialog>

          <Link to="/help">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </Link>

          <Link to="/settings">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>

          <Dialog open={openDialog === "user"} onOpenChange={(open) => setOpenDialog(open ? "user" : null)}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Mi Cuenta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center space-x-4 pb-4 border-b">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Link to="/profile" onClick={() => setOpenDialog(null)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={() => {
                      logout()
                      setOpenDialog(null)
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  )
}
