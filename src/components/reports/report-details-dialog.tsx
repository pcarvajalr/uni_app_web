"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin, Clock, User, AlertTriangle, Phone } from "lucide-react"
import type { Report } from "@/hooks/useReports"
import { ReportsCarousel } from "./reports-carousel"

interface ReportDetailsDialogProps {
  reports: Report[]
  initialIndex?: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onReportChange?: (index: number) => void
}

export function ReportDetailsDialog({
  reports,
  initialIndex = 0,
  open,
  onOpenChange,
  onReportChange
}: ReportDetailsDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  // Reset index when dialog opens or reports change
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex)
    }
  }, [open, initialIndex])

  // Sync index changes with parent component
  const handleIndexChange = (index: number) => {
    setCurrentIndex(index)
    onReportChange?.(index)
  }

  if (!reports || reports.length === 0) return null

  const report = reports[currentIndex]
  const hasMultipleReports = reports.length > 1

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
        return "text-red-600"
      case "media":
        return "text-yellow-600"
      case "baja":
        return "text-green-600"
      default:
        return "text-gray-600"
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        {/* Carousel for multiple reports */}
        {hasMultipleReports && (
          <ReportsCarousel
            reports={reports}
            currentIndex={currentIndex}
            onIndexChange={handleIndexChange}
            locationName={report.locationData?.name || report.location}
          />
        )}

        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span className="text-2xl">{getTypeIcon(report.type)}</span>
            <span>{report.title}</span>
          </DialogTitle>
          <DialogDescription>
            Reporte #{report.id} - Detalles completos del incidente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(report.status)}>{report.status.toUpperCase()}</Badge>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Prioridad:</span>
              <span className={`font-medium ${getPriorityColor(report.priority)}`}>
                {report.priority.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-medium">Descripción</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{report.description}</p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start space-x-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <span className="text-sm font-medium">Ubicación</span>
                <p className="text-sm text-muted-foreground">{report.location}</p>
                {report.locationData && (
                  <div className="mt-1 space-y-0.5">
                    {report.locationData.type && (
                      <p className="text-xs text-muted-foreground">
                        Tipo: <span className="font-medium">{report.locationData.type}</span>
                      </p>
                    )}
                    {report.locationData.floor && (
                      <p className="text-xs text-muted-foreground">
                        Piso: <span className="font-medium">{report.locationData.floor}</span>
                      </p>
                    )}
                    {report.locationData.description && (
                      <p className="text-xs text-muted-foreground italic">
                        {report.locationData.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="text-sm font-medium">Fecha y Hora</span>
                <p className="text-sm text-muted-foreground">
                  {report.date} a las {report.time}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="text-sm font-medium">Reportado por</span>
                <p className="text-sm text-muted-foreground">{report.reporter}</p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          {report.priority === "alta" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Phone className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-900">Contacto de Emergencia</span>
              </div>
              <p className="text-sm text-red-700">
                Para reportes de alta prioridad, también puedes llamar directamente a seguridad: 123-456-7890
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
            {report.status !== "resuelto" && (
              <Button>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Seguir Reporte
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
