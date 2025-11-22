import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { MapPin, AlertTriangle, ShoppingBag, GraduationCap, Home, Ticket } from 'lucide-react'

const mainNavItems = [  
  {
    href: "/maps",
    label: "Mapas",
    icon: MapPin,
  },
  {
    href: "/coupons",
    label: "Cupones",
    icon: Ticket,
  },
  {
    href: "/reports",
    label: "Reportes",
    icon: AlertTriangle,
  },
  {
    href: "/marketplace",
    label: "Tienda",
    icon: ShoppingBag,
  },
  {
    href: "/tutoring",
    label: "Tutorías",
    icon: GraduationCap,
  },
]

export function MobileNav() {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around py-2 px-2">
        {mainNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-colors flex-1 max-w-[70px]",
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium truncate w-full text-center">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
