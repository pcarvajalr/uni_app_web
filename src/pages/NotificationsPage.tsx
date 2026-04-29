import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import {
  Bell,
  AlertTriangle,
  ShoppingBag,
  BookOpen,
  MessageSquare,
  Star,
  Trash2,
  X,
  Loader2,
} from "lucide-react"

import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth"
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from "@/hooks/useNotifications"
import type { Database } from "@/types/database.types"

type Notification = Database["public"]["Tables"]["notifications"]["Row"]

const NOTIFICATION_LIMIT = 20

const TYPE_LABELS: Record<string, string> = {
  message: "Mensajes",
  sale: "Ventas",
  booking: "Tutorías",
  review: "Reseñas",
  security: "Seguridad",
  system: "Sistema",
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "security":
      return <AlertTriangle className="h-5 w-5 text-red-600" />
    case "sale":
      return <ShoppingBag className="h-5 w-5 text-green-600" />
    case "booking":
      return <BookOpen className="h-5 w-5 text-blue-600" />
    case "message":
      return <MessageSquare className="h-5 w-5 text-blue-600" />
    case "review":
      return <Star className="h-5 w-5 text-yellow-600" />
    default:
      return <Bell className="h-5 w-5 text-gray-600" />
  }
}

function getNotificationColor(type: string, read: boolean) {
  if (read) return "bg-muted"
  switch (type) {
    case "security":
      return "bg-red-50 border-red-200"
    case "sale":
      return "bg-green-50 border-green-200"
    case "booking":
    case "message":
      return "bg-blue-50 border-blue-200"
    case "review":
      return "bg-yellow-50 border-yellow-200"
    default:
      return "bg-background"
  }
}

function formatTimestamp(createdAt: string | null) {
  if (!createdAt) return ""
  try {
    return formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: es })
  } catch {
    return ""
  }
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const userId = user?.id

  const { data: notifications = [], isLoading } = useNotifications(userId, NOTIFICATION_LIMIT)
  const markAsReadMutation = useMarkNotificationAsRead(userId)
  const markAllAsReadMutation = useMarkAllNotificationsAsRead(userId)
  const deleteMutation = useDeleteNotification(userId)

  const [selectedType, setSelectedType] = useState<string>("")

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  )

  const securityCount = useMemo(
    () => notifications.filter((n) => n.type === "security").length,
    [notifications]
  )

  const marketplaceCount = useMemo(
    () => notifications.filter((n) => n.type === "sale").length,
    [notifications]
  )

  const availableTypes = useMemo(() => {
    const types = new Set(notifications.map((n) => n.type))
    return Array.from(types)
  }, [notifications])

  const filteredNotifications = useMemo(() => {
    if (!selectedType) return notifications
    if (selectedType === "no-leidas") return notifications.filter((n) => !n.is_read)
    return notifications.filter((n) => n.type === selectedType)
  }, [notifications, selectedType])

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id)
    }
  }

  const handleNavigateAction = (e: React.MouseEvent, notification: Notification) => {
    e.stopPropagation()
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id)
    }
    if (notification.action_url) {
      navigate(notification.action_url)
    }
  }

  const handleDelete = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation()
    deleteMutation.mutate(notificationId)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notificaciones</h1>
            <p className="text-muted-foreground">
              Mantente actualizado sobre todo lo importante
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              Marcar todas como leídas
            </Button>
          )}
        </div>

        {/* Quick Stats */}
        <div
          className={`grid grid-cols-2 gap-4 ${
            securityCount > 0 && marketplaceCount > 0
              ? "md:grid-cols-4"
              : securityCount > 0 || marketplaceCount > 0
              ? "md:grid-cols-3"
              : "md:grid-cols-2"
          }`}
        >
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
          {securityCount > 0 && (
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{securityCount}</div>
                <p className="text-sm text-muted-foreground">Seguridad</p>
              </CardContent>
            </Card>
          )}
          {marketplaceCount > 0 && (
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{marketplaceCount}</div>
                <p className="text-sm text-muted-foreground">Marketplace</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Filter */}
        {notifications.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3 text-sm">Filtros</h3>
              <div className="space-y-2">
                <label className="text-xs font-medium">Tipo de Notificación</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                >
                  <option value="">Todas las Notificaciones</option>
                  <option value="no-leidas">Sin Leer ({unreadCount})</option>
                  {availableTypes.map((type) => (
                    <option key={type} value={type}>
                      {TYPE_LABELS[type] ?? type}
                    </option>
                  ))}
                </select>
              </div>

              {selectedType && (
                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {selectedType === "no-leidas"
                      ? "Sin Leer"
                      : TYPE_LABELS[selectedType] ?? selectedType}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSelectedType("")}
                    />
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedType("")}>
                    Limpiar filtro
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notifications List */}
        <div className="space-y-3">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Cargando notificaciones...</p>
              </CardContent>
            </Card>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`border cursor-pointer transition-all hover:shadow-md ${getNotificationColor(
                  notification.type,
                  !!notification.is_read
                )}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="pt-1">{getNotificationIcon(notification.type)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-sm line-clamp-1">
                          {notification.title}
                        </h3>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {notification.body}
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatTimestamp(notification.created_at)}</span>
                        <Badge variant="outline" className="text-xs">
                          {TYPE_LABELS[notification.type] ?? notification.type}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {notification.action_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleNavigateAction(e, notification)}
                        >
                          Ver
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleDelete(e, notification.id)}
                        disabled={deleteMutation.isPending}
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
                <p className="text-muted-foreground">
                  Te notificaremos cuando haya actualizaciones importantes
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {notifications.length >= NOTIFICATION_LIMIT && (
          <p className="text-xs text-center text-muted-foreground">
            Mostrando las {NOTIFICATION_LIMIT} más recientes
          </p>
        )}
      </div>
    </AppLayout>
  )
}
