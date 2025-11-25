import { useCallback, useEffect } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Report } from "@/hooks/useReports"
import { getIconComponent } from "@/lib/icon-mapper"

interface ReportsCarouselProps {
  reports: Report[]
  currentIndex: number
  onIndexChange: (index: number) => void
  locationName: string
}

export function ReportsCarousel({
  reports,
  currentIndex,
  onIndexChange,
  locationName,
}: ReportsCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    startIndex: currentIndex,
  })

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index)
    },
    [emblaApi]
  )

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    const index = emblaApi.selectedScrollSnap()
    onIndexChange(index)
  }, [emblaApi, onIndexChange])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, onSelect])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        scrollPrev()
      } else if (e.key === "ArrowRight") {
        scrollNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [scrollPrev, scrollNext])

  // Sync external index changes with embla
  useEffect(() => {
    if (emblaApi && emblaApi.selectedScrollSnap() !== currentIndex) {
      emblaApi.scrollTo(currentIndex)
    }
  }, [emblaApi, currentIndex])

  const canScrollPrev = emblaApi?.canScrollPrev() ?? false
  const canScrollNext = emblaApi?.canScrollNext() ?? false

  if (reports.length <= 1) {
    return null
  }

  return (
    <div className="border-b bg-muted/30 pb-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between px-3 sm:px-4">
        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
          Reportes en {locationName}
        </h3>
        <span className="text-xs sm:text-sm font-semibold flex-shrink-0 ml-2">
          {currentIndex + 1} / {reports.length}
        </span>
      </div>

      {/* Carousel */}
      <div className="relative px-2 sm:px-4">
        {/* Navigation Buttons - Hidden on mobile, shown on tablet+ */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 z-10 h-7 w-7 sm:h-8 sm:w-8 -translate-y-1/2 rounded-full bg-background shadow-md disabled:opacity-30 hidden sm:flex"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          aria-label="Reporte anterior"
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 z-10 h-7 w-7 sm:h-8 sm:w-8 -translate-y-1/2 rounded-full bg-background shadow-md disabled:opacity-30 hidden sm:flex"
          onClick={scrollNext}
          disabled={!canScrollNext}
          aria-label="Siguiente reporte"
        >
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>

        {/* Embla Container */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {reports.map((report, index) => {
              const Icon = report.locationData?.icon
                ? getIconComponent(report.locationData.icon)
                : MapPin

              return (
                <div
                  key={report.id}
                  className="min-w-0 flex-[0_0_100%]"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Reporte ${index + 1} de ${reports.length}`}
                >
                  <div className="mx-2 sm:mx-8 rounded-lg border bg-card p-2.5 sm:p-3 shadow-sm">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="flex h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-semibold text-xs sm:text-sm">{report.title}</h4>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <span className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${
                              report.status === "resuelto" ? "bg-green-500" :
                              report.status === "investigando" ? "bg-yellow-500" :
                              report.status === "activo" ? "bg-red-500" :
                              "bg-gray-400"
                            }`} />
                            <span className="truncate">
                              {report.status === "resuelto" ? "Resuelto" :
                               report.status === "investigando" ? "Investigando" :
                               report.status === "activo" ? "Activo" :
                               "Desconocido"}
                            </span>
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className="truncate hidden sm:inline">{report.type}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="truncate hidden sm:inline">{report.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Dots Navigation */}
      <div className="mt-3 sm:mt-4 flex justify-center gap-1 sm:gap-1.5 px-2">
        {reports.map((_, index) => (
          <button
            key={index}
            className={`h-1.5 sm:h-2 rounded-full transition-all ${
              index === currentIndex
                ? "w-4 sm:w-6 bg-primary"
                : "w-1.5 sm:w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
            onClick={() => scrollTo(index)}
            aria-label={`Ir a reporte ${index + 1}`}
            aria-current={index === currentIndex ? "true" : "false"}
          />
        ))}
      </div>
    </div>
  )
}
