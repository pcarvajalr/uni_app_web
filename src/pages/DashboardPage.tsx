import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { MapPin, AlertTriangle, ShoppingBag, GraduationCap, TrendingUp, Users, Clock } from "lucide-react"
import { Link } from "react-router-dom"

export default function DashboardPage() {
  const { user } = useAuth()

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

  const stats = [
    {
      title: "Reportes Activos",
      value: "12",
      icon: AlertTriangle,
      trend: "+2 esta semana",
    },
    {
      title: "Productos en Venta",
      value: "48",
      icon: ShoppingBag,
      trend: "+8 nuevos hoy",
    },
    {
      title: "Tutorías Disponibles",
      value: "23",
      icon: Users,
      trend: "5 materias",
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
                      <p className="text-2xl font-bold">{stat.value}</p>
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
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-muted-foreground">Hace 2 horas</span>
                <span>Nuevo producto publicado en Marketplace</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-muted-foreground">Hace 4 horas</span>
                <span>Tutoría de Matemáticas programada</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-muted-foreground">Ayer</span>
                <span>Reporte de seguridad actualizado</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
