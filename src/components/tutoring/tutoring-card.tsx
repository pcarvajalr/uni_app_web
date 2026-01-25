"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Clock, Heart, Video, Users, Pause } from "lucide-react"
import type { TutoringSessionWithTutor, SessionMode } from "@/types/tutoring.types"
import { parseAvailableHours, formatAvailabilitySummary } from "@/lib/availability-utils"
import { MODE_LABELS } from "@/types/tutoring.types"
import AppIcon from "@/assets/AppIcon_Principal.png"

interface TutoringCardProps {
  session: TutoringSessionWithTutor
  onClick?: () => void
  onFavoriteClick?: (e: React.MouseEvent) => void
  onBookClick?: (e: React.MouseEvent) => void
  showBookButton?: boolean
  isCompact?: boolean
  unreadMessageCount?: number
}

export function TutoringCard({
  session,
  onClick,
  onFavoriteClick,
  onBookClick,
  showBookButton = true,
  isCompact = false,
  unreadMessageCount = 0,
}: TutoringCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getModeIcon = (mode: SessionMode) => {
    switch (mode) {
      case "online":
        return <Video className="h-4 w-4" />
      case "presential":
        return <MapPin className="h-4 w-4" />
      case "both":
        return <Users className="h-4 w-4" />
    }
  }

  const availableHours = parseAvailableHours(session.available_hours)
  const availabilitySummary = formatAvailabilitySummary(availableHours)
  const isPaused = session.status === 'paused'

  if (isCompact) {
    return (
      <Card
        className={`cursor-pointer hover:shadow-md transition-shadow ${isPaused ? 'opacity-60' : ''}`}
        onClick={onClick}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <div className="relative flex-shrink-0">
              <img
                src={AppIcon}
                alt="BLE"
                className="h-10 w-10 rounded-lg"
              />
              {unreadMessageCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm leading-tight truncate">{session.title}</h3>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{session.tutor.full_name}</p>
                </div>
                {isPaused && (
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    <Pause className="h-3 w-3 mr-1" />
                    Pausada
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  {session.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current text-yellow-400" />
                      <span className="text-xs">{session.rating.toFixed(1)}</span>
                    </div>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {getModeIcon(session.mode as SessionMode)}
                    <span className="ml-1">{MODE_LABELS[session.mode as SessionMode]}</span>
                  </Badge>
                </div>
                <span className="text-sm font-bold text-primary">
                  {formatPrice(session.price_per_hour)}/hr
                </span>
              </div>
            </div>

            {onFavoriteClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onFavoriteClick}
                className={`h-8 w-8 flex-shrink-0 ${session.is_favorite ? "text-red-500" : "text-gray-400"}`}
              >
                <Heart className={`h-4 w-4 ${session.is_favorite ? "fill-current" : ""}`} />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${isPaused ? 'opacity-60' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-5">
        {/* Header con icono, título y precio */}
        <div className="flex items-start gap-3 mb-3">
          <div className="relative flex-shrink-0">
            <img
              src={AppIcon}
              alt="BLE"
              className="h-12 w-12 rounded-lg"
            />
            {unreadMessageCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold leading-tight line-clamp-2">{session.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{session.tutor.full_name}</p>
              </div>
              {isPaused && (
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  <Pause className="h-3 w-3 mr-1" />
                  Pausada
                </Badge>
              )}
            </div>

            {/* Rating */}
            {session.rating !== null && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 fill-current text-yellow-400" />
                <span className="text-sm font-medium">{session.rating.toFixed(1)}</span>
                {session.total_bookings && (
                  <span className="text-xs text-muted-foreground">
                    ({session.total_bookings} {session.total_bookings === 1 ? 'reseña' : 'reseñas'})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Descripción */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {session.description}
        </p>

        {/* Badges de categoría y materia */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {session.category && (
            <Badge variant="secondary" className="text-xs">
              {session.category.name}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {session.subject}
          </Badge>
        </div>

        {/* Info de modalidad, ubicación y horario */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs sm:text-sm text-muted-foreground mb-4">
          <span className="flex items-center">
            {getModeIcon(session.mode as SessionMode)}
            <span className="ml-1">{MODE_LABELS[session.mode as SessionMode]}</span>
          </span>
          {session.location && (
            <span className="flex items-center">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate max-w-[150px]">{session.location}</span>
            </span>
          )}
          <span className="flex items-center">
            <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
            {availabilitySummary}
          </span>
        </div>

        {/* Footer con precio y acciones */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div>
            <span className="text-xl sm:text-2xl font-bold text-primary">
              {formatPrice(session.price_per_hour)}
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground ml-1">/ hora</span>
          </div>

          <div className="flex items-center gap-2">
            {onFavoriteClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onFavoriteClick}
                className={`h-9 w-9 ${session.is_favorite ? "text-red-500" : "text-gray-400"}`}
              >
                <Heart className={`h-5 w-5 ${session.is_favorite ? "fill-current" : ""}`} />
              </Button>
            )}

            {showBookButton && !isPaused && onBookClick && (
              <Button onClick={onBookClick} size="sm" className="px-4">
                Reservar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
