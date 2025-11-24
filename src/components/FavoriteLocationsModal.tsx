import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, X, MapPin, Heart, Loader2 } from 'lucide-react'
import { getCampusLocations } from '@/services/campus-locations.service'
import { getLocationCategories } from '@/services/location-categories.service'
import {
  toggleLocationFavorite,
  getUserFavoriteLocationIds,
} from '@/services/location-favorites.service'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/lib/auth'
import type { Database } from '@/types/database.types'

type CampusLocation = Database['public']['Tables']['campus_locations']['Row']
type Category = Database['public']['Tables']['categories']['Row']

interface FavoriteLocationsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFavoritesChange?: () => void
}

export function FavoriteLocationsModal({
  open,
  onOpenChange,
  onFavoritesChange,
}: FavoriteLocationsModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  const [locations, setLocations] = useState<CampusLocation[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  const loadData = async () => {
    if (!user) return

    setLoading(true)
    try {
      const [locationsData, categoriesData, favoriteIdsData] = await Promise.all([
        getCampusLocations(),
        getLocationCategories(),
        getUserFavoriteLocationIds(user.id),
      ])

      setLocations(locationsData)
      setCategories(categoriesData)
      setFavoriteIds(new Set(favoriteIdsData))
    } catch (error) {
      console.error('Error cargando datos:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las ubicaciones',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Filtrar ubicaciones
  const filteredLocations = locations.filter((location) => {
    const hasSearchFilter = searchQuery.trim() !== ''
    const hasTypeFilter = selectedType !== 'all'

    if (!hasSearchFilter && !hasTypeFilter) return true

    const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = location.type === selectedType

    return (hasSearchFilter && matchesSearch) || (hasTypeFilter && matchesType)
  })

  // Toggle favorito
  const handleToggleFavorite = async (locationId: string) => {
    if (!user) return

    setTogglingId(locationId)
    try {
      const isFavorite = await toggleLocationFavorite(locationId, user.id)

      setFavoriteIds((prev) => {
        const newSet = new Set(prev)
        if (isFavorite) {
          newSet.add(locationId)
        } else {
          newSet.delete(locationId)
        }
        return newSet
      })

      toast({
        title: isFavorite ? 'Agregado a favoritos' : 'Eliminado de favoritos',
        description: isFavorite
          ? 'La ubicación se agregó a tus favoritos'
          : 'La ubicación se eliminó de tus favoritos',
      })

      onFavoritesChange?.()
    } catch (error) {
      console.error('Error toggling favorito:', error)
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el favorito',
        variant: 'destructive',
      })
    } finally {
      setTogglingId(null)
    }
  }

  // Limpiar filtros
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedType('all')
  }

  const hasActiveFilters = searchQuery.trim() !== '' || selectedType !== 'all'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Gestionar Ubicaciones Favoritas
          </DialogTitle>
        </DialogHeader>

        {/* Controles de búsqueda y filtros */}
        <div className="space-y-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar ubicación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Toggle filtros */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full"
          >
            {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
          </Button>

          {/* Panel de filtros */}
          {showFilters && (
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Filtros</h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="mr-1 h-3 w-3" />
                    Limpiar
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de ubicación</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Contador de resultados */}
          <p className="text-sm text-muted-foreground">
            {filteredLocations.length} ubicación{filteredLocations.length !== 1 ? 'es' : ''}{' '}
            {hasActiveFilters ? 'encontrada' + (filteredLocations.length !== 1 ? 's' : '') : 'disponible' + (filteredLocations.length !== 1 ? 's' : '')}
          </p>
        </div>

        {/* Lista de ubicaciones */}
        <div className="flex-1 -mx-6 px-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLocations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {hasActiveFilters
                  ? 'No se encontraron ubicaciones con los filtros aplicados'
                  : 'No hay ubicaciones disponibles'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 py-4">
              {filteredLocations.map((location) => {
                const isFavorite = favoriteIds.has(location.id)
                const isToggling = togglingId === location.id

                return (
                  <div
                    key={location.id}
                    className="flex items-start gap-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      checked={isFavorite}
                      onCheckedChange={() => handleToggleFavorite(location.id)}
                      disabled={isToggling}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{location.name}</h4>
                          {location.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {location.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                              {location.type}
                            </span>
                            {location.building && (
                              <span className="text-xs text-muted-foreground">
                                {location.building}
                              </span>
                            )}
                          </div>
                        </div>
                        {isFavorite && (
                          <Heart className="h-5 w-5 text-destructive fill-destructive flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
