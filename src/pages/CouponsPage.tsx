import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Ticket, Download, Copy, Heart, Info } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth"
import {
  getActiveCouponsWithPartner,
  type CouponWithPartner,
  type CouponPartner,
} from "@/services/coupons.service"

// Helper para formatear el descuento
const formatDiscount = (type: string, value: number): string => {
  if (type === 'percentage') {
    return `${value}% OFF`
  } else {
    return `$${value} OFF`
  }
}

// Helper para formatear la fecha
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Helper para formatear categoría
const formatCategory = (applicableTo: string | null): string => {
  if (!applicableTo) return 'General'
  return applicableTo
}

export default function CouponsPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [coupons, setCoupons] = useState<CouponWithPartner[]>([])
  const [favorites, setFavorites] = useState<string[]>(() => {
    const stored = localStorage.getItem("uniapp_coupon_favorites")
    return stored ? JSON.parse(stored) : []
  })
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null)

  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const activeCoupons = await getActiveCouponsWithPartner()
        setCoupons(activeCoupons)
      } catch (error) {
        console.error('Error cargando cupones:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los cupones. Por favor intenta de nuevo.",
          variant: "destructive",
        })
      }
    }

    loadCoupons()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCopyCode = (code: string, title: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Código copiado",
      description: `Código de ${title} copiado al portapapeles`,
    })
  }

  const handleToggleFavorite = (couponId: string) => {
    const newFavorites = favorites.includes(couponId)
      ? favorites.filter((id) => id !== couponId)
      : [...favorites, couponId]
    setFavorites(newFavorites)
    localStorage.setItem("uniapp_coupon_favorites", JSON.stringify(newFavorites))
  }

  const handleDownloadCoupon = (imageUrl: string | null, title: string) => {
    if (!imageUrl) {
      toast({
        title: "Error",
        description: "Este cupón no tiene imagen disponible",
        variant: "destructive",
      })
      return
    }

    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `${title}.jpg`
    link.click()
    toast({
      title: "Descargando",
      description: `Cupón de ${title} descargado`,
    })
  }

  // Aliados distintos presentes en los cupones visibles
  const partners: CouponPartner[] = Array.from(
    coupons
      .reduce((map, c) => {
        if (c.partner && !map.has(c.partner.id)) map.set(c.partner.id, c.partner)
        return map
      }, new Map<string, CouponPartner>())
      .values()
  )

  const partnerCoupons = selectedPartnerId
    ? coupons.filter((c) => c.partner?.id === selectedPartnerId)
    : []

  const selectedPartner = partners.find((p) => p.id === selectedPartnerId) ?? null

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Ticket className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Cupones</h1>
          </div>
          <p className="text-muted-foreground">
            {selectedPartnerId
              ? "Ofertas y promociones del establecimiento"
              : "Selecciona un establecimiento para ver sus cupones"}
          </p>
        </div>

        {selectedPartnerId === null ? (
          partners.length > 0 ? (
            <>
              {isAdmin && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  Los administradores ven todos los aliados.
                </p>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {partners.map((p) => (
                <Card
                  key={p.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedPartnerId(p.id)}
                >
                  <CardContent className="flex flex-col items-center gap-3 py-6">
                    {p.logo_url ? (
                      <img
                        src={p.logo_url}
                        alt={p.name}
                        className="h-16 w-16 object-contain rounded"
                      />
                    ) : (
                      <div className="h-16 w-16 flex items-center justify-center rounded bg-muted">
                        <Ticket className="h-7 w-7 text-muted-foreground" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-center">{p.name}</span>
                  </CardContent>
                </Card>
              ))}
              </div>
            </>
          ) : (
            <Card className="border-dashed border-2 border-muted-foreground/30">
              <CardContent className="py-12 text-center">
                <Ticket className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No hay cupones disponibles
                </h3>
                <p className="text-muted-foreground">
                  Los administradores aún no han subido cupones. ¡Vuelve pronto!
                </p>
              </CardContent>
            </Card>
          )
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setSelectedPartnerId(null)}>
                ← Volver a establecimientos
              </Button>
              <h2 className="text-lg font-semibold">{selectedPartner?.name}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {partnerCoupons.map((coupon) => (
                <Card key={coupon.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative w-full aspect-video bg-muted overflow-hidden">
                    <img
                      src={coupon.image_url || "/placeholder.svg"}
                      alt={coupon.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 bg-white/80 hover:bg-white rounded-full"
                        onClick={() => handleToggleFavorite(coupon.id)}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            favorites.includes(coupon.id)
                              ? "fill-red-500 text-red-500"
                              : "text-gray-400"
                          }`}
                        />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="pt-4 space-y-3">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground truncate">{coupon.title}</h3>
                      {coupon.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {coupon.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {formatDiscount(coupon.discount_type, coupon.discount_value)}
                        </Badge>
                        {coupon.applicable_to && (
                          <Badge variant="outline">{formatCategory(coupon.applicable_to)}</Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="bg-secondary/20 rounded-lg p-2">
                        <p className="text-xs text-muted-foreground mb-1">Código promocional</p>
                        <p className="font-mono font-bold text-secondary text-center">
                          {coupon.code}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Válido hasta:{" "}
                        <span className="font-semibold">{formatDate(coupon.valid_until)}</span>
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => handleCopyCode(coupon.code, coupon.title)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copiar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => handleDownloadCoupon(coupon.image_url, coupon.title)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Descargar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
