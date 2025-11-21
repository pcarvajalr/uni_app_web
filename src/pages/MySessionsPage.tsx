import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Star, Calendar, Clock, MapPin, MessageSquare, CheckCircle, X } from "lucide-react"
import { useState } from "react"

interface Session {
  id: string
  studentName: string
  subject: string
  date: string
  time: string
  duration: number
  location: string
  status: "programada" | "completada" | "cancelada"
  price: number
  rating?: number
  review?: string
  modalidad: "presencial" | "virtual"
}

interface Request {
  id: string
  studentName: string
  subject: string
  requestedDate: string
  duration: number
  message: string
  status: "pendiente" | "aceptada" | "rechazada"
  price: number
}

export default function MySessionsPage() {
  const [selectedTab, setSelectedTab] = useState("sesiones")
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: "1",
      studentName: "Juan Pérez",
      subject: "Cálculo Diferencial",
      date: "2024-01-20",
      time: "14:00",
      duration: 60,
      location: "Biblioteca Central",
      status: "programada",
      price: 25000,
      modalidad: "presencial",
    },
    {
      id: "2",
      studentName: "María López",
      subject: "Cálculo Integral",
      date: "2024-01-18",
      time: "10:00",
      duration: 90,
      location: "Sala Virtual",
      status: "completada",
      price: 37500,
      rating: 5,
      review: "Excelente tutor, muy clara la explicación",
      modalidad: "virtual",
    },
    {
      id: "3",
      studentName: "Carlos Ruiz",
      subject: "Álgebra Lineal",
      date: "2024-01-15",
      time: "16:00",
      duration: 120,
      location: "Laboratorio de Sistemas",
      status: "completada",
      price: 50000,
      rating: 4.5,
      review: "Muy buena sesión, aprendi mucho",
      modalidad: "presencial",
    },
    {
      id: "4",
      studentName: "Ana García",
      subject: "Cálculo Diferencial",
      date: "2024-01-10",
      time: "15:00",
      duration: 60,
      location: "Campus",
      status: "cancelada",
      price: 25000,
      modalidad: "presencial",
    },
  ])

  const [requests, setRequests] = useState<Request[]>([
    {
      id: "1",
      studentName: "Diego Morales",
      subject: "Cálculo Diferencial",
      requestedDate: "2024-01-22",
      duration: 60,
      message: "Necesito ayuda con derivadas implícitas",
      status: "pendiente",
      price: 25000,
    },
    {
      id: "2",
      studentName: "Laura Martínez",
      subject: "Cálculo Integral",
      requestedDate: "2024-01-25",
      duration: 90,
      message: "Integración por partes",
      status: "aceptada",
      price: 37500,
    },
  ])

  const [showEvaluationDialog, setShowEvaluationDialog] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState("")

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "programada":
        return "bg-blue-100 text-blue-800"
      case "completada":
        return "bg-green-100 text-green-800"
      case "cancelada":
        return "bg-red-100 text-red-800"
      case "pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "aceptada":
        return "bg-green-100 text-green-800"
      case "rechazada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalEarnings = sessions.filter((s) => s.status === "completada").reduce((sum, s) => sum + s.price, 0)
  const completedSessions = sessions.filter((s) => s.status === "completada").length
  const upcomingSessions = sessions.filter((s) => s.status === "programada").length
  const averageRating =
    completedSessions > 0
      ? (
          sessions.filter((s) => s.rating && s.status === "completada").reduce((sum, s) => sum + (s.rating || 0), 0) /
          sessions.filter((s) => s.rating).length
        ).toFixed(1)
      : 0

  const handleAcceptRequest = (id: string) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: "aceptada" } : r)))
  }

  const handleRejectRequest = (id: string) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: "rechazada" } : r)))
  }

  const handleSubmitEvaluation = () => {
    if (selectedSession) {
      setSessions(sessions.map((s) => (s.id === selectedSession.id ? { ...s, rating, review } : s)))
      setShowEvaluationDialog(false)
      setSelectedSession(null)
      setRating(5)
      setReview("")
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Mi Panel de Tutorías</h1>
          <p className="text-muted-foreground">Gestiona tus sesiones y estudiantes</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{formatPrice(totalEarnings)}</div>
              <p className="text-sm text-muted-foreground">Ganancias Totales</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{completedSessions}</div>
              <p className="text-sm text-muted-foreground">Sesiones Completadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{upcomingSessions}</div>
              <p className="text-sm text-muted-foreground">Próximas Sesiones</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{averageRating}</div>
              <p className="text-sm text-muted-foreground">Rating Promedio</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sesiones">Mis Sesiones</TabsTrigger>
            <TabsTrigger value="solicitudes">
              Solicitudes ({requests.filter((r) => r.status === "pendiente").length})
            </TabsTrigger>
            <TabsTrigger value="calendario">Calendario</TabsTrigger>
          </TabsList>

          {/* Sessions Tab */}
          <TabsContent value="sesiones" className="space-y-4">
            {/* Upcoming Sessions */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Próximas Sesiones</h3>
              {sessions
                .filter((s) => s.status === "programada")
                .map((session) => (
                  <Card key={session.id} className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{session.studentName}</h4>
                          <p className="text-sm text-muted-foreground">{session.subject}</p>
                        </div>
                        <Badge className={getStatusColor(session.status)}>{session.status}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{session.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {session.time} ({session.duration} min)
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {session.modalidad === "presencial" ? (
                            <>
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{session.location}</span>
                            </>
                          ) : (
                            <>
                              <MessageSquare className="h-4 w-4 text-muted-foreground" />
                              <span>Virtual</span>
                            </>
                          )}
                        </div>
                        <div className="text-right font-bold text-primary">{formatPrice(session.price)}</div>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" className="flex-1">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Completar
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Contactar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>

            {/* Completed Sessions */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Sesiones Completadas</h3>
              {sessions
                .filter((s) => s.status === "completada")
                .map((session) => (
                  <Card key={session.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{session.studentName}</h4>
                          <p className="text-sm text-muted-foreground">{session.subject}</p>
                        </div>
                        <Badge className={getStatusColor(session.status)}>{session.status}</Badge>
                      </div>

                      {session.rating && (
                        <div className="bg-muted p-3 rounded-lg mb-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="flex items-center">
                              {Array.from({ length: Math.round(session.rating) }).map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                            <span className="font-medium">{session.rating}</span>
                          </div>
                          <p className="text-sm italic">"{session.review}"</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{session.date}</span>
                        <span className="font-bold text-green-600">{formatPrice(session.price)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="solicitudes" className="space-y-4">
            <div className="space-y-3">
              {requests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{request.studentName}</h4>
                        <p className="text-sm text-muted-foreground">{request.subject}</p>
                      </div>
                      <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                    </div>

                    <div className="bg-muted p-3 rounded-lg mb-3">
                      <p className="text-sm">{request.message}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{request.requestedDate}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{request.duration} minutos</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">{formatPrice(request.price)}</span>
                      {request.status === "pendiente" && (
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={() => handleAcceptRequest(request.id)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aceptar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleRejectRequest(request.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {request.status === "aceptada" && (
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Contactar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendario" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Calendario de Sesiones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">
                          {session.date} - {session.time}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {session.studentName} - {session.subject}
                        </p>
                      </div>
                      <Badge className={getStatusColor(session.status)}>{session.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Evaluation Dialog */}
      <Dialog open={showEvaluationDialog} onOpenChange={setShowEvaluationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Evaluar Sesión</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Calificación</label>
              <div className="flex space-x-2 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button key={i} onClick={() => setRating(i + 1)} className="focus:outline-none">
                    <Star className={`h-6 w-6 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Comentarios</label>
              <Textarea
                placeholder="Comparte tus comentarios sobre la sesión..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="mt-2"
              />
            </div>
            <Button onClick={handleSubmitEvaluation} className="w-full">
              Guardar Evaluación
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
