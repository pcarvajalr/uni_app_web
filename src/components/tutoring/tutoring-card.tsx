"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, Clock, Heart, Video, Users, Pause, MessageCircle } from "lucide-react"
import type { TutoringSessionWithTutor, SessionMode } from "@/types/tutoring.types"
import { parseAvailableHours, formatAvailabilitySummary } from "@/lib/availability-utils"
import { MODE_LABELS } from "@/types/tutoring.types"

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
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
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={session.tutor.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(session.tutor.full_name)}
                </AvatarFallback>
              </Avatar>
              {unreadMessageCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold truncate">{session.title}</h3>
                {isPaused && (
                  <Badge variant="secondary" className="text-xs">
                    <Pause className="h-3 w-3 mr-1" />
                    Pausada
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{session.tutor.full_name}</p>
              <div className="flex items-center space-x-2 mt-1">
                {session.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 fill-current text-yellow-400" />
                    <span className="text-xs">{session.rating.toFixed(1)}</span>
                  </div>
                )}
                <span className="text-sm font-medium text-primary">
                  {formatPrice(session.price_per_hour)}/hr
                </span>
              </div>
            </div>

            {onFavoriteClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onFavoriteClick}
                className={session.is_favorite ? "text-red-500" : "text-gray-400"}
              >
                <Heart className={`h-5 w-5 ${session.is_favorite ? "fill-current" : ""}`} />
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
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={session.tutor.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {getInitials(session.tutor.full_name)}
              </AvatarFallback>
            </Avatar>
            {unreadMessageCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold truncate">{session.title}</h3>
              {isPaused && (
                <Badge variant="secondary" className="text-xs">
                  <Pause className="h-3 w-3 mr-1" />
                  Pausada
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm text-muted-foreground">{session.tutor.full_name}</span>
              {session.rating !== null && (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                  <span className="text-sm font-medium">{session.rating.toFixed(1)}</span>
                  {session.total_bookings && (
                    <span className="text-sm text-muted-foreground">
                      ({session.total_bookings} {session.total_bookings === 1 ? 'reseña' : 'reseñas'})
                    </span>
                  )}
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {session.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              {session.category && (
                <Badge variant="secondary" className="text-xs">
                  {session.category.name}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {session.subject}
              </Badge>
            </div>

            <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                {getModeIcon(session.mode as SessionMode)}
                <span className="ml-1">{MODE_LABELS[session.mode as SessionMode]}</span>
              </span>
              {session.location && (
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {session.location}
                </span>
              )}
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {availabilitySummary}
              </span>
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            <div className="text-2xl font-bold text-primary mb-1">
              {formatPrice(session.price_per_hour)}
            </div>
            <p className="text-sm text-muted-foreground mb-3">por hora</p>

            <div className="flex items-center space-x-2">
              {onFavoriteClick && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onFavoriteClick}
                  className={session.is_favorite ? "text-red-500" : "text-gray-400"}
                >
                  <Heart className={`h-5 w-5 ${session.is_favorite ? "fill-current" : ""}`} />
                </Button>
              )}

              {showBookButton && !isPaused && onBookClick && (
                <Button onClick={onBookClick}>Reservar</Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
