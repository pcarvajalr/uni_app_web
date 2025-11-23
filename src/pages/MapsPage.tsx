import type React from "react"

import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  MapPin,
  Search,
  Navigation,
  Building,
  Coffee,
  BookOpen,
  Car,
  ExternalLink,
  Clock,
  Maximize2,
  X,
  ChevronDown,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react"
import { useState, useRef, useEffect, useMemo } from "react"
import { getCampusLocations } from "@/services/campus-locations.service"
import { getMapImageUrl } from "@/services/campus-settings.service"
import { getLocationCategories } from "@/services/location-categories.service"
import { getIconComponent } from "@/lib/icon-mapper"
import type { Database } from "@/types/database.types"

type CampusLocation = Database['public']['Tables']['campus_locations']['Row']
type Category = Database['public']['Tables']['categories']['Row']

export default function MapsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOption, setSelectedOption] = useState<"nearby" | "campus" | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [mapZoomOpen, setMapZoomOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 })
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const currentPanRef = useRef({ x: 0, y: 0 }) // store current pan position for smooth dragging
  const mapImageRef = useRef<HTMLDivElement>(null) // ref for the transformed div

  // Campus locations and map image from database
  const [campusLocations, setCampusLocations] = useState<CampusLocation[]>([])
  const [isLoadingLocations, setIsLoadingLocations] = useState(true)
  const [mapImageUrl, setMapImageUrl] = useState("/university-campus-map-layout-with-buildings-and-pa.jpg")

  // Image gallery state
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Campus search and filter state
  const [campusSearchQuery, setCampusSearchQuery] = useState("")
  const [campusSelectedType, setCampusSelectedType] = useState<string>("all")
  const [locationTypes, setLocationTypes] = useState<Category[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Refs for auto-scroll to selected location
  const locationRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Load campus locations and map image
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingLocations(true)
      try {
        const [locations, imageUrl, types] = await Promise.all([
          getCampusLocations(),
          getMapImageUrl(),
          getLocationCategories()
        ])
        setCampusLocations(locations)
        setMapImageUrl(imageUrl)
        setLocationTypes(types)
      } catch (error) {
        console.error('Error loading campus data:', error)
      } finally {
        setIsLoadingLocations(false)
      }
    }
    loadData()
  }, [])

  // Auto-scroll to selected location when clicking on map marker
  useEffect(() => {
    if (selectedLocation && !isLoadingLocations && locationRefs.current[selectedLocation]) {
      setTimeout(() => {
        const element = locationRefs.current[selectedLocation]
        element?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        })
      }, 100)
    }
  }, [selectedLocation, isLoadingLocations])

  const nearbyCategories = [
    { name: "Restaurantes", icon: Coffee, count: 15 },
    { name: "Bancos", icon: Building, count: 8 },
    { name: "Farmacias", icon: Building, count: 12 },
    { name: "Transporte", icon: Car, count: 6 },
  ]

  const handleGoogleMapsSearch = () => {
    if (searchQuery.trim()) {
      const query = encodeURIComponent(searchQuery + " cerca de universidad")
      window.open(`https://www.google.com/maps/search/${query}`, "_blank")
    }
  }

  const handleCategorySearch = (category: string) => {
    const query = encodeURIComponent(category + " cerca de universidad")
    window.open(`https://www.google.com/maps/search/${query}`, "_blank")
  }

  // Campus locations filtering (OR logic - non-exclusive filters)
  const filteredLocations = campusLocations.filter((location) => {
    const hasSearchFilter = campusSearchQuery.trim() !== ""
    const hasTypeFilter = campusSelectedType !== "all"

    // No filters active: show all
    if (!hasSearchFilter && !hasTypeFilter) return true

    const matchesSearch = location.name.toLowerCase().includes(campusSearchQuery.toLowerCase())
    const matchesType = location.type === campusSelectedType

    // With filters: show if matches ANY filter (OR logic)
    return (hasSearchFilter && matchesSearch) || (hasTypeFilter && matchesType)
  })

  const clearCampusFilters = () => {
    setCampusSearchQuery("")
    setCampusSelectedType("all")
  }

  const hasActiveFilters = campusSearchQuery.trim() !== "" || campusSelectedType !== "all"

  // Order locations: selected first, then others
  const orderedLocations = useMemo(() => {
    if (!selectedLocation) return filteredLocations

    const selected = filteredLocations.find(loc => loc.id === selectedLocation)
    if (!selected) return filteredLocations

    const others = filteredLocations.filter(loc => loc.id !== selectedLocation)
    return [selected, ...others]
  }, [filteredLocations, selectedLocation])

  const handleMapMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      isDraggingRef.current = true
      dragStartRef.current = { x: e.clientX, y: e.clientY }
    }
  }

  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !mapImageRef.current) return

    const deltaX = e.clientX - dragStartRef.current.x
    const deltaY = e.clientY - dragStartRef.current.y

    const newX = currentPanRef.current.x + deltaX
    const newY = currentPanRef.current.y + deltaY

    mapImageRef.current.style.transform = `scale(${zoomLevel}) translate(${newX / zoomLevel}px, ${newY / zoomLevel}px)`
  }

  const handleMapMouseUp = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return

    isDraggingRef.current = false

    const deltaX = e.clientX - dragStartRef.current.x
    const deltaY = e.clientY - dragStartRef.current.y

    currentPanRef.current = {
      x: currentPanRef.current.x + deltaX,
      y: currentPanRef.current.y + deltaY,
    }

    setPanPosition(currentPanRef.current)
  }

  const handleMapTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel > 1 && e.touches.length === 1) {
      isDraggingRef.current = true
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
  }

  const handleMapTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || !mapImageRef.current || e.touches.length !== 1) return

    const deltaX = e.touches[0].clientX - dragStartRef.current.x
    const deltaY = e.touches[0].clientY - dragStartRef.current.y

    const newX = currentPanRef.current.x + deltaX
    const newY = currentPanRef.current.y + deltaY

    mapImageRef.current.style.transform = `scale(${zoomLevel}) translate(${newX / zoomLevel}px, ${newY / zoomLevel}px)`
  }

  const handleMapTouchEnd = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return

    isDraggingRef.current = false

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - dragStartRef.current.x
    const deltaY = touch.clientY - dragStartRef.current.y

    currentPanRef.current = {
      x: currentPanRef.current.x + deltaX,
      y: currentPanRef.current.y + deltaY,
    }

    setPanPosition(currentPanRef.current)
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const newZoom = Math.max(prev - 0.5, 1)
      if (newZoom === 1) {
        setPanPosition({ x: 0, y: 0 })
        currentPanRef.current = { x: 0, y: 0 } // reset ref on zoom out
      }
      return newZoom
    })
  }

  const resetMap = () => {
    setZoomLevel(1)
    setPanPosition({ x: 0, y: 0 })
    currentPanRef.current = { x: 0, y: 0 } // reset ref on reset
  }

  const openGallery = (images: string[], startIndex: number = 0) => {
    setGalleryImages(images)
    setCurrentImageIndex(startIndex)
    setGalleryOpen(true)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextImage()
    if (e.key === 'ArrowLeft') prevImage()
    if (e.key === 'Escape') setGalleryOpen(false)
  }

  const MapContent = ({ isZoomed = false }: { isZoomed?: boolean }) => (
    <div
      ref={isZoomed ? mapContainerRef : null}
      className={`aspect-video ${isZoomed ? "w-full h-full overflow-hidden cursor-grab active:cursor-grabbing" : ""} bg-gradient-to-br from-green-100 to-blue-100 rounded-lg relative`}
      style={isZoomed ? { cursor: zoomLevel > 1 ? "grab" : "default" } : undefined}
      onMouseDown={handleMapMouseDown}
      onMouseMove={handleMapMouseMove}
      onMouseUp={handleMapMouseUp}
      onMouseLeave={handleMapMouseUp}
      onTouchStart={handleMapTouchStart}
      onTouchMove={handleMapTouchMove}
      onTouchEnd={handleMapTouchEnd}
    >
      <div
        ref={isZoomed ? mapImageRef : null}
        className={isZoomed ? "w-full h-full" : "w-full h-full transition-transform duration-100"}
        style={
          isZoomed
            ? {
                transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                transformOrigin: "center center",
                willChange: "transform",
              }
            : undefined
        }
      >
        <img
          src={mapImageUrl}
          alt="Mapa del Campus Universitario"
          className="w-full h-full object-cover"
          draggable={false}
        />

        {orderedLocations.map((location) => {
          const Icon = getIconComponent(location.icon)
          const isSelected = selectedLocation === location.id
          const hours = location.opening_hours ? (location.opening_hours as any).hours || "" : ""
          return (
            <div
              key={location.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110 ${
                isSelected ? "z-50" : "z-0"
              }`}
              style={{
                left: `${location.coordinate_x}%`,
                top: `${location.coordinate_y}%`,
              }}
              onClick={() => {
                if (!isSelected) {
                  setShowFilters(false)
                }
                setSelectedLocation(isSelected ? null : location.id)
              }}
            >
              <div className={`relative ${isSelected ? "animate-bounce" : ""}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-colors ${
                    isSelected
                      ? "bg-primary text-white scale-125"
                      : "bg-white text-primary hover:bg-primary hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                {isSelected && (
                  <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-75"></div>
                )}

                {isSelected && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white rounded-lg shadow-xl border p-3 z-20">
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-sm">{location.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {location.type}
                          </Badge>
                        </div>
                        {location.description && (
                          <p className="text-xs text-muted-foreground mb-2">{location.description}</p>
                        )}
                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                          {location.floor && (
                            <span className="flex items-center">
                              <Building className="h-3 w-3 mr-1" />
                              {location.floor}
                            </span>
                          )}
                          {hours && (
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {hours}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* {selectedLocation === null && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
            <div className="text-center text-white">
              <MapPin className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-semibold">Mapa Interactivo del Campus</p>
              <p className="text-sm opacity-90">Toca los marcadores para ver información</p>
            </div>
          </div>
        )} */}
      </div>
    </div>
  )

  if (selectedOption === null) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-balance">Mapas y Ubicación</h1>
            <p className="text-muted-foreground">¿Qué tipo de ubicación buscas?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
              onClick={() => setSelectedOption("nearby")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Navigation className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Lugares Cercanos</CardTitle>
                <CardDescription>Busca restaurantes, bancos, farmacias y más cerca de la universidad</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Explorar Alrededores</Button>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
              onClick={() => setSelectedOption("campus")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Building className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle>Campus Universitario</CardTitle>
                <CardDescription>Encuentra edificios, aulas, servicios y ubicaciones dentro del campus</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="secondary">
                  Ver Mapa del Campus
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (selectedOption === "nearby") {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedOption(null)}>
              ← Volver
            </Button>
            <h1 className="text-xl font-bold">Lugares Cercanos</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Buscar Lugar</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="¿Qué estás buscando?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleGoogleMapsSearch()}
                />
                <Button onClick={handleGoogleMapsSearch} disabled={!searchQuery.trim()}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Te llevará a Google Maps para encontrar lugares cerca de la universidad
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Categorías Populares</h2>
            <div className="grid grid-cols-2 gap-4">
              {nearbyCategories.map((category, index) => {
                const Icon = category.icon
                return (
                  <Card
                    key={index}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleCategorySearch(category.name)}
                  >
                    <CardContent className="p-4 text-center">
                      <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h3 className="font-medium">{category.name}</h3>
                      <Badge variant="secondary" className="mt-2">
                        ~{category.count} lugares
                      </Badge>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (selectedOption === "campus") {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedOption(null)}>
              ← Volver
            </Button>
            <h1 className="text-xl font-bold">Mapa del Campus</h1>
          </div>

          <Card>
            <CardContent className="p-0 relative">
              <div className="relative">
                <MapContent />

                <Dialog open={mapZoomOpen} onOpenChange={setMapZoomOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="icon"
                      className="absolute bottom-4 right-4 rounded-full shadow-lg z-10"
                      title="Ampliar mapa"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 sm:rounded-none flex flex-col">
                    <div className="relative flex-1 overflow-hidden">
                      <DialogHeader className="absolute top-0 left-0 right-0 z-20 bg-background/80 backdrop-blur px-4 py-2 border-b">
                        <DialogTitle>Mapa Interactivo del Campus</DialogTitle>
                      </DialogHeader>

                      <div className="w-full h-full pt-16">
                        <MapContent isZoomed={true} />
                      </div>

                      <div className="absolute bottom-6 left-6 right-6 z-20 flex gap-2 items-center justify-center md:left-auto md:right-6">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-background/80 backdrop-blur"
                          onClick={handleZoomOut}
                          disabled={zoomLevel <= 1}
                        >
                          −
                        </Button>
                        <span className="text-sm font-medium min-w-[60px] text-center bg-background/80 backdrop-blur px-3 py-1 rounded">
                          {Math.round(zoomLevel * 100)}%
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-background/80 backdrop-blur"
                          onClick={handleZoomIn}
                          disabled={zoomLevel >= 3}
                        >
                          +
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-background/80 backdrop-blur"
                          onClick={resetMap}
                          disabled={zoomLevel === 1 && panPosition.x === 0 && panPosition.y === 0}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        size="icon"
                        variant="outline"
                        className="absolute top-4 right-4 z-20 bg-background/80 backdrop-blur"
                        onClick={() => setMapZoomOpen(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>

                      {zoomLevel > 1 && (
                        <div className="absolute top-20 left-4 right-4 z-15 bg-background/80 backdrop-blur px-3 py-2 rounded text-sm text-muted-foreground">
                          Arrastra para mover • Usa los botones para zoom
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Filters Control Bar */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Filtros de Búsqueda</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Ocultar Filtros" : "Buscar Ubicación"}
              <ChevronDown
                className={`h-4 w-4 ml-2 transition-transform duration-200 ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </Button>
          </div>

          {/* Search and Filters Card - Collapsible */}
          {showFilters && (
            <Card className="py-3 animate-in slide-in-from-top-2 duration-200">
              <CardContent className="px-4">
                <div className="flex flex-col md:flex-row gap-3">
                  {/* Search input */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="Buscar por nombre..."
                      value={campusSearchQuery}
                      onChange={(e) => setCampusSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Type filter */}
                  <Select value={campusSelectedType} onValueChange={setCampusSelectedType}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Todos los tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      {locationTypes.map((type) => (
                        <SelectItem key={type.id} value={type.name}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Clear filters button */}
                  {hasActiveFilters && (
                    <Button variant="ghost" onClick={clearCampusFilters} title="Limpiar filtros">
                      <X className="h-4 w-4" />
                      <span>Limpiar filtros</span>
                    </Button>
                  )}
                </div>

                {/* Results counter */}
                <p className="text-sm text-muted-foreground mt-3">
                  {filteredLocations.length} ubicación{filteredLocations.length !== 1 ? 'es' : ''} encontrada{filteredLocations.length !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Ubicaciones del Campus</h2>
            {isLoadingLocations ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : orderedLocations.length > 0 ? (
              <div className="space-y-3">
                {orderedLocations.map((location) => {
                  const Icon = getIconComponent(location.icon)
                  const isSelected = selectedLocation === location.id
                  const hours = location.opening_hours ? (location.opening_hours as any).hours || "" : ""
                  return (
                    <Card
                      key={location.id}
                      ref={(el) => {
                        if (el) {
                          locationRefs.current[location.id] = el
                        }
                      }}
                      className={`hover:shadow-md transition-all cursor-pointer py-3 ${
                        isSelected ? "ring-2 ring-primary shadow-md" : ""
                      }`}
                      onClick={() => setSelectedLocation(isSelected ? null : location.id)}
                    >
                      <CardContent className="px-4">
                        <div className="flex items-start space-x-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected ? "bg-primary text-white" : "bg-primary/10 text-primary"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium truncate">{location.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {location.type}
                              </Badge>
                            </div>
                            {location.description && (
                              <p className="text-sm text-muted-foreground mb-2">{location.description}</p>
                            )}
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                              {location.floor && (
                                <span className="flex items-center">
                                  <Building className="h-3 w-3 mr-1" />
                                  {location.floor}
                                </span>
                              )}
                              {hours && (
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {hours}
                                </span>
                              )}
                            </div>

                            {/* Galería de imágenes en miniatura */}
                            {location.images && location.images.length > 0 && (
                              <div className="mt-2 flex gap-1">
                                {location.images.slice(0, 4).map((imageUrl, idx) => (
                                  <button
                                    key={idx}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openGallery(location.images || [], idx)
                                    }}
                                    className="w-12 h-12 rounded border overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                                  >
                                    <img
                                      src={imageUrl}
                                      alt={`${location.name} ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </button>
                                ))}
                                {location.images.length > 4 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openGallery(location.images || [], 4)
                                    }}
                                    className="w-12 h-12 bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground font-medium hover:bg-muted/80 transition-all"
                                  >
                                    +{location.images.length - 4}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                          <Button size="sm" variant={isSelected ? "default" : "outline"} className="transition-all">
                            <MapPin className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay ubicaciones configuradas</p>
                <p className="text-sm mt-1">Los administradores pueden agregar ubicaciones en Configuración</p>
              </div>
            )}
          </div>
        </div>

        {/* Image Gallery Modal */}
        <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
          <DialogContent
            className="max-w-screen-lg w-full h-[90vh] p-0"
            onKeyDown={handleKeyDown}
          >
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              {/* Close button */}
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setGalleryOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>

              {/* Image counter */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {galleryImages.length}
              </div>

              {/* Previous button */}
              {galleryImages.length > 1 && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute left-4 z-50 bg-black/50 hover:bg-black/70 text-white h-12 w-12"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
              )}

              {/* Current image */}
              <img
                src={galleryImages[currentImageIndex]}
                alt={`Imagen ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />

              {/* Next button */}
              {galleryImages.length > 1 && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-4 z-50 bg-black/50 hover:bg-black/70 text-white h-12 w-12"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              )}

              {/* Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-2 max-w-full overflow-x-auto px-4">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex
                          ? 'border-white scale-110'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </AppLayout>
    )
  }

  return null
}
