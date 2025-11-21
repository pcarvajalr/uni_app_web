import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LogOut, Settings, User, Menu, Bell, HelpCircle } from "lucide-react"
import { Link } from "react-router-dom"
import { useState } from "react"

export function Header() {
  const { user, logout } = useAuth()
  const [openDialog, setOpenDialog] = useState<"notifications" | "user" | "menu" | null>(null)

  if (!user) return null

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-3">
          <Dialog open={openDialog === "menu"} onOpenChange={(open) => setOpenDialog(open ? "menu" : null)}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Menú</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <Link to="/notifications" onClick={() => setOpenDialog(null)} className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <Bell className="mr-2 h-4 w-4" />
                    Notificaciones
                  </Button>
                </Link>
                <Link to="/settings" onClick={() => setOpenDialog(null)} className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Configuración
                  </Button>
                </Link>
                <Link to="/help" onClick={() => setOpenDialog(null)} className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Ayuda
                  </Button>
                </Link>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-primary">UniApp</h1>
            <p className="text-sm text-muted-foreground">{user.role || 'Estudiante'}</p>
          </div>
        </div>

        <div className="flex-1 max-w-md" />

        <div className="flex items-center gap-2">
          <Dialog
            open={openDialog === "notifications"}
            onOpenChange={(open) => setOpenDialog(open ? "notifications" : null)}
          >
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden">
                <Bell className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Notificaciones</DialogTitle>
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

          <Dialog open={openDialog === "user"} onOpenChange={(open) => setOpenDialog(open ? "user" : null)}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full md:hidden">
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
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Button>
                  <Link to="/settings" onClick={() => setOpenDialog(null)} className="w-full">
                    <Button variant="ghost" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configuración</span>
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

          {/* Desktop user menu dropdown - hidden on mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hidden md:flex">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  {user.id && <p className="text-xs leading-none text-muted-foreground">ID: {user.id}</p>}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
