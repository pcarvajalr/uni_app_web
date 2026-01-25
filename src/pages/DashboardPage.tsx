import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { MapPin, AlertTriangle, ShoppingBag, GraduationCap, TrendingUp, Users, Clock, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"
import { useReports } from "@/hooks/useReports"
import { useTutoringSessions } from "@/hooks/useTutoringSessions"
import { getProducts, type ProductWithSeller } from "@/services/products.service"
import { useState, useEffect, useMemo } from "react"

export default function DashboardPage() {
  const { user } = useAuth()

  // Datos dinámicos
  const { reports, loading: reportsLoading } = useReports()
  const { data: tutoringSessions, isLoading: tutoringLoading } = useTutoringSessions()
  const [products, setProducts] = useState<ProductWithSeller[]>([])
  const [productsLoading, setProductsLoading] = useState(true)

  // Cargar productos
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts({ status: 'available' })
        setProducts(data)
      } catch (error) {
        console.error('Error cargando productos:', error)
      } finally {
        setProductsLoading(false)
      }
    }
    loadProducts()
  }, [])

  // Generar actividad reciente combinando todas las fuentes
  const recentActivity = useMemo(() => {
    type ActivityItem = {
      id: string
      type: 'report' | 'product' | 'tutoring'
      title: string
      date: Date
      color: string
    }

    const activities: ActivityItem[] = []

    // Agregar reportes recientes
    reports.slice(0, 5).forEach(report => {
      activities.push({
        id: `report-${report.id}`,
        type: 'report',
        title: `Reporte: ${report.title}`,
        date: new Date(report.createdAt),
        color: 'bg-red-500'
      })
    })

    // Agregar productos recientes
    products.slice(0, 5).forEach(product => {
      activities.push({
        id: `product-${product.id}`,
        type: 'product',
        title: `Producto: ${product.title}`,
        date: new Date(product.created_at || ''),
        color: 'bg-green-500'
      })
    })

    // Agregar tutorías recientes
    tutoringSessions?.slice(0, 5).forEach(session => {
      activities.push({
        id: `tutoring-${session.id}`,
        type: 'tutoring',
        title: `Tutoría: ${session.subject}`,
        date: new Date(session.created_at || ''),
        color: 'bg-blue-500'
      })
    })

    // Ordenar por fecha (más reciente primero) y tomar las primeras 5
    return activities
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5)
  }, [reports, products, tutoringSessions])

  // Función para formatear tiempo relativo
  const formatRelativeTime = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Justo ahora'
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    if (diffDays === 1) return 'Ayer'
    if (diffDays < 7) return `Hace ${diffDays} días`
    return date.toLocaleDateString('es-CO')
  }

  // Calcular métricas
  const activeReports = reports.filter(r => r.status === 'activo' || r.status === 'investigando').length
  const availableTutoring = tutoringSessions?.length ?? 0
  const uniqueSubjects = new Set(tutoringSessions?.map(s => s.subject)).size

  const quickActions = [
    {
      title: "Buscar Ubicación",
      description: "Encuentra lugares dentro y fuera del campus",
      icon: MapPin,
      href: "/maps",
      color: "text-blue-600",
    },
    {
      title: "Reportar Incidente",
      description: "Reporta robos o situaciones de seguridad",
      icon: AlertTriangle,
      href: "/reports",
      color: "text-red-600",
    },
    {
      title: "Marketplace",
      description: "Compra y vende productos con otros estudiantes",
      icon: ShoppingBag,
      href: "/marketplace",
      color: "text-green-600",
    },
    {
      title: "Tutorías",
      description: "Ofrece o busca tutorías académicas",
      icon: GraduationCap,
      href: "/tutoring",
      color: "text-purple-600",
    },
  ]

  const isLoading = reportsLoading || tutoringLoading || productsLoading

  const stats = [
    {
      title: "Reportes Activos",
      value: isLoading ? null : activeReports,
      icon: AlertTriangle,
      trend: `${reports.length} total`,
    },
    {
      title: "Productos en Venta",
      value: isLoading ? null : products.length,
      icon: ShoppingBag,
      trend: "disponibles",
    },
    {
      title: "Tutorías Disponibles",
      value: isLoading ? null : availableTutoring,
      icon: Users,
      trend: `${uniqueSubjects} materias`,
    },
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-balance">¡Hola, {user?.name?.split(" ")[0]}!</h1>
          <p className="text-muted-foreground">Bienvenido a tu aplicación universitaria</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      {stat.value === null ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground my-1" />
                      ) : (
                        <p className="text-2xl font-bold">{stat.value}</p>
                      )}
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stat.trend}
                      </p>
                    </div>
                    <Icon className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-6 w-6 ${action.color}`} />
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                    </div>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button asChild className="w-full">
                      <Link to={action.href}>Acceder</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Actividad Reciente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay actividad reciente
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 text-sm">
                    <div className={`w-2 h-2 ${activity.color} rounded-full flex-shrink-0`}></div>
                    <span className="text-muted-foreground whitespace-nowrap">
                      {formatRelativeTime(activity.date)}
                    </span>
                    <span className="truncate">{activity.title}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
