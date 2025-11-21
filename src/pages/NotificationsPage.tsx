import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertTriangle, ShoppingBag, BookOpen, Trash2, X } from "lucide-react"
import { useState } from "react"

interface Notification {
  id: string
  type: "security" | "marketplace" | "tutoring" | "system"
  title: string
  description: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "security",
      title: "Alerta de Seguridad Cercana",
      description: "Reporte de incidente a 200m de tu ubicación",
      message: "Se ha reportado un robo en la biblioteca. Ten cuidado en la zona.",
      timestamp: "Hace 15 minutos",
      read: false,
      actionUrl: "/reports",
    },
    {
      id: "2",
      type: "marketplace",
      title: "Nuevo Producto Disponible",
      description: "Se agregó un nuevo artículo de tu interés",
      message: "Un nuevo MacBook Pro está disponible en el marketplace.",
      timestamp: "Hace 1 hora",
      read: false,
      actionUrl: "/marketplace",
    },
    {
      id: "3",
      type: "tutoring",
      title: "Tutor Disponible",
      description: "Nuevas sesiones de Cálculo están disponibles",
      message: "Ana García tiene disponibilidad para sesiones de Cálculo Diferencial.",
      timestamp: "Hace 2 horas",
      read: false,
      actionUrl: "/tutoring",
    },
    {
      id: "4",
      type: "security",
      title: "Resumen de Seguridad Diario",
      description: "3 reportes nuevos en el campus hoy",
      message: "Revisión diaria de incidentes: 2 robos reportados y 1 vandalismo en áreas comunes.",
      timestamp: "Ayer",
      read: true,
      actionUrl: "/reports",
    },
    {
      id: "5",
      type: "marketplace",
      title: "Producto en Oferta",
      description: "Descuento especial en artículos electrónicos",
      message: "Varios productos tienen descuento esta semana. ¡Aprovecha!",
      timestamp: "Hace 3 días",
      read: true,
      actionUrl: "/marketplace",
    },
  ])

  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<string | null>(null)

  const dateFilters = [
    { id: "todos", name: "Todas las Fechas" },
    { id: "hoy", name: "Hoy" },
    { id: "semana", name: "Esta Semana" },
    { id: "mes", name: "Este Mes" },
  ]

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "security":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case "marketplace":
        return <ShoppingBag className="h-5 w-5 text-green-600" />
      case "tutoring":
        return <BookOpen className="h-5 w-5 text-blue-600" />
      case "system":
        return <Bell className="h-5 w-5 text-gray-600" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getNotificationColor = (type: string, read: boolean) => {
    if (read) return "bg-muted"
    switch (type) {
      case "security":
        return "bg-red-50 border-red-200"
      case "marketplace":
        return "bg-green-50 border-green-200"
      case "tutoring":
        return "bg-blue-50 border-blue-200"
      case "system":
        return "bg-gray-50 border-gray-200"
      default:
        return "bg-background"
    }
  }

  const getDateCategory = (timestamp: string): string => {
    if (timestamp.includes("minuto") || timestamp.includes("hora")) return "hoy"
    if (timestamp.includes("día") || timestamp.includes("Ayer")) return "semana"
    if (timestamp.includes("semana")) return "semana"
    return "mes"
  }

  const filteredNotifications = notifications.filter((notif) => {
    let typeMatch = true
    let dateMatch = true

    if (!selectedType) typeMatch = true
    else if (selectedType === "no-leidas") typeMatch = !notif.read
    else typeMatch = notif.type === selectedType

    if (!dateFilter) dateMatch = true
    else dateMatch = getDateCategory(notif.timestamp) === dateFilter || dateFilter === "hoy"

    return typeMatch && dateMatch
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notificaciones</h1>
            <p className="text-muted-foreground">Mantente actualizado sobre todo lo importante</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              Marcar todas como leídas
            </Button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
              <p className="text-sm text-muted-foreground">Sin Leer</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{notifications.length}</div>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {notifications.filter((n) => n.type === "security").length}
              </div>
              <p className="text-sm text-muted-foreground">Seguridad</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {notifications.filter((n) => n.type === "marketplace").length}
              </div>
              <p className="text-sm text-muted-foreground">Marketplace</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3 text-sm">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium">Tipo de Notificación</label>
                <select
                  value={selectedType || ""}
                  onChange={(e) => setSelectedType(e.target.value || null)}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                >
                  <option value="">Todas las Notificaciones</option>
                  <option value="no-leidas">Sin Leer ({unreadCount})</option>
                  <option value="security">Seguridad</option>
                  <option value="marketplace">Marketplace</option>
                  <option value="tutoring">Tutorías</option>
                </select>
              </div>

              {/* Date Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium">Filtrar por Fecha</label>
                <select
                  value={dateFilter || ""}
                  onChange={(e) => setDateFilter(e.target.value || null)}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                >
                  <option value="">Todas las Fechas</option>
                  <option value="hoy">Hoy</option>
                  <option value="semana">Esta Semana</option>
                  <option value="mes">Este Mes</option>
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedType || dateFilter) && (
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                {selectedType && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {selectedType === "no-leidas" ? "Sin Leer" : selectedType}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedType(null)} />
                  </Badge>
                )}
                {dateFilter && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {dateFilter === "hoy" ? "Hoy" : dateFilter === "semana" ? "Esta Semana" : "Este Mes"}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setDateFilter(null)} />
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedType(null)
                    setDateFilter(null)
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`border cursor-pointer transition-all hover:shadow-md ${getNotificationColor(
                  notification.type,
                  notification.read,
                )}`}
                onClick={() => markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="pt-1">{getNotificationIcon(notification.type)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-sm line-clamp-1">{notification.title}</h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{notification.message}</p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{notification.timestamp}</span>
                        <Badge variant="outline" className="text-xs">
                          {notification.type}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {notification.actionUrl && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.location.href = notification.actionUrl!
                          }}
                        >
                          Ver
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">Sin notificaciones</h3>
                <p className="text-muted-foreground">Te notificaremos cuando haya actualizaciones importantes</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
