import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, Filter, BookOpen, X, Heart, MessageSquare } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { CreateTutoringDialog } from "@/components/tutoring/create-tutoring-dialog"
import { TutoringDetailsDialog } from "@/components/tutoring/tutoring-details-dialog"
import { TutoringCard } from "@/components/tutoring/tutoring-card"
import { getTutoringSubjects } from "@/services/tutoring-subjects.service"
import { useTutoringSessions, useToggleTutoringFavorite } from "@/hooks/useTutoringSessions"
import { useUnreadMessageCount } from "@/hooks/useTutoringMessages"
import { useAuth } from "@/lib/auth"
import type { TutoringFilters, TutoringSessionWithTutor, DayOfWeek, SessionMode } from "@/types/tutoring.types"
import { DAY_LABELS } from "@/types/tutoring.types"
import type { Database } from "@/types/database.types"

type Category = Database['public']['Tables']['categories']['Row']

export default function TutoringPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: unreadCount } = useUnreadMessageCount(user?.id || '')
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedSession, setSelectedSession] = useState<TutoringSessionWithTutor | null>(null)
  const [subjects, setSubjects] = useState<Category[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Filter states
  const [filters, setFilters] = useState<TutoringFilters>({
    exclude_own: true,
  })

  // Fetch sessions with filters
  const { data: sessions, isLoading, error, refetch } = useTutoringSessions(filters)
  const toggleFavorite = useToggleTutoringFavorite()

  useEffect(() => {
    getTutoringSubjects().then(setSubjects).catch(console.error)
  }, [])

  // Apply search filter with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: searchQuery || undefined,
      }))
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchQuery])

  const handleCategoryFilter = (categoryId: string | null) => {
    setFilters(prev => ({
      ...prev,
      category_id: categoryId || undefined,
    }))
  }

  const handleModeFilter = (mode: string | null) => {
    setFilters(prev => ({
      ...prev,
      mode: mode as SessionMode | undefined,
    }))
  }

  const handleRatingFilter = (rating: string | null) => {
    setFilters(prev => ({
      ...prev,
      min_rating: rating ? parseFloat(rating) : undefined,
    }))
  }

  const handleDayFilter = (day: string | null) => {
    setFilters(prev => ({
      ...prev,
      availability_day: day as DayOfWeek | undefined,
    }))
  }

  const handleFavoritesFilter = (onlyFavorites: boolean) => {
    setFilters(prev => ({
      ...prev,
      only_favorites: onlyFavorites || undefined,
    }))
  }

  const clearFilters = () => {
    setFilters({ exclude_own: true })
    setSearchQuery("")
  }

  const handleFavoriteClick = (e: React.MouseEvent, session: TutoringSessionWithTutor) => {
    e.stopPropagation()
    toggleFavorite.mutate(session.id)
  }

  const handleBookClick = (e: React.MouseEvent, session: TutoringSessionWithTutor) => {
    e.stopPropagation()
    setSelectedSession(session)
  }

  const hasActiveFilters = filters.category_id || filters.mode || filters.min_rating ||
    filters.availability_day || filters.only_favorites || searchQuery

  // Calculate stats
  const activeTutors = sessions ? new Set(sessions.map(s => s.tutor_id)).size : 0

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">Sistema de Tutorías</h1>
            <p className="text-muted-foreground">Encuentra tutores o ofrece tus servicios</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/tutoring/my-sessions')} className="flex-1">
              <BookOpen className="h-4 w-4 mr-2" />
              Mis tutorias
              {(unreadCount ?? 0) > 0 && (
                <MessageSquare className="h-4 w-4 ml-2 animate-pulse text-orange-500" />
              )}
            </Button>
            <Button onClick={() => setShowCreateDialog(true)} className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Ofrecer Tutoría
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{activeTutors}</div>
              <p className="text-sm text-muted-foreground">Tutores Activos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{sessions?.length || 0}</div>
              <p className="text-sm text-muted-foreground">Sesiones Disponibles</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="Buscar tutores o materias..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-primary text-primary-foreground" : ""}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {showFilters && (
              <>
                <h3 className="font-medium mb-3 text-sm">Filtros</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Category Filter */}
                  <Select
                    value={filters.category_id || "all"}
                    onValueChange={(value) => handleCategoryFilter(value === "all" ? null : value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las Categorías</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Mode Filter */}
                  <Select
                    value={filters.mode || "all"}
                    onValueChange={(value) => handleModeFilter(value === "all" ? null : value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Modalidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las Modalidades</SelectItem>
                      <SelectItem value="presential">Presencial</SelectItem>
                      <SelectItem value="online">Virtual</SelectItem>
                      <SelectItem value="both">Ambas</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Rating Filter */}
                  <Select
                    value={filters.min_rating?.toString() || "all"}
                    onValueChange={(value) => handleRatingFilter(value === "all" ? null : value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Puntaje mínimo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Cualquier puntaje</SelectItem>
                      <SelectItem value="4.5">4.5+ Estrellas</SelectItem>
                      <SelectItem value="4.0">4.0+ Estrellas</SelectItem>
                      <SelectItem value="3.5">3.5+ Estrellas</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Day Filter */}
                  <Select
                    value={filters.availability_day || "all"}
                    onValueChange={(value) => handleDayFilter(value === "all" ? null : value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Disponibilidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Cualquier día</SelectItem>
                      {Object.entries(DAY_LABELS).map(([day, label]) => (
                        <SelectItem key={day} value={day}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Favorites Toggle */}
                {user && (
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant={filters.only_favorites ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFavoritesFilter(!filters.only_favorites)}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${filters.only_favorites ? "fill-current" : ""}`} />
                      Solo favoritos
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                {filters.category_id && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {subjects.find(s => s.id === filters.category_id)?.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleCategoryFilter(null)}
                    />
                  </Badge>
                )}
                {filters.mode && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {filters.mode === "presential" ? "Presencial" :
                     filters.mode === "online" ? "Virtual" : "Ambas"}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleModeFilter(null)}
                    />
                  </Badge>
                )}
                {filters.min_rating && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {filters.min_rating}+ estrellas
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRatingFilter(null)}
                    />
                  </Badge>
                )}
                {filters.availability_day && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {DAY_LABELS[filters.availability_day]}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleDayFilter(null)}
                    />
                  </Badge>
                )}
                {filters.only_favorites && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Favoritos
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleFavoritesFilter(false)}
                    />
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sessions List */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-10 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  <p className="mb-4">Error al cargar las sesiones de tutoría</p>
                  <Button onClick={() => refetch()}>Reintentar</Button>
                </div>
              </CardContent>
            </Card>
          ) : sessions && sessions.length > 0 ? (
            sessions.map((session) => (
              <TutoringCard
                key={session.id}
                session={session}
                onClick={() => setSelectedSession(session)}
                onFavoriteClick={user ? (e) => handleFavoriteClick(e, session) : undefined}
                onBookClick={(e) => handleBookClick(e, session)}
                showBookButton={!!user && session.tutor_id !== user.id}
              />
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No se encontraron sesiones</h3>
                  <p>Intenta cambiar los filtros de búsqueda o explora otras materias</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Popular Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Categorías Populares</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {subjects.slice(0, 4).map((subject) => {
                const count = sessions?.filter(s => s.category_id === subject.id).length || 0
                return (
                  <div
                    key={subject.id}
                    className="text-center p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleCategoryFilter(subject.id)}
                  >
                    <div className="text-2xl font-bold text-primary">{count}</div>
                    <p className="text-sm font-medium">{subject.name}</p>
                    <p className="text-xs text-muted-foreground">tutores disponibles</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateTutoringDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => refetch()}
      />

      <TutoringDetailsDialog
        session={selectedSession}
        open={!!selectedSession}
        onOpenChange={(open) => !open && setSelectedSession(null)}
      />
    </AppLayout>
  )
}
