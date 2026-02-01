import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { MapPin, AlertTriangle, ShoppingBag, GraduationCap, Home, Ticket } from 'lucide-react'
import { useAuth } from "@/lib/auth"
import { useUnreadMessageCount } from "@/hooks/useTutoringMessages"
import { useUnreadMarketplaceCount } from "@/hooks/useMarketplaceMessages"

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
    href: "/marketplace",
    label: "Tienda",
    icon: ShoppingBag,
  },
  {
    href: "/reports",
    label: "Reportes",
    icon: AlertTriangle,
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
  const { user } = useAuth()
  const { data: unreadCount } = useUnreadMessageCount(user?.id || '')
  const { data: unreadMarketplace } = useUnreadMarketplaceCount(user?.id || '')

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around py-2 px-2">
        {mainNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const showDot =
            (item.href === "/tutoring" && (unreadCount ?? 0) > 0) ||
            (item.href === "/marketplace" && (unreadMarketplace ?? 0) > 0)

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-colors flex-1 max-w-[70px]",
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <div className="relative mb-1">
                <Icon className={cn(
                  item.href === "/marketplace" ? "h-6 w-6 text-primary" : "h-5 w-5"
                )} />
                {showDot && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-orange-500" />
                )}
              </div>
              <span className="text-xs font-medium truncate w-full text-center">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
