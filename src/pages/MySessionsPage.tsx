import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Star,
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  CheckCircle,
  X,
  Play,
  UserX,
  Loader2,
  Plus,
  AlertCircle,
  Edit,
  Pause,
  GraduationCap,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import {
  useTutorBookings,
  useStudentBookings,
  useConfirmBooking,
  useRejectBooking,
  useCancelBooking,
  useStartSession,
  useCompleteSession,
  useMarkNoShow,
  useAddBookingReview,
} from "@/hooks/useTutoringBookings"
import {
  useMyTutoringSessions,
  usePauseTutoringSession,
  useActivateTutoringSession,
} from "@/hooks/useTutoringSessions"
import { CreateTutoringDialog } from "@/components/tutoring/create-tutoring-dialog"
import { EditTutoringDialog } from "@/components/tutoring/edit-tutoring-dialog"
import { TutoringMessages, ConversationItem } from "@/components/tutoring/tutoring-messages"
import { useUserConversations, useUnreadMessageCount } from "@/hooks/useTutoringMessages"
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  type BookingStatus,
  type TutoringSessionWithTutor,
} from "@/types/tutoring.types"
import { getTutorActions, getStudentActions } from "@/lib/booking-states"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function MySessionsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedTab, setSelectedTab] = useState("student")
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showMessagesDialog, setShowMessagesDialog] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<{
    id: string
    name: string
    avatar?: string | null
    sessionId: string
  } | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedSessionForEdit, setSelectedSessionForEdit] = useState<TutoringSessionWithTutor | null>(null)
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())

  // Fetch data
  const { data: tutorBookings, isLoading: tutorLoading, error: tutorError, refetch: refetchTutorBookings } = useTutorBookings()
  const { data: studentBookings, isLoading: studentLoading, error: studentError, refetch: refetchStudentBookings } = useStudentBookings()
  const { data: mySessions, isLoading: sessionsLoading, error: sessionsError, refetch: refetchSessions } = useMyTutoringSessions()
  const { data: conversations, isLoading: conversationsLoading } = useUserConversations(user?.id || '')
  const { data: unreadCount } = useUnreadMessageCount(user?.id || '')

  // Auto-expand sessions with unread messages
  useEffect(() => {
    if (conversations && conversations.length > 0) {
      const sessionsWithUnread = new Set<string>()
      for (const conv of conversations) {
        if (conv.unreadCount > 0) {
          sessionsWithUnread.add(conv.sessionId || 'direct')
        }
      }
      if (sessionsWithUnread.size > 0) {
        setExpandedSessions((prev) => {
          const next = new Set(prev)
          for (const id of sessionsWithUnread) {
            next.add(id)
          }
          return next
        })
      }
    }
  }, [conversations])

  // Mutations
  const confirmBooking = useConfirmBooking()
  const rejectBooking = useRejectBooking()
  const cancelBooking = useCancelBooking()
  const startSession = useStartSession()
  const completeSession = useCompleteSession()
  const markNoShow = useMarkNoShow()
  const addReview = useAddBookingReview()
  const pauseSession = usePauseTutoringSession()
  const activateSession = useActivateTutoringSession()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (date: string) => {
    return format(new Date(date), "dd MMM yyyy", { locale: es })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Calculate stats for tutor
  const tutorStats = {
    totalEarnings: tutorBookings
      ?.filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + b.total_price, 0) || 0,
    completedSessions: tutorBookings?.filter((b) => b.status === "completed").length || 0,
    upcomingSessions: tutorBookings?.filter((b) => b.status === "confirmed" || b.status === "pending").length || 0,
    averageRating: tutorBookings && tutorBookings.length > 0
      ? (tutorBookings
          .filter((b) => b.student_rating)
          .reduce((sum, b) => sum + (b.student_rating || 0), 0) /
          tutorBookings.filter((b) => b.student_rating).length) || 0
      : 0,
  }

  // Handle tutor actions
  const handleTutorAction = async (
    bookingId: string,
    action: "confirm" | "reject" | "start" | "complete" | "no_show"
  ) => {
    try {
      switch (action) {
        case "confirm":
          await confirmBooking.mutateAsync(bookingId)
          toast({ title: "Reserva confirmada" })
          break
        case "reject":
          await rejectBooking.mutateAsync(bookingId)
          toast({ title: "Reserva rechazada" })
          break
        case "start":
          await startSession.mutateAsync(bookingId)
          toast({ title: "Sesión iniciada" })
          break
        case "complete":
          await completeSession.mutateAsync(bookingId)
          toast({ title: "Sesión completada" })
          break
        case "no_show":
          await markNoShow.mutateAsync(bookingId)
          toast({ title: "Marcada como no asistió" })
          break
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // Handle student cancel
  const handleStudentCancel = async (bookingId: string) => {
    try {
      await cancelBooking.mutateAsync(bookingId)
      toast({ title: "Reserva cancelada" })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!selectedBookingId) return

    try {
      await addReview.mutateAsync({
        bookingId: selectedBookingId,
        review: { rating, review },
      })
      toast({ title: "Reseña enviada" })
      setShowReviewDialog(false)
      setSelectedBookingId(null)
      setRating(5)
      setReview("")
      refetchStudentBookings()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // Handle pause session
  const handlePauseSession = async (sessionId: string) => {
    try {
      await pauseSession.mutateAsync(sessionId)
      toast({ title: "Sesión pausada", description: "La sesión no recibirá nuevas reservas" })
      refetchSessions()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // Handle activate session
  const handleActivateSession = async (sessionId: string) => {
    try {
      await activateSession.mutateAsync(sessionId)
      toast({ title: "Sesión activada", description: "La sesión ahora está disponible para reservas" })
      refetchSessions()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const openReviewDialog = (bookingId: string) => {
    setSelectedBookingId(bookingId)
    setShowReviewDialog(true)
  }

  const isPending = confirmBooking.isPending || rejectBooking.isPending ||
    cancelBooking.isPending || startSession.isPending ||
    completeSession.isPending || markNoShow.isPending

  const toggleSessionExpanded = (sessionId: string) => {
    setExpandedSessions((prev) => {
      const next = new Set(prev)
      if (next.has(sessionId)) {
        next.delete(sessionId)
      } else {
        next.add(sessionId)
      }
      return next
    })
  }

  // Group conversations by session
  const conversationsBySession = (conversations || []).reduce<
    Record<string, { sessionTitle: string; sessionId: string; conversations: typeof conversations }>
  >((acc, conv) => {
    const key = conv.sessionId || 'direct'
    if (!acc[key]) {
      acc[key] = {
        sessionTitle: conv.sessionTitle || 'Mensaje directo',
        sessionId: conv.sessionId,
        conversations: [],
      }
    }
    acc[key].conversations!.push(conv)
    return acc
  }, {})

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mi Panel de Tutorías</h1>
            <p className="text-muted-foreground">Gestiona tus sesiones como tutor y estudiante</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
            <TabsTrigger value="student">
              Como Estudiante ({studentBookings?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="tutor">
              Como Tutor ({tutorBookings?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="sessions">
              Mis Sesiones ({mySessions?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="messages" className="relative">
              Mensajes
              {(unreadCount ?? 0) > 0 && (
                <span className="ml-1 bg-orange-500 text-white text-xs rounded-full h-5 min-w-[20px] px-1 inline-flex items-center justify-center">
                  {unreadCount! > 9 ? "9+" : unreadCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tutor Tab */}
          <TabsContent value="tutor" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-2">
                <CardContent className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(tutorStats.totalEarnings)}
                  </div>
                  <p className="text-sm text-muted-foreground">Ganancias Totales</p>
                </CardContent>
              </Card>
              <Card className="p-2">
                <CardContent className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {tutorStats.completedSessions}
                  </div>
                  <p className="text-sm text-muted-foreground">Sesiones Completadas</p>
                </CardContent>
              </Card>
              <Card className="p-2">
                <CardContent className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {tutorStats.upcomingSessions}
                  </div>
                  <p className="text-sm text-muted-foreground">Próximas Sesiones</p>
                </CardContent>
              </Card>
              <Card className="p-2">
                <CardContent className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {tutorStats.averageRating > 0 ? tutorStats.averageRating.toFixed(1) : "N/A"}
                  </div>
                  <p className="text-sm text-muted-foreground">Rating Promedio</p>
                </CardContent>
              </Card>
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Reservas Recibidas</h3>

              {tutorError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error al cargar reservas</AlertTitle>
                  <AlertDescription className="flex flex-col gap-2">
                    <p>{tutorError.message || "No se pudieron cargar las reservas recibidas"}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchTutorBookings()}
                      className="w-fit"
                    >
                      Reintentar
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {tutorLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                  </Card>
                ))
              ) : tutorBookings && tutorBookings.length > 0 ? (
                tutorBookings.map((booking) => {
                  const actions = getTutorActions(booking.status as BookingStatus)
                  return (
                    <Card key={booking.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={booking.student?.avatar_url || undefined} />
                              <AvatarFallback>
                                {getInitials(booking.student?.full_name || "Usuario")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold">{booking.student?.full_name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {booking.session?.subject || booking.session?.title}
                              </p>
                            </div>
                          </div>
                          <Badge className={BOOKING_STATUS_COLORS[booking.status as BookingStatus]}>
                            {BOOKING_STATUS_LABELS[booking.status as BookingStatus]}
                          </Badge>
                        </div>

                        {booking.notes && (
                          <div className="bg-muted p-3 rounded-lg mb-3">
                            <p className="text-sm">{booking.notes}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(booking.scheduled_date)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {booking.scheduled_time} ({booking.duration_minutes} min)
                            </span>
                          </div>
                          {booking.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{booking.location}</span>
                            </div>
                          )}
                          <div className="text-right font-bold text-primary">
                            {formatPrice(booking.total_price)}
                          </div>
                        </div>

                        {/* Tutor Review if completed */}
                        {booking.status === "completed" && booking.student_rating && (
                          <div className="bg-muted p-3 rounded-lg mb-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="flex items-center">
                                {Array.from({ length: Math.round(booking.student_rating) }).map((_, i) => (
                                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                              <span className="font-medium">{booking.student_rating}</span>
                            </div>
                            {booking.student_review && (
                              <p className="text-sm italic">"{booking.student_review}"</p>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          {actions.canConfirm && (
                            <Button
                              size="sm"
                              onClick={() => handleTutorAction(booking.id, "confirm")}
                              disabled={isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Confirmar
                            </Button>
                          )}
                          {actions.canReject && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleTutorAction(booking.id, "reject")}
                              disabled={isPending}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Rechazar
                            </Button>
                          )}
                          {actions.canStart && (
                            <Button
                              size="sm"
                              onClick={() => handleTutorAction(booking.id, "start")}
                              disabled={isPending}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Iniciar
                            </Button>
                          )}
                          {actions.canComplete && (
                            <Button
                              size="sm"
                              onClick={() => handleTutorAction(booking.id, "complete")}
                              disabled={isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Completar
                            </Button>
                          )}
                          {actions.canMarkNoShow && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTutorAction(booking.id, "no_show")}
                              disabled={isPending}
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              No Asistió
                            </Button>
                          )}
                          {actions.canCancel && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTutorAction(booking.id, "reject")}
                              disabled={isPending}
                            >
                              Cancelar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedStudent({
                                id: booking.student_id,
                                name: booking.student?.full_name || "Estudiante",
                                avatar: booking.student?.avatar_url,
                                sessionId: booking.session_id,
                              })
                              setShowMessagesDialog(true)
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Mensajes
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No tienes reservas como tutor</p>
                    <Button
                      className="mt-4"
                      onClick={() => setShowCreateDialog(true)}
                    >
                      Crear mi primera sesión
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Student Tab */}
          <TabsContent value="student" className="space-y-4">
            <h3 className="font-semibold text-lg">Mis Reservas como Estudiante</h3>

            {studentError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error al cargar reservas</AlertTitle>
                <AlertDescription className="flex flex-col gap-2">
                  <p>{studentError.message || "No se pudieron cargar tus reservas"}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchStudentBookings()}
                    className="w-fit"
                  >
                    Reintentar
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {studentLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : studentBookings && studentBookings.length > 0 ? (
              studentBookings.map((booking) => {
                const actions = getStudentActions(booking.status as BookingStatus)
                return (
                  <Card key={booking.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={booking.tutor?.avatar_url || undefined} />
                            <AvatarFallback>
                              {getInitials(booking.tutor?.full_name || "Tutor")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{booking.tutor?.full_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {booking.session?.subject || booking.session?.title}
                            </p>
                          </div>
                        </div>
                        <Badge className={BOOKING_STATUS_COLORS[booking.status as BookingStatus]}>
                          {BOOKING_STATUS_LABELS[booking.status as BookingStatus]}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(booking.scheduled_date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {booking.scheduled_time} ({booking.duration_minutes} min)
                          </span>
                        </div>
                        {booking.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.location}</span>
                          </div>
                        )}
                        <div className="text-right font-bold text-primary">
                          {formatPrice(booking.total_price)}
                        </div>
                      </div>

                      {/* My review if given */}
                      {booking.student_rating && (
                        <div className="bg-muted p-3 rounded-lg mb-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium">Mi reseña:</span>
                            <div className="flex items-center">
                              {Array.from({ length: Math.round(booking.student_rating) }).map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          {booking.student_review && (
                            <p className="text-sm italic">"{booking.student_review}"</p>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {actions.canCancel && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStudentCancel(booking.id)}
                            disabled={isPending}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        )}
                        {actions.canReview && !booking.student_rating && (
                          <Button
                            size="sm"
                            onClick={() => openReviewDialog(booking.id)}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Dejar Reseña
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedStudent({
                              id: booking.tutor_id,
                              name: booking.tutor?.full_name || "Tutor",
                              avatar: booking.tutor?.avatar_url,
                              sessionId: booking.session_id,
                            })
                            setShowMessagesDialog(true)
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Mensajes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No tienes reservas como estudiante</p>
                  <Button
                    className="mt-4"
                    variant="outline"
                    onClick={() => window.location.href = "/tutoring"}
                  >
                    Buscar tutorías
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* My Sessions Tab */}
          <TabsContent value="sessions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Mis Sesiones de Tutoría</h3>
              <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Nueva
              </Button>
            </div>

            {sessionsError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error al cargar tus sesiones</AlertTitle>
                <AlertDescription className="flex flex-col gap-2">
                  <p>{sessionsError.message || "No se pudieron cargar tus sesiones de tutoría"}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchSessions()}
                    className="w-fit"
                  >
                    Reintentar
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {sessionsLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : mySessions && mySessions.length > 0 ? (
              mySessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4">
                      {/* Session Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{session.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{session.subject}</p>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {session.description}
                            </p>
                            <div className="flex items-center gap-4 mt-3 text-sm">
                              <span className="font-semibold text-primary">
                                {formatPrice(session.price_per_hour)}/hora
                              </span>
                              <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                                {session.status === 'active' ? 'Activa' : 'Pausada'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedSessionForEdit(session)
                            setShowEditDialog(true)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        {session.status === 'active' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePauseSession(session.id)}
                          >
                            <Pause className="h-4 w-4 mr-1" />
                            Pausar
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleActivateSession(session.id)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Activar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No has creado ninguna sesión de tutoría
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setShowCreateDialog(true)}
                  >
                    Crear mi primera sesión
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4">
            <h3 className="font-semibold text-lg">Mis Conversaciones</h3>

            {conversationsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : Object.keys(conversationsBySession).length > 0 ? (
              Object.entries(conversationsBySession).map(([key, group]) => {
                const isExpanded = expandedSessions.has(key)
                const sessionUnread = group.conversations!.reduce((sum, c) => sum + c.unreadCount, 0)

                return (
                  <Card key={key}>
                    <button
                      className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
                      onClick={() => toggleSessionExpanded(key)}
                    >
                      <GraduationCap className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold truncate block">{group.sessionTitle}</span>
                        <span className="text-xs text-muted-foreground">
                          {group.conversations!.length} {group.conversations!.length === 1 ? 'conversación' : 'conversaciones'}
                        </span>
                      </div>
                      {sessionUnread > 0 && (
                        <span className="bg-orange-500 text-white text-xs rounded-full h-5 min-w-[20px] px-1 inline-flex items-center justify-center">
                          {sessionUnread > 9 ? "9+" : sessionUnread}
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                    {isExpanded && (
                      <CardContent className="p-2 pt-0 border-t">
                        {group.conversations!.map((conv) => (
                          <ConversationItem
                            key={`${conv.sessionId}-${conv.participant.id}`}
                            participant={conv.participant}
                            lastMessage={conv.lastMessage.content || ''}
                            lastMessageDate={conv.lastMessage.created_at}
                            unreadCount={conv.unreadCount}
                            onClick={() => {
                              setSelectedStudent({
                                id: conv.participant.id,
                                name: conv.participant.full_name || "Usuario",
                                avatar: conv.participant.avatar_url,
                                sessionId: conv.sessionId,
                              })
                              setShowMessagesDialog(true)
                            }}
                          />
                        ))}
                      </CardContent>
                    )}
                  </Card>
                )
              })
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tienes conversaciones aún</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Evaluar Sesión</DialogTitle>
            <DialogDescription>
              Comparte tu experiencia con esta sesión de tutoría
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Calificación</Label>
              <div className="flex space-x-2 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setRating(i + 1)}
                    className="focus:outline-none"
                    type="button"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Comentarios (opcional)</Label>
              <Textarea
                placeholder="Comparte tu experiencia con esta sesión..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
            <Button
              onClick={handleSubmitReview}
              className="w-full"
              disabled={addReview.isPending}
            >
              {addReview.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Guardar Evaluación"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Session Dialog */}
      <CreateTutoringDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => refetchSessions()}
      />

      {/* Messages Dialog */}
      <Dialog open={showMessagesDialog} onOpenChange={setShowMessagesDialog}>
        <DialogContent className="max-w-2xl h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Conversación con {selectedStudent?.name}
            </DialogTitle>
            <DialogDescription>
              Historial completo de mensajes
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && user && (
            <TutoringMessages
              sessionId={selectedStudent.sessionId || undefined}
              studentId={selectedStudent.id}
              tutorId={selectedTab === "tutor" || selectedTab === "messages" ? user.id : selectedStudent.id}
              tutorName={selectedStudent.name}
              tutorAvatar={selectedStudent.avatar}
              className="flex-1"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Session Dialog */}
      {selectedSessionForEdit && (
        <EditTutoringDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          session={selectedSessionForEdit}
          onSuccess={() => {
            refetchSessions()
            setSelectedSessionForEdit(null)
          }}
        />
      )}
    </AppLayout>
  )
}
