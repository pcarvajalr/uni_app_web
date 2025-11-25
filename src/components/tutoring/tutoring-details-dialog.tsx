"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MapPin, Clock, Video, MessageCircle, Calendar as CalendarIcon, Heart, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { useToggleTutoringFavorite, useSessionReviews } from "@/hooks/useTutoringSessions"
import { useCreateBooking, useBookedSlots } from "@/hooks/useTutoringBookings"
import { useUnreadMessageCountForSession } from "@/hooks/useTutoringMessages"
import { parseAvailableHours, getBookingSlotsForDate, formatTimeForDisplay, getDayOfWeekFromDate, hasAvailabilityOnDate } from "@/lib/availability-utils"
import { MODE_LABELS, DAY_LABELS } from "@/types/tutoring.types"
import type { TutoringSessionWithTutor, DayOfWeek, SessionMode } from "@/types/tutoring.types"
import { format, addDays, isBefore, startOfDay } from "date-fns"
import { es } from "date-fns/locale"
import { TutoringMessages } from "./tutoring-messages"

export interface TutoringDetailsDialogProps {
  session: TutoringSessionWithTutor | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TutoringDetailsDialog({ session, open, onOpenChange }: TutoringDetailsDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const toggleFavorite = useToggleTutoringFavorite()
  const createBooking = useCreateBooking()

  // Booking state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [selectedDuration, setSelectedDuration] = useState<number>(60)
  const [bookingNotes, setBookingNotes] = useState("")
  const [showBookingForm, setShowBookingForm] = useState(false)

  // Get booked slots for selected date
  const formattedDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""
  const { data: bookedSlots } = useBookedSlots(session?.id, formattedDate)
  const { data: reviews, isLoading: reviewsLoading } = useSessionReviews(session?.id)
  const { data: unreadCount } = useUnreadMessageCountForSession({
    tutoring_session_id: session?.id || "",
    user_id: user?.id || "",
    enabled: !!session?.id && !!user?.id,
  })

  // Reset booking form when session changes
  useEffect(() => {
    if (!open) {
      setSelectedDate(undefined)
      setSelectedTime("")
      setSelectedDuration(60)
      setBookingNotes("")
      setShowBookingForm(false)
    }
  }, [open])

  if (!session) return null

  const availableHours = parseAvailableHours(session.available_hours)
  const isOwnSession = user?.id === session.tutor_id

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleFavoriteClick = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar favoritos",
        variant: "destructive",
      })
      return
    }
    toggleFavorite.mutate(session.id)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTime("") // Reset time when date changes
  }

  // Get available time slots for selected date
  const getAvailableTimeSlots = () => {
    if (!selectedDate) return []

    const allSlots = getBookingSlotsForDate(availableHours, formattedDate)
    const bookedSet = new Set(bookedSlots || [])

    return allSlots.filter(slot => !bookedSet.has(slot))
  }

  const availableTimeSlots = getAvailableTimeSlots()

  // Date disabled check
  const isDateDisabled = (date: Date) => {
    // Disable past dates
    if (isBefore(date, startOfDay(new Date()))) return true

    // Disable dates without availability
    const dateString = format(date, "yyyy-MM-dd")
    return !hasAvailabilityOnDate(availableHours, dateString)
  }

  const handleBookSession = async () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para reservar una sesión",
        variant: "destructive",
      })
      return
    }

    if (!selectedDate || !selectedTime) {
      toast({
        title: "Selecciona fecha y hora",
        description: "Debes seleccionar una fecha y hora para la reserva",
        variant: "destructive",
      })
      return
    }

    try {
      await createBooking.mutateAsync({
        sessionId: session.id,
        scheduledDate: formattedDate,
        scheduledTime: selectedTime,
        durationMinutes: selectedDuration,
        notes: bookingNotes || undefined,
      })

      toast({
        title: "Reserva creada",
        description: "Tu solicitud de reserva ha sido enviada al tutor",
      })

      setShowBookingForm(false)
      setSelectedDate(undefined)
      setSelectedTime("")
      setBookingNotes("")
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la reserva",
        variant: "destructive",
      })
    }
  }

  const totalPrice = (selectedDuration / 60) * session.price_per_hour

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalles de la Sesión</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteClick}
              className={session.is_favorite ? "text-red-500" : "text-gray-400"}
            >
              <Heart className={`h-5 w-5 ${session.is_favorite ? "fill-current" : ""}`} />
            </Button>
          </DialogTitle>
          <DialogDescription>Información detallada y opciones de reserva</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tutor Header */}
          <div className="flex items-start space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={session.tutor.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {getInitials(session.tutor.full_name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{session.title}</h2>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-muted-foreground">{session.tutor.full_name}</span>
                {session.rating !== null && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                    <span className="font-medium">{session.rating.toFixed(1)}</span>
                    {session.total_bookings && (
                      <span className="text-muted-foreground text-sm">
                        ({session.total_bookings} reseñas)
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center">
                  {session.mode === "online" ? (
                    <Video className="h-4 w-4 mr-1" />
                  ) : (
                    <MapPin className="h-4 w-4 mr-1" />
                  )}
                  {MODE_LABELS[session.mode as SessionMode]}
                </span>
                {session.location && (
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {session.location}
                  </span>
                )}
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {session.duration_minutes} min
                </span>
              </div>

              <div className="text-2xl font-bold text-primary mt-3">
                {formatPrice(session.price_per_hour)}/hora
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-semibold">Descripción</h3>
            <p className="text-muted-foreground leading-relaxed">{session.description}</p>
          </div>

          {/* Subject and Category */}
          <div className="space-y-2">
            <h3 className="font-semibold">Materia</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{session.subject}</Badge>
              {session.category && (
                <Badge variant="outline">{session.category.name}</Badge>
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <h3 className="font-semibold">Disponibilidad Horaria</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(availableHours).map(([day, slots]) => {
                if (!slots || slots.length === 0) return null
                return (
                  <div key={day} className="text-sm bg-muted p-2 rounded">
                    <span className="font-medium">{DAY_LABELS[day as DayOfWeek]}:</span>{" "}
                    {slots.map((s: string) => s.replace("-", " a ")).join(", ")}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Reseñas</h3>
            {reviewsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : reviews && reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={review.student.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(review.student.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{review.student.full_name}</span>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.student_rating ? "fill-current text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.completed_at && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(review.completed_at), "dd MMM yyyy", { locale: es })}
                        </span>
                      )}
                    </div>
                    {review.student_review && (
                      <p className="text-sm text-muted-foreground">{review.student_review}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aún no hay reseñas para esta sesión</p>
            )}
          </div>

          {/* Booking and Messages Section */}
          {!isOwnSession && user && (
            <Tabs defaultValue="booking" className="pt-4 border-t">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="booking" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Reservar
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Mensajes
                  {unreadCount && unreadCount > 0 && (
                    <span className="bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="booking" className="mt-4">
                {!showBookingForm ? (
                  <Button className="w-full" onClick={() => setShowBookingForm(true)}>
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Reservar Sesión
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Reservar Sesión</h3>

                    {/* Date Selection */}
                    <div className="space-y-2">
                      <Label>Selecciona una fecha</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={isDateDisabled}
                        fromDate={new Date()}
                        toDate={addDays(new Date(), 60)}
                        locale={es}
                        className="rounded-md border"
                      />
                    </div>

                    {/* Time Selection */}
                    {selectedDate && (
                      <div className="space-y-2">
                        <Label>Selecciona un horario</Label>
                        {availableTimeSlots.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {availableTimeSlots.map((time) => (
                              <Button
                                key={time}
                                type="button"
                                variant={selectedTime === time ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedTime(time)}
                              >
                                {formatTimeForDisplay(time)}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No hay horarios disponibles para esta fecha
                          </p>
                        )}
                      </div>
                    )}

                    {/* Duration Selection */}
                    {selectedTime && (
                      <div className="space-y-2">
                        <Label>Duración</Label>
                        <Select
                          value={selectedDuration.toString()}
                          onValueChange={(v) => setSelectedDuration(parseInt(v))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 minutos</SelectItem>
                            <SelectItem value="60">1 hora</SelectItem>
                            <SelectItem value="90">1.5 horas</SelectItem>
                            <SelectItem value="120">2 horas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Notes */}
                    {selectedTime && (
                      <div className="space-y-2">
                        <Label>Notas para el tutor (opcional)</Label>
                        <Textarea
                          placeholder="Describe qué temas te gustaría cubrir, tu nivel actual, etc."
                          value={bookingNotes}
                          onChange={(e) => setBookingNotes(e.target.value)}
                          rows={3}
                        />
                      </div>
                    )}

                    {/* Price Summary */}
                    {selectedTime && (
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span>Duración:</span>
                          <span>{selectedDuration} minutos</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span>Tarifa por hora:</span>
                          <span>{formatPrice(session.price_per_hour)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                          <span>Total:</span>
                          <span className="text-primary">{formatPrice(totalPrice)}</span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowBookingForm(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={handleBookSession}
                        disabled={!selectedDate || !selectedTime || createBooking.isPending}
                      >
                        {createBooking.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Reservando...
                          </>
                        ) : (
                          "Confirmar Reserva"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="messages" className="mt-4">
                <TutoringMessages
                  sessionId={session.id}
                  tutorId={session.tutor_id}
                  tutorName={session.tutor.full_name}
                  tutorAvatar={session.tutor.avatar_url}
                  className="min-h-[300px]"
                />
              </TabsContent>
            </Tabs>
          )}

          {/* Safety Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Consejos para Tutorías Seguras</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Reúnete en espacios públicos del campus</li>
              <li>• Confirma la identidad del tutor antes de la sesión</li>
              <li>• Acuerda el precio y duración antes de comenzar</li>
              <li>• Reporta cualquier comportamiento inapropiado</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
