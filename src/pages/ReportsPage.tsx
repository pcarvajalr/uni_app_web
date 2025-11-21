import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Clock, MapPin, Eye, Phone, X, Maximize2 } from 'lucide-react'
import { useState, useRef } from "react"
import { CreateReportDialog } from "@/components/reports/create-report-dialog"
import { ReportDetailsDialog } from "@/components/reports/report-details-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Report {
  id: string
  title: string
  type: "robo" | "vandalismo" | "sospechoso" | "emergencia"
  description: string
  location: string
  coordinates: { x: number; y: number }
  date: string
  time: string
  status: "activo" | "investigando" | "resuelto"
  reporter: string
  priority: "alta" | "media" | "baja"
}

export default function ReportsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [selectedTab, setSelectedTab] = useState("lista")
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [filterPriority, setFilterPriority] = useState<string | null>(null)
  const [mapZoomOpen, setMapZoomOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 })
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const currentPanRef = useRef({ x: 0, y: 0 })
  const mapImageRef = useRef<HTMLDivElement>(null)

  const mockReports: Report[] = [
    {
      id: "1",
      title: "Robo de bicicleta",
      type: "robo",
      description: "Bicicleta azul marca Trek robada del estacionamiento de bicicletas",
      location: "Estacionamiento Norte",
      coordinates: { x: 35, y: 25 },
      date: "2024-01-15",
      time: "14:30",
      status: "investigando",
      reporter: "Estudiante Anónimo",
      priority: "alta",
    },
    {
      id: "2",
      title: "Persona sospechosa",
      type: "sospechoso",
      description: "Persona no identificada merodeando cerca de los dormitorios",
      location: "Residencias Estudiantiles",
      coordinates: { x: 65, y: 45 },
      date: "2024-01-14",
      time: "22:15",
      status: "activo",
      reporter: "María González",
      priority: "media",
    },
    {
      id: "3",
      title: "Vandalismo en baños",
      type: "vandalismo",
      description: "Grafitis y daños en los baños del segundo piso",
      location: "Edificio de Ciencias",
      coordinates: { x: 50, y: 60 },
      date: "2024-01-13",
      time: "16:45",
      status: "resuelto",
      reporter: "Carlos Ruiz",
      priority: "baja",
    },
    {
      id: "4",
      title: "Robo de electrónico",
      type: "robo",
      description: "Laptop robada de la biblioteca",
      location: "Biblioteca Central",
      coordinates: { x: 45, y: 30 },
      date: "2024-01-12",
      time: "18:20",
      status: "investigando",
      reporter: "Jorge López",
      priority: "alta",
    },
    {
      id: "5",
      title: "Intento de fraude",
      type: "sospechoso",
      description: "Persona intentando acceder a áreas restringidas",
      location: "Entrada Principal",
      coordinates: { x: 20, y: 55 },
      date: "2024-01-11",
      time: "10:30",
      status: "resuelto",
      reporter: "Seguridad Campus",
      priority: "media",
    },
  ]

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
        currentPanRef.current = { x: 0, y: 0 }
      }
      return newZoom
    })
  }

  const resetMap = () => {
    setZoomLevel(1)
    setPanPosition({ x: 0, y: 0 })
    currentPanRef.current = { x: 0, y: 0 }
  }

  const filteredReports = mockReports.filter((report) => {
    if (filterType && report.type !== filterType) return false
    if (filterStatus && report.status !== filterStatus) return false
    if (filterPriority && report.priority !== filterPriority) return false
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "activo":
        return "bg-red-100 text-red-800"
      case "investigando":
        return "bg-yellow-100 text-yellow-800"
      case "resuelto":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta":
        return "bg-red-500"
      case "media":
        return "bg-yellow-500"
      case "baja":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "robo":
        return "🔒"
      case "vandalismo":
        return "🔨"
      case "sospechoso":
        return "👤"
      case "emergencia":
        return "🚨"
      default:
        return "⚠️"
    }
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
        className={isZoomed ? "w-full h-full" : "w-full h-full"}
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
          src="/university-campus-map-layout-with-buildings-and-pa.jpg"
          alt="Mapa del Campus Universitario"
          className="w-full h-full object-cover"
          draggable={false}
        />

        {filteredReports.map((report) => {
          const isSelected = selectedReport?.id === report.id
          return (
            <div
              key={report.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110"
              style={{
                left: `${report.coordinates.x}%`,
                top: `${report.coordinates.y}%`,
              }}
              onClick={() => setSelectedReport(isSelected ? null : report)}
            >
              <div className={`relative ${isSelected ? "animate-bounce" : ""}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-colors ${
                    isSelected
                      ? "bg-red-500 text-white scale-125"
                      : "bg-white text-red-500 hover:bg-red-500 hover:text-white"
                  }`}
                  title={report.title}
                >
                  <span className="text-lg">{getTypeIcon(report.type)}</span>
                </div>

                {isSelected && (
                  <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-75"></div>
                )}

                {isSelected && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 bg-white rounded-lg shadow-xl border p-3 z-10">
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">{getTypeIcon(report.type)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm mb-1">{report.title}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{report.location}</p>
                        <Badge className={`text-xs ${getStatusColor(report.status)}`}>{report.status}</Badge>
                      </div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const activeReports = filteredReports.filter((r) => r.status === "activo").length
  const investigatingReports = filteredReports.filter((r) => r.status === "investigando").length
  const highPriorityReports = filteredReports.filter((r) => r.priority === "alta").length

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Reportes de Seguridad</h1>
            <p className="text-muted-foreground">Mantén seguro nuestro campus</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Reporte
          </Button>
        </div>

        {/* Emergency Contact */}
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Phone className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-red-900">Emergencia</h3>
                <p className="text-sm text-red-700">Para emergencias inmediatas, llama a seguridad: 123-456-7890</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{activeReports}</div>
              <p className="text-sm text-muted-foreground">Reportes Activos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{investigatingReports}</div>
              <p className="text-sm text-muted-foreground">En Investigación</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-500">{highPriorityReports}</div>
              <p className="text-sm text-muted-foreground">Prioridad Alta</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredReports.length}</div>
              <p className="text-sm text-muted-foreground">Total Reportes</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-2">
            <TabsTrigger value="lista">Lista de Reportes</TabsTrigger>
            <TabsTrigger value="mapa">Ver en Mapa</TabsTrigger>
          </TabsList>

          <TabsContent value="lista" className="space-y-4">
            <Card className="bg-background border">
              <CardContent className="p-4">
                <h3 className="font-medium mb-3 text-sm">Filtros</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Filter by Type */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Tipo de Incidente</label>
                    <select
                      value={filterType || ""}
                      onChange={(e) => setFilterType(e.target.value || null)}
                      className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                    >
                      <option value="">Todos</option>
                      <option value="robo">Robo</option>
                      <option value="vandalismo">Vandalismo</option>
                      <option value="sospechoso">Sospechoso</option>
                      <option value="emergencia">Emergencia</option>
                    </select>
                  </div>

                  {/* Filter by Status */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Estado</label>
                    <select
                      value={filterStatus || ""}
                      onChange={(e) => setFilterStatus(e.target.value || null)}
                      className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                    >
                      <option value="">Todos</option>
                      <option value="activo">Activo</option>
                      <option value="investigando">Investigando</option>
                      <option value="resuelto">Resuelto</option>
                    </select>
                  </div>

                  {/* Filter by Priority */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Prioridad</label>
                    <select
                      value={filterPriority || ""}
                      onChange={(e) => setFilterPriority(e.target.value || null)}
                      className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                    >
                      <option value="">Todos</option>
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                  </div>
                </div>

                {(filterType || filterStatus || filterPriority) && (
                  <div className="mt-3 flex flex-wrap gap-2 items-center">
                    {filterType && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {filterType}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterType(null)} />
                      </Badge>
                    )}
                    {filterStatus && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {filterStatus}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterStatus(null)} />
                      </Badge>
                    )}
                    {filterPriority && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {filterPriority}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterPriority(null)} />
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilterType(null)
                        setFilterStatus(null)
                        setFilterPriority(null)
                      }}
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reports List */}
            <div className="space-y-3">
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <Card
                    key={report.id}
                    className={`cursor-pointer hover:shadow-md transition-all ${
                      selectedReport?.id === report.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedReport(report)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{getTypeIcon(report.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium truncate">{report.title}</h3>
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(report.priority)}`}></div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{report.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {report.location}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {report.date} {report.time}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No se encontraron reportes con los filtros seleccionados</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="mapa" className="space-y-4">
            <Card className="bg-background border">
              <CardContent className="p-4">
                <h3 className="font-medium mb-3 text-sm">Filtros</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Filter by Type */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Tipo de Incidente</label>
                    <select
                      value={filterType || ""}
                      onChange={(e) => setFilterType(e.target.value || null)}
                      className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                    >
                      <option value="">Todos</option>
                      <option value="robo">Robo</option>
                      <option value="vandalismo">Vandalismo</option>
                      <option value="sospechoso">Sospechoso</option>
                      <option value="emergencia">Emergencia</option>
                    </select>
                  </div>

                  {/* Filter by Status */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Estado</label>
                    <select
                      value={filterStatus || ""}
                      onChange={(e) => setFilterStatus(e.target.value || null)}
                      className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                    >
                      <option value="">Todos</option>
                      <option value="activo">Activo</option>
                      <option value="investigando">Investigando</option>
                      <option value="resuelto">Resuelto</option>
                    </select>
                  </div>

                  {/* Filter by Priority */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Prioridad</label>
                    <select
                      value={filterPriority || ""}
                      onChange={(e) => setFilterPriority(e.target.value || null)}
                      className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                    >
                      <option value="">Todos</option>
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                  </div>
                </div>

                {(filterType || filterStatus || filterPriority) && (
                  <div className="mt-3 flex flex-wrap gap-2 items-center">
                    {filterType && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {filterType}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterType(null)} />
                      </Badge>
                    )}
                    {filterStatus && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {filterStatus}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterStatus(null)} />
                      </Badge>
                    )}
                    {filterPriority && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {filterPriority}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterPriority(null)} />
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilterType(null)
                        setFilterStatus(null)
                        setFilterPriority(null)
                      }}
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

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
                          <DialogTitle>Mapa Interactivo de Reportes</DialogTitle>
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
                            Reset
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

            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Reportes en el mapa ({filteredReports.length})</h3>
                <div className="space-y-2">
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                      <div
                        key={report.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                          selectedReport?.id === report.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedReport(report)}
                      >
                        <div className="flex items-start space-x-2">
                          <span className="text-lg mt-0.5">{getTypeIcon(report.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{report.title}</p>
                            <p className="text-xs text-muted-foreground">{report.location}</p>
                          </div>
                          <Badge className={`text-xs ${getStatusColor(report.status)}`}>{report.status}</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No se encontraron reportes</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <CreateReportDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />

      <ReportDetailsDialog
        report={selectedReport}
        open={!!selectedReport}
        onOpenChange={(open) => !open && setSelectedReport(null)}
      />
    </AppLayout>
  )
}
