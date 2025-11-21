"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, MapPin, Clock, Users, MessageCircle, Calendar, Heart } from "lucide-react"
import { useState } from "react"

interface Tutor {
  id: string
  name: string
  studentId: string
  subjects: string[]
  rating: number
  reviewCount: number
  hourlyRate: number
  availability: string[]
  location: string
  description: string
  experience: string
  languages: string[]
  avatar?: string
}

interface TutoringDetailsDialogProps {
  tutor: Tutor | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TutoringDetailsDialog({ tutor, open, onOpenChange }: TutoringDetailsDialogProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  if (!tutor) return null

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
  }

  const mockReviews = [
    {
      id: 1,
      student: "Juan Pérez",
      rating: 5,
      comment: "Excelente tutor, muy paciente y explica muy bien los conceptos de cálculo.",
      date: "2024-01-10",
    },
    {
      id: 2,
      student: "Laura Gómez",
      rating: 5,
      comment: "Me ayudó mucho a entender álgebra lineal. Altamente recomendado.",
      date: "2024-01-08",
    },
    {
      id: 3,
      student: "Miguel Torres",
      rating: 4,
      comment: "Buen tutor, puntual y preparado. Las sesiones fueron muy útiles.",
      date: "2024-01-05",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Perfil del Tutor</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFavorite(!isFavorite)}
              className={isFavorite ? "text-red-500" : "text-gray-400"}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
          </DialogTitle>
          <DialogDescription>Información detallada y reseñas</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tutor Header */}
          <div className="flex items-start space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {getInitials(tutor.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-2xl font-bold">{tutor.name}</h2>
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 fill-current text-yellow-400" />
                  <span className="font-medium">{tutor.rating}</span>
                  <span className="text-muted-foreground">({tutor.reviewCount} reseñas)</span>
                </div>
              </div>

              <p className="text-muted-foreground mb-3">ID: {tutor.studentId}</p>

              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {tutor.location}
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {tutor.experience} experiencia
                </span>
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {tutor.languages.join(", ")}
                </span>
              </div>

              <div className="text-3xl font-bold text-primary">{formatPrice(tutor.hourlyRate)}/hora</div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-semibold">Sobre el Tutor</h3>
            <p className="text-muted-foreground leading-relaxed">{tutor.description}</p>
          </div>

          {/* Subjects */}
          <div className="space-y-2">
            <h3 className="font-semibold">Materias</h3>
            <div className="flex flex-wrap gap-2">
              {tutor.subjects.map((subject, index) => (
                <Badge key={index} variant="secondary">
                  {subject}
                </Badge>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <h3 className="font-semibold">Disponibilidad</h3>
            <div className="grid grid-cols-2 gap-2">
              {tutor.availability.map((slot, index) => (
                <div key={index} className="text-sm bg-muted p-2 rounded">
                  {slot}
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="space-y-4">
            <h3 className="font-semibold">Reseñas Recientes</h3>
            <div className="space-y-3">
              {mockReviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{review.student}</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? "fill-current text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{review.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4 border-t">
            <Button className="flex-1">
              <Calendar className="h-4 w-4 mr-2" />
              Reservar Sesión
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              <MessageCircle className="h-4 w-4 mr-2" />
              Enviar Mensaje
            </Button>
          </div>

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
