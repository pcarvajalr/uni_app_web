import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Clock, MapPin, Eye, Phone, X, Maximize2, Loader2, AlertCircle } from 'lucide-react'
import { useState, useRef } from "react"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { getIconComponent } from "@/lib/icon-mapper"
import { CreateReportDialog } from "@/components/reports/create-report-dialog"
import { ReportDetailsDialog } from "@/components/reports/report-details-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useReports, type Report } from "@/hooks/useReports"
import { getMapImageUrl } from "@/services/campus-settings.service"
import { useEffect } from "react"

export default function ReportsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedReports, setSelectedReports] = useState<Report[]>([])
  const [selectedReportIndex, setSelectedReportIndex] = useState(0)
  const [selectedTab, setSelectedTab] = useState("lista")
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [filterPriority, setFilterPriority] = useState<string | null>(null)
  const [mapZoomOpen, setMapZoomOpen] = useState(false)

  // Estado para la URL del mapa del campus
  const [mapImageUrl, setMapImageUrl] = useState("/university-campus-map-layout-with-buildings-and-pa.jpg")

  // Cargar reportes desde la BD
  const { reports, loading, error, refetch } = useReports()

  // Cargar imagen del mapa desde la configuración del sistema
  useEffect(() => {
    const loadMapImage = async () => {
      try {
        const imageUrl = await getMapImageUrl()
        setMapImageUrl(imageUrl)
      } catch (error) {
        console.error('Error loading map image:', error)
        // Mantiene la imagen por defecto si hay error
      }
    }
    loadMapImage()
  }, [])

  const filteredReports = reports.filter((report) => {
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
    <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 rounded-lg relative overflow-visible">
      <TransformWrapper
        initialScale={1}
        minScale={isZoomed ? 0.3 : 0.5}
        maxScale={isZoomed ? 5 : 3}
        centerOnInit
        limitToBounds={true}
        pinch={{ step: 0.05 }}
        wheel={{ step: 0.05 }}
        doubleClick={{ disabled: false, step: 0.7 }}
        panning={{ disabled: false }}
      >
        <TransformComponent
          wrapperClass="w-full h-full !overflow-visible"
          contentClass="w-full h-full flex items-center justify-center !overflow-visible"
          wrapperStyle={{ overflow: 'visible' }}
        >
          <div>
            <div className="relative inline-block max-h-full max-w-full !overflow-visible" style={{ overflow: 'visible' }}>
              <img
                src={mapImageUrl}
                alt="Mapa del Campus Universitario"
                className="h-full w-auto object-contain block"
                draggable={false}
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />

              {/* Agrupar reportes por ubicación */}
              {(() => {
                // Agrupar reportes por location_id
                const reportsByLocation = filteredReports
                  .filter((report) => report.coordinates !== null && report.locationData !== null)
                  .reduce((acc, report) => {
                    const locationId = report.locationData!.id
                    if (!acc[locationId]) {
                      acc[locationId] = []
                    }
                    acc[locationId].push(report)
                    return acc
                  }, {} as Record<string, typeof filteredReports>)

                return Object.entries(reportsByLocation).map(([locationId, reportsInLocation]) => {
                  const firstReport = reportsInLocation[0]
                  const isSelected = selectedReports.length > 0 && selectedReports[0].locationData?.id === locationId
                  const reportCount = reportsInLocation.length
                  const Icon = firstReport.locationData?.icon
                    ? getIconComponent(firstReport.locationData.icon)
                    : MapPin

                  return (
                    <div
                      key={locationId}
                      className={`absolute transform -translate-x-1/2 -translate-y-full cursor-pointer transition-all duration-200 hover:scale-110 ${isSelected ? "z-50" : "z-20"}`}
                      style={{
                        left: `${firstReport.coordinates!.x}%`,
                        top: `${firstReport.coordinates!.y}%`,
                      }}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedReports([])
                        } else {
                          setSelectedReports(reportsInLocation)
                          setSelectedReportIndex(0)
                        }
                      }}
                    >
                      <div className={`relative flex flex-col items-center ${isSelected ? "animate-bounce" : ""}`}>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-colors ${
                            isSelected
                              ? "bg-red-500 text-white scale-125"
                              : "bg-white text-red-500 hover:bg-red-500 hover:text-white"
                          }`}
                          title={`${reportCount} reporte(s) en ${firstReport.location}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        {/* Punta triangular del pin */}
                        <svg
                          width="10"
                          height="8"
                          className={`transition-transform ${isSelected ? "scale-125" : ""}`}
                          style={{ marginTop: '-2px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
                        >
                          <polygon
                            points="5,8 0,0 10,0"
                            className={isSelected ? "fill-red-500" : "fill-white"}
                          />
                        </svg>

                        {/* Badge con contador */}
                        {reportCount > 1 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
                            {reportCount}
                          </div>
                        )}

                        {isSelected && (
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border-2 border-red-500 animate-ping opacity-75"></div>
                        )}
                      </div>

                      {/* Tooltip */}
                      {isSelected && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 max-h-96 overflow-y-auto bg-white rounded-lg shadow-xl border p-3 z-[9999] pointer-events-none">
                          <div className="font-semibold text-sm mb-2">{firstReport.location}</div>
                          <div className="text-xs text-muted-foreground mb-3">{reportCount} reporte(s) en esta ubicación</div>

                          {/* Lista de reportes en esta ubicación */}
                          <div className="space-y-2">
                            {reportsInLocation.map((report) => (
                              <div key={report.id} className="border-t pt-2 first:border-t-0 first:pt-0">
                                <div className="flex items-start space-x-2">
                                  <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm">{getTypeIcon(report.type)}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-xs mb-1">{report.title}</h4>
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge className={`text-xs ${getStatusColor(report.status)}`}>{report.status}</Badge>
                                      <span className="text-xs text-muted-foreground">{report.type}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{report.date} {report.time}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                        </div>
                      )}
                    </div>
                  )
                })
              })()}
            </div>
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  )

  const activeReports = filteredReports.filter((r) => r.status === "activo").length
  const investigatingReports = filteredReports.filter((r) => r.status === "investigando").length
  const highPriorityReports = filteredReports.filter((r) => r.priority === "alta").length

  // Mostrar estado de carga
  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Cargando reportes...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Mostrar error si ocurre
  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Error al cargar reportes</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {error.message || "Ocurrió un error al cargar los reportes"}
                </p>
                <Button onClick={() => refetch()}>
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

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
          <TabsList className="w-full">
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
                    <Select
                      value={filterType || "all"}
                      onValueChange={(value) => setFilterType(value === "all" ? null : value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Todos los tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="robo">Robo</SelectItem>
                        <SelectItem value="vandalismo">Vandalismo</SelectItem>
                        <SelectItem value="sospechoso">Sospechoso</SelectItem>
                        <SelectItem value="emergencia">Emergencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filter by Status */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Estado</label>
                    <Select
                      value={filterStatus || "all"}
                      onValueChange={(value) => setFilterStatus(value === "all" ? null : value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="activo">Activo</SelectItem>
                        <SelectItem value="investigando">Investigando</SelectItem>
                        <SelectItem value="resuelto">Resuelto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filter by Priority */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Prioridad</label>
                    <Select
                      value={filterPriority || "all"}
                      onValueChange={(value) => setFilterPriority(value === "all" ? null : value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Todas las prioridades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="baja">Baja</SelectItem>
                      </SelectContent>
                    </Select>
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
                      selectedReports.length > 0 && selectedReports[0].id === report.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => {
                      setSelectedReports([report])
                      setSelectedReportIndex(0)
                    }}
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
                    <Select
                      value={filterType || "all"}
                      onValueChange={(value) => setFilterType(value === "all" ? null : value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Todos los tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="robo">Robo</SelectItem>
                        <SelectItem value="vandalismo">Vandalismo</SelectItem>
                        <SelectItem value="sospechoso">Sospechoso</SelectItem>
                        <SelectItem value="emergencia">Emergencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filter by Status */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Estado</label>
                    <Select
                      value={filterStatus || "all"}
                      onValueChange={(value) => setFilterStatus(value === "all" ? null : value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="activo">Activo</SelectItem>
                        <SelectItem value="investigando">Investigando</SelectItem>
                        <SelectItem value="resuelto">Resuelto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filter by Priority */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Prioridad</label>
                    <Select
                      value={filterPriority || "all"}
                      onValueChange={(value) => setFilterPriority(value === "all" ? null : value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Todas las prioridades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="baja">Baja</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <DialogContent className="w-[95vw] md:w-[80vw] h-[80vh] p-0 rounded-lg flex flex-col overflow-hidden">
                      <DialogHeader className="flex-shrink-0 z-20 bg-background/95 backdrop-blur px-4 py-3 border-b rounded-t-lg">
                        <DialogTitle>Mapa Interactivo de Reportes</DialogTitle>
                      </DialogHeader>

                      <div className="relative flex-1 overflow-hidden rounded-b-lg flex flex-col">
                        <div className="w-full flex-1 bg-gradient-to-br from-green-100 to-blue-100 relative overflow-hidden" style={{ display: 'flex', flexDirection: 'column' }}>
                          <TransformWrapper
                            initialScale={1}
                            minScale={0.3}
                            maxScale={5}
                            centerOnInit
                            limitToBounds={true}
                            pinch={{ step: 0.05 }}
                            wheel={{ step: 0.05 }}
                            doubleClick={{ disabled: false, step: 0.7 }}
                            panning={{ disabled: false }}
                          >
                            {({ zoomIn, zoomOut, resetTransform, ...instance }) => (
                              <>
                                <TransformComponent
                                  wrapperClass="!w-full !h-full !overflow-visible"
                                  contentClass="!w-full !h-full !flex !items-center !justify-center !overflow-visible"
                                  wrapperStyle={{ width: '100%', height: '100%', overflow: 'visible' }}
                                  contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}
                                >
                                  <div>
                                    <div className="relative inline-block max-h-full max-w-full !overflow-visible" style={{ overflow: 'visible' }}>
                                      <img
                                        src={mapImageUrl}
                                        alt="Mapa del Campus Universitario"
                                        className="h-full w-auto object-contain block"
                                        draggable={false}
                                        style={{ maxHeight: '100%', maxWidth: '100%' }}
                                      />

                                      {/* Iconos de reportes - igual que en el mapa principal */}
                                      {(() => {
                                        const reportsByLocation = filteredReports
                                          .filter((report) => report.coordinates !== null && report.locationData !== null)
                                          .reduce((acc, report) => {
                                            const locationId = report.locationData!.id
                                            if (!acc[locationId]) {
                                              acc[locationId] = []
                                            }
                                            acc[locationId].push(report)
                                            return acc
                                          }, {} as Record<string, typeof filteredReports>)

                                        return Object.entries(reportsByLocation).map(([locationId, reportsInLocation]) => {
                                          const firstReport = reportsInLocation[0]
                                          const isSelected = selectedReports.length > 0 && selectedReports[0].locationData?.id === locationId
                                          const reportCount = reportsInLocation.length
                                          const Icon = firstReport.locationData?.icon
                                            ? getIconComponent(firstReport.locationData.icon)
                                            : MapPin

                                          return (
                                            <div
                                              key={locationId}
                                              className={`absolute transform -translate-x-1/2 -translate-y-full cursor-pointer transition-all duration-200 hover:scale-110 ${isSelected ? "z-50" : "z-20"}`}
                                              style={{
                                                left: `${firstReport.coordinates!.x}%`,
                                                top: `${firstReport.coordinates!.y}%`,
                                              }}
                                              onClick={() => {
                                                if (isSelected) {
                                                  setSelectedReports([])
                                                } else {
                                                  setSelectedReports(reportsInLocation)
                                                  setSelectedReportIndex(0)
                                                }
                                              }}
                                            >
                                              <div className={`relative flex flex-col items-center ${isSelected ? "animate-bounce" : ""}`}>
                                                <div
                                                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-colors ${
                                                    isSelected
                                                      ? "bg-red-500 text-white scale-125"
                                                      : "bg-white text-red-500 hover:bg-red-500 hover:text-white"
                                                  }`}
                                                >
                                                  <Icon className="h-4 w-4" />
                                                </div>

                                                <svg width="10" height="8" className={`transition-transform ${isSelected ? "scale-125" : ""}`} style={{ marginTop: '-2px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
                                                  <polygon points="5,8 0,0 10,0" className={isSelected ? "fill-red-500" : "fill-white"} />
                                                </svg>

                                                {reportCount > 1 && (
                                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
                                                    {reportCount}
                                                  </div>
                                                )}

                                                {isSelected && (
                                                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border-2 border-red-500 animate-ping opacity-75"></div>
                                                )}
                                              </div>
                                            </div>
                                          )
                                        })
                                      })()}
                                    </div>
                                  </div>
                                </TransformComponent>

                                {/* Controles de zoom */}
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex gap-2 items-center justify-center bg-background/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={() => zoomOut(0.5)}
                                    disabled={instance.instance.transformState.scale <= 0.3}
                                  >
                                    −
                                  </Button>
                                  <span className="text-sm font-medium min-w-[50px] text-center">
                                    {Math.round(instance.instance.transformState.scale * 100)}%
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={() => zoomIn(0.5)}
                                    disabled={instance.instance.transformState.scale >= 5}
                                  >
                                    +
                                  </Button>
                                  <div className="w-px h-4 bg-border mx-1"></div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-2"
                                    onClick={() => resetTransform()}
                                    title="Restablecer vista"
                                  >
                                    Reset
                                  </Button>
                                </div>

                                {instance.instance.transformState.scale > 1 && (
                                  <div className="absolute top-16 left-4 right-4 z-25 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg text-xs text-muted-foreground text-center shadow-md border">
                                    Arrastra para mover • Pellizca para zoom • Doble tap para acercar
                                  </div>
                                )}
                              </>
                            )}
                          </TransformWrapper>
                        </div>

                        <Button
                          size="icon"
                          variant="outline"
                          className="absolute top-2 right-2 z-30 bg-background hover:bg-background/90 shadow-lg border-2"
                          onClick={() => setMapZoomOpen(false)}
                        >
                          <X className="h-5 w-5" />
                        </Button>
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
                          selectedReports.length > 0 && selectedReports[0].id === report.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => {
                          setSelectedReports([report])
                          setSelectedReportIndex(0)
                        }}
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

      <CreateReportDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={refetch}
      />

      <ReportDetailsDialog
        reports={selectedReports}
        initialIndex={selectedReportIndex}
        open={selectedReports.length > 0}
        onOpenChange={(open) => !open && setSelectedReports([])}
        onReportChange={setSelectedReportIndex}
      />
    </AppLayout>
  )
}
