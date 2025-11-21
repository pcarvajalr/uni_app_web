import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Ticket, Download, Copy, Heart } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface Coupon {
  id: string
  image: string
  title: string
  discount: string
  code: string
  expiry: string
  category: string
  isFavorite: boolean
}

export default function CouponsPage() {
  const { toast } = useToast()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    // Load coupons from localStorage
    const stored = localStorage.getItem("uniapp_coupons")
    if (stored) {
      setCoupons(JSON.parse(stored))
    }

    const storedFavorites = localStorage.getItem("uniapp_coupon_favorites")
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites))
    }
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

  const handleDownloadCoupon = (image: string, title: string) => {
    const link = document.createElement("a")
    link.href = image
    link.download = `${title}.jpg`
    link.click()
    toast({
      title: "Descargando",
      description: `Cupón de ${title} descargado`,
    })
  }

  const filteredCoupons =
    filter === "favorites" ? coupons.filter((c) => favorites.includes(c.id)) : coupons

  const categories = [...new Set(coupons.map((c) => c.category))]

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Ticket className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Cupones</h1>
          </div>
          <p className="text-muted-foreground">Descubre todas las ofertas y promociones disponibles</p>
        </div>

        {/* Filter Tabs */}
        {coupons.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className="whitespace-nowrap"
            >
              Todos ({coupons.length})
            </Button>
            <Button
              variant={filter === "favorites" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("favorites")}
              className="whitespace-nowrap"
            >
              Favoritos ({favorites.length})
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={filter === category ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        )}

        {/* Coupons Grid */}
        {filteredCoupons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCoupons.map((coupon) => (
              <Card
                key={coupon.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Coupon Image */}
                <div className="relative w-full aspect-video bg-muted overflow-hidden">
                  <img
                    src={coupon.image || "/placeholder.svg"}
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
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {coupon.discount}
                      </Badge>
                      <Badge variant="outline">{coupon.category}</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-secondary/20 rounded-lg p-2">
                      <p className="text-xs text-muted-foreground mb-1">Código promocional</p>
                      <p className="font-mono font-bold text-secondary text-center">{coupon.code}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Válido hasta: <span className="font-semibold">{coupon.expiry}</span>
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
                      onClick={() => handleDownloadCoupon(coupon.image, coupon.title)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Descargar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-muted-foreground/30">
            <CardContent className="py-12 text-center">
              <Ticket className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No hay cupones disponibles</h3>
              <p className="text-muted-foreground">
                Los administradores aún no han subido cupones. ¡Vuelve pronto!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
